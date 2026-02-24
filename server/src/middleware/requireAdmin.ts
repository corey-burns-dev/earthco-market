import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";

export function requireAdmin(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) {
  if (!request.auth.user.isAdmin) {
    response.status(403).json({ message: "Admin access required." });
    return;
  }

  next();
}
