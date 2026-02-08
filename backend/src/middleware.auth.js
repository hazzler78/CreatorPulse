import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

/**
 * Verifies Supabase JWT from Authorization: Bearer <token>.
 * Sets req.user = { sub } on success.
 * Falls back to demo-user when no token (for dev / backwards compat).
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    req.user = { sub: "demo-user" };
    return next();
  }

  if (!JWT_SECRET) {
    req.user = { sub: "demo-user" };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { sub: decoded.sub };
    return next();
  } catch {
    req.user = { sub: "demo-user" };
    return next();
  }
}
