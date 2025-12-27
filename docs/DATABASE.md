# Database Schema

## Diagrama ER

```
┌─────────────────┐       ┌─────────────────┐
│      User       │       │    Category     │
├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │
│ email           │       │ name            │
│ name            │       │ type            │
│ settings (JSON) │       │ icon            │
│ createdAt       │       │ color           │
│ updatedAt       │       │ parentId?       │──┐
└────────┬────────┘       │ isSystem        │  │
         │                └────────┬────────┘  │
         │                         │           │
         │ 1:N                     │ 1:N       │ self-ref
         │                         │           │
         ▼                         ▼           │
┌─────────────────┐       ┌─────────────────┐◀─┘
│   Transaction   │       │  Subcategory    │
├─────────────────┤       │  (via parentId) │
│ id              │       └─────────────────┘
│ userId          │───┐
│ date            │   │
│ description     │   │
│ originalDesc    │   │
│ amount          │   │
│ type            │   │
│ categoryId?     │───┼──▶ Category
│ accountId?      │───┼──▶ Account
│ creditCardId?   │───┼──▶ CreditCard
│ isRecurring     │   │
│ notes           │   │
│ importId        │───┼──▶ Import
│ metadata (JSON) │   │
│ createdAt       │   │
└─────────────────┘   │
                      │
┌─────────────────┐   │   ┌─────────────────┐
│     Account     │◀──┘   │   CreditCard    │
├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │
│ userId          │       │ userId          │
│ bankName        │       │ bankName        │
│ accountType     │       │ cardName        │
│ lastFourDigits  │       │ lastFourDigits  │
│ isActive        │       │ closingDay      │
└─────────────────┘       │ dueDay          │
                          │ limit           │
                          │ isActive        │
                          └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│     Budget      │       │  Subscription   │
├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │
│ userId          │       │ userId          │
│ categoryId      │       │ name            │
│ month           │       │ amount          │
│ limit           │       │ frequency       │
│ alertAt50       │       │ categoryId      │
│ alertAt80       │       │ nextBillingDate │
│ alertAt100      │       │ sharedWith JSON │
│ createdAt       │       │ status          │
└─────────────────┘       │ notes           │
                          └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│   Installment   │       │     Import      │
├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │
│ userId          │       │ userId          │
│ description     │       │ fileName        │
│ totalAmount     │       │ fileType        │
│ installmentAmt  │       │ period          │
│ current         │       │ status          │
│ total           │       │ transactionsCnt │
│ startDate       │       │ errors (JSON)   │
│ endDate         │       │ createdAt       │
│ creditCardId    │       └─────────────────┘
│ categoryId      │
│ status          │       ┌─────────────────┐
└─────────────────┘       │ CategorizeRule  │
                          ├─────────────────┤
┌─────────────────┐       │ id              │
│     Alert       │       │ userId          │
├─────────────────┤       │ pattern         │
│ id              │       │ categoryId      │
│ userId          │       │ priority        │
│ type            │       │ isActive        │
│ title           │       │ createdAt       │
│ message         │       └─────────────────┘
│ data (JSON)     │
│ isRead          │
│ createdAt       │
└─────────────────┘
```

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================================================
// USER
// ============================================================================

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  settings  Json     @default("{}")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  transactions     Transaction[]
  accounts         Account[]
  creditCards      CreditCard[]
  categories       Category[]
  budgets          Budget[]
  subscriptions    Subscription[]
  installments     Installment[]
  imports          Import[]
  alerts           Alert[]
  categorizeRules  CategorizeRule[]

  @@map("users")
}

// ============================================================================
// ACCOUNTS & CARDS
// ============================================================================

model Account {
  id             String   @id @default(uuid())
  userId         String
  bankName       String
  accountType    String   // checking, savings, investment
  lastFourDigits String?
  currentBalance Decimal  @default(0) @db.Decimal(15, 2)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relations
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]

  @@index([userId])
  @@map("accounts")
}

model CreditCard {
  id             String   @id @default(uuid())
  userId         String
  bankName       String
  cardName       String   // VISA Infinite, ELO Nanquim
  lastFourDigits String
  closingDay     Int      // Dia de fechamento (1-31)
  dueDay         Int      // Dia de vencimento (1-31)
  limit          Decimal  @db.Decimal(15, 2)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relations
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  installments Installment[]

  @@index([userId])
  @@map("credit_cards")
}

// ============================================================================
// CATEGORIES
// ============================================================================

