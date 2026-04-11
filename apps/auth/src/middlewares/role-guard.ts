import type { Request, Response, NextFunction } from "express";
import { HttpError } from "@yesboss/errors";
import { UserRole } from "@yesboss/types";

export function roleGuard(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      // API key auth bypasses role checks (service-to-service)
      const apiKey = req.headers["x-yesboss-api-key"];
      if (apiKey) {
        next();
        return;
      }
      throw HttpError.unauthorized();
    }

    if (!roles.includes(req.user.role as UserRole)) {
      throw HttpError.forbidden(`Requires role: ${roles.join(" or ")}`);
    }
    next();
  };
}
