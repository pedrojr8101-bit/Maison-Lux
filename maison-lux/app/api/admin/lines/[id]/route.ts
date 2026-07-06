import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productLineSchema } from "@/lib/validations";

interface Params {
  params: { id: string };
}

// GET /api/admin/lines/:id
export async function GET(_request: NextRequest, { params }: Params) {
  const line = await prisma.productLine.findUnique({ where: { id: params.id } });
  if (!line) return NextResponse.json({ error: "Linha não encontrada." }, { status: 404 });
  return NextResponse.json(line);
}

// PUT /api/admin/lines/:id — edita nome, descrição, destaque, status, ordem
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    const data = productLineSchema.partial().parse(body);

    const line = await prisma.productLine.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(line);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Linha não encontrada." }, { status: 404 });
    }
    return NextResponse.json({ error: "Erro ao atualizar linha." }, { status: 400 });
  }
}

// DELETE /api/admin/lines/:id
// Bloqueia exclusão se houver produtos vinculados (integridade do catálogo)
export async function DELETE(_request: NextRequest, { params }: Params) {
  const productsCount = await prisma.product.count({ where: { lineId: params.id } });

  if (productsCount > 0) {
    return NextResponse.json(
      {
        error: `Não é possível excluir: existem ${productsCount} produto(s) vinculados a esta linha. Arquive ou mova os produtos primeiro.`,
      },
      { status: 409 }
    );
  }

  await prisma.productLine.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
