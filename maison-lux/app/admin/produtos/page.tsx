"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Pencil, Archive, Trash2, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ProductRow {
  id: string;
  name: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  originalPrice: string;
  salePrice: string | null;
  totalStock: number;
  line: { name: string };
  images: { url: string }[];
}

const statusLabel: Record<ProductRow["status"], string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  ARCHIVED: "Arquivado",
};

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ProductRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ search, page: String(page), pageSize: "10" });
    const res = await fetch(`/api/admin/products?${params}`);
    const data = await res.json();
    setItems(data.items);
    setTotalPages(data.totalPages);
    setLoading(false);
  }, [search, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleArchive(id: string) {
    if (!confirm("Arquivar este produto? Ele deixará de aparecer na loja.")) return;
    await fetch(`/api/admin/products/${id}?mode=archive`, { method: "DELETE" });
    loadProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir permanentemente este produto? Essa ação não pode ser desfeita.")) return;
    const res = await fetch(`/api/admin/products/${id}?mode=hard`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    loadProducts();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-brown">Modelos de Roupas</h1>
        <Link href="/admin/produtos/novo">
          <Button>
            <Plus size={16} /> Novo Modelo
          </Button>
        </Link>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" size={18} />
        <input
          className="input-field pl-10"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="admin-card overflow-x-auto !p-0">
        <table className="w-full text-sm">
          <thead className="bg-sand text-left text-charcoal/70 uppercase text-xs tracking-luxe">
            <tr>
              <th className="p-4">Produto</th>
              <th className="p-4">Linha</th>
              <th className="p-4">Preço</th>
              <th className="p-4">Estoque</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ações</th>
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
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-charcoal/50">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
            {items.map((product) => (
              <tr key={product.id} className="border-t border-beige">
                <td className="p-4 flex items-center gap-3">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.images[0].url} alt="" className="w-10 h-10 object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-sand" />
                  )}
                  <span>{product.name}</span>
                </td>
                <td className="p-4">{product.line.name}</td>
                <td className="p-4">
                  {product.salePrice ? (
                    <>
                      <span className="line-through text-charcoal/40 mr-2">
                        R$ {Number(product.originalPrice).toFixed(2)}
                      </span>
                      R$ {Number(product.salePrice).toFixed(2)}
                    </>
                  ) : (
                    <>R$ {Number(product.originalPrice).toFixed(2)}</>
                  )}
                </td>
                <td className="p-4">{product.totalStock}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      product.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : product.status === "DRAFT"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {statusLabel[product.status]}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-3 text-charcoal/60">
                    <Link href={`/admin/produtos/${product.id}/editar`} title="Editar">
                      <Pencil size={18} className="hover:text-gold" />
                    </Link>
                    <button onClick={() => handleArchive(product.id)} title="Arquivar">
                      <Archive size={18} className="hover:text-gold" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} title="Excluir">
                      <Trash2 size={18} className="hover:text-red-700" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="btn-outline disabled:opacity-30"
        >
          Anterior
        </button>
        <span className="self-center text-sm">
          Página {page} de {totalPages || 1}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="btn-outline disabled:opacity-30"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
