import { z } from "zod";

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const productLineSchema = z.object({
  name: z.string().min(2, "Informe o nome da linha."),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
});

export const SIZES = ["PP", "P", "M", "G", "GG"] as const;

export const productVariantSchema = z.object({
  size: z.enum(SIZES),
  color: z.string().min(1, "Informe a cor."),
  colorHex: z.string().optional(),
  sku: z.string().min(1, "SKU obrigatório."),
  stock: z.number().int().min(0).default(0),
});

export const productSchema = z.object({
  name: z.string().min(2, "Informe o nome do modelo."),
  description: z.string().min(10, "Descreva o produto."),
  fabric: z.string().optional(),
  fit: z.string().optional(),
  careInstructions: z.string().optional(),
  originalPrice: z.number().positive("Preço deve ser maior que zero."),
  salePrice: z.number().positive().nullable().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  isNewArrival: z.boolean().default(false),
  lineId: z.string().min(1, "Selecione uma linha de produto."),
  images: z
    .array(
      z.object({
        url: z.string().min(1),
        altText: z.string().optional(),
        isCover: z.boolean().default(false),
      })
    )
    .default([]),
  variants: z.array(productVariantSchema).min(1, "Adicione ao menos uma variação."),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductLineInput = z.infer<typeof productLineSchema>;
