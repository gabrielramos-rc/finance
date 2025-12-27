# Fluxos de Usuário

## 1. Onboarding (Primeira Vez)

```
┌─────────────────────────────────────────────────────────────────┐
│                      FLUXO DE ONBOARDING                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐     │
│  │  Login  │───▶│  Setup  │───▶│ Import  │───▶│ Review  │     │
│  │ Supabase│    │ Inicial │    │  Dados  │    │Categorias│     │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘     │
│       │              │              │              │            │
│       ▼              ▼              ▼              ▼            │
│   Autenticação   Config básica   Upload CSV/PDF   Validar      │
│   com Google     renda, colchão   banco, cartões  categorias   │
│                                                                  │
│                         ┌─────────┐                             │
│                         │Dashboard│                             │
│                         │ Pronto! │                             │
│                         └─────────┘                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.1 Login/Cadastro

```typescript
// Páginas: /login, /signup
// Componentes: LoginForm, SignupForm, SocialButtons

// Fluxo:
1. Usuário acessa /login
2. Opções:
   a) Login com Google (recomendado)
   b) Login com Email/Senha
   c) Link para cadastro
3. Após autenticação, redirecionar para:
   - /onboarding (se primeiro acesso)
   - /dashboard (se já configurado)

// Verificar primeiro acesso:
async function isFirstAccess(userId: string): Promise<boolean> {
  const settings = await prisma.userSettings.findUnique({
    where: { userId }
  });
  return !settings || !settings.onboardingCompleted;
}
```

### 1.2 Configuração Inicial

```typescript
// Página: /onboarding/setup
// Wizard com 3-4 steps

const ONBOARDING_STEPS = [
  {
    id: 'profile',
    title: 'Seu Perfil',
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', disabled: true },
    ],
  },
  {
    id: 'finances',
    title: 'Configuração Financeira',
    fields: [
      {
        name: 'expectedIncome',
        label: 'Renda mensal esperada',
        type: 'currency',
        help: 'Valor líquido que você costuma receber',
        required: true,
      },
      {
        name: 'minimumBalance',
        label: 'Saldo mínimo na conta',
        type: 'currency',
        default: 5000,
        help: 'Colchão de segurança para imprevistos',
      },
    ],
  },
  {
    id: 'preferences',
    title: 'Preferências',
    fields: [
      {
        name: 'titheEnabled',
        label: 'Controlar dízimo?',
        type: 'boolean',
        default: false,
      },
      {
        name: 'tithePercent',
        label: 'Percentual do dízimo',
        type: 'percent',
        showIf: 'titheEnabled',
        default: 10,
      },
    ],
  },
];
```

### 1.3 Import Inicial

```typescript
// Página: /onboarding/import
// Componentes: FileUploader, ImportProgress, ImportPreview

// Instruções exibidas:
const IMPORT_INSTRUCTIONS = {
  csv: {
    title: 'Extrato Banco do Brasil (CSV)',
    steps: [
      '1. Acesse o Internet Banking do BB',
      '2. Vá em Conta Corrente > Extrato',
      '3. Selecione o período desejado',
      '4. Clique em "Salvar" e escolha CSV',
    ],
    tip: 'Importe os últimos 3-6 meses para melhor análise',
  },
  pdf: {
    title: 'Fatura do Cartão (PDF)',
    steps: [
      '1. Acesse o app BB ou Internet Banking',
      '2. Vá em Cartões > Faturas',
      '3. Selecione a fatura fechada',
      '4. Clique em "Baixar PDF"',
    ],
    tip: 'Importe todas as faturas dos últimos 3-6 meses',
  },
};

// Fluxo de upload:
// 1. Usuário arrasta ou seleciona arquivo(s)
// 2. Sistema detecta tipo automaticamente
// 3. Parsing em background
// 4. Exibe preview com resumo
// 5. Usuário confirma importação
```

### 1.4 Revisão de Categorias

```typescript
// Página: /onboarding/review
// Componentes: TransactionList, CategorySelector, BulkActions

// Exibir apenas transações não categorizadas:
// - Lista com agrupamento por merchant similar
// - Opção de categorizar em lote
// - Criar regra automática

