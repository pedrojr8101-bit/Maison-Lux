import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Usuário administrador padrão
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@maisonlux.com" },
    update: {},
    create: {
      name: "Administradora Maison Lux",
      email: "admin@maisonlux.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  // Linhas de produto
  const linhaAlfaiataria = await prisma.productLine.create({
    data: {
      name: "Alfaiataria",
      slug: "alfaiataria",
      description: "Peças estruturadas com caimento impecável.",
      isFeatured: true,
      order: 1,
    },
  });

  const linhaSeda = await prisma.productLine.create({
    data: {
      name: "Coleção Seda",
      slug: "colecao-seda",
      description: "Fluidez e leveza em tecidos nobres.",
      isFeatured: true,
      order: 2,
    },
  });

  // Produto de exemplo com grade completa
  await prisma.product.create({
    data: {
      name: "Blazer Alfaiataria Camel",
      slug: "blazer-alfaiataria-camel",
      description:
        "Blazer de alfaiataria em tom camel, com forro interno e botões em resina. Caimento reto e estruturado.",
      fabric: "70% Lã, 30% Poliéster",
      fit: "Reto",
      originalPrice: 890.0,
      salePrice: 712.0,
      status: "ACTIVE",
      isNewArrival: true,
      lineId: linhaAlfaiataria.id,
      variants: {
        create: [
          { size: "P", color: "Camel", colorHex: "#C19A6B", sku: "BLZ-CAM-P", stock: 5 },
          { size: "M", color: "Camel", colorHex: "#C19A6B", sku: "BLZ-CAM-M", stock: 8 },
          { size: "G", color: "Camel", colorHex: "#C19A6B", sku: "BLZ-CAM-G", stock: 3 },
        ],
      },
      images: {
        create: [{ url: "/images/products/blazer-camel-1.jpg", isCover: true, order: 0 }],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Vestido Midi Seda Off-White",
      slug: "vestido-midi-seda-off-white",
      description: "Vestido midi em seda pura, corte fluido e cinto de amarrar na cintura.",
      fabric: "100% Seda",
      fit: "Fluido",
      originalPrice: 1250.0,
      status: "ACTIVE",
      isNewArrival: true,
      lineId: linhaSeda.id,
      variants: {
        create: [
          { size: "PP", color: "Off-White", colorHex: "#FAF7F2", sku: "VST-OFW-PP", stock: 4 },
          { size: "P", color: "Off-White", colorHex: "#FAF7F2", sku: "VST-OFW-P", stock: 6 },
        ],
      },
      images: {
        create: [{ url: "/images/products/vestido-seda-1.jpg", isCover: true, order: 0 }],
      },
    },
  });

  console.log("Seed concluído. Login admin: admin@maisonlux.com / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
