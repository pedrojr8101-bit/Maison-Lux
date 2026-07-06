"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());

  // Evita mismatch de hidratação (o carrinho vem do localStorage, só existe no cliente)
  useEffect(() => setMounted(true), []);

  const links = [
    { href: "/produtos", label: "Coleção" },
    { href: "/produtos?linha=alfaiataria", label: "Alfaiataria" },
    { href: "/produtos?linha=colecao-seda", label: "Seda" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-offwhite/95 backdrop-blur border-b border-beige">
      <div className="max-w-content mx-auto px-6 h-20 flex items-center justify-between">
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" className="font-serif text-2xl tracking-luxe text-brown">
          MAISON LUX
        </Link>

        <nav className="hidden md:flex gap-8 text-sm tracking-luxe uppercase">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-gold-dark transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/carrinho" className="relative">
          <ShoppingBag size={22} />
          {mounted && totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-gold text-offwhite text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
      </div>

      {menuOpen && (
        <nav className="md:hidden flex flex-col gap-4 px-6 pb-6 text-sm tracking-luxe uppercase">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
