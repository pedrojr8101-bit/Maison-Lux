"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  slug: string;
  size: string;
  color: string;
  unitPrice: number;
  image?: string;
  quantity: number;
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find((i) => i.variantId === item.variantId);
        if (existing) {
          const newQty = Math.min(existing.quantity + item.quantity, existing.maxStock);
          set({
            items: get().items.map((i) =>
              i.variantId === item.variantId ? { ...i, quantity: newQty } : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },

      updateQuantity: (variantId, quantity) => {
        set({
          items: get().items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
              : i
          ),
        });
      },

      clear: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    }),
    { name: "maison-lux-cart" }
  )
);
