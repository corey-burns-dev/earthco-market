import type { Session, User } from "@prisma/client";
import type { Request } from "express";

export interface AuthPayload {
  user: Pick<User, "id" | "name" | "email" | "isAdmin">;
  session: Pick<Session, "id" | "token" | "expiresAt">;
}

export interface AuthenticatedRequest extends Request {
  auth: AuthPayload;
}
