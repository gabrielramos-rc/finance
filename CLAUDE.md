# Finance - Instruções para Claude Code

> Sistema pessoal de gestão financeira para controle de gastos, orçamentos e investimentos.

## Contexto do Projeto

Este é um sistema **pessoal** (não comercial) para ajudar Gabriel a controlar suas finanças após uma redução de 50% na renda. O sistema importa dados do Banco do Brasil (CSV e PDF), categoriza transações automaticamente, e fornece visibilidade sobre gastos, orçamentos e investimentos.

**Usuário principal:** Gabriel (desenvolvedor, Brasília)
**Usuária secundária:** Isabela (esposa, acesso para visualização)

## Stack Tecnológica

```
Runtime:        Node.js 22+ (LTS)
Frontend:       Next.js 16 (App Router) + React 19.2 + TypeScript
Styling:        Tailwind CSS 4.0 + shadcn/ui
Charts:         Recharts
State:          React Query (TanStack Query v5)
Backend:        Next.js API Routes + TypeScript
ORM:            Prisma 7
Database:       PostgreSQL (Supabase)
Auth:           Supabase Auth
Email:          Resend
File Parsing:   papaparse (CSV), pdf-parse (PDF)
Hosting:        Vercel
Domain:         finance.rcconsultech.com
```

## Estrutura de Pastas

```
/finance
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Rotas autenticadas
│   │   │   ├── dashboard/
│   │   │   ├── transactions/
│   │   │   ├── budgets/
│   │   │   ├── subscriptions/
│   │   │   ├── installments/
│   │   │   └── settings/
│   │   ├── api/               # API Routes
│   │   │   ├── transactions/
│   │   │   ├── import/
│   │   │   ├── categories/
│   │   │   └── reports/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                # shadcn components
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── charts/
│   │   └── forms/
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── supabase.ts        # Supabase client
│   │   ├── parsers/           # CSV and PDF parsers
│   │   │   ├── csv-parser.ts
│   │   │   ├── pdf-parser.ts
│   │   │   └── categorizer.ts
│   │   ├── utils/
│   │   └── constants/
│   ├── hooks/
│   ├── types/
│   └── styles/
├── prisma/
│   └── schema.prisma
├── config/
│   ├── categories.yaml
│   └── patterns.yaml
├── docs/
├── samples/                    # Dados de exemplo (não commitar dados reais)
└── public/
```

## Padrões de Código

### Nomenclatura
- **Arquivos:** kebab-case (`transaction-list.tsx`)
- **Componentes:** PascalCase (`TransactionList`)
- **Funções:** camelCase (`getTransactions`)
- **Constantes:** UPPER_SNAKE_CASE (`MAX_UPLOAD_SIZE`)
- **Types/Interfaces:** PascalCase com prefixo descritivo (`TransactionWithCategory`)

### Componentes React
```tsx
// Preferir function components com TypeScript
interface TransactionCardProps {
  transaction: Transaction;
  onEdit?: (id: string) => void;
}

export function TransactionCard({ transaction, onEdit }: TransactionCardProps) {
  // ...
}
```

### Server vs Client Components
- **Server Components (default):** Para fetch de dados, sem interatividade
- **Client Components ('use client'):** Para interatividade, hooks, event handlers
- Preferir Server Components sempre que possível

### Data Fetching
```tsx
// Server Component - fetch direto
async function DashboardPage() {
  const transactions = await getTransactions();
  return <TransactionList transactions={transactions} />;
}

// Client Component - React Query
function TransactionList() {
  const { data, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });
}
```

### API Routes
```tsx
// src/app/api/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const transactions = await prisma.transaction.findMany();
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
```

### Tratamento de Erros
- Sempre usar try/catch em operações async
- Retornar mensagens de erro claras em português
- Logar erros no servidor, mostrar mensagens amigáveis no cliente

### Formatação de Valores
```tsx
// Sempre usar formatação brasileira
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};
```

## Design System

### Cores (Dark Mode Default)
```css
/* Usar variáveis do Tailwind/shadcn */
--background: dark gray
--foreground: white/light
--primary: blue (ações principais)
--destructive: red (alertas críticos, valores negativos)
--warning: yellow/amber (alertas de atenção)
--success: green (positivo, dentro do orçamento)
--muted: gray (informações secundárias)
```

### Componentes UI
- Usar shadcn/ui como base
- Manter consistência visual
- Feedback visual para todas as ações
- Loading states em todas as operações async
- Empty states informativos

### Responsividade
- Mobile-first
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Dashboard deve funcionar bem em mobile

