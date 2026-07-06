"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check } from "lucide-react";

interface PixPaymentProps {
  payload: string;
  total: number;
  orderCode: string;
}

const formatPrice = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export function PixPayment({ payload, total, orderCode }: PixPaymentProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(payload, { width: 260, margin: 1, color: { dark: "#1A1A1A" } }).then(
      setQrDataUrl
    );
  }, [payload]);

  function handleCopy() {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="admin-card text-center max-w-md mx-auto space-y-6">
      <div>
        <p className="text-xs uppercase tracking-luxe text-brown/60">Pedido {orderCode}</p>
        <h2 className="font-serif text-2xl text-brown mt-1">Pague com Pix</h2>
        <p className="text-sm text-charcoal/60 mt-1">{formatPrice(total)}</p>
      </div>

      {qrDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qrDataUrl} alt="QR Code Pix" className="mx-auto" />
      ) : (
        <div className="h-[260px] flex items-center justify-center text-charcoal/40">
          Gerando QR Code...
        </div>
      )}

      <div>
        <p className="text-xs text-charcoal/60 mb-2">Ou copie o código Pix Copia e Cola:</p>
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-between gap-2 border border-beige px-4 py-3 text-xs text-charcoal/70 hover:border-gold"
        >
          <span className="truncate">{payload}</span>
          {copied ? <Check size={16} className="text-green-700 flex-shrink-0" /> : <Copy size={16} className="flex-shrink-0" />}
        </button>
      </div>

      <p className="text-xs text-charcoal/50">
        Assim que o pagamento for identificado, seu pedido passará automaticamente para
        &quot;Pago&quot; e você receberá a confirmação por e-mail.
      </p>
    </div>
  );
}
