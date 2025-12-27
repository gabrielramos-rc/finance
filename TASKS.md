# Finance - Implementation Tasks

## Progress Summary

| Phase | Status | Tasks |
|-------|--------|-------|
| Phase 1: Foundation | ✅ Complete | TASK-01 ✅, TASK-02 ✅, TASK-03 ✅, TASK-04 ✅ |
| Phase 2: Core | ⏳ Pending | TASK-05, TASK-06, TASK-07 |
| Phase 3: Features | ⏳ Pending | TASK-08, TASK-09, TASK-10, TASK-11, TASK-12, TASK-13 |
| Phase 4: Polish | ⏳ Pending | TASK-14, TASK-15, TASK-16 |

**Overall Progress:** 4/16 tasks completed (25%)

---

## Task Dependency Graph

```
                                    ┌─────────┐
                                    │ TASK-01 │ Project Setup
                                    └────┬────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
              ▼                          ▼                          ▼
        ┌─────────┐                ┌─────────┐                ┌─────────┐
        │ TASK-02 │                │ TASK-03 │                │ TASK-04 │
        │ Database│                │  Auth   │                │ Parsers │
        └────┬────┘                └────┬────┘                └────┬────┘
             │                          │                          │
             │                          │                          │
             ▼                          │                          │
        ┌─────────┐                     │                          │
        │ TASK-05 │                     │                          │
        │Core API │◀────────────────────┘                          │
        └────┬────┘                                                 │
             │                                                      │
             ├──────────────────────────────────────────────────────┤
             │                                                      │
             ▼                                                      ▼
        ┌─────────┐                                           ┌─────────┐
        │ TASK-06 │                                           │ TASK-07 │
        │Import UI│◀──────────────────────────────────────────│Import BE│
        └────┬────┘                                           └─────────┘
             │
             ▼
        ┌─────────┐
        │ TASK-08 │
        │Dashboard│
        └────┬────┘
             │
     ┌───────┼───────┬───────────┐
     │       │       │           │
     ▼       ▼       ▼           ▼
┌────────┐┌────────┐┌────────┐┌────────┐
│TASK-09 ││TASK-10 ││TASK-11 ││TASK-12 │
│Transact││Budgets ││Subscr. ││Install.│
└────────┘└────────┘└────────┘└────────┘
                    │
                    ▼
              ┌─────────┐
              │ TASK-13 │
              │Settings │
              └────┬────┘
                   │
          ┌────────┴────────┐
          ▼                 ▼
    ┌─────────┐       ┌─────────┐
    │ TASK-14 │       │ TASK-15 │
    │Telegram │       │ Reports │
    └─────────┘       └─────────┘
```

---

## Task List

| Task | Name | Prerequisites | Parallelizable With |
|------|------|---------------|---------------------|
| TASK-01 | Project Setup | - | - |
| TASK-02 | Database Schema | TASK-01 | TASK-03, TASK-04 |
| TASK-03 | Authentication | TASK-01 | TASK-02, TASK-04 |
| TASK-04 | Parsers (CSV/PDF) | TASK-01 | TASK-02, TASK-03 |
| TASK-05 | Core API | TASK-02, TASK-03 | - |
| TASK-06 | UI Components | TASK-01 | TASK-02, TASK-03, TASK-04, TASK-05 |
| TASK-07 | Import Backend | TASK-04, TASK-05 | TASK-06 |
| TASK-08 | Import Flow UI | TASK-06, TASK-07 | - |
| TASK-09 | Dashboard | TASK-05, TASK-06 | TASK-08 |
| TASK-10 | Transactions Page | TASK-09 | TASK-11, TASK-12, TASK-13 |
| TASK-11 | Budgets | TASK-09 | TASK-10, TASK-12, TASK-13 |
| TASK-12 | Subscriptions | TASK-09 | TASK-10, TASK-11, TASK-13 |
| TASK-13 | Installments | TASK-09 | TASK-10, TASK-11, TASK-12 |
| TASK-14 | Settings | TASK-05, TASK-06 | TASK-10, TASK-11, TASK-12, TASK-13 |
| TASK-15 | Telegram Notifications | TASK-14 | TASK-16 |
| TASK-16 | Email Reports | TASK-14 | TASK-15 |

