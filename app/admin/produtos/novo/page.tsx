import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const lines = await prisma.productLine.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl text-brown mb-6">Novo Modelo de Roupa</h1>
      <ProductForm lines={lines} />
    </div>
  );
}
