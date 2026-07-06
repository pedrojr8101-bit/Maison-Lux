import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductInfo } from "@/components/store/ProductInfo";
import { ProductCard } from "@/components/store/ProductCard";

interface Props {
  params: { slug: string };
}

export const revalidate = 60;

export default async function ProductPage({ params }: Props) {
  const product = await prisma.product.findFirst({
    where: { slug: params.slug, status: "ACTIVE" },
    include: {
      line: true,
      images: { orderBy: { order: "asc" } },
      variants: true,
    },
  });

  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { lineId: product.lineId, status: "ACTIVE", id: { not: product.id } },
    include: { line: true, images: { where: { isCover: true }, take: 1 } },
    take: 4,
  });

  return (
    <main className="max-w-content mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <ProductGallery images={product.images} productName={product.name} />
        <ProductInfo
          productId={product.id}
          slug={product.slug}
          name={product.name}
          lineName={product.line.name}
          description={product.description}
          fabric={product.fabric}
          fit={product.fit}
          careInstructions={product.careInstructions}
          originalPrice={Number(product.originalPrice)}
          salePrice={product.salePrice ? Number(product.salePrice) : null}
          variants={product.variants.map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            stock: v.stock,
          }))}
          coverImage={product.images[0]?.url}
        />
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="section-title text-center mb-12">Você também vai gostar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                slug={p.slug}
                name={p.name}
                lineName={p.line.name}
                originalPrice={Number(p.originalPrice)}
                salePrice={p.salePrice ? Number(p.salePrice) : null}
                coverImage={p.images[0]?.url}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
