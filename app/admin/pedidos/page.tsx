"use client";

import { useEffect, useState, useCallback } from "react";

interface OrderRow {
  id: string;
  code: string;
  status: "AGUARDANDO_PAGAMENTO" | "PAGO" | "ENVIADO" | "CANCELADO";
  total: string;
  paymentMethod: "PIX" | "CREDIT_CARD";
  createdAt: string;
  user: { name: string; email: string };
  items: { product: { name: string }; quantity: number }[];
}

const statusOptions = [
  { value: "AGUARDANDO_PAGAMENTO", label: "Aguardando Pagamento" },
  { value: "PAGO", label: "Pago" },
  { value: "ENVIADO", label: "Enviado" },
  { value: "CANCELADO", label: "Cancelado" },
];

const statusColor: Record<OrderRow["status"], string> = {
  AGUARDANDO_PAGAMENTO: "bg-yellow-100 text-yellow-800",
  PAGO: "bg-green-100 text-green-800",
  ENVIADO: "bg-blue-100 text-blue-800",
  CANCELADO: "bg-gray-200 text-gray-600",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/orders");
    setOrders(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl text-brown mb-6">Pedidos</h1>

      <div className="admin-card overflow-x-auto !p-0">
        <table className="w-full text-sm">
          <thead className="bg-sand text-left text-charcoal/70 uppercase text-xs tracking-luxe">
            <tr>
              <th className="p-4">Código</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Itens</th>
              <th className="p-4">Total</th>
              <th className="p-4">Pagamento</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-charcoal/50">
                  Carregando...
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-beige align-top">
                <td className="p-4 font-medium">{order.code}</td>
                <td className="p-4">
                  <div>{order.user.name}</div>
                  <div className="text-xs text-charcoal/50">{order.user.email}</div>
                </td>
                <td className="p-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="text-xs">
                      {item.quantity}x {item.product.name}
                    </div>
                  ))}
                </td>
                <td className="p-4">R$ {Number(order.total).toFixed(2)}</td>
                <td className="p-4">{order.paymentMethod === "PIX" ? "Pix" : "Cartão"}</td>
                <td className="p-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full border-0 ${statusColor[order.status]}`}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
