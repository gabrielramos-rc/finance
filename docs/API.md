# API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production:  https://finance.rcconsultech.com/api
```

## Authentication

Todas as rotas requerem autenticação via Supabase Auth.

```typescript
// Headers
Authorization: Bearer <supabase_access_token>
```

## Endpoints

### Transactions

#### GET /api/transactions

Lista transações com filtros.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| month | string | current | Mês no formato YYYY-MM |
| categoryId | string | - | Filtrar por categoria |
| type | string | - | income, expense, transfer |
| uncategorized | boolean | false | Apenas não categorizadas |
| limit | number | 100 | Máximo de resultados |
| offset | number | 0 | Paginação |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "date": "2025-11-15",
      "description": "RESTAURANTE OUTBACK",
      "originalDescription": "RESTAURANTE OUTBACK BRASILIA",
      "amount": -150.00,
      "type": "expense",
      "category": {
        "id": "uuid",
        "name": "Restaurantes",
        "slug": "alimentacao-restaurantes",
        "icon": "🍽️",
        "color": "#F97316",
        "parent": {
          "name": "Alimentação",
          "slug": "alimentacao"
        }
      },
      "cardHolder": "Gabriel L Ramos",
      "creditCard": {
        "cardName": "VISA Infinite",
        "lastFourDigits": "4256"
      },
      "isRecurring": false,
      "metadata": {}
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

#### GET /api/transactions/:id

Retorna uma transação específica.

#### PATCH /api/transactions/:id

Atualiza uma transação.

**Body:**
```json
{
  "categoryId": "uuid",
  "notes": "Almoço de trabalho",
  "isIgnored": false
}
```

#### POST /api/transactions/:id/categorize

Categoriza e opcionalmente cria regra.

**Body:**
```json
{
  "categoryId": "uuid",
  "createRule": true,
  "rulePattern": "OUTBACK",
  "ruleMatchType": "contains"
}
```

---

### Import

#### POST /api/import/upload

Upload de arquivo para importação.

**Body:** FormData
```
file: File (CSV ou PDF)
type: "csv-account" | "pdf-visa" | "pdf-elo"
```

**Response:**
```json
{
  "importId": "uuid",
  "status": "processing",
  "fileName": "extrato-112025.csv"
}
```

#### GET /api/import/:id

Status da importação.

**Response:**
```json
{
  "id": "uuid",
  "status": "completed",
  "fileName": "extrato-112025.csv",
  "fileType": "csv-account",
  "period": "2025-11",
  "transactionsCount": 45,
  "newCount": 42,
  "duplicateCount": 3,
  "errors": [],
  "createdAt": "2025-12-01T10:00:00Z"
}
```

#### GET /api/import/:id/preview

Preview das transações antes de confirmar.

**Response:**
```json
{
  "transactions": [...],
  "summary": {
    "total": 45,
    "new": 42,
    "duplicates": 3,
    "uncategorized": 5,
    "totalIncome": 20000,
    "totalExpense": -15000
  }
}
```

#### POST /api/import/:id/confirm

Confirma importação e salva transações.

---

### Categories

#### GET /api/categories

Lista todas as categorias.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Alimentação",
      "slug": "alimentacao",
      "type": "variable",
      "icon": "🍽️",
      "color": "#F97316",
      "children": [
        {
          "id": "uuid",
          "name": "Restaurantes",
          "slug": "alimentacao-restaurantes"
        },
        {
          "id": "uuid",
          "name": "Delivery",
          "slug": "alimentacao-delivery"
        }
      ]
    }
  ]
}
```

#### POST /api/categories

Cria categoria customizada.

**Body:**
```json
{
  "name": "Jogos",
  "parentId": "uuid-lazer",
  "icon": "🎮",
  "color": "#8B5CF6"
}
```

---

### Budgets

#### GET /api/budgets

Lista orçamentos do mês.

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| month | string | current |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "category": {
        "name": "Alimentação",
        "slug": "alimentacao",
        "icon": "🍽️"
      },
      "limit": 3000,
      "spent": 2400,
      "remaining": 600,
      "percentage": 80,
      "alert": "warning"
    }
  ],
  "summary": {
    "totalLimit": 10000,
    "totalSpent": 7500,
    "totalRemaining": 2500
  }
}
```

#### PUT /api/budgets/:categoryId

Define/atualiza orçamento.

**Body:**
```json
{
  "month": "2025-11",
  "limit": 3000,
  "alertAt50": true,
  "alertAt80": true,
  "alertAt100": true
}
```

---

### Subscriptions

#### GET /api/subscriptions

Lista assinaturas.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Netflix",
      "amount": 55.90,
      "frequency": "monthly",
      "category": {...},
      "status": "active",
      "sharedWith": [
        { "name": "João", "amount": 15, "isPaid": false }
      ],
      "nextBillingDate": "2025-12-15"
    }
  ],
  "summary": {
    "monthlyTotal": 1065,
    "annualTotal": 980,
    "toReceive": 45
  }
}
```

