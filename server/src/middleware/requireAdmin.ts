import type { RequestHandler } from "express";

export const requireAdmin: RequestHandler = (request, response, next) => {
  if (!request.auth?.user.isAdmin) {
    response.status(403).json({ message: "Admin access required." });
    return;
  }

  next();
};
