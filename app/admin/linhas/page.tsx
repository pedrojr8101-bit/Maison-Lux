"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Line {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  _count: { products: number };
}

const emptyForm = { name: "", description: "", isFeatured: false, isActive: true, order: 0 };

export default function AdminLinesPage() {
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const loadLines = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/lines");
    setLines(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLines();
  }, [loadLines]);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError(null);
  }

  function openEdit(line: Line) {
    setForm({
      name: line.name,
      description: line.description ?? "",
      isFeatured: line.isFeatured,
      isActive: line.isActive,
      order: line.order,
    });
    setEditingId(line.id);
    setShowForm(true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const endpoint = editingId ? `/api/admin/lines/${editingId}` : "/api/admin/lines";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.toString() ?? "Erro ao salvar linha.");
      return;
    }

    setShowForm(false);
    loadLines();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta linha de produto?")) return;
    const res = await fetch(`/api/admin/lines/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    loadLines();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-brown">Linhas de Produto</h1>
        <Button onClick={openCreate}>
          <Plus size={16} /> Nova Linha
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card space-y-4 mb-8 max-w-lg">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-brown">
              {editingId ? "Editar Linha" : "Nova Linha"}
            </h2>
            <button type="button" onClick={() => setShowForm(false)}>
              <X size={18} />
            </button>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3">{error}</div>}

          <div>
            <label className="text-sm text-charcoal/70">Nome</label>
            <input
              className="input-field mt-1"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm text-charcoal/70">Descrição</label>
            <textarea
              rows={3}
              className="input-field mt-1"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              />
              Destacar na home (carrossel)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Ativa
            </label>
          </div>

          <div>
            <label className="text-sm text-charcoal/70">Ordem de exibição</label>
            <input
              type="number"
              className="input-field mt-1 !w-24"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            />
          </div>

          <Button type="submit">{editingId ? "Salvar Alterações" : "Criar Linha"}</Button>
        </form>
      )}

      <div className="admin-card overflow-x-auto !p-0">
        <table className="w-full text-sm">
          <thead className="bg-sand text-left text-charcoal/70 uppercase text-xs tracking-luxe">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">Produtos</th>
              <th className="p-4">Destaque</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-charcoal/50">
                  Carregando...
                </td>
              </tr>
            )}
            {!loading && lines.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-charcoal/50">
                  Nenhuma linha cadastrada.
                </td>
              </tr>
            )}
            {lines.map((line) => (
              <tr key={line.id} className="border-t border-beige">
                <td className="p-4">{line.name}</td>
                <td className="p-4">{line._count.products}</td>
                <td className="p-4">{line.isFeatured ? "Sim" : "Não"}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      line.isActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {line.isActive ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-3 text-charcoal/60">
                    <button onClick={() => openEdit(line)} title="Editar">
                      <Pencil size={18} className="hover:text-gold" />
                    </button>
                    <button onClick={() => handleDelete(line.id)} title="Excluir">
                      <Trash2 size={18} className="hover:text-red-700" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