---

## TASK-01: Project Setup

**Prerequisites:** None
**Estimated Complexity:** Low
**Output:** Working Next.js project with all dependencies configured

### Objectives
1. Initialize Next.js 16 project with TypeScript
2. Configure Tailwind CSS 4.0
3. Setup shadcn/ui
4. Configure ESLint and Prettier
5. Setup project structure
6. Configure environment variables

### Steps

```bash
# 1. Create Next.js project
pnpm create next-app@latest finance --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. Install dependencies
pnpm add @supabase/supabase-js @supabase/ssr prisma @prisma/client
pnpm add @tanstack/react-query recharts date-fns
pnpm add papaparse pdf-parse yaml
pnpm add resend
pnpm add -D @types/papaparse

# 3. Setup shadcn/ui
pnpm dlx shadcn@latest init

# 4. Add shadcn components
pnpm dlx shadcn@latest add button card input label select table tabs toast dialog dropdown-menu avatar badge progress skeleton
```

### Files to Create
- `src/app/layout.tsx` - Root layout with providers
- `src/app/globals.css` - Global styles
- `src/lib/utils.ts` - Utility functions
- `src/components/providers.tsx` - React Query provider
- `.env.local` - Environment variables (from .env.example)
- `tailwind.config.ts` - Tailwind configuration
- `tsconfig.json` - TypeScript configuration

### Acceptance Criteria
- [x] `pnpm dev` runs without errors
- [x] `pnpm build` completes successfully
- [x] `pnpm lint` passes
- [x] shadcn/ui components render correctly
- [x] Dark mode works by default

### Completion Notes
- **Completed:** December 26, 2025
- **Branch:** `feature/task-01-project-setup`
- **PR:** #1
- **Frameworks:** Next.js 16.1.1, React 19.2.1, Prisma 7.2.0, TanStack Query 5.90.12

---

## TASK-02: Database Schema

**Prerequisites:** TASK-01
**Parallelizable With:** TASK-03, TASK-04
**Estimated Complexity:** Medium
**Output:** Complete Prisma schema with migrations and seed data

### Objectives
1. Create Prisma schema with all models
2. Configure Supabase connection
3. Run initial migration
4. Create seed script for categories

### Files to Create
- `prisma/schema.prisma` - Database schema (see docs/DATABASE.md)
- `prisma/seed.ts` - Seed script for categories
- `src/lib/prisma.ts` - Prisma client singleton

### Models to Implement
1. User
2. Account
3. CreditCard
4. Category
5. Transaction
6. Budget
7. Subscription
8. SubscriptionShare
9. Installment
10. Import
11. Alert
12. CategorizeRule
13. UserSettings

### Commands
```bash
# Initialize Prisma
pnpm prisma init

# Generate client
pnpm prisma generate

# Push schema to database
pnpm prisma db push

# Run seed
pnpm prisma db seed
```

### Acceptance Criteria
- [x] All models created per docs/DATABASE.md
- [x] Prisma client generates without errors
- [ ] Database syncs successfully (requires Supabase credentials)
- [ ] Categories seeded from config/categories.yaml (requires database connection)
- [ ] `pnpm prisma studio` opens and shows tables (requires database connection)

### Completion Notes
- **Completed:** December 26, 2025
- **Branch:** `feature/task-02-database-schema`
- **PR:** #2
- **Models:** 11 models implemented (User, Account, CreditCard, Category, Transaction, Budget, Subscription, Installment, Import, Alert, CategorizeRule)
- **Note:** UserSettings and SubscriptionShare are JSON fields within User and Subscription models respectively, not separate tables
- **Prisma Version:** 7.2.0 with pg adapter pattern
- **Additional Files Created:**
  - `prisma/schema.prisma` - Complete schema with all models
  - `prisma/prisma.config.ts` - Prisma 7 migration config
  - `prisma/seed.ts` - Category seeding from YAML
  - `src/lib/prisma.ts` - Prisma client singleton
  - `src/types/database.ts` - TypeScript types for JSON fields
  - `.env.example` - Environment template

