"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Trash2, Plus, UploadCloud } from "lucide-react";
import { productSchema, SIZES, ProductInput } from "@/lib/validations";
import { Button } from "@/components/ui/Button";

interface ProductLineOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  lines: ProductLineOption[];
  defaultValues?: Partial<ProductInput>;
  productId?: string; // presente somente em modo edição
}

const emptyVariant = { size: "M" as const, color: "", colorHex: "", sku: "", stock: 0 };

export function ProductForm({ lines, defaultValues, productId }: ProductFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: "DRAFT",
      isNewArrival: false,
      images: [],
      variants: [emptyVariant],
      ...defaultValues,
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: "variants" });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({ control, name: "images" });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/media/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok) {
          appendImage({ url: data.url, altText: "", isCover: imageFields.length === 0 });
        }
      }
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: ProductInput) {
    setServerError(null);
    const endpoint = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
    const method = productId ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setServerError(err.error?.toString() ?? "Erro ao salvar produto.");
      return;
    }

    router.push("/admin/produtos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4">
          {serverError}
        </div>
      )}

      {/* DADOS PRINCIPAIS */}
      <section className="admin-card space-y-4">
        <h2 className="font-serif text-xl text-brown">Informações do Modelo</h2>

        <div>
          <label className="text-sm text-charcoal/70">Nome do modelo</label>
          <input className="input-field mt-1" {...register("name")} />
          {errors.name && <p className="text-xs text-red-700 mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-charcoal/70">Preço original (R$)</label>
            <input
              type="number"
              step="0.01"
              className="input-field mt-1"
              {...register("originalPrice", { valueAsNumber: true })}
            />
            {errors.originalPrice && (
              <p className="text-xs text-red-700 mt-1">{errors.originalPrice.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-charcoal/70">Preço promocional (opcional)</label>
            <input
              type="number"
              step="0.01"
              className="input-field mt-1"
              {...register("salePrice", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-charcoal/70">Linha de Produto</label>
          <select className="input-field mt-1" {...register("lineId")}>
            <option value="">Selecione...</option>
            {lines.map((line) => (
              <option key={line.id} value={line.id}>
                {line.name}
              </option>
            ))}
          </select>
          {errors.lineId && <p className="text-xs text-red-700 mt-1">{errors.lineId.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-charcoal/70">Tecido / Composição</label>
            <input className="input-field mt-1" {...register("fabric")} />
          </div>
          <div>
            <label className="text-sm text-charcoal/70">Caimento</label>
            <input className="input-field mt-1" placeholder="Ex: Reto, Slim, Oversized" {...register("fit")} />
          </div>
        </div>

        <div>
          <label className="text-sm text-charcoal/70">Descrição</label>
          <textarea rows={4} className="input-field mt-1" {...register("description")} />
          {errors.description && (
            <p className="text-xs text-red-700 mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isNewArrival")} /> Novo Lançamento
          </label>
          <div className="flex items-center gap-2 text-sm">
            <span>Status:</span>
            <select className="input-field !w-auto" {...register("status")}>
              <option value="DRAFT">Rascunho</option>
              <option value="ACTIVE">Ativo</option>
              <option value="ARCHIVED">Arquivado</option>
            </select>
          </div>
        </div>
      </section>

      {/* GRADE DE ESTOQUE: TAMANHO x COR */}
      <section className="admin-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-brown">Grade de Estoque</h2>
          <Button
            type="button"
            variant="outline"
            onClick={() => appendVariant(emptyVariant)}
          >
            <Plus size={16} /> Adicionar Variação
          </Button>
        </div>
        {errors.variants?.message && (
          <p className="text-xs text-red-700">{errors.variants.message as string}</p>
        )}

        <div className="space-y-3">
          {variantFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-3 items-center border-b border-beige pb-3">
              <div className="col-span-2">
                <label className="text-xs text-charcoal/60">Tamanho</label>
                <select className="input-field mt-1" {...register(`variants.${index}.size`)}>
                  {SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-3">
                <label className="text-xs text-charcoal/60">Cor</label>
                <input className="input-field mt-1" {...register(`variants.${index}.color`)} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-charcoal/60">Hex (swatch)</label>
                <input
                  type="color"
                  className="mt-1 h-11 w-full border border-beige"
                  {...register(`variants.${index}.colorHex`)}
                />
              </div>
              <div className="col-span-3">
                <label className="text-xs text-charcoal/60">SKU</label>
                <input className="input-field mt-1" {...register(`variants.${index}.sku`)} />
              </div>
              <div className="col-span-1">
                <label className="text-xs text-charcoal/60">Estoque</label>
                <input
                  type="number"
                  className="input-field mt-1"
                  {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="text-red-700 hover:text-red-900 mt-5"
                  aria-label="Remover variação"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GALERIA DE IMAGENS */}
      <section className="admin-card space-y-4">
        <h2 className="font-serif text-xl text-brown">Fotos do Produto</h2>

        <label className="flex flex-col items-center justify-center border-2 border-dashed border-beige rounded-md py-10 cursor-pointer hover:border-gold transition-colors">
          <UploadCloud className="text-gold mb-2" size={28} />
          <span className="text-sm text-charcoal/70">
            {uploading ? "Enviando..." : "Clique para enviar imagens (JPG/PNG)"}
          </span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
        </label>

        <div className="grid grid-cols-4 gap-4">
          {imageFields.map((field, index) => (
            <div key={field.id} className="relative border border-beige">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={watch(`images.${index}.url`)} alt="" className="w-full aspect-square object-cover" />
              <div className="absolute top-1 right-1 flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    imageFields.forEach((_, i) => setValue(`images.${i}.isCover`, i === index));
                  }}
                  className="text-xs bg-white/90 px-2 py-1"
                  title="Definir como capa"
                >
                  Capa
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="text-xs bg-white/90 px-2 py-1 text-red-700"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {watch(`images.${index}.isCover`) && (
                <span className="absolute bottom-1 left-1 bg-gold text-offwhite text-[10px] px-2 py-0.5">
                  CAPA
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/produtos")}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {productId ? "Salvar Alterações" : "Cadastrar Produto"}
        </Button>
      </div>
    </form>
  );
}