// UI:
// ┌─────────────────────────────────────────────────────────┐
// │ Transações para Revisar                     [Pular ▶]  │
// ├─────────────────────────────────────────────────────────┤
// │ ⬜ CASCOL (5 transações)                    [Categoria ▼]│
// │    Total: R$ 850,00                                     │
// │                                                          │
// │ ⬜ TAGUATINGA (2 transações)                [Categoria ▼]│
// │    Total: R$ 340,00                                     │
// │                                                          │
// │ ⬜ DONA AGUAS CLARAS (8 transações)         [Categoria ▼]│
// │    Total: R$ 1.200,00                                   │
// └─────────────────────────────────────────────────────────┘
// │ [Aplicar Seleção] ou [Pular para Dashboard]            │
// └─────────────────────────────────────────────────────────┘
```

---

## 2. Fluxo de Importação (Recorrente)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE IMPORTAÇÃO                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐     │
│  │ Upload  │───▶│ Parsing │───▶│ Preview │───▶│ Confirm │     │
│  │  File   │    │   Auto  │    │  Review │    │  Save   │     │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘     │
│       │              │              │              │            │
│       ▼              ▼              ▼              ▼            │
│   Drag & Drop    Detectar tipo   Ver transações  Salvar no DB  │
│   ou click       Aplicar regras  Ver duplicatas  Atualizar     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.1 Upload de Arquivo

```typescript
// Página: /import
// Componentes: DropZone, FileList, ImportHistory

interface ImportPageState {
  files: File[];
  uploading: boolean;
  imports: ImportRecord[];
}

// Aceitar múltiplos arquivos de uma vez
// Validações:
// - Tipo: CSV ou PDF
// - Tamanho: máx 10MB
// - Conteúdo: formato reconhecido

function validateFile(file: File): ValidationResult {
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'Arquivo muito grande (máx 10MB)' };
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!['csv', 'pdf'].includes(ext || '')) {
    return { valid: false, error: 'Formato não suportado (use CSV ou PDF)' };
  }

  return { valid: true };
}
```

### 2.2 Preview e Confirmação

```typescript
// Página: /import/[id]/preview
// Componentes: PreviewTable, SummaryCard, DuplicateWarning

interface PreviewPageProps {
  importId: string;
  transactions: ParsedTransaction[];
  summary: {
    total: number;
    new: number;
    duplicates: number;
    uncategorized: number;
    totalIncome: number;
    totalExpense: number;
    period: { start: string; end: string };
  };
}

// UI do Preview:
// ┌─────────────────────────────────────────────────────────────┐
// │ Preview: extrato-112025.csv                                 │
// ├─────────────────────────────────────────────────────────────┤
// │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
// │ │ 45 transações│ │ 3 duplicatas │ │ 5 para revisar│        │
// │ └──────────────┘ └──────────────┘ └──────────────┘         │
// │                                                             │
// │ ⚠️ 3 transações já existem e serão ignoradas               │
// │                                                             │
// │ Período: 01/11/2025 - 30/11/2025                           │
// │ Total Entradas: R$ 20.000,00                               │
// │ Total Saídas: R$ -18.500,00                                │
// │                                                             │
// │ [Ver Todas] [Ver Duplicatas] [Ver Não Categorizadas]       │
// │                                                             │
// │ ┌───────────────────────────────────────────────────────┐ │
// │ │ Data  │ Descrição           │ Valor    │ Categoria    │ │
// │ ├───────────────────────────────────────────────────────┤ │
// │ │ 15/11 │ OUTBACK BRASILIA    │ -110,54  │ Restaurantes │ │
// │ │ 14/11 │ UBER                │ -25,00   │ Transporte   │ │
// │ │ ...   │ ...                 │ ...      │ ...          │ │
// │ └───────────────────────────────────────────────────────┘ │
// │                                                             │
// │           [Cancelar]  [Confirmar Importação]               │
// └─────────────────────────────────────────────────────────────┘
```

---

## 3. Dashboard Principal

```
┌─────────────────────────────────────────────────────────────────┐
│                      LAYOUT DO DASHBOARD                        │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │  [Logo] Finance                    Nov 2025 ▼  [🔔] [👤]   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│ │ Renda     │ │ Gastos    │ │ Saldo     │ │ Orçamento │       │
│ │ R$ 20.000 │ │ R$ 18.500 │ │ R$ 1.500  │ │ 75%       │       │
│ │ ✓ 100%    │ │ Fixo+Var  │ │ Projetado │ │ ████████░░│       │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘       │
│                                                                  │
│ ┌──────────────────────────┐ ┌──────────────────────────────┐ │
│ │ Gastos por Categoria     │ │ Alertas                      │ │
│ │ ┌────────────────────┐  │ │ ⚠️ Alimentação 85% do limite │ │
│ │ │ [Gráfico Donut]    │  │ │ 📅 Fatura vence em 3 dias    │ │
│ │ │                    │  │ │ ❓ 2 transações para revisar │ │
│ │ └────────────────────┘  │ │                              │ │
│ │ Alimentação    R$ 2.550 │ │                              │ │
│ │ Transporte     R$ 1.300 │ │                              │ │
│ │ Assinaturas    R$ 1.065 │ │                              │ │
│ └──────────────────────────┘ └──────────────────────────────┘ │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Últimas Transações                            [Ver Todas ▶] │ │
│ │ ┌───────────────────────────────────────────────────────┐  │ │
│ │ │ Hoje                                                  │  │ │
│ │ │ 🍽️ OUTBACK BRASILIA           -R$ 110,54  Restaurantes │  │ │
│ │ │ 🚗 UBER                        -R$ 25,00  Transporte  │  │ │
│ │ │                                                       │  │ │
│ │ │ Ontem                                                 │  │ │
│ │ │ 🛒 DONA AGUAS CLARAS          -R$ 220,90  Supermercado│  │ │
│ │ └───────────────────────────────────────────────────────┘  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Sidebar (collapsed)                                        │  │
│ │ 📊 Dashboard                                               │  │
│ │ 💳 Transações                                              │  │
│ │ 📁 Categorias                                              │  │
│ │ 💰 Orçamentos                                              │  │
│ │ 🔄 Assinaturas                                             │  │
│ │ 📋 Parcelas                                                │  │
│ │ 📤 Importar                                                │  │
│ │ ⚙️ Configurações                                           │  │
│ └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.1 Componentes do Dashboard