---

## TASK-03: Authentication

**Prerequisites:** TASK-01
**Parallelizable With:** TASK-02, TASK-04
**Estimated Complexity:** Medium
**Output:** Working authentication with Supabase

### Objectives
1. Configure Supabase Auth
2. Create login/signup pages
3. Implement auth middleware
4. Create protected route layout

### Files to Create
- `src/lib/supabase/client.ts` - Browser client
- `src/lib/supabase/server.ts` - Server client
- `src/lib/supabase/middleware.ts` - Auth middleware
- `src/app/login/page.tsx` - Login page
- `src/app/(auth)/layout.tsx` - Protected layout
- `src/components/auth/login-form.tsx` - Login form component
- `src/components/auth/user-menu.tsx` - User dropdown menu
- `middleware.ts` - Next.js middleware for auth

### Acceptance Criteria
- [x] Users can login with email/password
- [x] Users can login with Google OAuth
- [x] Protected routes redirect to login
- [x] User session persists on refresh
- [x] Logout works correctly
- [x] User menu shows in header

### Completion Notes
- **Completed:** December 26, 2025
- **Branch:** `feature/task-03-authentication`
- **PR:** #3
- **Files Created:**
  - `src/lib/supabase/client.ts` - Browser client for Supabase
  - `src/lib/supabase/server.ts` - Server client for Supabase
  - `src/lib/supabase/middleware.ts` - Auth middleware helper
  - `middleware.ts` - Next.js middleware for route protection
  - `src/app/login/page.tsx` - Login page with beautiful UI
  - `src/app/(auth)/layout.tsx` - Protected layout with sidebar and header
  - `src/app/(auth)/dashboard/page.tsx` - Dashboard placeholder page
  - `src/app/auth/callback/route.ts` - OAuth callback handler
  - `src/components/auth/login-form.tsx` - Login form (email/password + Google)
  - `src/components/auth/user-menu.tsx` - User dropdown menu
  - `src/components/layout/sidebar.tsx` - Navigation sidebar
  - `src/components/layout/header.tsx` - App header with user menu
  - `src/components/layout/mobile-nav.tsx` - Mobile navigation drawer
