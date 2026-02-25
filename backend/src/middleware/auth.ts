import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const TOKEN_NAME = "auth_token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return secret;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: TOKEN_MAX_AGE });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_MAX_AGE * 1000, // Express uses milliseconds
    path: "/",
  });
}

export function removeAuthCookie(res: Response): void {
  res.cookie(TOKEN_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export function getAuthToken(req: Request): string | undefined {
  return req.cookies?.[TOKEN_NAME];
}

export function getAuthUser(req: Request): JwtPayload | null {
  const token = getAuthToken(req);
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

// Express middleware for protecting routes
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return;
  }
  // Attach user to request object
  (req as Request & { user: JwtPayload }).user = user;
  next();
}