#### POST /api/subscriptions

Adiciona assinatura manualmente.

#### PATCH /api/subscriptions/:id

Atualiza assinatura.

**Body:**
```json
{
  "status": "cancelled",
  "notes": "Cancelado em 01/12"
}
```

---

### Installments

#### GET /api/installments

Lista parcelas ativas.

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| status | string | active |
| endBefore | string | - |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "description": "Aramis Park Shopping",
      "totalAmount": 5439.30,
      "installmentAmount": 1087.86,
      "currentInstallment": 1,
      "totalInstallments": 5,
      "startDate": "2025-11-13",
      "endDate": "2026-03-13",
      "creditCard": {...},
      "status": "active"
    }
  ],
  "summary": {
    "monthlyImpact": 4922,
    "totalRemaining": 18000
  },
  "projection": [
    { "month": "2026-01", "relief": 558, "items": ["Sivet", "AmazonMktplc"] },
    { "month": "2026-02", "relief": 1349, "items": ["Abreutur", "..."] }
  ]
}
```

---

### Dashboard

#### GET /api/dashboard

Dados consolidados para o dashboard.

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| month | string | current |

**Response:**
```json
{
  "period": {
    "month": "2025-11",
    "startDate": "2025-11-01",
    "endDate": "2025-11-30"
  },
  "income": {
    "received": 20000,
    "expected": 20000,
    "percentOfExpected": 100
  },
  "expenses": {
    "fixed": 11870,
    "variable": 3500,
    "installments": 4922,
    "total": 20292
  },
  "balance": {
    "projected": -292,
    "current": 2671.38
  },
  "budgets": {
    "total": 10000,
    "used": 7500,
    "remaining": 2500,
    "alerts": [
      { "category": "Alimentação", "percentage": 85, "level": "warning" }
    ]
  },
  "topCategories": [
    { "category": "Alimentação", "amount": 2550, "percentage": 25 },
    { "category": "Transporte", "amount": 1300, "percentage": 13 }
  ],
  "recentTransactions": [...],
  "alerts": [
    { "type": "budget_warning", "message": "...", "isRead": false }
  ],
  "investmentSuggestion": {
    "available": 0,
    "reason": "Gastos excedem renda este mês"
  }
}
```

---

### Alerts

#### GET /api/alerts

Lista alertas.

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| unreadOnly | boolean | false |
| limit | number | 20 |

#### PATCH /api/alerts/:id/read

Marca alerta como lido.

#### POST /api/alerts/mark-all-read

Marca todos como lidos.

---

### Reports

#### GET /api/reports/monthly

Relatório mensal.

**Query Parameters:**
| Param | Type |
|-------|------|
| month | string |

#### GET /api/reports/comparison

Comparativo entre meses.

**Query Parameters:**
| Param | Type |
|-------|------|
| months | string[] |

#### POST /api/reports/send-email

Envia relatório por email.

**Body:**
```json
{
  "type": "monthly",
  "month": "2025-11",
  "email": "user@example.com"
}
```

---

### Settings

#### GET /api/settings

Retorna configurações do usuário.

#### PATCH /api/settings

Atualiza configurações.

**Body:**
```json
{
  "minimumBalance": 5000,
  "titheEnabled": true,
  "tithePercent": 5,
  "notifications": {
    "telegram": {
      "enabled": true,
      "chatId": "123456789"
    }
  }
}
```

---

### Categorization Rules

#### GET /api/rules

Lista regras de categorização.

#### POST /api/rules

Cria nova regra.

**Body:**
```json
{
  "pattern": "OUTBACK",
  "matchType": "contains",
  "categoryId": "uuid",
  "priority": 10
}
```

#### DELETE /api/rules/:id

Remove regra.

---

## Error Responses

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid month format",
    "details": {
      "field": "month",
      "expected": "YYYY-MM"
    }
  }
}
```

**Error Codes:**
| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Token inválido ou expirado |
| FORBIDDEN | 403 | Sem permissão para recurso |
| NOT_FOUND | 404 | Recurso não encontrado |
| VALIDATION_ERROR | 400 | Dados inválidos |
| IMPORT_ERROR | 422 | Erro ao processar arquivo |
| INTERNAL_ERROR | 500 | Erro interno |

---

## Rate Limiting

- 100 requests/minuto por usuário
- Import: 10 arquivos/hora
- Reports: 5/hora

---

## Webhooks (Futuro)

Para integração com Telegram e outros serviços.

```
POST /api/webhooks/telegram
POST /api/webhooks/import-complete
```

---

*API versão 1.0*
