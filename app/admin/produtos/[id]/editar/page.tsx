import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

interface Props {
  params: { id: string };
}

export default async function EditProductPage({ params }: Props) {
  const [product, lines] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { images: { orderBy: { order: "asc" } }, variants: true },
    }),
    prisma.productLine.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) notFound();

  const defaultValues = {
    name: product.name,
    description: product.description,
    fabric: product.fabric ?? undefined,
    fit: product.fit ?? undefined,
    careInstructions: product.careInstructions ?? undefined,
    originalPrice: Number(product.originalPrice),
    salePrice: product.salePrice ? Number(product.salePrice) : undefined,
    status: product.status,
    isNewArrival: product.isNewArrival,
    lineId: product.lineId,
    images: product.images.map((img) => ({
      url: img.url,
      altText: img.altText ?? "",
      isCover: img.isCover,
    })),
    variants: product.variants.map((v) => ({
      size: v.size,
      color: v.color,
      colorHex: v.colorHex ?? "",
      sku: v.sku,
      stock: v.stock,
    })),
  };

  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl text-brown mb-6">Editar: {product.name}</h1>
      <ProductForm lines={lines} defaultValues={defaultValues} productId={product.id} />
    </div>
  );
}