```typescript
// Página: /dashboard
// Componentes principais:

interface DashboardComponents {
  // Header
  MonthSelector: { current: string; onChange: (month: string) => void };
  NotificationBell: { unreadCount: number };
  UserMenu: { user: User };

  // Cards de resumo
  SummaryCards: {
    income: { received: number; expected: number };
    expenses: { total: number; byType: Record<string, number> };
    balance: { projected: number; current: number };
    budget: { total: number; used: number };
  };

  // Gráficos
  CategoryDonut: { data: CategoryTotal[] };
  TrendLine: { data: MonthlyTrend[] }; // Opcional no MVP

  // Listas
  AlertsList: { alerts: Alert[] };
  RecentTransactions: { transactions: Transaction[]; limit: number };
  BudgetProgress: { budgets: BudgetWithProgress[] };
}
```

### 3.2 Interações do Dashboard

```typescript
// Ações disponíveis:

// 1. Mudar mês
function handleMonthChange(month: string) {
  router.push(`/dashboard?month=${month}`);
  // Recarrega dados via React Query
}

// 2. Clicar em categoria no gráfico
function handleCategoryClick(categorySlug: string) {
  router.push(`/transactions?category=${categorySlug}`);
}

// 3. Clicar em alerta
function handleAlertClick(alert: Alert) {
  // Marca como lido
  await markAlertAsRead(alert.id);
  // Navega para contexto
  if (alert.type === 'budget_warning') {
    router.push(`/budgets?category=${alert.data.categorySlug}`);
  } else if (alert.type === 'unknown_merchant') {
    router.push(`/transactions/${alert.data.transactionId}`);
  }
}

// 4. Ver todas as transações
function handleViewAllTransactions() {
  router.push('/transactions');
}
```

---

## 4. Gestão de Transações

### 4.1 Lista de Transações

