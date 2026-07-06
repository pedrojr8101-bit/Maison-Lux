import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productLineSchema, slugify } from "@/lib/validations";

// GET /api/admin/lines — lista todas as linhas (com contagem de produtos)
export async function GET() {
  const lines = await prisma.productLine.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(lines);
}

// POST /api/admin/lines — cria uma nova linha de produto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = productLineSchema.parse(body);

    const baseSlug = slugify(data.name);
    let slug = baseSlug;
    let count = 1;
    // garante slug único caso já exista uma linha com o mesmo nome
    while (await prisma.productLine.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const line = await prisma.productLine.create({
      data: { ...data, slug },
    });

    return NextResponse.json(line, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro ao criar linha de produto." },
      { status: 500 }
    );
  }
}
