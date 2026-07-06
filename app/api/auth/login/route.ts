import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }

  if (user.role !== "ADMIN" && user.role !== "STAFF") {
    return NextResponse.json(
      { error: "Este usuário não possui acesso ao painel administrativo." },
      { status: 403 }
    );
  }

  const token = await signSession({ userId: user.id, role: user.role, name: user.name });

  const response = NextResponse.json({
    user: { id: user.id, name: user.name, role: user.role },
  });

  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });

  return response;
}