```typescript
// Página: /transactions
// Componentes: TransactionFilters, TransactionTable, TransactionDetail

interface TransactionListState {
  filters: {
    month: string;
    category: string | null;
    type: 'all' | 'income' | 'expense';
    search: string;
    uncategorizedOnly: boolean;
    cardHolder: string | null;
  };
  sort: {
    field: 'date' | 'amount' | 'description';
    direction: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    perPage: number;
  };
}

// Layout:
// ┌─────────────────────────────────────────────────────────────┐
// │ Transações                                                  │
// ├─────────────────────────────────────────────────────────────┤
// │ ┌─────────────────────────────────────────────────────────┐ │
// │ │ [🔍 Buscar...]  [Nov 2025 ▼] [Categoria ▼] [Tipo ▼]    │ │
// │ │ [ ] Apenas não categorizadas  [Titular ▼]              │ │
// │ └─────────────────────────────────────────────────────────┘ │
// │                                                             │
// │ ┌─────────────────────────────────────────────────────────┐ │
// │ │ ⬜ │ Data  │ Descrição          │ Valor   │ Categoria   │ │
// │ ├─────────────────────────────────────────────────────────┤ │
// │ │ ⬜ │ 15/11 │ OUTBACK BRASILIA   │ -110,54 │ Restaurante │ │
// │ │ ⬜ │ 14/11 │ UBER               │ -25,00  │ Transporte  │ │
// │ │ ⬜ │ 14/11 │ CASCOL             │ -150,00 │ ❓         │ │
// │ └─────────────────────────────────────────────────────────┘ │
// │                                                             │
// │ [Ações em Lote ▼]              Mostrando 1-20 de 150 [◀ ▶] │
// └─────────────────────────────────────────────────────────────┘
```

### 4.2 Detalhe/Edição de Transação

```typescript
// Página: /transactions/[id] ou Modal
// Componentes: TransactionDetail, CategoryPicker, RuleCreator

interface TransactionDetailProps {
  transaction: Transaction;
  onUpdate: (data: Partial<Transaction>) => void;
  onCreateRule: (rule: CategorizeRule) => void;
}

// Layout do Modal/Página:
// ┌─────────────────────────────────────────────────────────────┐
// │ Detalhes da Transação                              [✕]     │
// ├─────────────────────────────────────────────────────────────┤
// │                                                             │
// │ OUTBACK BRASILIA BRASILIA BR                               │
// │ ─────────────────────────────────────────────              │
// │                                                             │
// │ Data:      15/11/2025                                      │
// │ Valor:     R$ -110,54                                      │
// │ Cartão:    VISA Infinite ****4256                          │
// │ Titular:   Gabriel L Ramos                                 │
// │                                                             │
// │ Categoria: [Restaurantes ▼]                                │
// │                                                             │
// │ Notas:     [                          ]                    │
// │                                                             │
// │ ☐ Ignorar esta transação nos cálculos                     │
// │                                                             │
// │ ─────────────────────────────────────────────              │
// │ Criar regra automática:                                    │
// │ [ ] Categorizar automaticamente transações com "OUTBACK"   │
// │     como "Restaurantes"                                    │
// │                                                             │
// │                          [Cancelar] [Salvar]               │
// └─────────────────────────────────────────────────────────────┘
```

### 4.3 Categorização em Lote

```typescript
// Componente: BulkCategorize
// Ativado quando múltiplas transações são selecionadas

interface BulkCategorizeProps {
  selectedIds: string[];
  onApply: (categoryId: string, createRule: boolean) => void;
}

// UI:
// ┌─────────────────────────────────────────────────────────────┐
// │ 5 transações selecionadas                                  │
// │                                                             │
// │ Categorizar como: [Selecione... ▼]                        │
// │                                                             │
// │ ☑ Criar regra para "CASCOL" (3 transações)                │
// │ ☑ Criar regra para "POSTO EXTRA" (2 transações)           │
// │                                                             │
// │                    [Cancelar] [Aplicar]                    │
// └─────────────────────────────────────────────────────────────┘
```

---

## 5. Gestão de Orçamentos

