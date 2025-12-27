# Edge Cases e Tratamento Especial

## Transações

### 1. Transação em Moeda Estrangeira

**Cenário:** Compras em USD (Brilliant, Claude, etc.)

```typescript
// Exemplo do PDF:
// 09/11 BRILLIANT.ORG - EDU BRILLIANT.ORG CA R$ 359,92
// 10/11 IOF - COMPRA NO EXTERIOR R$ 3,95

// Tratamento:
// 1. Identificar país != BR como internacional
// 2. Próxima linha com "IOF - COMPRA NO EXTERIOR" é relacionada
// 3. Opções:
//    a) Juntar IOF na transação original (recomendado)
//    b) Categorizar IOF separadamente como "Taxas"

function processarTransacaoInternacional(
  transacao: Transaction,
  proximaLinha: Transaction
): Transaction {
  if (proximaLinha?.description.includes('IOF - COMPRA NO EXTERIOR')) {
    return {
      ...transacao,
      amount: transacao.amount + proximaLinha.amount,
      metadata: {
        ...transacao.metadata,
        iof: proximaLinha.amount,
        isInternational: true,
      },
    };
  }
  return transacao;
}
```

### 2. Estorno/Crédito

**Cenário:** Devolução de compra, cashback, desconto

```typescript
// Exemplos do PDF:
// 03/12 DESC AUTOMATICO ANUD. TIT-PARC 06/12 BR R$ -83,00
// 13/11 iFood Osasco BR R$ -1,00

// Tratamento:
// - Valores negativos no cartão = crédito
// - Categorizar como a mesma categoria da compra original se possível
// - Ou criar categoria "Créditos/Estornos"

interface CreditTransaction {
  type: 'expense'; // Mantém como expense
  amount: number;  // Valor positivo (é um crédito)
  metadata: {
    isCredit: true;
    reason?: 'estorno' | 'desconto' | 'cashback' | 'outro';
  };
}
```

### 3. Parcela vs Compra Única

**Cenário:** Diferenciar compra parcelada de compra única

```typescript
// Parcelada:
// 13/08 SportCicle PARC 04/12 BRASILIA BR R$ 149,16

// Única:
// 29/11 OUTBACK BRASILIA BRASILIA BR R$ 110,54

// Tratamento:
// - Regex para detectar "PARC XX/XX"
// - Se encontrar, criar/atualizar registro em `installments`
// - Se não, é compra única normal

const INSTALLMENT_PATTERNS = [
  /PARC\s+(\d{2})\/(\d{2})/,           // PARC 04/12
  /PARCELA\s+(\d+)\s+DE\s+(\d+)/i,    // Parcela 4 de 12
  /(\d+)\/(\d+)X/i,                    // 4/12X
];
```

### 4. Mesmo Merchant, Valores Diferentes

**Cenário:** Mesmo estabelecimento com variação de preço

```typescript
// DONA AGUAS CLARAS aparece várias vezes:
// 12/11 DONA AGUAS CLARAS 1 BR R$ 14,99
// 15/11 DONA AGUAS CLARAS 1 BR R$ 220,90
// 15/11 DONA AGUAS CLARAS 1 BR R$ 19,98

// Tratamento:
// - Cada transação é única (não deduplicar por merchant)
// - Categorizar todas igual: alimentacao-supermercado
// - Não é assinatura (valores muito diferentes)
```

### 5. Transações no Mesmo Dia, Mesmo Valor

**Cenário:** Possível duplicata vs transações legítimas

```typescript
// Exemplo (legítimo - são 2 seguros):
// 15/11 Prudent APOL001951058 BR R$ 372,61
// 15/11 Prudent APOL001951059 BR R$ 519,10

// Exemplo (possível duplicata - mesmo valor exato):
// 05/11 CASCOL BR R$ 100,00
// 05/11 CASCOL BR R$ 100,00

// Tratamento:
// - Verificar documento/ID único se disponível
// - Se IDs diferentes, são transações distintas
// - Se não há ID, alertar usuário para confirmar

function detectarPossivelDuplicata(
  transacoes: Transaction[]
): DuplicateCandidate[] {
  // Agrupar por data + valor + merchant similar
  // Retornar pares para revisão humana
}
```

