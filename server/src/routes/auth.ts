import { Router } from "express";
import { z } from "zod";
import { createSessionToken, hashPassword, verifyPassword } from "../lib/auth.js";
import { env } from "../lib/env.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = credentialsSchema.extend({
  name: z.string().min(1)
});

function sessionExpiryDate() {
  const date = new Date();
  date.setDate(date.getDate() + env.sessionDays);
  return date;
}

router.post("/register", async (request, response) => {
  const parsed = registerSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ message: "Invalid registration payload." });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const isAdmin = env.adminEmails.includes(email);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    response.status(409).json({ message: "An account with that email already exists." });
    return;
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const token = createSessionToken();

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: parsed.data.name.trim(),
        email,
        passwordHash,
        isAdmin
      },
      select: { id: true, name: true, email: true, isAdmin: true }
    });

    await tx.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: sessionExpiryDate()
      }
    });

    return user;
  });

  response.status(201).json({ user: result, token });
});

router.post("/login", async (request, response) => {
  const parsed = credentialsSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ message: "Invalid login payload." });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    response.status(401).json({ message: "Invalid email/password combination." });
    return;
  }

  const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!isValid) {
    response.status(401).json({ message: "Invalid email/password combination." });
    return;
  }

  const token = createSessionToken();

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: sessionExpiryDate()
    }
  });

  response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    },
    token
  });
});

router.post("/logout", requireAuth, async (request, response) => {
  await prisma.session.deleteMany({
    where: {
      token: request.auth!.session.token
    }
  });

  response.json({ ok: true });
});

router.get("/me", requireAuth, (request, response) => {
  response.json({ user: request.auth!.user });
});

export default router;