```typescript
// Página: /budgets
// Componentes: BudgetList, BudgetForm, BudgetProgress

// Layout:
// ┌─────────────────────────────────────────────────────────────┐
// │ Orçamentos - Novembro 2025                    [+ Novo]     │
// ├─────────────────────────────────────────────────────────────┤
// │                                                             │
// │ ┌──────────────────────────────────────────────────────┐  │
// │ │ Total Disponível: R$ 10.000                          │  │
// │ │ Total Alocado:    R$ 8.500                           │  │
// │ │ Livre para alocar: R$ 1.500                          │  │
// │ └──────────────────────────────────────────────────────┘  │
// │                                                             │
// │ ┌──────────────────────────────────────────────────────┐  │
// │ │ 🍽️ Alimentação                            [Editar]   │  │
// │ │ Limite: R$ 3.000   Gasto: R$ 2.550   Restante: R$ 450│  │
// │ │ ████████████████████████████████░░░░░░░░░░░ 85%      │  │
// │ │ ⚠️ Atenção: próximo do limite                        │  │
// │ └──────────────────────────────────────────────────────┘  │
// │                                                             │
// │ ┌──────────────────────────────────────────────────────┐  │
// │ │ 🚗 Transporte                              [Editar]   │  │
// │ │ Limite: R$ 1.500   Gasto: R$ 1.300   Restante: R$ 200│  │
// │ │ ████████████████████████████████████████░░░░ 87%     │  │
// │ └──────────────────────────────────────────────────────┘  │
// │                                                             │
// │ ┌──────────────────────────────────────────────────────┐  │
// │ │ 🐕 Pets                                    [Editar]   │  │
// │ │ Limite: R$ 500     Gasto: R$ 180     Restante: R$ 320│  │
// │ │ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 36%      │  │
// │ └──────────────────────────────────────────────────────┘  │
// │                                                             │
// └─────────────────────────────────────────────────────────────┘

// Modal de Edição:
// ┌─────────────────────────────────────────────────────────────┐
// │ Editar Orçamento - Alimentação                     [✕]     │
// ├─────────────────────────────────────────────────────────────┤
// │                                                             │
// │ Limite mensal: R$ [3.000,00]                               │
// │                                                             │
// │ Histórico (média últimos 3 meses): R$ 2.800                │
// │ Sugestão do sistema: R$ 2.520 (-10%)                       │
// │                                                             │
// │ Alertas:                                                   │
// │ ☑ Notificar em 50% (R$ 1.500)                            │
// │ ☑ Notificar em 80% (R$ 2.400)                            │
// │ ☑ Notificar em 100% (R$ 3.000)                           │
// │                                                             │
// │                         [Cancelar] [Salvar]                │
// └─────────────────────────────────────────────────────────────┘
```

---

## 6. Gestão de Assinaturas

```typescript
// Página: /subscriptions
// Componentes: SubscriptionList, SubscriptionForm, ShareManager

// Layout:
// ┌─────────────────────────────────────────────────────────────┐
// │ Assinaturas                                   [+ Nova]     │
// ├─────────────────────────────────────────────────────────────┤
// │                                                             │
// │ ┌──────────────────────────────────────────────────────┐  │
// │ │ Resumo Mensal                                        │  │
// │ │ Total Mensal:    R$ 1.065    │  A Receber: R$ 45     │  │
// │ │ Total Anual:     R$ 980      │  Líquido: R$ 1.020    │  │
// │ └──────────────────────────────────────────────────────┘  │
// │                                                             │
// │ ─── Mensais ───────────────────────────────────────────   │
// │                                                             │
// │ ┌──────────────────────────────────────────────────────┐  │
// │ │ 📺 Netflix                    R$ 55,90/mês  [Ativo]  │  │
// │ │ Compartilhado: João (R$ 15) ❌  Maria (R$ 15) ✅      │  │
// │ │ Próxima cobrança: 15/12                              │  │
// │ └──────────────────────────────────────────────────────┘  │
// │                                                             │
// │ ┌──────────────────────────────────────────────────────┐  │
// │ │ 🎵 Spotify Família            R$ 34,90/mês  [Ativo]  │  │
// │ │ Compartilhado: -                                     │  │
// │ │ Próxima cobrança: 20/12                              │  │
// │ └──────────────────────────────────────────────────────┘  │
// │                                                             │
// │ ─── Anuais ────────────────────────────────────────────   │
// │                                                             │
// │ ┌──────────────────────────────────────────────────────┐  │
// │ │ 💼 LinkedIn Premium           R$ 420/ano    [Ativo]  │  │
// │ │ Provisão mensal: R$ 35                               │  │
// │ │ Próxima cobrança: Nov/2026                           │  │
// │ └──────────────────────────────────────────────────────┘  │
// │                                                             │
// └─────────────────────────────────────────────────────────────┘
```

---

## 7. Gestão de Parcelas

