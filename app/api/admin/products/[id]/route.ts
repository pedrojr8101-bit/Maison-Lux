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

// PUT /api/admin/products/:id — edita dados e sincroniza a grade de variações
// Em vez de apagar e recriar tudo, atualiza (upsert) as variações existentes e só
// remove as que não têm nenhum pedido vinculado (preserva histórico de vendas).
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    const data = productSchema.parse(body);

    const skus = data.variants.map((v) => v.sku);
    if (new Set(skus).size !== skus.length) {
      return NextResponse.json(
        { error: "Existem SKUs duplicados na grade de variações." },
        { status: 400 }
      );
    }

    const product = await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: params.id } });

      const existingVariants = await tx.productVariant.findMany({
        where: { productId: params.id },
      });
      const incomingKeys = new Set(data.variants.map((v) => `${v.size}|${v.color}`));

      for (const v of data.variants) {
        await tx.productVariant.upsert({
          where: {
            productId_size_color: {
              productId: params.id,
              size: v.size,
              color: v.color,
            },
          },
          update: { sku: v.sku, colorHex: v.colorHex, stock: v.stock },
          create: {
            productId: params.id,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            sku: v.sku,
            stock: v.stock,
          },
        });
      }

      const toRemove = existingVariants.filter(
        (ev) => !incomingKeys.has(`${ev.size}|${ev.color}`)
      );
      for (const variant of toRemove) {
        const refCount = await tx.orderItem.count({ where: { variantId: variant.id } });
        if (refCount === 0) {
          await tx.productVariant.delete({ where: { id: variant.id } });
        }
      }

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