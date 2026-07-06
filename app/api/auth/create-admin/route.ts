import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!process.env.ADMIN_SETUP_SECRET || secret !== process.env.ADMIN_SETUP_SECRET) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const email = "admin@maisonlux.com";
  const password = "TrocarDepois#2026";

  const passwordHash = await hashPassword(password);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: {
      name: "Administradora Maison Lux",
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  return NextResponse.json({
    success: true,
    message: "Admin criado/atualizado com sucesso.",
    email: admin.email,
    senhaTemporaria: password,
  });
}