import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";

export const revalidate = 60;

async function getHomeData() {
  const [featuredLines, newArrivals] = await Promise.all([
    prisma.productLine.findMany({
      where: { isFeatured: true, isActive: true },
      orderBy: { order: "asc" },
      take: 6,
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE", isNewArrival: true },
      include: { line: true, images: { where: { isCover: true }, take: 1 } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);
  return { featuredLines, newArrivals };
}

export default async function HomePage() {
  const { featuredLines, newArrivals } = await getHomeData();

  return (
    <main className="bg-offwhite">
      {/* HERO INSTITUCIONAL */}
      <section className="relative h-[85vh] w-full overflow-hidden bg-brown">
        <Image
          src="/images/hero-banner.jpg"
          alt="Maison Lux — Coleção Atual"
          fill
          priority
          className="object-cover object-top opacity-80"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-offwhite/80 tracking-luxe text-xs uppercase mb-4">
            Nova Coleção
          </p>
          <h1 className="font-serif text-4xl md:text-6xl text-offwhite max-w-2xl">
            Elegância que veste a sua história
          </h1>
          <Link href="/produtos" className="btn-primary mt-8">
            Ver Coleção
          </Link>
        </div>
      </section>

      {/* CARROSSEL DE LINHAS EM DESTAQUE */}
      <section className="max-w-content mx-auto px-6 py-20">
        <h2 className="section-title text-center mb-12">Nossas Linhas</h2>
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {featuredLines.map((line) => (
            <Link
              key={line.id}
              href={`/produtos?linha=${line.slug}`}
              className="group relative flex-shrink-0 w-[280px] md:w-[340px] aspect-[4/5] snap-start overflow-hidden"
            >
              {line.coverImage ? (
                <Image
                  src={line.coverImage}
                  alt={line.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-beige" />
              )}
              <div className="absolute inset-0 bg-charcoal/20 flex items-end p-6">
                <h3 className="font-serif text-2xl text-offwhite">{line.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* GRID DE NOVOS LANÇAMENTOS */}
      <section className="max-w-content mx-auto px-6 py-20">
        <h2 className="section-title text-center mb-12">Novos Lançamentos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              slug={product.slug}
              name={product.name}
              lineName={product.line.name}
              originalPrice={Number(product.originalPrice)}
              salePrice={product.salePrice ? Number(product.salePrice) : null}
              coverImage={product.images[0]?.url}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
