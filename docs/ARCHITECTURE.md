# Arquitetura do Sistema

## Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE                                  │
│                    (Browser/Mobile)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL EDGE                                 │
│              (CDN + Edge Functions)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NEXT.JS APP                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Pages     │  │  API Routes  │  │   Server     │          │
│  │  (App Router)│  │   (/api/*)   │  │  Components  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      LIB LAYER                            │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │  │
│  │  │ Parsers │  │ Services│  │  Utils  │  │  Types  │     │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│    SUPABASE      │ │    RESEND    │ │   TELEGRAM   │
│  (PostgreSQL +   │ │   (Email)    │ │    (Bot)     │
│     Auth)        │ │              │ │              │
└──────────────────┘ └──────────────┘ └──────────────┘
```

## Decisões Técnicas

### Por que Next.js 16 App Router?

| Decisão | Justificativa |
|---------|---------------|
| Server Components | Reduz bundle size, melhor SEO, fetch direto no servidor |
| App Router | API mais moderna, layouts aninhados, loading states nativos |
| React 19.2 | View Transitions, Activity API, useEffectEvent |
| Turbopack | Builds até 5x mais rápidos, incremental em microsegundos |
| API Routes | Backend e frontend no mesmo deploy, sem CORS |
| Edge Runtime | Menor latência para usuários no Brasil |

### Por que Supabase?

| Decisão | Justificativa |
|---------|---------------|
| PostgreSQL | Banco relacional robusto, bom para dados financeiros |
| Free tier generoso | 500MB storage, 2GB transfer, suficiente para uso pessoal |
| Auth integrado | Login sem implementação manual |
| Real-time | Futuro: atualizações live no dashboard |
| Row Level Security | Segurança a nível de banco |

### Por que Prisma 7?

| Decisão | Justificativa |
|---------|---------------|
| Type safety | Queries tipadas, menos erros |
| Nova arquitetura | Query Compiler em TypeScript/WASM, 3.4x mais rápido |
| Bundle menor | 90% menor (1.6MB vs 14MB), ideal para serverless |
| Edge support | Funciona em Cloudflare Workers, Vercel Edge, Deno, Bun |
| Migrations | Controle de versão do schema |
| Studio | Nova versão do Prisma Studio |

### Por que shadcn/ui + Tailwind 4.0?

| Decisão | Justificativa |
|---------|---------------|
| Não é biblioteca | Componentes copiados, controle total |
| Tailwind 4.0 | Engine 5x mais rápido, CSS-first config, cascade layers |
| Acessibilidade | Radix UI por baixo, ARIA compliant |
| Dark mode | Suporte nativo com CSS custom properties |

## Fluxo de Dados

### Import de Transações

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Upload    │────▶│   Parser    │────▶│  Validator  │
│  (CSV/PDF)  │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Database  │◀────│  Categorize │◀────│  Transform  │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

1. **Upload:** Usuário faz upload de CSV ou PDF
2. **Parser:** Extrai dados estruturados do arquivo
3. **Validator:** Valida formato, datas, valores
4. **Transform:** Normaliza dados para schema do banco
5. **Categorize:** Aplica regras de categorização
6. **Database:** Salva transações e metadata

### Cálculo de Orçamento

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Transações │────▶│  Aggregate  │────▶│   Compare   │
│   do Mês    │     │ por Categoria│    │  vs Budget  │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   Alerts    │
                                        │  (50/80/100)│
                                        └─────────────┘
```

## Camadas da Aplicação

### 1. Presentation Layer (src/app, src/components)

Responsável por:
- Renderização de UI
- Interação com usuário
- Routing
- Loading/Error states

```
src/app/
├── (auth)/                 # Layout autenticado
│   ├── layout.tsx         # Sidebar + Header
│   ├── dashboard/
│   │   └── page.tsx       # Server Component
│   └── transactions/
│       ├── page.tsx       # Lista
│       └── [id]/
│           └── page.tsx   # Detalhe
└── api/                    # API Routes
```

### 2. Business Logic Layer (src/lib/services)

Responsável por:
- Regras de negócio
- Cálculos financeiros
- Validações complexas

```
src/lib/services/
├── transaction-service.ts
├── budget-service.ts
├── categorization-service.ts
├── import-service.ts
└── notification-service.ts
```

### 3. Data Access Layer (src/lib/prisma, src/lib/supabase)

Responsável por:
- Queries ao banco
- Transformação de dados
- Cache

```
src/lib/
├── prisma.ts              # Singleton do Prisma Client
├── supabase.ts            # Singleton do Supabase Client
└── repositories/
    ├── transaction-repository.ts
    ├── category-repository.ts
    └── user-repository.ts
```

### 4. Infrastructure Layer (src/lib/parsers, external services)

Responsável por:
- Parsing de arquivos
- Integrações externas
- Email, Telegram

```
src/lib/
├── parsers/
│   ├── csv-parser.ts
│   ├── pdf-parser.ts
│   └── index.ts
├── email/
│   └── resend.ts
└── telegram/
    └── bot.ts
```

## Patterns Utilizados

### Repository Pattern

```typescript
// src/lib/repositories/transaction-repository.ts
export const transactionRepository = {
  async findMany(filters: TransactionFilters) {
    return prisma.transaction.findMany({
      where: buildWhereClause(filters),
      include: { category: true },
      orderBy: { date: 'desc' },
    });
  },

  async create(data: CreateTransactionInput) {
    return prisma.transaction.create({ data });
  },

  async bulkCreate(transactions: CreateTransactionInput[]) {
    return prisma.transaction.createMany({ data: transactions });
  },
};
```

### Service Pattern

```typescript
// src/lib/services/budget-service.ts
export const budgetService = {
  async calculateAvailable(userId: string, month: Date) {
    const income = await this.getMonthlyIncome(userId, month);
    const fixedCosts = await this.getFixedCosts(userId);
    const installments = await this.getInstallments(userId, month);
    const provisions = await this.getAnnualProvisions(userId);

    return income - fixedCosts - installments - provisions;
  },

  async checkAlerts(userId: string, month: Date) {
    const budgets = await this.getBudgets(userId, month);
    const spent = await this.getSpentByCategory(userId, month);

    return budgets.map(budget => ({
      ...budget,
      percentage: (spent[budget.categoryId] / budget.limit) * 100,
      alert: this.determineAlertLevel(spent[budget.categoryId], budget.limit),
    }));
  },
};
```

### Factory Pattern (para Parsers)

```typescript
// src/lib/parsers/index.ts
export function createParser(fileType: 'csv' | 'pdf-visa' | 'pdf-elo') {
  switch (fileType) {
    case 'csv':
      return new BancoBrasilCSVParser();
    case 'pdf-visa':
      return new BancoBrasilVisaPDFParser();
    case 'pdf-elo':
      return new BancoBrasilEloPDFParser();
    default:
      throw new Error(`Unknown file type: ${fileType}`);
  }
}
```

## Segurança

### Autenticação

```typescript
// Middleware para proteger rotas
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session && req.nextUrl.pathname.startsWith('/(auth)')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}
```

### Row Level Security (Supabase)

```sql
-- Cada usuário só vê seus próprios dados
CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### Validação de Input

```typescript
// Usar Zod para validação
import { z } from 'zod';

const transactionSchema = z.object({
  date: z.coerce.date(),
  description: z.string().min(1).max(500),
  amount: z.number(),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().uuid().optional(),
});
```

## Performance

### Caching Strategy

```typescript
// React Query para cache no cliente
const { data } = useQuery({
  queryKey: ['transactions', month],
  queryFn: () => fetchTransactions(month),
  staleTime: 5 * 60 * 1000, // 5 minutos
  cacheTime: 30 * 60 * 1000, // 30 minutos
});
```

### Database Indexes

```prisma
model Transaction {
  // ...
  @@index([userId, date])
  @@index([userId, categoryId])
  @@index([userId, type, date])
}
```

### Lazy Loading

```typescript
// Componentes pesados carregados sob demanda
const ChartComponent = dynamic(
  () => import('@/components/charts/spending-chart'),
  { loading: () => <ChartSkeleton /> }
);
```

## Monitoramento

### Error Tracking

```typescript
// Integrar Sentry para erros em produção (futuro)
if (process.env.NODE_ENV === 'production') {
  Sentry.captureException(error);
}
```

### Logs

```typescript
// Logger estruturado
const log = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date() }));
  },
  error: (message: string, error: Error, meta?: object) => {
    console.error(JSON.stringify({ level: 'error', message, error: error.message, stack: error.stack, ...meta, timestamp: new Date() }));
  },
};
```

## Testes

### Estrutura

```
__tests__/
├── unit/
│   ├── parsers/
│   │   ├── csv-parser.test.ts
│   │   └── pdf-parser.test.ts
│   └── services/
│       ├── budget-service.test.ts
│       └── categorization-service.test.ts
├── integration/
│   └── api/
│       └── transactions.test.ts
└── e2e/
    └── import-flow.test.ts
```

### Fixtures

```typescript
// __tests__/fixtures/transactions.ts
export const mockTransactions = [
  {
    id: '1',
    date: new Date('2025-11-15'),
    description: 'RESTAURANTE OUTBACK',
    amount: -150.00,
    type: 'expense',
    categoryId: 'alimentacao-restaurante',
  },
  // ...
];
```

## Deploy

### Ambientes

| Ambiente | URL | Branch | Database |
|----------|-----|--------|----------|
| Development | localhost:3000 | - | Local/Supabase dev |
| Preview | *.vercel.app | PR branches | Supabase dev |
| Production | finance.rcconsultech.com | main | Supabase prod |

### CI/CD (Vercel)

```yaml
# Automático via Vercel:
# 1. Push para branch → Preview deploy
# 2. Merge para main → Production deploy
# 3. Prisma migrate deploy automático
```

### Environment Variables

```bash
# Ver .env.example para lista completa
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
TELEGRAM_BOT_TOKEN=
```

---

*Documento técnico - Atualizar conforme decisões evoluem*