model Category {
  id        String   @id @default(uuid())
  userId    String?  // null = system category
  name      String
  slug      String
  type      String   // fixed, variable, income, transfer, investment
  icon      String?
  color     String?
  parentId  String?  // For subcategories
  isSystem  Boolean  @default(false)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user            User?            @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent          Category?        @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children        Category[]       @relation("CategoryHierarchy")
  transactions    Transaction[]
  budgets         Budget[]
  subscriptions   Subscription[]
  installments    Installment[]
  categorizeRules CategorizeRule[]

  @@unique([userId, slug])
  @@index([userId])
  @@index([parentId])
  @@map("categories")
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

model Transaction {
  id              String    @id @default(uuid())
  userId          String
  date            DateTime  @db.Date
  description     String
  originalDesc    String    // Descrição original do banco
  amount          Decimal   @db.Decimal(15, 2) // Positivo = entrada, Negativo = saída
  type            String    // income, expense, transfer
  categoryId      String?
  accountId       String?
  creditCardId    String?
  isRecurring     Boolean   @default(false)
  isIgnored       Boolean   @default(false) // Ignorar em cálculos (ex: transferência própria)
  notes           String?
  importId        String?
  metadata        Json      @default("{}") // Dados extras do parser
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  category   Category?   @relation(fields: [categoryId], references: [id])
  account    Account?    @relation(fields: [accountId], references: [id])
  creditCard CreditCard? @relation(fields: [creditCardId], references: [id])
  import     Import?     @relation(fields: [importId], references: [id])

  @@index([userId, date])
  @@index([userId, categoryId])
  @@index([userId, type, date])
  @@index([importId])
  @@map("transactions")
}

// ============================================================================
// BUDGETS
// ============================================================================

model Budget {
  id         String   @id @default(uuid())
  userId     String
  categoryId String
  month      DateTime @db.Date // Primeiro dia do mês
  limit      Decimal  @db.Decimal(15, 2)
  alertAt50  Boolean  @default(true)
  alertAt80  Boolean  @default(true)
  alertAt100 Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id])

  @@unique([userId, categoryId, month])
  @@index([userId, month])
  @@map("budgets")
}

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

model Subscription {
  id              String    @id @default(uuid())
  userId          String
  name            String
  amount          Decimal   @db.Decimal(15, 2)
  frequency       String    // monthly, annual
  categoryId      String?
  nextBillingDate DateTime? @db.Date
  sharedWith      Json      @default("[]") // [{name: "João", amount: 20}]
  status          String    @default("active") // active, evaluate, cancelled
  notes           String?
  detectedFrom    String?   // Merchant name que originou
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  category Category? @relation(fields: [categoryId], references: [id])

  @@index([userId])
  @@map("subscriptions")
}

// ============================================================================
// INSTALLMENTS
// ============================================================================

model Installment {
  id               String   @id @default(uuid())
  userId           String
  description      String
  totalAmount      Decimal  @db.Decimal(15, 2)
  installmentAmount Decimal  @db.Decimal(15, 2)
  currentInstallment Int
  totalInstallments  Int
  startDate        DateTime @db.Date
  endDate          DateTime @db.Date
  creditCardId     String?
  categoryId       String?
  status           String   @default("active") // active, completed, cancelled
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  // Relations
  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  creditCard CreditCard? @relation(fields: [creditCardId], references: [id])
  category   Category?   @relation(fields: [categoryId], references: [id])

  @@index([userId])
  @@index([userId, status])
  @@map("installments")
}

// ============================================================================
// IMPORTS
// ============================================================================

model Import {
  id               String   @id @default(uuid())
  userId           String
  fileName         String
  fileType         String   // csv-account, pdf-visa, pdf-elo
  period           String   // "2025-11" (YYYY-MM)
  status           String   @default("pending") // pending, processing, completed, failed
  transactionsCount Int      @default(0)
  newCount         Int      @default(0)
  duplicateCount   Int      @default(0)
  errors           Json     @default("[]")
  createdAt        DateTime @default(now())

  // Relations
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]

  @@index([userId])
  @@map("imports")
}

// ============================================================================
// ALERTS
// ============================================================================

model Alert {
  id        String   @id @default(uuid())
  userId    String
  type      String   // budget_50, budget_80, budget_100, unknown_merchant, import_complete
  title     String
  message   String
  data      Json     @default("{}")
  isRead    Boolean  @default(false)
  sentVia   String[] @default([]) // ["email", "telegram", "push"]
  createdAt DateTime @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@index([userId, createdAt])
  @@map("alerts")
}

// ============================================================================
// CATEGORIZATION RULES
// ============================================================================

model CategorizeRule {
  id         String   @id @default(uuid())
  userId     String
  pattern    String   // Regex ou texto simples
  matchType  String   // contains, startsWith, regex
  categoryId String
  priority   Int      @default(0) // Maior = mais prioritário
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())

  // Relations
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id])

  @@index([userId, isActive])
  @@map("categorize_rules")
}
```

## User Settings JSON Structure

```typescript
interface UserSettings {
  // Perfil
  email: string;
  notificationEmail?: string;
  telegramChatId?: string;

