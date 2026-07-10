"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/cart";
import { SIZES } from "@/lib/validations";

interface Variant {
  id: string;
  size: string;
  color: string;
  colorHex: string | null;
  stock: number;
}

interface ProductInfoProps {
  productId: string;
  slug: string;
  name: string;
  lineName: string;
  description: string;
  fabric?: string | null;
  fit?: string | null;
  careInstructions?: string | null;
  originalPrice: number;
  salePrice?: number | null;
  variants: Variant[];
  coverImage?: string;
}

const formatPrice = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

// Mesma referência de medidas usada na página /guia-de-medidas
const sizeChart: Record<string, { bust: string; waist: string; hip: string }> = {
  PP: { bust: "80-84", waist: "60-64", hip: "88-92" },
  P: { bust: "85-89", waist: "65-69", hip: "93-97" },
  M: { bust: "90-94", waist: "70-74", hip: "98-102" },
  G: { bust: "95-99", waist: "75-79", hip: "103-107" },
  GG: { bust: "100-104", waist: "80-84", hip: "108-112" },
};

export function ProductInfo({
  productId,
  slug,
  name,
  lineName,
  description,
  fabric,
  fit,
  careInstructions,
  originalPrice,
  salePrice,
  variants,
  coverImage,
}: ProductInfoProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const availableSizes = Array.from(new Set(variants.map((v) => v.size)));
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const colorsForSize = useMemo(
    () => variants.filter((v) => !selectedSize || v.size === selectedSize),
    [variants, selectedSize]
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const selectedVariant = variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const effectivePrice = salePrice && salePrice < originalPrice ? salePrice : originalPrice;
  const hasDiscount = salePrice && salePrice < originalPrice;

  function handleAddToCart() {
    if (!selectedVariant) return;
    addItem({
      variantId: selectedVariant.id,
      productId,
      productName: name,
      slug,
      size: selectedVariant.size,
      color: selectedVariant.color,
      unitPrice: effectivePrice,
      image: coverImage,
      quantity: 1,
      maxStock: selectedVariant.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-luxe text-brown/60">{lineName}</p>
        <h1 className="font-serif text-3xl text-charcoal mt-1">{name}</h1>
      </div>

      <div className="flex items-center gap-3">
        {hasDiscount ? (
          <>
            <span className="text-charcoal/40 line-through">{formatPrice(originalPrice)}</span>
            <span className="text-xl text-gold-dark font-medium">{formatPrice(salePrice!)}</span>
          </>
        ) : (
          <span className="text-xl text-charcoal">{formatPrice(originalPrice)}</span>
        )}
      </div>

      {/* SELEÇÃO DE TAMANHO */}
      <div>
        <h3 className="text-xs uppercase tracking-luxe text-brown mb-2">Tamanho</h3>
        <div className="flex gap-2">
          {SIZES.filter((s) => availableSizes.includes(s)).map((size) => (
            <button
              key={size}
              onClick={() => {
                setSelectedSize(size);
                setSelectedColor(null);
              }}
              className={`w-11 h-11 text-sm border ${
                selectedSize === size
                  ? "bg-charcoal text-offwhite border-charcoal"
                  : "border-beige text-charcoal/70 hover:border-gold"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* SELEÇÃO DE COR */}
      <div>
        <h3 className="text-xs uppercase tracking-luxe text-brown mb-2">Cor</h3>
        <div className="flex gap-2">
          {colorsForSize.map((v) => (
            <button
              key={v.id}
              disabled={v.stock === 0}
              onClick={() => setSelectedColor(v.color)}
              title={`${v.color}${v.stock === 0 ? " (esgotado)" : ""}`}
              className={`w-9 h-9 rounded-full border-2 disabled:opacity-30 disabled:cursor-not-allowed ${
                selectedColor === v.color ? "border-gold" : "border-beige"
              }`}
              style={{ backgroundColor: v.colorHex || "#ccc" }}
            />
          ))}
        </div>
      </div>

      {selectedVariant && selectedVariant.stock <= 3 && selectedVariant.stock > 0 && (
        <p className="text-xs text-gold-dark">Últimas {selectedVariant.stock} unidades</p>
      )}

      <Button
        className="w-full"
        disabled={!selectedVariant || selectedVariant.stock === 0}
        onClick={handleAddToCart}
      >
        {added ? "Adicionado ✓" : selectedVariant?.stock === 0 ? "Esgotado" : "Adicionar à Sacola"}
      </Button>

      {added && (
        <button
          onClick={() => router.push("/carrinho")}
          className="text-xs uppercase tracking-luxe text-gold-dark underline w-full text-center"
        >
          Ver sacola
        </button>
      )}

      {/* DESCRIÇÃO TÉCNICA */}
      <div className="border-t border-beige pt-6 space-y-3 text-sm text-charcoal/80">
        <p>{description}</p>
        {fabric && (
          <p>
            <span className="font-medium text-charcoal">Composição: </span>
            {fabric}
          </p>
        )}
        {fit && (
          <p>
            <span className="font-medium text-charcoal">Caimento: </span>
            {fit}
          </p>
        )}
        {careInstructions && (
          <p>
            <span className="font-medium text-charcoal">Cuidados: </span>
            {careInstructions}
          </p>
        )}
      </div>

      {/* GUIA DE MEDIDAS (RESUMIDO, SÓ COM OS TAMANHOS DESTE PRODUTO) */}
      {availableSizes.length > 0 && (
        <details className="border-t border-beige pt-6 text-sm text-charcoal/80">
          <summary className="cursor-pointer text-xs uppercase tracking-luxe text-brown font-medium">
            Guia de Medidas
          </summary>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm border border-beige">
              <thead className="bg-sand text-left uppercase tracking-luxe text-xs">
                <tr>
                  <th className="p-3">Tamanho</th>
                  <th className="p-3">Busto (cm)</th>
                  <th className="p-3">Cintura (cm)</th>
                  <th className="p-3">Quadril (cm)</th>
                </tr>
              </thead>
              <tbody>
                {SIZES.filter((s) => availableSizes.includes(s)).map((size) => (
                  <tr key={size} className="border-t border-beige">
                    <td className="p-3 font-medium">{size}</td>
                    <td className="p-3">{sizeChart[size].bust}</td>
                    <td className="p-3">{sizeChart[size].waist}</td>
                    <td className="p-3">{sizeChart[size].hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <a
            href="/guia-de-medidas"
            className="inline-block mt-3 text-xs text-gold-dark underline"
          >
            Ver guia completo com instruções de medição
          </a>
        </details>
      )}
    </div>
  );
}
