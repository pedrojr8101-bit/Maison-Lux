import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";
import crypto from "crypto";

const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  address: z.object({
    street: z.string().min(2),
    number: z.string().min(1),
    complement: z.string().optional(),
    district: z.string().min(2),
    city: z.string().min(2),
    state: z.string().length(2),
    zipCode: z.string().min(8),
  }),
  paymentMethod: z.enum(["PIX", "CREDIT_CARD"]),
  card: z
    .object({
      number: z.string(),
      holderName: z.string(),
      expiry: z.string(),
      cvv: z.string(),
    })
    .optional(),
  items: z
    .array(
      z.object({
        variantId: z.string(),
        productId: z.string(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
      })
    )
    .min(1),
  shippingCost: z.number().min(0).default(0),
});

function generateOrderCode() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ML-${year}-${random}`;
}

// Gera um payload simulado no padrão visual do BR Code Pix (não é um Pix real/válido bancariamente)
function generatePixPayload(orderCode: string, total: number) {
  const merchant = "MAISONLUXMODA";
  const city = "SAO PAULO";
  return `00020126360014BR.GOV.BCB.PIX0114+55119999999952040000530398654${total
    .toFixed(2)
    .replace(".", "")}5802BR5913${merchant}6009${city}62070503${orderCode}6304ABCD`;
}

export async function POST(request: NextRequest) {
  try {
    const body = checkoutSchema.parse(await request.json());

    // Checkout de convidado: encontra ou cria o usuário pelo e-mail
    let user = await prisma.user.findUnique({ where: { email: body.customer.email } });
    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString("hex");
      user = await prisma.user.create({
        data: {
          name: body.customer.name,
          email: body.customer.email,
          phone: body.customer.phone,
          passwordHash: await hashPassword(randomPassword),
          role: "CUSTOMER",
        },
      });
    }

    const address = await prisma.address.create({
      data: { ...body.address, userId: user.id },
    });

    // Valida estoque disponível antes de confirmar o pedido
    for (const item of body.items) {
      const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId } });
      if (!variant || variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `Estoque insuficiente para um dos itens da sacola.` },
          { status: 409 }
        );
      }
    }

    const subtotal = body.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const total = subtotal + body.shippingCost;
    const orderCode = generateOrderCode();
    const pixPayload = body.paymentMethod === "PIX" ? generatePixPayload(orderCode, total) : null;

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          code: orderCode,
          userId: user!.id,
          addressId: address.id,
          paymentMethod: body.paymentMethod,
          status: "AGUARDANDO_PAGAMENTO",
          subtotal,
          shippingCost: body.shippingCost,
          total,
          pixQrCode: pixPayload,
          cardLast4: body.card ? body.card.number.slice(-4) : null,
          items: {
            create: body.items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
            })),
          },
        },
        include: { items: true },
      });

      // Decrementa estoque de cada variante comprada
      for (const item of body.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Cartão de crédito é "aprovado" automaticamente nesta simulação
      if (body.paymentMethod === "CREDIT_CARD") {
        return tx.order.update({ where: { id: created.id }, data: { status: "PAGO" } });
      }
      return created;
    });

    return NextResponse.json(
      { orderId: order.id, code: orderCode, pixPayload, total },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao processar o pedido." }, { status: 500 });
  }
}
