"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao entrar.");
      return;
    }

    const redirect = searchParams.get("redirect") || "/admin";
    router.push(redirect);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-brown flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="bg-offwhite p-10 w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-2xl tracking-luxe text-brown">MAISON LUX</h1>
          <p className="text-xs uppercase tracking-luxe text-charcoal/50 mt-1">Painel Administrativo</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3">{error}</div>}

        <div>
          <label className="text-sm text-charcoal/70">E-mail</label>
          <input
            type="email"
            className="input-field mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm text-charcoal/70">Senha</label>
          <input
            type="password"
            className="input-field mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" isLoading={loading}>
          Entrar
        </Button>
      </form>
    </main>
  );
}
