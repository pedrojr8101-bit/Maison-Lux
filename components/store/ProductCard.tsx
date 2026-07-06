import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  slug: string;
  name: string;
  lineName: string;
  originalPrice: number;
  salePrice?: number | null;
  coverImage?: string;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function ProductCard({
  slug,
  name,
  lineName,
  originalPrice,
  salePrice,
  coverImage,
}: ProductCardProps) {
  const hasDiscount = !!salePrice && salePrice < originalPrice;

  return (
    <Link href={`/produto/${slug}`} className="group block">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-sand">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brown/30 font-serif text-sm">
            Maison Lux
          </div>
        )}
        {hasDiscount && (
          <span className="absolute left-3 top-3 bg-charcoal text-offwhite text-xs px-2 py-1 tracking-luxe">
            OFERTA
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-xs uppercase tracking-luxe text-brown/60">{lineName}</p>
        <h3 className="font-serif text-lg text-charcoal">{name}</h3>
        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-sm text-charcoal/40 line-through">
                {formatPrice(originalPrice)}
              </span>
              <span className="text-sm text-gold-dark font-medium">
                {formatPrice(salePrice!)}
              </span>
            </>
          ) : (
            <span className="text-sm text-charcoal">{formatPrice(originalPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
