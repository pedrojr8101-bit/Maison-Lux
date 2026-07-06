"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import { SIZES } from "@/lib/validations";

interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  originalPrice: string;
  salePrice: string | null;
  line: { name: string; slug: string };
  images: { url: string }[];
  variants: { size: string; color: string; colorHex: string | null }[];
}

interface LineOption {
  name: string;
  slug: string;
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [items, setItems] = useState<ProductListItem[]>([]);
  const [lines, setLines] = useState<LineOption[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const linha = searchParams.get("linha") ?? "";
  const tamanho = searchParams.get("tamanho") ?? "";
  const cor = searchParams.get("cor") ?? "";
  const precoMax = searchParams.get("precoMax") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.set("page", "1");
      router.push(`/produtos?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (linha) params.set("linha", linha);
    if (tamanho) params.set("tamanho", tamanho);
    if (cor) params.set("cor", cor);
    if (precoMax) params.set("precoMax", precoMax);
    params.set("page", String(page));

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items);
        setLines(data.availableLines);
        setTotalPages(data.totalPages);
        setLoading(false);
      });
  }, [linha, tamanho, cor, precoMax, page]);

  // Cores disponíveis calculadas a partir dos próprios produtos já carregados
  const availableColors = Array.from(
    new Map(
      items.flatMap((p) => p.variants.map((v) => [v.color, v.colorHex]))
    ).entries()
  );

  return (
    <main className="max-w-content mx-auto px-6 py-12">
      <h1 className="section-title text-center mb-10">Coleção</h1>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10">
        {/* FILTROS */}
        <aside className="space-y-8">
          <div>
            <h3 className="text-xs uppercase tracking-luxe text-brown mb-3">Linha</h3>
            <div className="space-y-2 text-sm">
              <button
                className={`block ${!linha ? "text-gold-dark font-medium" : "text-charcoal/70"}`}
                onClick={() => updateFilter("linha", "")}
              >
                Todas
              </button>
              {lines.map((l) => (
                <button
                  key={l.slug}
                  className={`block ${linha === l.slug ? "text-gold-dark font-medium" : "text-charcoal/70"}`}
                  onClick={() => updateFilter("linha", l.slug)}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-luxe text-brown mb-3">Tamanho</h3>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => updateFilter("tamanho", tamanho === size ? "" : size)}
                  className={`w-9 h-9 text-xs border ${
                    tamanho === size
                      ? "bg-charcoal text-offwhite border-charcoal"
                      : "border-beige text-charcoal/70"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {availableColors.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-luxe text-brown mb-3">Cor</h3>
              <div className="flex flex-wrap gap-2">
                {availableColors.map(([colorName, colorHex]) => (
                  <button
                    key={colorName}
                    onClick={() => updateFilter("cor", cor === colorName ? "" : (colorName as string))}
                    title={colorName as string}
                    className={`w-8 h-8 rounded-full border-2 ${
                      cor === colorName ? "border-gold" : "border-beige"
                    }`}
                    style={{ backgroundColor: (colorHex as string) || "#ccc" }}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs uppercase tracking-luxe text-brown mb-3">Preço até</h3>
            <input
              type="range"
              min={100}
              max={3000}
              step={50}
              value={precoMax || 3000}
              onChange={(e) => updateFilter("precoMax", e.target.value)}
              className="w-full accent-gold"
            />
            <p className="text-xs text-charcoal/60 mt-1">
              R$ {precoMax || "3000"}
            </p>
          </div>
        </aside>

        {/* GRID DE PRODUTOS */}
        <div>
          {loading ? (
            <p className="text-center text-charcoal/50 py-20">Carregando produtos...</p>
          ) : items.length === 0 ? (
            <p className="text-center text-charcoal/50 py-20">
              Nenhum produto encontrado com esses filtros.
            </p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {items.map((product) => (
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
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-12">
              <button
                disabled={page <= 1}
                onClick={() => updateFilter("page", String(page - 1))}
                className="btn-outline disabled:opacity-30"
              >
                Anterior
              </button>
              <span className="self-center text-sm">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => updateFilter("page", String(page + 1))}
                className="btn-outline disabled:opacity-30"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageContent />
    </Suspense>
  );
}
