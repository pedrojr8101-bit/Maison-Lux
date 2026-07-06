import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products/:slug — detalhe do produto para a PDP (somente se ACTIVE)
export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const product = await prisma.product.findFirst({
    where: { slug: params.slug, status: "ACTIVE" },
    include: {
      line: { select: { name: true, slug: true } },
      images: { orderBy: { order: "asc" } },
      variants: true,
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  }

  return NextResponse.json(product);
}
