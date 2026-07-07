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

// ===== Geração de BR Code Pix real (padrão EMV do Banco Central) =====

function sanitizeForPix(text: string, maxLen: number) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "") // só letras, números e espaço
    .trim()
    .slice(0, maxLen);
}

function tlv(id: string, value: string) {
  const length = value.length.toString().padStart(2, "0");
  return `${id}${length}${value}`;
}

// CRC16-CCITT (polinômio 0x1021), exigido pelo padrão do Banco Central
function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function generatePixPayload(orderCode: string, total: number) {
  const pixKey = process.env.PIX_KEY as string;
  const merchantName = sanitizeForPix(process.env.PIX_MERCHANT_NAME as string, 25);
  const merchantCity = sanitizeForPix(process.env.PIX_MERCHANT_CITY as string, 15);
  const txid = orderCode.replace(/[^A-Za-z0-9]/g, "").slice(0, 25);

  const merchantAccountInfo = tlv("00", "BR.GOV.BCB.PIX") + tlv("01", pixKey);
  const additionalData = tlv("05", txid);

  const payload =
    tlv("00", "01") +
    tlv("26", merchantAccountInfo) +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("54", total.toFixed(2)) +
    tlv("58", "BR") +
    tlv("59", merchantName) +
    tlv("60", merchantCity) +
    tlv("62", additionalData) +
    "6304";

  return payload + crc16(payload);
}

export async function POST(request: NextRequest) {
  try {
    const body = checkoutSchema.parse(await request.json());

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

      for (const item of body.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

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