"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/Button";
import { PixPayment } from "@/components/store/PixPayment";

interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
}

const formatPrice = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const SHIPPING_COST = 10;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ code: string; pixPayload: string | null; total: number } | null>(
    null
  );

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && items.length === 0 && !result) {
      router.push("/carrinho");
    }
  }, [mounted, items, result, router]);

  async function onSubmit(data: CheckoutFormData) {
    setSubmitting(true);
    setError(null);

    const payload = {
      customer: { name: data.name, email: data.email, phone: data.phone },
      address: {
        street: data.street,
        number: data.number,
        complement: data.complement,
        district: data.district,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      },
      paymentMethod: "PIX" as const,
      items: items.map((i) => ({
        variantId: i.variantId,
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      shippingCost: SHIPPING_COST,
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(json.error?.toString() ?? "Erro ao finalizar o pedido.");
      return;
    }

    setResult({ code: json.code, pixPayload: json.pixPayload, total: json.total });
    clear();
  }

  if (!mounted) return null;

  if (result) {
    if (result.pixPayload) {
      return (
        <main className="max-w-content mx-auto px-6 py-16">
          <PixPayment payload={result.pixPayload} total={result.total} orderCode={result.code} />
        </main>
      );
    }
    return (
      <main className="max-w-content mx-auto px-6 py-24 text-center">
        <h1 className="section-title mb-4">Pedido Confirmado</h1>
        <p className="text-charcoal/70">
          Seu pedido <span className="font-medium">{result.code}</span> foi registrado com sucesso.
        </p>
        <p className="text-charcoal/70 mt-1">Total: {formatPrice(result.total)}</p>
      </main>
    );
  }

  const total = subtotal() + SHIPPING_COST;

  return (
    <main className="max-w-content mx-auto px-6 py-12">
      <h1 className="section-title text-center mb-10">Finalizar Compra</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-12">
        <div className="space-y-8">
          {error && <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4">{error}</div>}

          <section className="admin-card space-y-4">
            <h2 className="font-serif text-lg text-brown">Seus Dados</h2>
            <input className="input-field" placeholder="Nome completo" {...register("name", { required: true })} />
            {errors.name && <p className="text-xs text-red-700">Informe seu nome.</p>}
            <div className="grid grid-cols-2 gap-4">
              <input className="input-field" placeholder="E-mail" type="email" {...register("email", { required: true })} />
              <input className="input-field" placeholder="Telefone" {...register("phone")} />
            </div>
          </section>

          <section className="admin-card space-y-4">
            <h2 className="font-serif text-lg text-brown">Endereço de Entrega</h2>
            <div className="grid grid-cols-3 gap-4">
              <input className="input-field col-span-2" placeholder="Rua" {...register("street", { required: true })} />
              <input className="input-field" placeholder="Número" {...register("number", { required: true })} />
            </div>
            <input className="input-field" placeholder="Complemento (opcional)" {...register("complement")} />
            <div className="grid grid-cols-4 gap-4">
              <input className="input-field col-span-2" placeholder="Bairro" {...register("district", { required: true })} />
              <input className="input-field" placeholder="Cidade" {...register("city", { required: true })} />
              <input className="input-field" placeholder="UF" maxLength={2} {...register("state", { required: true })} />
            </div>
            <input className="input-field" placeholder="CEP" {...register("zipCode", { required: true })} />
          </section>

          <section className="admin-card space-y-4">
            <h2 className="font-serif text-lg text-brown">Pagamento</h2>
            <div className="flex-1 py-3 text-sm uppercase tracking-luxe border border-gold bg-sand text-center">
              Pix
            </div>
            <p className="text-xs text-charcoal/50">
              No momento aceitamos apenas pagamento via Pix. Ao confirmar, geraremos um QR Code
              para pagamento instantâneo.
            </p>
          </section>
        </div>