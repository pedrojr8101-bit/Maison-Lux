"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DollarSign, ShoppingBag, TrendingUp, CheckCircle } from "lucide-react";

interface DashboardData {
  totalSalesMonth: number;
  totalOrdersMonth: number;
  avgTicket: number;
  paidOrdersMonth: number;
  weeklyChart: { day: string; total: number }[];
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const cards = data
    ? [
        { label: "Vendas do Mês", value: formatBRL(data.totalSalesMonth), icon: DollarSign },
        { label: "Ticket Médio", value: formatBRL(data.avgTicket), icon: TrendingUp },
        { label: "Total de Pedidos", value: data.totalOrdersMonth, icon: ShoppingBag },
        { label: "Pedidos Pagos", value: data.paidOrdersMonth, icon: CheckCircle },
      ]
    : [];

  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl text-brown mb-6">Visão Geral</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {cards.map((card) => (
          <div key={card.label} className="admin-card flex items-center gap-4">
            <div className="bg-sand p-3 rounded-full text-gold-dark">
              <card.icon size={22} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-luxe text-charcoal/50">{card.label}</p>
              <p className="text-xl font-serif text-brown">{card.value ?? "—"}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <h2 className="font-serif text-lg text-brown mb-4">Faturamento — Últimos 7 dias</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data?.weeklyChart ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4D6C1" />
            <XAxis dataKey="day" stroke="#1A1A1A" fontSize={12} />
            <YAxis stroke="#1A1A1A" fontSize={12} tickFormatter={(v) => `R$${v}`} />
            <Tooltip formatter={(value: number) => formatBRL(value)} />
            <Line type="monotone" dataKey="total" stroke="#B08D57" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