```typescript
// Página: /installments
// Componentes: InstallmentList, InstallmentDetail, ProjectionChart

// Layout:
// ┌─────────────────────────────────────────────────────────────┐
// │ Parcelas                                                    │
// ├─────────────────────────────────────────────────────────────┤
// │                                                             │
// │ ┌──────────────────────────────────────────────────────┐  │
// │ │ Impacto Mensal Atual: R$ 4.922                       │  │
// │ │ Total Restante: R$ 18.000                            │  │
// │ └──────────────────────────────────────────────────────┘  │
// │                                                             │
// │ ─── Projeção de Alívio ────────────────────────────────   │
// │ ┌──────────────────────────────────────────────────────┐  │
// │ │ [Gráfico de barras mostrando redução por mês]        │  │
// │ │                                                       │  │
// │ │ Jan/26: -R$ 558  (Sivet, AmazonMktplc)              │  │
// │ │ Fev/26: -R$ 1.349 (Abreutur, PG Italiano...)        │  │
// │ │ Abr/26: -R$ 2.135 (Aramis, Nannai...)               │  │
// │ └──────────────────────────────────────────────────────┘  │
// │                                                             │
// │ ─── Parcelas Ativas ──────────────────────────────────    │
// │                                                             │
// │ ┌──────────────────────────────────────────────────────┐  │
// │ │ Aramis Park Shopping                                 │  │
// │ │ R$ 1.087,86/mês  │  Parcela 1/5  │  Termina: Mar/26 │  │
// │ │ ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 20%   │  │
// │ │ Total: R$ 5.439,30  │  Restante: R$ 4.351,44        │  │
// │ └──────────────────────────────────────────────────────┘  │
// │                                                             │
// │ ┌──────────────────────────────────────────────────────┐  │
// │ │ Nannai Resort & Spa                                  │  │
// │ │ R$ 499,00/mês    │  Parcela 2/6  │  Termina: Abr/26 │  │
// │ │ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 33%   │  │
// │ │ Total: R$ 2.994,00  │  Restante: R$ 1.996,00        │  │
// │ └──────────────────────────────────────────────────────┘  │
// │                                                             │
// └─────────────────────────────────────────────────────────────┘
```

---

## 8. Configurações

```typescript
// Página: /settings
// Componentes: SettingsTabs, ProfileForm, NotificationSettings, etc.

// Layout com tabs:
// ┌─────────────────────────────────────────────────────────────┐
// │ Configurações                                              │
// ├─────────────────────────────────────────────────────────────┤
// │ [Perfil] [Financeiro] [Notificações] [Conta]              │
// │ ─────────────────────────────────────────────────────────  │
// │                                                             │
// │ === Tab: Financeiro ===                                    │
// │                                                             │
// │ Renda esperada:                                            │
// │ R$ [20.000,00]                                             │
// │                                                             │
// │ Saldo mínimo (colchão):                                    │
// │ R$ [5.000,00]                                              │
// │ ℹ️ Valor mantido na conta para imprevistos                 │
// │                                                             │
// │ ─────────────────────────────────────────────────────────  │
// │                                                             │
// │ Dízimo:                                                    │
// │ [✓] Habilitar controle de dízimo                          │
// │ Percentual: [5]%                                          │
// │ ℹ️ Calculado sobre toda renda recebida                     │
// │                                                             │
// │ ─────────────────────────────────────────────────────────  │
// │                                                             │
// │ === Tab: Notificações ===                                  │
// │                                                             │
// │ Email:                                                     │
// │ [✓] Relatório semanal                                     │
// │ [✓] Relatório mensal                                      │
// │ [✓] Alertas de orçamento                                  │
// │                                                             │
// │ Telegram:                                                  │
// │ [✓] Habilitar notificações                                │
// │ Chat ID: [123456789]                                      │
// │ [Testar Conexão]                                          │
// │                                                             │
// │                                          [Salvar]          │
// └─────────────────────────────────────────────────────────────┘
```

---

## 9. Fluxos de Notificação

### 9.1 Alerta de Orçamento

```typescript
// Trigger: Budget.spent atinge threshold
// Canal: App + Telegram (se habilitado)

interface BudgetAlertFlow {
  trigger: 'budget_threshold';
  conditions: {
    percentage: 50 | 80 | 100;
    enabled: boolean;
  };
  actions: [
    // 1. Criar registro de alerta
    {
      type: 'create_alert';
      data: {
        type: 'budget_warning';
        title: 'Orçamento de Alimentação em 80%';
        message: 'Você gastou R$ 2.400 de R$ 3.000';
      };
    },
    // 2. Notificar via Telegram (se habilitado)
    {
      type: 'send_telegram';
      condition: 'user.settings.telegram.enabled && user.settings.telegram.budgetAlerts';
      message: '⚠️ Orçamento de Alimentação em 80%\nGasto: R$ 2.400 / R$ 3.000';
    },
    // 3. Enviar email (se 100%)
    {
      type: 'send_email';
      condition: 'percentage === 100';
      template: 'budget-exceeded';
    },
  ];
}
```