### 6. Cartões Adicionais

**Cenário:** Transações de Isabela e Beatriz

```typescript
// PDF mostra titulares separados:
// Gabriel L Ramos (Cartão 4256)
// Beatriz L Ramos (Cartão 6604)
// Isabela S F Ramos (Cartão 4224)

// Tratamento:
// - Armazenar cardHolder na transação
// - Filtros no dashboard: "Todos" / "Gabriel" / "Isabela" / "Beatriz"
// - Beatriz = irmã, usar cartão só para viagem (poucos gastos)
// - Isabela = esposa, gastos compartilhados

interface Transaction {
  // ...
  cardHolder: string;
  cardLastFour: string;
  metadata: {
    isAdditionalCard: boolean;
    cardHolderRelation?: 'titular' | 'esposa' | 'irma';
  };
}
```

## Importação

### 7. Período Sobreposto

**Cenário:** Usuário importa mesmo mês duas vezes

```typescript
// Tratamento:
// 1. Detectar período do arquivo
// 2. Verificar se já existe import para mesmo período
// 3. Opções:
//    a) Bloquear reimport (mostrar erro)
//    b) Perguntar ao usuário: substituir ou mesclar?
//    c) Mesclar automaticamente (detectar novas vs existentes)

async function handleReimport(
  newImport: ParsedData,
  existingImport: Import
): Promise<ImportResult> {
  const existing = await getTransactionsByImport(existingImport.id);
  const { novas, duplicatas, atualizadas } = compareTransactions(
    newImport.transactions,
    existing
  );

  return {
    action: 'merge',
    novas: novas.length,
    duplicatas: duplicatas.length,
    atualizadas: atualizadas.length,
  };
}
```

### 8. Arquivo Corrompido/Incompleto

**Cenário:** PDF baixado incompleto, CSV truncado

```typescript
// Validações:
// 1. Tamanho mínimo do arquivo
// 2. Headers esperados (CSV)
// 3. Estrutura básica do PDF

function validateFile(file: File): ValidationResult {
  const errors: string[] = [];

  // Tamanho
  if (file.size < 1000) {
    errors.push('Arquivo muito pequeno, pode estar corrompido');
  }

  // Tipo
  if (!['text/csv', 'application/pdf'].includes(file.type)) {
    errors.push('Tipo de arquivo não suportado');
  }

  return { valid: errors.length === 0, errors };
}
```

### 9. Formato Alterado pelo Banco

**Cenário:** Banco do Brasil muda estrutura do CSV/PDF

```typescript
// Estratégia de resiliência:
// 1. Versionar parsers
// 2. Detectar versão do formato automaticamente
// 3. Fallback para parser genérico
// 4. Alertar desenvolvedor se formato desconhecido

function detectFormatVersion(content: string): string {
  // CSV v1: Headers com acento
  if (content.includes('"Lançamento"')) return 'csv-v1';

  // CSV v2: Headers sem acento (hipotético)
  if (content.includes('"Lancamento"')) return 'csv-v2';

  return 'unknown';
}
```

## Categorização

### 10. Merchant Ambíguo

**Cenário:** "TAGUATINGA" - não sabemos o que é

```typescript
// Tratamento:
// 1. Categorizar como "A Classificar"
// 2. Criar alerta para usuário
// 3. Quando usuário categorizar, perguntar:
//    "Deseja criar regra para TAGUATINGA?"
// 4. Se sim, salvar em categorize_rules

async function handleUnknownMerchant(
  transaction: Transaction
): Promise<void> {
  // Categorizar temporariamente
  transaction.categoryId = 'a-classificar';

  // Criar alerta
  await createAlert({
    userId: transaction.userId,
    type: 'unknown_merchant',
    title: 'Transação não categorizada',
    message: `${transaction.description} - ${formatCurrency(transaction.amount)}`,
    data: {
      transactionId: transaction.id,
      description: transaction.description,
      suggestedCategories: getSuggestions(transaction.description),
    },
  });
}
```

