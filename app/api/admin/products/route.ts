import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema, slugify } from "@/lib/validations";
import { Prisma } from "@prisma/client";

// GET /api/admin/products?search=&lineId=&status=&page=1&pageSize=20
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const lineId = searchParams.get("lineId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");

  const where: Prisma.ProductWhereInput = {
    ...(search && { name: { contains: search, mode: "insensitive" } }),
    ...(lineId && { lineId }),
    ...(status && { status: status as any }),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        line: { select: { name: true } },
        images: { where: { isCover: true }, take: 1 },
        variants: { select: { stock: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  const products = items.map((p) => ({
    ...p,
    totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
  }));

  return NextResponse.json({
    items: products,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

// POST /api/admin/products — cria produto + variantes (grade) + imagens numa única transação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = productSchema.parse(body);

    const baseSlug = slugify(data.name);
    let slug = baseSlug;
    let count = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    // Garante SKUs únicos dentro da grade enviada
    const skus = data.variants.map((v) => v.sku);
    if (new Set(skus).size !== skus.length) {
      return NextResponse.json(
        { error: "Existem SKUs duplicados na grade de variações." },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        fabric: data.fabric,
        fit: data.fit,
        careInstructions: data.careInstructions,
        originalPrice: data.originalPrice,
        salePrice: data.salePrice ?? null,
        status: data.status,
        isNewArrival: data.isNewArrival,
        lineId: data.lineId,
        images: {
          create: data.images.map((img, idx) => ({
            url: img.url,
            altText: img.altText,
            isCover: img.isCover,
            order: idx,
          })),
        },
        variants: {
          create: data.variants.map((v) => ({
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            sku: v.sku,
            stock: v.stock,
          })),
        },
      },
      include: { images: true, variants: true, line: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um produto ou SKU com esse identificador." },
        { status: 409 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar produto." }, { status: 500 });
  }
}
