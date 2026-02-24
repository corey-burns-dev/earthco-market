import type { Session, User } from "@prisma/client";

export interface AuthPayload {
  user: Pick<User, "id" | "name" | "email" | "isAdmin">;
  session: Pick<Session, "id" | "token" | "expiresAt">;
}