  // Configurações financeiras
  minimumBalance: number; // R$ 5.000 default
  savingsReservePercent: number; // % para reserva
  titheEnabled: boolean;
  tithePercent: number; // 0-10, progressivo

  // Notificações
  notifications: {
    email: {
      enabled: boolean;
      weeklyReport: boolean;
      monthlyReport: boolean;
      budgetAlerts: boolean;
    };
    telegram: {
      enabled: boolean;
      budgetAlerts: boolean;
      importReminders: boolean;
    };
  };

  // Preferências
  preferences: {
    theme: 'dark' | 'light' | 'system';
    currency: 'BRL';
    dateFormat: 'DD/MM/YYYY';
    startOfMonth: number; // Dia que considera início do mês (default: 1)
  };
}
```

## Transaction Metadata JSON Structure

```typescript
interface TransactionMetadata {
  // Do parser
  originalCategory?: string; // Categoria do banco
  cardHolder?: string; // Nome no cartão (para adicionais)
  installmentInfo?: {
    current: number;
    total: number;
    originalDescription: string;
  };
  country?: string;

  // Do usuário
  tags?: string[];
  attachments?: string[]; // URLs de comprovantes

  // Sistema
  categorizedBy: 'auto' | 'rule' | 'manual';
  confidence?: number; // 0-1 para auto-categorização
  matchedRule?: string; // ID da regra que categorizou
}
```

## Queries Comuns

### Gastos por Categoria no Mês

```typescript
const spendingByCategory = await prisma.transaction.groupBy({
  by: ['categoryId'],
  where: {
    userId,
    date: {
      gte: startOfMonth,
      lte: endOfMonth,
    },
    type: 'expense',
    isIgnored: false,
  },
  _sum: {
    amount: true,
  },
});
```

### Transações com Categoria e Subcategoria

```typescript
const transactions = await prisma.transaction.findMany({
  where: { userId },
  include: {
    category: {
      include: {
        parent: true,
      },
    },
  },
  orderBy: { date: 'desc' },
});
```

### Parcelas Ativas com Projeção

```typescript
const activeInstallments = await prisma.installment.findMany({
  where: {
    userId,
    status: 'active',
    endDate: { gte: new Date() },
  },
  orderBy: { endDate: 'asc' },
});
```

### Assinaturas por Status

```typescript
const subscriptions = await prisma.subscription.findMany({
  where: { userId },
  include: { category: true },
  orderBy: [
    { status: 'asc' },
    { amount: 'desc' },
  ],
});
```

## Seed Data

```typescript
// prisma/seed.ts

const systemCategories = [
  // Fixos
  { name: 'Moradia', slug: 'moradia', type: 'fixed', icon: '🏠', children: [
    { name: 'Aluguel', slug: 'moradia-aluguel' },
    { name: 'Condomínio', slug: 'moradia-condominio' },
    { name: 'Energia', slug: 'moradia-energia' },
  ]},
  { name: 'Saúde', slug: 'saude', type: 'fixed', icon: '🏥', children: [
    { name: 'Plano de Saúde', slug: 'saude-plano' },
    { name: 'Seguro de Vida', slug: 'saude-seguro-vida' },
  ]},
  // ... mais categorias

  // Variáveis
  { name: 'Alimentação', slug: 'alimentacao', type: 'variable', icon: '🍽️', children: [
    { name: 'Restaurantes', slug: 'alimentacao-restaurantes' },
    { name: 'Delivery', slug: 'alimentacao-delivery' },
    { name: 'Supermercado', slug: 'alimentacao-supermercado' },
    { name: 'Hortifruti', slug: 'alimentacao-hortifruti' },
    { name: 'Açougue', slug: 'alimentacao-acougue' },
  ]},
  // ... mais categorias

  // Especiais
  { name: 'A Classificar', slug: 'a-classificar', type: 'variable', icon: '❓' },
  { name: 'Ignorar', slug: 'ignorar', type: 'transfer', icon: '🚫' },
];
```

## Migrations

### Estratégia

1. **Development:** `npx prisma db push` para iteração rápida
2. **Production:** `npx prisma migrate deploy` para migrations versionadas

### Comandos

```bash
# Gerar migration
npx prisma migrate dev --name add_something

# Aplicar em produção
npx prisma migrate deploy

# Reset completo (dev only)
npx prisma migrate reset

# Ver status
npx prisma migrate status
```

---

*Schema version: 1.0*
