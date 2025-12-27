# Finance

Sistema pessoal de gestão financeira para controle de gastos, orçamentos e planejamento.

## Stack

- **Runtime:** Node.js 22+ (LTS)
- **Frontend:** Next.js 16 (App Router) + React 19.2 + TypeScript
- **Styling:** Tailwind CSS 4.0 + shadcn/ui
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma 7
- **Auth:** Supabase Auth
- **Email:** Resend
- **Notifications:** Telegram Bot API

## Requisitos

- Node.js 22+ (LTS)
- pnpm 9+
- PostgreSQL (ou conta Supabase)

## Instalação

```bash
# Clone o repositório
git clone git@github.com:rcconsultech/finance.git
cd finance

# Instale dependências
pnpm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Configure o banco de dados
pnpm prisma generate
pnpm prisma db push

# Seed inicial (categorias)
pnpm prisma db seed

# Execute em desenvolvimento
pnpm dev
```

## Estrutura do Projeto

```
finance/
├── src/
│   ├── app/                 # App Router (páginas e API)
│   │   ├── (auth)/          # Rotas de autenticação
│   │   ├── (dashboard)/     # Rotas protegidas
│   │   └── api/             # API Routes
│   ├── components/          # Componentes React
│   │   ├── ui/              # shadcn/ui components
│   │   └── ...              # Custom components
│   ├── lib/                 # Utilitários e configurações
│   │   ├── db/              # Prisma client e repositories
│   │   ├── parsers/         # Parsers CSV/PDF
│   │   ├── categorizer/     # Lógica de categorização
│   │   └── services/        # Serviços de negócio
│   ├── hooks/               # Custom React hooks
│   └── types/               # TypeScript types
├── prisma/
│   └── schema.prisma        # Schema do banco
├── config/
│   ├── categories.yaml      # Hierarquia de categorias
│   └── patterns.yaml        # Regras de categorização
├── docs/                    # Documentação técnica
├── samples/                 # Arquivos de exemplo (dev only)
└── public/                  # Assets estáticos
```

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [PRODUCT.md](./PRODUCT.md) | Descrição do produto e requisitos |
| [CLAUDE.md](./CLAUDE.md) | Instruções para Claude Code agents |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Arquitetura do sistema |
| [docs/DATABASE.md](./docs/DATABASE.md) | Schema Prisma e queries |
| [docs/PARSERS.md](./docs/PARSERS.md) | Parsers de CSV e PDF |
| [docs/CATEGORIES.md](./docs/CATEGORIES.md) | Estrutura de categorias |
| [docs/BUSINESS_RULES.md](./docs/BUSINESS_RULES.md) | Regras de negócio |
| [docs/USER_FLOWS.md](./docs/USER_FLOWS.md) | Fluxos de usuário |
| [docs/EDGE_CASES.md](./docs/EDGE_CASES.md) | Casos especiais |
| [docs/API.md](./docs/API.md) | Documentação da API |

## Scripts

```bash
# Desenvolvimento
pnpm dev           # Inicia servidor de desenvolvimento
pnpm build         # Build de produção
pnpm start         # Inicia servidor de produção
pnpm lint          # Executa linter
pnpm typecheck     # Verifica tipos TypeScript

# Banco de Dados
pnpm prisma generate    # Gera Prisma Client
pnpm prisma db push     # Sincroniza schema com DB
pnpm prisma db seed     # Popula dados iniciais
pnpm prisma studio      # UI para explorar banco

# Testes
pnpm test          # Executa testes unitários
pnpm test:e2e      # Executa testes E2E
```

## Variáveis de Ambiente

Veja [.env.example](./.env.example) para lista completa.

Principais variáveis:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# Telegram (opcional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Email (opcional)
RESEND_API_KEY=
```

## Deploy

O projeto está configurado para deploy na Vercel.

```bash
# Deploy via CLI
vercel --prod
```

URL de produção: https://finance.rcconsultech.com

## Funcionalidades Principais

### Importação de Dados
- Upload de CSV (extrato Banco do Brasil)
- Upload de PDF (faturas de cartão)
- Detecção automática de formato
- Preview antes de confirmar

### Categorização
- Categorização automática via padrões
- Criação de regras personalizadas
- Categorização em lote

### Orçamentos
- Definição de limites por categoria
- Alertas progressivos (50%, 80%, 100%)
- Histórico e sugestões

### Assinaturas
- Detecção automática
- Rastreamento de compartilhamentos
- Provisão mensal para anuais

### Parcelas
- Rastreamento automático
- Projeção de término
- Cálculo de alívio futuro

### Dashboard
- Resumo financeiro mensal
- Gráficos por categoria
- Alertas e notificações

## Contribuição

Este é um projeto pessoal. Para reportar bugs ou sugerir melhorias:

1. Abra uma issue descrevendo o problema/sugestão
2. Aguarde aprovação antes de submeter PR
3. Siga os padrões de código existentes

## Licença

Proprietary - Todos os direitos reservados.
