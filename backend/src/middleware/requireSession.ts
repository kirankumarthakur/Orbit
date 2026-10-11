import type { Request, Response, NextFunction } from "express";
import { descopeClient } from "../config/descope/index.js";
import { upsertUser } from "../repositories/user.repository.js";

export type AuthContext = {
  authUserId: string;
  email?: string;
  name?: string;
  userId?: string;
  token: Record<string, any>;
};

declare global {
  namespace Express {
    interface Request {
      authContext?: AuthContext;
    }
  }
}

export const requireSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;
  if (!header) {
    return res
      .status(401)
      .json({ error: "Authorization header missing", success: false });
  }
  if (!header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Invalid authorization header format", success: false });
  }
  const token = header.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ error: "Token missing in authorization header", success: false });
  }

  try {
    const validateSession = await descopeClient.validateSession(token);
    if (!validateSession) {
      return res
        .status(401)
        .json({ error: "Invalid or expired token", success: false });
    }

    const claims = validateSession.token as Record<string, any>;
    const authUserId = claims.sub as string;
    const email = claims.email as string | undefined;
    const user = await upsertUser(authUserId, email);
    req.authContext = {
      authUserId,
      email,
      name: claims.name as string | undefined,
      userId: user?.id,
      token: claims,
    };

    next();
  } catch (error) {
    console.error("Error validating session:", error);
    return res
      .status(401)
      .json({ error: "Invalid or expired token", success: false });
  }
};
