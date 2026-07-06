import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/lines — apenas linhas ativas, para uso na loja (filtros, navegação)
export async function GET() {
  const lines = await prisma.productLine.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, coverImage: true },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(lines);
}