### 11. Serviços Genéricos

**Cenário:** Categoria "Serviços" do banco é muito ampla

```typescript
// "Serviços" pode incluir:
// - Combustível (CASCOL)
// - Estacionamento (ESTAPAR)
// - Assinaturas (DISNEY, SPOTIFY)
// - Compras online (AMAZON)
// - Diversos

// Tratamento:
// - NÃO usar categoria "Serviços" do banco
// - Sempre aplicar patterns do sistema
// - Se nenhum pattern, marcar como "A Classificar"
```

### 12. Amazon - Múltiplos Tipos

**Cenário:** Amazon pode ser compra, assinatura ou serviço

```typescript
// Exemplos:
// AMAZON BR - Produto comprado
// AMAZON PRIME - Assinatura Prime
// AMAZON PRIME CANAIS - Canais adicionais
// AMAZON SERVICOS - Prime Video/Music
// AMAZONMKTPLC - Marketplace (terceiros)

const AMAZON_PATTERNS = {
  'AMAZON PRIME CANAIS': 'assinaturas-streaming',
  'AMAZON PRIME': 'assinaturas-streaming',
  'AMAZON SERVICOS': 'assinaturas-streaming',
  'AMAZON AD FREE': 'assinaturas-streaming',
  'AMAZONMKTPLC': null, // Pode ser qualquer coisa - verificar valor
  'AMAZON BR': null,    // Produto - verificar contexto
};

// Se valor < R$ 50 e recorrente: provavelmente assinatura
// Se valor > R$ 100: provavelmente produto
// Se aparecer em "Transporte": pode ser Kindle/device
```

## Cálculos

### 13. Mês com Renda Abaixo do Esperado

**Cenário:** Recebeu R$ 15.000 ao invés de R$ 20.000

```typescript
// Tratamento:
// 1. Alertar usuário sobre renda abaixo do esperado
// 2. Recalcular orçamentos proporcionalmente
// 3. Sugerir cortes temporários
// 4. NÃO sugerir investimento se renda < custos fixos

function handleLowIncome(
  rendaReal: number,
  rendaEsperada: number,
  custosFixos: number
): IncomeAlert {
  const deficit = rendaEsperada - rendaReal;
  const percentual = (rendaReal / rendaEsperada) * 100;

  if (rendaReal < custosFixos) {
    return {
      severity: 'critical',
      message: `Renda (${formatCurrency(rendaReal)}) abaixo dos custos fixos (${formatCurrency(custosFixos)})`,
      action: 'Usar reserva de emergência ou renegociar despesas',
    };
  }

  return {
    severity: 'warning',
    message: `Renda ${percentual.toFixed(0)}% do esperado. Déficit: ${formatCurrency(deficit)}`,
    action: 'Reduzir gastos variáveis em proporção',
  };
}
```

### 14. Parcelas que Mudam de Valor

**Cenário:** Parcela ajustada por correção/juros

```typescript
// Tratamento:
// - Normalmente parcelas são fixas (sem juros)
// - Se valor mudar, alertar usuário
// - Pode ser: correção monetária, erro do banco, parcela diferente

function detectInstallmentChange(
  installment: Installment,
  newAmount: number
): void {
  const diff = Math.abs(newAmount - installment.installmentAmount);
  const threshold = installment.installmentAmount * 0.05; // 5%

  if (diff > threshold) {
    createAlert({
      type: 'installment_change',
      message: `Parcela "${installment.description}" mudou de ${formatCurrency(installment.installmentAmount)} para ${formatCurrency(newAmount)}`,
    });
  }
}
```

