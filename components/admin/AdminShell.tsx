"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex bg-offwhite min-h-screen">
      <AdminSidebar />
      <main className="flex-1 ml-64">{children}</main>
    </div>
  );
}
