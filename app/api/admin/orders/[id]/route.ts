import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["AGUARDANDO_PAGAMENTO", "PAGO", "ENVIADO", "CANCELADO"]),
});

// PUT /api/admin/orders/:id — altera o status do pedido (ex: marcar como Enviado)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = statusSchema.parse(await request.json());

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(order);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ error: "Erro ao atualizar status do pedido." }, { status: 400 });
  }
}
