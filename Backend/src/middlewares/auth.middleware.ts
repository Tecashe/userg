import { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";
import { getAuth } from "@clerk/express";

/**
 * @name protect
 * @description Middleware to authenticate requests using Clerk's getAuth().
 * Attaches userId to req if authenticated.
 *
 * @access Private
 */
export const protect = (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    if (!auth.isAuthenticated) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.userId = auth.userId;
    next();
  } catch (error: any) {
    Sentry.captureException(error);
    return res
      .status(401)
      .json({ message: error?.message || "Internal Server Error" });
  }
};
