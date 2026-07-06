# Maison Lux — E-commerce de Moda Feminina

Catálogo digital + e-commerce premium, com painel administrativo completo para o lojista.

## Stack escolhida

| Camada        | Tecnologia                                                   |
|---------------|----------------------------------------------------------------|
| Front-end     | **Next.js 14 (App Router)** + React 18 + TypeScript            |
| Estilo        | **Tailwind CSS** (tema custom "Maison Lux")                    |
| Back-end      | **Route Handlers do próprio Next.js** (`/app/api/**`) — Node.js |
| Banco de dados| **PostgreSQL** + **Prisma ORM**                                 |
| Autenticação  | JWT em cookie httpOnly (`lib/auth.ts`) + `middleware.ts`        |
| Formulários   | react-hook-form + zod                                          |
| Gráficos      | Recharts                                                        |
| Ícones        | lucide-react                                                    |

Por que essa stack: um único projeto Next.js serve tanto a loja quanto o admin e a API,
compartilhando tipos (Prisma), validações (zod) e componentes — reduz drasticamente a
complexidade de deploy (1 único serviço) sem abrir mão de separação de responsabilidades
via route groups.

## Estrutura de pastas

```
maison-lux/
├── prisma/
│   ├── schema.prisma          # Modelagem completa do banco
│   └── seed.ts                # Dados de exemplo (admin + linhas + produtos)
├── lib/
│   ├── prisma.ts              # Singleton do Prisma Client
│   ├── auth.ts                # Hash de senha, JWT, sessão
│   └── validations.ts         # Schemas Zod (Produto, Linha, Variante)
├── middleware.ts              # Protege /admin/** e /api/admin/**
├── app/
│   ├── globals.css            # Tema visual (cores, tipografia, componentes base)
│   ├── layout.tsx             # Layout raiz, fontes Playfair Display + Inter
│   │
│   ├── (store)/                       # ÁREA DO CLIENTE
│   │   ├── page.tsx                   # Home (hero, linhas em destaque, lançamentos)
│   │   ├── produtos/page.tsx          # Listagem com filtros [a implementar na íntegra]
│   │   └── produto/[slug]/page.tsx    # PDP [a implementar na íntegra]
│   │
│   ├── admin/                          # ÁREA ADMINISTRATIVA (protegida)
│   │   ├── page.tsx                    # Dashboard (KPIs + gráfico semanal)
│   │   ├── produtos/page.tsx           # Listagem: busca, paginação, arquivar/excluir
│   │   ├── produtos/novo/page.tsx      # Criar produto (formulário completo)
│   │   ├── produtos/[id]/editar/page.tsx
│   │   ├── linhas/page.tsx             # [a implementar: usa mesmo padrão de produtos]
│   │   └── pedidos/page.tsx            # Visualizar pedidos e mudar status
│   │
│   └── api/
│       ├── auth/login/route.ts
│       └── admin/
│           ├── dashboard/route.ts
│           ├── lines/route.ts              (GET, POST)
│           ├── lines/[id]/route.ts         (GET, PUT, DELETE)
│           ├── products/route.ts           (GET c/ busca+paginação, POST)
│           ├── products/[id]/route.ts      (GET, PUT, DELETE archive|hard)
│           ├── orders/route.ts             (GET)
│           ├── orders/[id]/route.ts        (PUT status)
│           └── media/upload/route.ts       (upload de imagens)
│
└── components/
    ├── ui/Button.tsx
    ├── store/ProductCard.tsx
    └── admin/ProductForm.tsx      # Formulário com grade de estoque + upload de imagens
```

## Modelagem do banco (resumo)

- **User** (`role`: ADMIN | STAFF | CUSTOMER) — mesmo modelo atende lojista e cliente final.
- **ProductLine** — as "coleções"/categorias exibidas no carrossel da home.
- **Product** — nome, preços (original + promocional), tecido, caimento, status
  (DRAFT/ACTIVE/ARCHIVED), pertence a uma `ProductLine`.
- **ProductVariant** — a grade PP/P/M/G/GG × Cor, cada uma com **SKU e estoque próprios**
  (`@@unique([productId, size, color])` evita duplicidade).
- **ProductImage** — galeria ordenável, com flag `isCover`.
- **Order / OrderItem** — pedido com status (AGUARDANDO_PAGAMENTO, PAGO, ENVIADO, CANCELADO),
  método de pagamento (PIX/CREDIT_CARD), e snapshot do preço no momento da compra
  (`unitPrice` em `OrderItem`, importante para não alterar histórico se o preço mudar depois).

Ver `prisma/schema.prisma` para o esquema completo e comentado.

## Regras de negócio já implementadas nas rotas

- **Exclusão de Linha bloqueada** se houver produtos vinculados (retorna 409 com mensagem clara).
- **Exclusão definitiva de Produto bloqueada** se já existirem pedidos associados — nesse caso
  o sistema força o **arquivamento** (soft delete), preservando o histórico de vendas.
- **Slug único** gerado automaticamente a partir do nome (com sufixo incremental em colisões).
- **SKU único por variante**, validado tanto no schema (`@@unique`) quanto na API (checagem de
  duplicados antes de gravar).
- Todas as rotas `/api/admin/**` são protegidas pelo `middleware.ts` (checa cookie JWT) e
  devolvem 401 se a sessão for inválida.

## Como rodar localmente

```bash
npm install
cp .env.example .env        # configure DATABASE_URL e JWT_SECRET
npx prisma migrate dev       # cria as tabelas
npm run prisma:seed          # popula admin + dados de exemplo
npm run dev
```

Login do admin de exemplo (criado pelo seed): `admin@maisonlux.com` / `admin123`

## Atualização — Área do Cliente completa

Nesta segunda rodada foram implementados todos os itens que faltavam:

1. **Carrinho** (`lib/store/cart.ts`) — Zustand com persistência em `localStorage`, contador
   no ícone do `Header`, adicionar/remover/atualizar quantidade respeitando o estoque da variante.
2. **Listagem pública de produtos** (`/produtos`) — filtros por Linha, Tamanho, Cor (swatch) e
   Preço (slider), com paginação. Consome `/api/products` (rota pública, somente `status: ACTIVE`).
3. **PDP completa** (`/produto/[slug]`) — `ProductGallery` com efeito de zoom no hover e
   miniaturas, `ProductInfo` com seleção dependente de Tamanho → Cor, aviso de estoque baixo,
   botão "Adicionar à Sacola" e seção de produtos relacionados da mesma linha.
4. **Carrinho** (`/carrinho`) e **Checkout One-Page** (`/checkout`) com Pix (QR Code real via
   lib `qrcode` a partir de payload simulado BR Code) e Cartão de Crédito (simulado, aprovado
   automaticamente). `/api/orders` cria/reaproveita usuário por e-mail (checkout de convidado),
   valida e decrementa estoque em transação, gera código do pedido e payload Pix.
5. **Tela de Linhas no Admin** (`/admin/linhas`) — CRUD completo.
6. **Login do Admin** (`/admin/login`) + logout + `AdminShell` com sidebar de navegação.

## Próximos passos sugeridos (fora do escopo desta entrega)

1. Página de "Minha Conta" para o cliente acompanhar pedidos (hoje o checkout é só guest).
2. E-mail transacional de confirmação de pedido.
3. Upload de imagens para storage externo (S3/Cloudinary/R2) em produção.
4. Webhook real de Pix (PSP como Mercado Pago/Pagar.me) para confirmar pagamento automaticamente.
5. Testes automatizados (unitários nas rotas de API + E2E no fluxo de checkout).
