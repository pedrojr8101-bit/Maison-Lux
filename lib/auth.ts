import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const TOKEN_COOKIE_NAME = "ml_session";
const TOKEN_TTL = "8h";

export interface SessionPayload {
  userId: string;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  name: string;
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = TOKEN_COOKIE_NAME;

// Garante que apenas ADMIN/STAFF acessem rotas de gestão
export function assertIsStaff(session: SessionPayload | null) {
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    throw new Error("UNAUTHORIZED");
  }
}