### 15. Assinatura Anual no Meio do Ano

**Cenário:** LinkedIn cobra R$ 420 de uma vez em Novembro

```typescript
// Tratamento:
// 1. Identificar como assinatura anual
// 2. NÃO contar todo valor no orçamento de Novembro
// 3. Usar provisão mensal (R$ 35/mês)
// 4. Mostrar no dashboard: "Pagamento anual - provisionado R$ 35/mês"

function handleAnnualPayment(
  transaction: Transaction,
  subscription: Subscription
): void {
  if (subscription.frequency === 'annual') {
    transaction.metadata = {
      ...transaction.metadata,
      isAnnualPayment: true,
      monthlyEquivalent: subscription.amount / 12,
      note: `Assinatura anual - equivalente a ${formatCurrency(subscription.amount / 12)}/mês`,
    };
  }
}
```

## Notificações

### 16. Feriado/Fim de Semana

**Cenário:** Fatura vence em feriado

```typescript
// Tratamento:
// - Antecipa lembrete para dia útil anterior
// - Vencimento 16/12 (terça) = lembrete 13/12 (sexta)

import { isWeekend, isBefore, subDays } from 'date-fns';
import { isHoliday } from './holidays-br'; // Feriados brasileiros

function getPaymentReminderDate(dueDate: Date): Date {
  let reminderDate = subDays(dueDate, 3);

  while (isWeekend(reminderDate) || isHoliday(reminderDate)) {
    reminderDate = subDays(reminderDate, 1);
  }

  return reminderDate;
}
```

### 17. Múltiplos Alertas Simultâneos

**Cenário:** Vários orçamentos atingem 80% no mesmo dia

```typescript
// Tratamento:
// - Consolidar em única notificação
// - Priorizar por severidade
// - Limitar frequência (max 3 notificações/dia via Telegram)

function consolidateAlerts(alerts: Alert[]): ConsolidatedAlert {
  const critical = alerts.filter(a => a.severity === 'critical');
  const warning = alerts.filter(a => a.severity === 'warning');

  if (critical.length > 0) {
    return {
      title: `⚠️ ${critical.length} orçamento(s) estourado(s)`,
      body: critical.map(a => a.message).join('\n'),
      priority: 'high',
    };
  }

  return {
    title: `📊 ${warning.length} orçamento(s) precisam de atenção`,
    body: warning.map(a => a.message).join('\n'),
    priority: 'normal',
  };
}
```

## Interface

### 18. Primeira Vez do Usuário

**Cenário:** Dashboard vazio, sem dados

```typescript
// Tratamento:
// - Mostrar onboarding guiado
// - Empty state com call-to-action claro
// - Wizard de configuração inicial

const ONBOARDING_STEPS = [
  {
    step: 1,
    title: 'Importar dados',
    description: 'Faça upload do seu extrato e faturas',
    action: '/import',
  },
  {
    step: 2,
    title: 'Revisar categorias',
    description: 'Verifique se as categorias estão corretas',
    action: '/transactions?uncategorized=true',
  },
  {
    step: 3,
    title: 'Definir orçamentos',
    description: 'Estabeleça limites para cada categoria',
    action: '/budgets',
  },
];
```

### 19. Dados Muito Antigos

**Cenário:** Usuário importa 2 anos de histórico

```typescript
// Tratamento:
// - Processar em background
// - Mostrar progresso
// - Limitar visualização padrão (últimos 6 meses)
// - Opção de ver histórico completo

const DEFAULT_HISTORY_MONTHS = 6;
const MAX_IMPORT_MONTHS = 24;

function limitHistoricalData(
  transactions: Transaction[],
  months: number = DEFAULT_HISTORY_MONTHS
): Transaction[] {
  const cutoff = subMonths(new Date(), months);
  return transactions.filter(t => isAfter(t.date, cutoff));
}
```

---

*Edge cases identificados durante análise dos dados - Atualizar conforme novos casos apareçam*
