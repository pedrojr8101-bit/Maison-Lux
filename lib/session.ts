import { SignJWT, jwtVerify } from "jose";

const TOKEN_TTL = "8h";
export const SESSION_COOKIE = "ml_session";

function getSecretKey() {
  return new TextEncoder().encode(process.env.JWT_SECRET as string);
}

export interface SessionPayload {
  userId: string;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  name: string;
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}