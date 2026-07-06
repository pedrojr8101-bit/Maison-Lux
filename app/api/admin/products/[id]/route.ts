import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";

interface Params {
  params: { id: string };
}

// GET /api/admin/products/:id — dados completos para tela de edição
export async function GET(_request: NextRequest, { params }: Params) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: true,
      line: true,
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  }
  return NextResponse.json(product);
}

// PUT /api/admin/products/:id — edita dados + substitui grade de variações e imagens
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    const data = productSchema.parse(body);

    const product = await prisma.$transaction(async (tx) => {
      // remove variantes e imagens antigas para recriar a grade atualizada
      await tx.productVariant.deleteMany({ where: { productId: params.id } });
      await tx.productImage.deleteMany({ where: { productId: params.id } });

      return tx.product.update({
        where: { id: params.id },
        data: {
          name: data.name,
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
        include: { images: true, variants: true },
      });
    });

    return NextResponse.json(product);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar produto." }, { status: 500 });
  }
}

// DELETE /api/admin/products/:id?mode=archive|hard
// Por padrão arquiva (soft delete) para preservar histórico em pedidos já feitos.
// mode=hard só é permitido se o produto nunca teve pedidos.
export async function DELETE(request: NextRequest, { params }: Params) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "archive";

  if (mode === "hard") {
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: params.id },
    });
    if (orderItemsCount > 0) {
      return NextResponse.json(
        {
          error:
            "Este produto já possui pedidos associados e não pode ser excluído permanentemente. Utilize o arquivamento.",
        },
        { status: 409 }
      );
    }
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, mode: "hard" });
  }

  const product = await prisma.product.update({
    where: { id: params.id },
    data: { status: "ARCHIVED" },
  });

  return NextResponse.json({ success: true, mode: "archive", product });
}