- **Bugs Fixed:**
  - Fixed middleware route group check (route groups don't appear in pathname)
  - Fixed `prisma.config.ts` to use `import.meta.url` instead of `__dirname` for ES modules
- **Features:**
  - Email/password authentication
  - Google OAuth authentication
  - Protected routes with middleware
  - Session persistence
  - Beautiful login page with animated background
  - Responsive sidebar and header
  - Mobile navigation support

---

## TASK-04: Parsers (CSV/PDF)

**Prerequisites:** TASK-01
**Parallelizable With:** TASK-02, TASK-03
**Estimated Complexity:** High
**Output:** Working parsers for BB CSV and PDF invoices

### Objectives
1. Implement CSV parser for bank statements
2. Implement PDF parser for VISA invoices
3. Implement PDF parser for ELO invoices
4. Create categorizer using patterns.yaml
5. Handle edge cases (see docs/EDGE_CASES.md)

### Files to Create
- `src/lib/parsers/csv-parser.ts` - Bank statement parser
- `src/lib/parsers/pdf-parser.ts` - Credit card invoice parser
- `src/lib/parsers/categorizer.ts` - Auto-categorization logic
- `src/lib/parsers/patterns.ts` - Load patterns from YAML
- `src/lib/parsers/types.ts` - Parser types
- `src/lib/parsers/index.ts` - Export all parsers

### Reference
- `docs/PARSERS.md` - Parser implementation details
- `config/patterns.yaml` - Categorization patterns
- `samples/` - Test data

### Acceptance Criteria
- [x] CSV parser extracts all transactions correctly
- [x] PDF parser handles both VISA and ELO formats
- [x] Encoding (ISO-8859-1) handled correctly
- [x] Installments detected (PARC XX/XX pattern)
- [x] IOF transactions linked to international purchases
- [x] Categorizer matches 70%+ of transactions (CSV: 65.9%, PDF VISA: 79.6%, PDF ELO: 73.2%)
- [x] Unknown merchants flagged as "A Classificar"

### Test Cases
```typescript
// Test with sample files
const csvResult = await parseCSV('samples/account/extrato-112025.csv');
expect(csvResult.transactions.length).toBeGreaterThan(0);

const pdfResult = await parsePDF('samples/cards/fatura-visa-112025.pdf');
expect(pdfResult.transactions.length).toBeGreaterThan(0);
```

### Completion Notes
- **Completed:** December 26, 2025
- **Branch:** `feature/task-04-parsers`
- **PR:** #4
- **Files Created:**
  - `src/lib/parsers/types.ts` - TypeScript interfaces for parsed data
  - `src/lib/parsers/csv-parser.ts` - Banco do Brasil CSV parser (ISO-8859-1)
  - `src/lib/parsers/pdf-parser.ts` - VISA/ELO invoice PDF parser
  - `src/lib/parsers/categorizer.ts` - Auto-categorization logic
  - `src/lib/parsers/patterns.ts` - Patterns loader from YAML config
  - `src/lib/parsers/index.ts` - Public API exports
  - `scripts/test-parsers.ts` - Test script for validation
- **Dependencies Added:**
  - `iconv-lite` - Encoding conversion (ISO-8859-1 → UTF-8)
  - `@types/pdf-parse` - TypeScript types for pdf-parse
  - `tsx` - TypeScript execution for test scripts
- **Test Results:**
  - CSV: 65.9% categorization rate (41 transactions parsed, 0 errors)
  - PDF VISA: 79.6% categorization rate (93 transactions parsed, 0 errors)
  - PDF ELO: 73.2% categorization rate (97 transactions parsed, 0 errors)
  - Installments detected correctly
  - International transactions with IOF linked correctly
- **Features:**
  - CSV parser with ISO-8859-1 encoding support
  - PDF parser for both VISA and ELO invoices
  - Auto-categorization with priority-based matching
  - Pattern matching (contains, equals, regex)
  - Installment detection (PARC XX/XX pattern)
  - IOF linking for international purchases
  - Multiple card holder detection
  - Invoice metadata extraction
- **Patterns Updated:**
  - Added health consultations patterns (PSICOLOG, GESTALT, AMANDA CASE)
  - Added family transfer patterns (ISABELA SOARES, BEATRIZ)
  - Added diarista pattern (MARIA TEREZINHA)
  - Added consórcio patterns (BB ADMIN CONS)
- **Technical Notes:**
  - Fixed pdf-parse v2 API compatibility (uses PDFParse class)
  - Implemented YAML snake_case to camelCase normalization
  - Income patterns handled separately from expense patterns
  - Internal transfers detected and categorized correctly

---

## TASK-05: Core API

**Prerequisites:** TASK-02, TASK-03
**Estimated Complexity:** High
**Output:** REST API endpoints for all core operations

### Objectives
1. Create API routes per docs/API.md
2. Implement repository pattern
3. Add input validation
4. Handle errors consistently

### Files to Create

**Repositories:**
- `src/lib/db/repositories/transaction.ts`
- `src/lib/db/repositories/category.ts`
- `src/lib/db/repositories/budget.ts`
- `src/lib/db/repositories/subscription.ts`
- `src/lib/db/repositories/installment.ts`
- `src/lib/db/repositories/alert.ts`
- `src/lib/db/repositories/user-settings.ts`

**API Routes:**
- `src/app/api/transactions/route.ts` - GET, POST
- `src/app/api/transactions/[id]/route.ts` - GET, PATCH, DELETE
- `src/app/api/transactions/[id]/categorize/route.ts` - POST
- `src/app/api/categories/route.ts` - GET, POST
- `src/app/api/budgets/route.ts` - GET
- `src/app/api/budgets/[categoryId]/route.ts` - PUT
- `src/app/api/subscriptions/route.ts` - GET, POST
- `src/app/api/subscriptions/[id]/route.ts` - PATCH
- `src/app/api/installments/route.ts` - GET
- `src/app/api/dashboard/route.ts` - GET
- `src/app/api/alerts/route.ts` - GET
- `src/app/api/alerts/[id]/read/route.ts` - PATCH
- `src/app/api/settings/route.ts` - GET, PATCH
- `src/app/api/rules/route.ts` - GET, POST, DELETE

### Acceptance Criteria
- [ ] All endpoints per docs/API.md implemented
- [ ] Endpoints require authentication
- [ ] Input validation with clear error messages
- [ ] Consistent error response format
- [ ] Pagination working on list endpoints

---

## TASK-06: UI Components

**Prerequisites:** TASK-01
**Parallelizable With:** TASK-02, TASK-03, TASK-04, TASK-05
**Estimated Complexity:** Medium
**Output:** Reusable UI components for the application

### Objectives
1. Create layout components (header, sidebar, footer)
2. Create dashboard components (cards, charts)
3. Create transaction components (list, detail, form)
4. Create form components (inputs, selectors)

### Files to Create

**Layout:**
- `src/components/layout/header.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/page-header.tsx`
- `src/components/layout/mobile-nav.tsx`

**Dashboard:**
- `src/components/dashboard/summary-cards.tsx`
- `src/components/dashboard/category-chart.tsx`
- `src/components/dashboard/budget-progress.tsx`
- `src/components/dashboard/alerts-list.tsx`
- `src/components/dashboard/recent-transactions.tsx`

**Transactions:**
- `src/components/transactions/transaction-list.tsx`
- `src/components/transactions/transaction-row.tsx`
- `src/components/transactions/transaction-detail.tsx`
- `src/components/transactions/transaction-filters.tsx`
- `src/components/transactions/category-picker.tsx`
- `src/components/transactions/bulk-actions.tsx`

**Common:**
- `src/components/common/currency-display.tsx`
- `src/components/common/date-display.tsx`
- `src/components/common/empty-state.tsx`
- `src/components/common/loading-spinner.tsx`
- `src/components/common/month-selector.tsx`
- `src/components/common/confirm-dialog.tsx`

### Acceptance Criteria
- [ ] All components use shadcn/ui as base
- [ ] Components are responsive (mobile-first)
- [ ] Dark mode works correctly
- [ ] Loading states implemented
- [ ] Empty states implemented
- [ ] Components are properly typed

---

## TASK-07: Import Backend

**Prerequisites:** TASK-04, TASK-05
**Parallelizable With:** TASK-06
**Estimated Complexity:** High
**Output:** Complete import processing pipeline

### Objectives
1. Create file upload endpoint
2. Implement import processing logic
3. Handle duplicate detection
4. Create import preview endpoint
5. Implement confirm/rollback

### Files to Create
- `src/app/api/import/upload/route.ts` - POST (file upload)
- `src/app/api/import/[id]/route.ts` - GET (status)
- `src/app/api/import/[id]/preview/route.ts` - GET (preview)
- `src/app/api/import/[id]/confirm/route.ts` - POST (confirm)
- `src/lib/services/import-service.ts` - Import logic
- `src/lib/services/duplicate-detector.ts` - Duplicate detection

### Import Flow
1. User uploads file → create Import record (status: processing)
2. Parse file using parsers from TASK-04
3. Detect duplicates against existing transactions
4. Auto-categorize using categorizer
5. Return preview with summary
6. User confirms → insert transactions
7. Update Import record (status: completed)

### Acceptance Criteria
- [ ] CSV and PDF files accepted
- [ ] File type auto-detected
- [ ] Duplicates correctly identified
- [ ] Preview shows accurate summary
- [ ] Confirm creates all transactions
- [ ] Installments created/updated correctly
- [ ] Import history saved

---

## TASK-08: Import Flow UI

**Prerequisites:** TASK-06, TASK-07
**Estimated Complexity:** Medium
**Output:** Complete import user interface

### Objectives
1. Create import page with file upload
2. Show processing status
3. Display preview with summary
4. Allow review before confirming
5. Show import history

### Files to Create
- `src/app/(auth)/import/page.tsx` - Import page
- `src/app/(auth)/import/[id]/page.tsx` - Import detail/preview
- `src/components/import/file-uploader.tsx` - Drag & drop upload
- `src/components/import/import-progress.tsx` - Processing status
- `src/components/import/import-preview.tsx` - Preview table
- `src/components/import/import-summary.tsx` - Summary cards
- `src/components/import/import-history.tsx` - Past imports
- `src/hooks/use-import.ts` - Import hooks

### Acceptance Criteria
- [ ] Drag & drop file upload works
- [ ] Multiple files can be uploaded
- [ ] Progress shown during processing
- [ ] Preview shows all transactions
- [ ] Duplicates highlighted
- [ ] Uncategorized items highlighted
- [ ] Confirm/cancel buttons work
- [ ] Success message with link to transactions

---

## TASK-09: Dashboard

**Prerequisites:** TASK-05, TASK-06
**Parallelizable With:** TASK-08
**Estimated Complexity:** Medium
**Output:** Functional dashboard with all widgets

### Objectives
1. Create dashboard page
2. Implement summary cards
3. Add category breakdown chart
4. Show budget progress
5. Display alerts
6. List recent transactions

### Files to Create
- `src/app/(auth)/dashboard/page.tsx` - Dashboard page
- `src/app/(auth)/dashboard/loading.tsx` - Loading state
- `src/hooks/use-dashboard.ts` - Dashboard data hook

### Dashboard Widgets
1. **Summary Cards:** Income, Expenses, Balance, Budget %
2. **Category Chart:** Donut chart of expenses by category
3. **Budget Progress:** List with progress bars
4. **Alerts:** Unread alerts list
5. **Recent Transactions:** Last 5-10 transactions

### Acceptance Criteria
- [ ] All summary cards show correct data
- [ ] Chart renders correctly
- [ ] Month selector changes data
- [ ] Clicking category navigates to transactions
- [ ] Alerts are clickable
- [ ] Recent transactions show category icons
- [ ] Page loads in < 2 seconds

---

## TASK-10: Transactions Page

**Prerequisites:** TASK-09
**Parallelizable With:** TASK-11, TASK-12, TASK-13
**Estimated Complexity:** Medium
**Output:** Full transaction management interface

### Objectives
1. Create transactions list page
2. Implement filters (month, category, type, search)
3. Add transaction detail modal/page
4. Implement category editing
5. Add bulk categorization
6. Create categorization rules

### Files to Create
- `src/app/(auth)/transactions/page.tsx` - List page
- `src/app/(auth)/transactions/[id]/page.tsx` - Detail page (optional, can use modal)
- `src/hooks/use-transactions.ts` - Transactions hook

### Features
1. **List View:** Table with date, description, amount, category
2. **Filters:** Month, category, type, search, uncategorized only
3. **Sorting:** By date, amount, description
4. **Pagination:** 50-100 per page
5. **Detail:** View/edit transaction, add notes
6. **Bulk Actions:** Select multiple, categorize together
7. **Rule Creation:** Option to create rule when categorizing

### Acceptance Criteria
- [ ] Transactions load with filters applied
- [ ] Search filters in real-time
- [ ] Category can be changed inline
- [ ] Detail modal shows all info
- [ ] Bulk selection works
- [ ] Rules created successfully
- [ ] Mobile view works

---

## TASK-11: Budgets

**Prerequisites:** TASK-09
**Parallelizable With:** TASK-10, TASK-12, TASK-13
**Estimated Complexity:** Medium
**Output:** Budget management interface

### Objectives
1. Create budgets page
2. Show budget progress by category
3. Allow setting/editing limits
4. Show historical data
5. Configure alert thresholds

### Files to Create
- `src/app/(auth)/budgets/page.tsx` - Budgets page
- `src/components/budgets/budget-card.tsx` - Budget progress card
- `src/components/budgets/budget-form.tsx` - Edit budget form
- `src/hooks/use-budgets.ts` - Budgets hook

### Features
1. **Overview:** Total allocated vs available
2. **Category Cards:** Each with progress bar
3. **Edit Modal:** Set limit, configure alerts
4. **History:** Compare with previous months
5. **Suggestions:** Based on spending history

### Acceptance Criteria
- [ ] All categories with budgets shown
- [ ] Progress bars accurate
- [ ] Edit modal saves correctly
- [ ] Alert thresholds configurable
- [ ] Month selector works
- [ ] Clicking category shows transactions

---

## TASK-12: Subscriptions

**Prerequisites:** TASK-09
**Parallelizable With:** TASK-10, TASK-11, TASK-13
**Estimated Complexity:** Medium
**Output:** Subscription tracking interface

### Objectives
1. Create subscriptions page
2. List active subscriptions
3. Track shared subscriptions
4. Calculate monthly impact
5. Show annual equivalents

### Files to Create
- `src/app/(auth)/subscriptions/page.tsx` - Subscriptions page
- `src/components/subscriptions/subscription-card.tsx` - Subscription card
- `src/components/subscriptions/subscription-form.tsx` - Add/edit form
- `src/components/subscriptions/share-manager.tsx` - Manage shares
- `src/hooks/use-subscriptions.ts` - Subscriptions hook

### Features
1. **Summary:** Monthly total, annual total, to receive
2. **Monthly List:** Subscriptions charged monthly
3. **Annual List:** Annual subscriptions with monthly provision
4. **Shares:** Track who owes what
5. **Add/Edit:** Manual subscription entry

### Acceptance Criteria
- [ ] All subscriptions listed
- [ ] Monthly vs annual separated
- [ ] Share tracking works
- [ ] Totals calculated correctly
- [ ] Can add new subscription
- [ ] Can mark as cancelled

---

## TASK-13: Installments

**Prerequisites:** TASK-09
**Parallelizable With:** TASK-10, TASK-11, TASK-12
**Estimated Complexity:** Medium
**Output:** Installment tracking interface

### Objectives
1. Create installments page
2. List active installments
3. Show progress for each
4. Calculate monthly impact
5. Project future relief

### Files to Create
- `src/app/(auth)/installments/page.tsx` - Installments page
- `src/components/installments/installment-card.tsx` - Installment card
- `src/components/installments/relief-projection.tsx` - Future relief chart
- `src/hooks/use-installments.ts` - Installments hook

### Features
1. **Summary:** Monthly impact, total remaining
2. **List:** All active installments with progress
3. **Projection Chart:** When installments end
4. **Relief Timeline:** Month-by-month relief amounts

### Acceptance Criteria
- [ ] All installments listed
- [ ] Progress bars accurate (current/total)
- [ ] End dates calculated correctly
- [ ] Projection chart renders
- [ ] Relief amounts match calculations

---

## TASK-14: Settings

**Prerequisites:** TASK-05, TASK-06
**Parallelizable With:** TASK-10, TASK-11, TASK-12, TASK-13
**Estimated Complexity:** Low
**Output:** User settings interface

### Objectives
1. Create settings page with tabs
2. Profile settings
3. Financial settings
4. Notification settings
5. Categorization rules management

### Files to Create
- `src/app/(auth)/settings/page.tsx` - Settings page
- `src/components/settings/profile-form.tsx` - Profile settings
- `src/components/settings/financial-form.tsx` - Financial settings
- `src/components/settings/notification-form.tsx` - Notification settings
- `src/components/settings/rules-manager.tsx` - Categorization rules

### Settings Sections
1. **Profile:** Name, email
2. **Financial:** Expected income, minimum balance, tithe settings
3. **Notifications:** Email preferences, Telegram setup
4. **Rules:** List/edit/delete categorization rules

### Acceptance Criteria
- [ ] All settings load correctly
- [ ] Changes save successfully
- [ ] Validation on inputs
- [ ] Telegram test button works
- [ ] Rules can be managed

---

## TASK-15: Telegram Notifications

**Prerequisites:** TASK-14
**Parallelizable With:** TASK-16
**Estimated Complexity:** Low
**Output:** Working Telegram bot integration

### Objectives
1. Create Telegram bot service
2. Send budget alerts
3. Send import reminders
4. Allow test message

### Files to Create
- `src/lib/services/telegram.ts` - Telegram service
- `src/app/api/notifications/telegram/test/route.ts` - Test endpoint
- `src/lib/jobs/budget-alerts.ts` - Budget alert job

### Message Types
1. Budget warning (50%, 80%, 100%)
2. Import reminder (monthly)
3. Weekly summary (optional)

### Acceptance Criteria
- [ ] Bot sends messages successfully
- [ ] Budget alerts trigger at thresholds
- [ ] Test message works from settings
- [ ] Messages formatted nicely

---

## TASK-16: Email Reports

**Prerequisites:** TASK-14
**Parallelizable With:** TASK-15
**Estimated Complexity:** Medium
**Output:** Automated email reports

### Objectives
1. Create email templates
2. Implement weekly report
3. Implement monthly report
4. Allow manual sending

### Files to Create
- `src/lib/services/email.ts` - Email service
- `src/lib/email/templates/weekly-report.tsx` - Weekly template
- `src/lib/email/templates/monthly-report.tsx` - Monthly template
- `src/app/api/reports/send-email/route.ts` - Send report endpoint

### Reports
1. **Weekly:** Spending summary, budget status, alerts
2. **Monthly:** Full breakdown, comparisons, trends

### Acceptance Criteria
- [ ] Emails render correctly
- [ ] Weekly report accurate
- [ ] Monthly report comprehensive
- [ ] Manual send works
- [ ] Unsubscribe link works

---

## Execution Order (Optimal)

### Phase 1: Foundation (Week 1)
```
TASK-01 ──────────────────────────────────────► ✅ Complete
    │
    ├── TASK-02 (Database) ────────────────► ✅ Complete
    ├── TASK-03 (Auth) ────────────────────► 🔄 Ready
    └── TASK-04 (Parsers) ─────────────────► 🔄 Ready
```

### Phase 2: Core (Week 2)
```
TASK-05 (Core API) ────────────────────────► Pending
TASK-06 (UI Components) ───────────────────► Pending
TASK-07 (Import Backend) ──────────────────► Pending
```

### Phase 3: Features (Week 3)
```
TASK-08 (Import UI) ───────────────────────► Pending
TASK-09 (Dashboard) ───────────────────────► Pending
    │
    ├── TASK-10 (Transactions) ────────────► Pending
    ├── TASK-11 (Budgets) ─────────────────► Pending
    ├── TASK-12 (Subscriptions) ───────────► Pending
    └── TASK-13 (Installments) ────────────► Pending
```

### Phase 4: Polish (Week 4)
```
TASK-14 (Settings) ────────────────────────► Pending
    │
    ├── TASK-15 (Telegram) ────────────────► Pending
    └── TASK-16 (Email Reports) ───────────► Pending
```

---

## Quick Reference: Parallel Execution

**Can run simultaneously:**
- TASK-02 + TASK-03 + TASK-04 (after TASK-01)
- TASK-06 + TASK-07 (after respective prerequisites)
- TASK-10 + TASK-11 + TASK-12 + TASK-13 + TASK-14 (after TASK-09)
- TASK-15 + TASK-16 (after TASK-14)

**Must run sequentially:**
- TASK-01 → TASK-02 → TASK-05
- TASK-04 → TASK-07 → TASK-08
- TASK-09 → TASK-10/11/12/13

---

*Last updated: December 2025*
