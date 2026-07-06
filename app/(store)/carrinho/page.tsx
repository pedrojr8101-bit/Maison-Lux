"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const formatPrice = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <main className="max-w-content mx-auto px-6 py-12">
      <h1 className="section-title text-center mb-10">Sua Sacola</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-charcoal/60 mb-6">Sua sacola está vazia.</p>
          <Link href="/produtos" className="btn-outline">
            Ver Coleção
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-12">
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-4 border-b border-beige pb-6">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.productName} className="w-24 h-32 object-cover" />
                ) : (
                  <div className="w-24 h-32 bg-sand" />
                )}
                <div className="flex-1">
                  <h3 className="font-serif text-lg text-charcoal">{item.productName}</h3>
                  <p className="text-xs text-charcoal/60 mt-1">
                    Tamanho {item.size} · Cor {item.color}
                  </p>
                  <p className="text-sm text-charcoal mt-2">{formatPrice(item.unitPrice)}</p>

                  <div className="flex items-center gap-3 mt-3">
                    <select
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.variantId, Number(e.target.value))}
                      className="input-field !w-20 !py-1"
                    >
                      {Array.from({ length: item.maxStock }, (_, i) => i + 1).map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-red-700 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="admin-card h-fit space-y-4">
            <h2 className="font-serif text-lg text-brown">Resumo</h2>
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal())}</span>
            </div>
            <div className="flex justify-between text-sm text-charcoal/60">
              <span>Frete</span>
              <span>Calculado no checkout</span>
            </div>
            <div className="border-t border-beige pt-4 flex justify-between font-medium">
              <span>Total</span>
              <span>{formatPrice(subtotal())}</span>
            </div>
            <Link href="/checkout">
              <Button className="w-full">Finalizar Compra</Button>
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