## Regras de Negócio Importantes

### Fontes de Dados
1. **Extrato CSV (Banco do Brasil):** Visão geral da conta, inclui PIX, boletos, débitos automáticos
2. **Fatura PDF VISA:** Detalhes de compras no cartão VISA
3. **Fatura PDF ELO:** Detalhes de compras no cartão ELO

**Regra de Reconciliação:** Transações de cartão vêm das faturas PDF (detalhadas). O pagamento do cartão no extrato CSV deve ser ignorado ou marcado como "transferência interna".

### Categorização
- Auto-categorizar baseado em patterns (ver `config/patterns.yaml`)
- Transações não reconhecidas → categoria "A Classificar" + alerta
- Correções manuais devem criar novas regras

### Cálculos Financeiros
```
DISPONÍVEL_MÊS = renda_recebida
                 - custos_fixos
                 - parcelas
                 - provisão_anuais
                 - reserva_segurança (% configurável)
                 - dízimo (se ativo)

SUGESTÃO_INVESTIMENTO = saldo_conta
                        - compromissos_pendentes
                        - colchão_mínimo (R$ 5.000)
```

### Alertas de Orçamento
- 🟢 **50%:** Info - "Você usou metade do orçamento de [categoria]"
- 🟡 **80%:** Warning - "Atenção: 80% do orçamento usado"
- 🔴 **100%+:** Critical - "Orçamento de [categoria] estourado!"

## O Que NUNCA Fazer

1. **NUNCA** commitar dados financeiros reais (samples/ deve ter .gitignore)
2. **NUNCA** expor credenciais ou tokens no código
3. **NUNCA** fazer fetch de dados no cliente quando pode ser server-side
4. **NUNCA** ignorar erros silenciosamente
5. **NUNCA** usar `any` no TypeScript (use `unknown` se necessário)
6. **NUNCA** criar componentes gigantes (max ~200 linhas)
7. **NUNCA** duplicar lógica de negócio (centralizar em lib/)
8. **NUNCA** hardcodar valores que devem ser configuráveis

## Comandos Úteis

```bash
# Desenvolvimento
pnpm dev

# Build
pnpm build

# Lint
pnpm lint

# Type checking
pnpm typecheck

# Prisma
pnpm prisma generate      # Gerar client
pnpm prisma db push       # Sync schema (dev)
pnpm prisma migrate dev   # Criar migration
pnpm prisma studio        # UI do banco

# Testes
pnpm test
```

## Arquivos de Referência

| Documento | Descrição |
|-----------|-----------|
| `PRODUCT.md` | Visão completa do produto |
| `docs/ARCHITECTURE.md` | Decisões técnicas |
| `docs/DATABASE.md` | Schema e relacionamentos |
| `docs/PARSERS.md` | Como parsear CSV/PDF |
| `docs/CATEGORIES.md` | Hierarquia de categorias |
| `docs/BUSINESS_RULES.md` | Fórmulas e cálculos |
| `docs/USER_FLOWS.md` | Fluxos de usuário |
| `docs/EDGE_CASES.md` | Casos especiais |
| `docs/API.md` | Endpoints da API |
| `config/categories.yaml` | Estrutura de categorias |
| `config/patterns.yaml` | Regras de categorização |

## Dados de Teste

A pasta `samples/` contém 12 meses de dados reais (anonimizados para desenvolvimento):
- `samples/account/` - Extratos CSV
- `samples/cards/` - Faturas PDF (VISA e ELO)

Use esses dados para testar parsers e categorização.

## Contexto do Usuário

- **Renda:** ~R$ 20.000/mês (variável, mínimo garantido)
- **Custos fixos:** ~R$ 12.000/mês
- **Parcelas atuais:** ~R$ 5.000/mês (reduzindo ao longo do tempo)
- **Dia de pagamento:** Dia 10 de cada mês
- **Saldo mínimo desejado:** R$ 5.000 (para cobrir despesas antes do dia 10)
- **Fatura cartão:** Fecha dia 4, vence dia 16
- **Objetivo:** Visibilidade, controle, investir consistentemente

## Prioridades de Implementação

1. **MVP Core:** Import de dados + Dashboard + Categorização básica
2. **Orçamentos:** Limites por categoria + Alertas
3. **Parcelas:** Tracking + Projeção de término
4. **Assinaturas:** Listagem + Identificação de economia
5. **Notificações:** Telegram + Email
6. **Investimentos:** Sugestão + Tracking de patrimônio

---

*Última atualização: Dezembro 2025*
