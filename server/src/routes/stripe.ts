import { OrderStatus } from "@prisma/client";
import { Router } from "express";
import Stripe from "stripe";
import { z } from "zod";
import { env } from "../lib/env.js";
import { HttpError } from "../lib/httpError.js";
import { prisma } from "../lib/prisma.js";
import { serializeOrder } from "../lib/serializers.js";
import { requireAuth } from "../middleware/requireAuth.js";
import type { AuthenticatedRequest } from "../types/auth.js";

const router = Router();

const checkoutSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  city: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1)
});

function computeShipping(subtotal: number) {
  return subtotal > 250 || subtotal === 0 ? 0 : 12;
}

function createOrderCode() {
  return `EC-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 90 + 10)}`;
}

function getStripeClient() {
  if (!env.stripeSecretKey) {
    throw new HttpError(500, "Stripe is not configured on the server.");
  }

  return new Stripe(env.stripeSecretKey);
}

router.use(requireAuth);

router.post("/checkout-session", async (request: AuthenticatedRequest, response, next) => {
  const parsed = checkoutSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ message: "Invalid checkout payload." });
    return;
  }

  try {
    const stripe = getStripeClient();

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: request.auth.user.id },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      throw new HttpError(400, "Your cart is empty.");
    }

    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        throw new HttpError(400, `${item.product.name} has insufficient stock.`);
      }
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shipping = computeShipping(subtotal);
    const total = subtotal + shipping;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${env.clientOrigin}/checkout?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.clientOrigin}/checkout?stripe=cancelled`,
      customer_email: parsed.data.email,
      line_items: [
        ...cartItems.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            unit_amount: item.product.price * 100,
            product_data: {
              name: item.product.name,
              description: item.product.tagline,
              images: [item.product.heroImage]
            }
          }
        })),
        ...(shipping > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: "usd",
                  unit_amount: shipping * 100,
                  product_data: {
                    name: "Shipping"
                  }
                }
              }
            ]
          : [])
      ],
      metadata: {
        userId: request.auth.user.id
      }
    });

    const order = await prisma.order.create({
      data: {
        orderCode: createOrderCode(),
        userId: request.auth.user.id,
        status: OrderStatus.PENDING_PAYMENT,
        stripeSessionId: session.id,
        subtotal,
        shipping,
        total,
        shippingFullName: parsed.data.fullName.trim(),
        shippingEmail: parsed.data.email.trim(),
        shippingAddress: parsed.data.address.trim(),
        shippingCity: parsed.data.city.trim(),
        shippingZip: parsed.data.zip.trim(),
        shippingCountry: parsed.data.country.trim(),
        lines: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: item.product.price
          }))
        }
      },
      include: {
        lines: true
      }
    });

    response.status(201).json({
      sessionId: session.id,
      url: session.url,
      order: serializeOrder(order)
    });
  } catch (error) {
    next(error);
  }
});

router.post("/confirm/:sessionId", async (request: AuthenticatedRequest, response, next) => {
  try {
    const stripe = getStripeClient();
    const sessionId = request.params.sessionId;

    const [session, existingOrder] = await Promise.all([
      stripe.checkout.sessions.retrieve(sessionId),
      prisma.order.findFirst({
        where: {
          stripeSessionId: sessionId,
          userId: request.auth.user.id
        },
        include: {
          lines: true
        }
      })
    ]);

    if (!existingOrder) {
      throw new HttpError(404, "No order found for this Stripe session.");
    }

    if (session.payment_status !== "paid") {
      response.json({ paid: false, order: serializeOrder(existingOrder) });
      return;
    }

    if (existingOrder.status === OrderStatus.PLACED || existingOrder.status === OrderStatus.FULFILLED) {
      response.json({ paid: true, order: serializeOrder(existingOrder) });
      return;
    }

    const order = await prisma.$transaction(async (tx) => {
      for (const line of existingOrder.lines) {
        const stockUpdate = await tx.product.updateMany({
          where: {
            id: line.productId,
            stock: {
              gte: line.quantity
            }
          },
          data: {
            stock: {
              decrement: line.quantity
            }
          }
        });

        if (stockUpdate.count === 0) {
          throw new HttpError(400, `${line.productName} is out of stock.`);
        }
      }

      await tx.cartItem.deleteMany({
        where: {
          userId: request.auth.user.id
        }
      });

      return tx.order.update({
        where: { id: existingOrder.id },
        data: { status: OrderStatus.PLACED },
        include: { lines: true }
      });
    });

    response.json({ paid: true, order: serializeOrder(order) });
  } catch (error) {
    next(error);
  }
});

export default router;
