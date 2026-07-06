"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Shirt, Layers, Package, LogOut } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/linhas", label: "Linhas de Produto", icon: Layers },
  { href: "/admin/produtos", label: "Modelos", icon: Shirt },
  { href: "/admin/pedidos", label: "Pedidos", icon: Package },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-64 min-h-screen bg-brown text-offwhite/80 flex flex-col fixed">
      <div className="p-6 border-b border-offwhite/10">
        <h1 className="font-serif text-xl tracking-luxe text-offwhite">MAISON LUX</h1>
        <p className="text-xs text-offwhite/50 mt-1">Painel Administrativo</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 text-sm rounded-md transition-colors",
                active ? "bg-gold text-offwhite" : "hover:bg-offwhite/10"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-4 m-4 text-sm border-t border-offwhite/10 hover:text-gold"
      >
        <LogOut size={18} /> Sair
      </button>
    </aside>
  );
}