### 9.2 Lembrete de Importação

```typescript
// Trigger: Cron job (dia 5 de cada mês)
// Canal: Telegram + App

interface ImportReminderFlow {
  trigger: 'scheduled';
  schedule: '0 10 5 * *'; // Dia 5, 10h
  actions: [
    // 1. Verificar se já importou o mês anterior
    {
      type: 'check_condition';
      condition: 'lastImportMonth < currentMonth - 1';
    },
    // 2. Criar alerta
    {
      type: 'create_alert';
      data: {
        type: 'import_reminder';
        title: 'Hora de importar os dados!';
        message: 'A fatura de Novembro já fechou. Importe para manter tudo atualizado.';
      };
    },
    // 3. Notificar via Telegram
    {
      type: 'send_telegram';
      message: '📊 Hora de importar!\n\nA fatura de Novembro já fechou. Acesse o Finance para importar seus dados.\n\n🔗 finance.rcconsultech.com/import';
    },
  ];
}
```

### 9.3 Relatório Semanal

```typescript
// Trigger: Cron job (toda segunda, 8h)
// Canal: Email

interface WeeklyReportFlow {
  trigger: 'scheduled';
  schedule: '0 8 * * 1'; // Segunda, 8h
  actions: [
    // 1. Gerar dados do relatório
    {
      type: 'generate_report';
      data: {
        type: 'weekly';
        period: 'last_7_days';
        metrics: ['totalSpent', 'topCategories', 'budgetStatus', 'alerts'];
      };
    },
    // 2. Enviar email
    {
      type: 'send_email';
      template: 'weekly-report';
    },
  ];
}
```

---

## 10. Tratamento de Erros (UX)

### 10.1 Erros de Importação

```typescript
// Componente: ImportError
// Exibir quando parsing falha

const IMPORT_ERRORS = {
  INVALID_FORMAT: {
    title: 'Formato não reconhecido',
    message: 'Este arquivo não parece ser um extrato do Banco do Brasil.',
    action: 'Certifique-se de baixar o extrato no formato correto (CSV ou PDF).',
  },
  CORRUPT_FILE: {
    title: 'Arquivo corrompido',
    message: 'Não foi possível ler o conteúdo do arquivo.',
    action: 'Tente baixar o arquivo novamente do Internet Banking.',
  },
  EMPTY_FILE: {
    title: 'Arquivo vazio',
    message: 'O arquivo não contém transações.',
    action: 'Verifique se selecionou o período correto ao exportar.',
  },
  DUPLICATE_IMPORT: {
    title: 'Período já importado',
    message: 'As transações deste período já foram importadas anteriormente.',
    action: 'Você pode ver as transações existentes ou forçar reimportação.',
    actions: ['Ver Existentes', 'Reimportar'],
  },
};
```

### 10.2 Estados Vazios

```typescript
// Componentes: EmptyState para cada página

const EMPTY_STATES = {
  transactions: {
    icon: '📋',
    title: 'Nenhuma transação',
    message: 'Importe seus extratos para começar a visualizar suas transações.',
    action: { label: 'Importar Dados', href: '/import' },
  },
  budgets: {
    icon: '💰',
    title: 'Nenhum orçamento definido',
    message: 'Crie orçamentos para controlar seus gastos por categoria.',
    action: { label: 'Criar Orçamento', href: '/budgets/new' },
  },
  subscriptions: {
    icon: '🔄',
    title: 'Nenhuma assinatura',
    message: 'Assinaturas serão detectadas automaticamente após importar seus dados.',
    action: { label: 'Importar Dados', href: '/import' },
  },
  alerts: {
    icon: '🔔',
    title: 'Tudo em dia!',
    message: 'Você não tem alertas no momento.',
    action: null,
  },
};
```

---

*Fluxos de usuário - Referência para implementação de UI/UX*
