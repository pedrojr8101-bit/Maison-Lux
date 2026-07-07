import bcrypt from "bcryptjs";

export { signSession, verifySession, SESSION_COOKIE } from "@/lib/session";
export type { SessionPayload } from "@/lib/session";

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function assertIsStaff(session: { role: string } | null) {
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    throw new Error("UNAUTHORIZED");
  }
}