import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET /api/products?linha=&tamanho=&cor=&precoMin=&precoMax=&busca=&page=&pageSize=
// Catálogo público — retorna apenas produtos com status ACTIVE
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const linha = searchParams.get("linha") ?? undefined;
  const tamanho = searchParams.get("tamanho") ?? undefined;
  const cor = searchParams.get("cor") ?? undefined;
  const precoMin = searchParams.get("precoMin");
  const precoMax = searchParams.get("precoMax");
  const busca = searchParams.get("busca") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "12");

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(linha && { line: { slug: linha } }),
    ...(tamanho && { variants: { some: { size: tamanho as any } } }),
    ...(cor && { variants: { some: { color: { equals: cor, mode: "insensitive" } } } }),
    ...(busca && { name: { contains: busca, mode: "insensitive" } }),
  };

  // Filtro por faixa de preço considera o preço efetivo (promocional se existir)
  if (precoMin || precoMax) {
    const min = precoMin ? Number(precoMin) : 0;
    const max = precoMax ? Number(precoMax) : Number.MAX_SAFE_INTEGER;
    where.OR = [
      { salePrice: { gte: min, lte: max } },
      { AND: [{ salePrice: null }, { originalPrice: { gte: min, lte: max } }] },
    ];
  }

  const [items, total, availableLines] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        line: { select: { name: true, slug: true } },
        images: { where: { isCover: true }, take: 1 },
        variants: { select: { size: true, color: true, colorHex: true, stock: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
    prisma.productLine.findMany({
      where: { isActive: true },
      select: { name: true, slug: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    availableLines,
  });
}
