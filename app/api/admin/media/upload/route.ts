import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

// POST /api/admin/media/upload — recebe multipart/form-data com "file"
// Usa o Vercel Blob Storage (necessário em produção, já que o sistema de
// arquivos do servidor é somente leitura).
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Formato de imagem não suportado." }, { status: 400 });
  }

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

  const blob = await put(fileName, file, { access: "public" });

  return NextResponse.json({ url: blob.url }, { status: 201 });
}