import { ProductCategory } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { serializeProduct } from "../lib/serializers.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

const categorySchema = z.nativeEnum(ProductCategory);

const baseSchema = z.object({
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  tagline: z.string().min(2),
  description: z.string().min(10),
  price: z.number().int().positive(),
  category: categorySchema,
  accent: z.string().min(4),
  heroImage: z.string().url(),
  gallery: z.array(z.string().url()).min(1).max(6),
  stock: z.number().int().min(0),
  rating: z.number().min(0).max(5)
});

const createSchema = baseSchema;
const updateSchema = baseSchema.partial();

router.use(requireAuth, requireAdmin);

router.get("/products", async (_request, response) => {
  const products = await prisma.product.findMany({
    orderBy: { id: "asc" }
  });

  response.json({ products: products.map(serializeProduct) });
});

router.post("/products", async (request, response) => {
  const parsed = createSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ message: "Invalid product payload." });
    return;
  }

  const existingSlug = await prisma.product.findUnique({
    where: { slug: parsed.data.slug },
    select: { id: true }
  });

  if (existingSlug) {
    response.status(409).json({ message: "Slug already exists." });
    return;
  }

  const max = await prisma.product.aggregate({
    _max: { id: true }
  });

  const product = await prisma.product.create({
    data: {
      id: (max._max.id ?? 0) + 1,
      ...parsed.data
    }
  });

  response.status(201).json({ product: serializeProduct(product) });
});

router.patch("/products/:id", async (request, response) => {
  const id = Number(request.params.id);
  if (!Number.isInteger(id)) {
    response.status(400).json({ message: "Invalid product id." });
    return;
  }

  const parsed = updateSchema.safeParse(request.body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    response.status(400).json({ message: "Invalid product update payload." });
    return;
  }

  if (parsed.data.slug) {
    const existingSlug = await prisma.product.findFirst({
      where: {
        slug: parsed.data.slug,
        id: { not: id }
      },
      select: { id: true }
    });

    if (existingSlug) {
      response.status(409).json({ message: "Slug already exists." });
      return;
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: parsed.data
  });

  response.json({ product: serializeProduct(product) });
});

router.delete("/products/:id", async (request, response) => {
  const id = Number(request.params.id);
  if (!Number.isInteger(id)) {
    response.status(400).json({ message: "Invalid product id." });
    return;
  }

  const orderUsage = await prisma.orderLine.count({
    where: { productId: id }
  });

  if (orderUsage > 0) {
    response.status(409).json({
      message: "Cannot delete a product that already appears in past orders."
    });
    return;
  }

  await prisma.cartItem.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });

  response.json({ ok: true });
});

export default router;
