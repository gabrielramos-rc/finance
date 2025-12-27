# Regras de Negócio

## Visão Geral Financeira

```
┌─────────────────────────────────────────────────────────────────┐
│                    RENDA MENSAL (~R$ 20.000)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Custos Fixos│  │  Parcelas   │  │ Assinaturas │             │
│  │  ~R$ 12.000 │  │  ~R$ 5.000  │  │  ~R$ 1.600  │             │
│  │    (60%)    │  │    (25%)    │  │     (8%)    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              DISPONÍVEL PARA VARIÁVEIS                     │ │
│  │                      ~R$ 1.400                             │ │
│  │                        (7%)                                │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Fórmulas

### 1. Disponível para Gastar no Mês

```typescript
function calcularDisponivelMes(
  rendaRecebida: number,
  custosFixos: number,
  parcelas: number,
  provisaoAnuais: number,
  reservaSeguranca: number,
  dizimo: number
): number {
  return rendaRecebida
    - custosFixos
    - parcelas
    - provisaoAnuais
    - reservaSeguranca
    - dizimo;
}

// Exemplo com valores do Gabriel:
// R$ 20.000 (renda)
// - R$ 11.870 (fixos: moradia + saúde + educação + diarista + telecom + consórcio + previdência)
// - R$ 4.922 (parcelas atuais)
// - R$ 82 (provisão anuais: LinkedIn + Brilliant + Crunchyroll / 12)
// - R$ 0 (reserva - aplicar depois de estabilizar)
// - R$ 0 (dízimo - iniciar progressivamente)
// = R$ 3.126 disponível para variáveis
```

### 2. Provisão para Assinaturas Anuais

```typescript
function calcularProvisaoAnuais(assinaturasAnuais: Subscription[]): number {
  const totalAnual = assinaturasAnuais.reduce(
    (sum, sub) => sum + sub.amount,
    0
  );
  return totalAnual / 12;
}

// Assinaturas anuais identificadas:
// - LinkedIn Premium: R$ 420/ano → R$ 35/mês
// - Brilliant: R$ 360/ano → R$ 30/mês
// - Crunchyroll: R$ 200/ano → R$ 17/mês
// Total: R$ 82/mês provisionado
```

### 3. Sugestão de Investimento

```typescript
function calcularSugestaoInvestimento(
  saldoConta: number,
  compromissosPendentes: number,
  colchaoMinimo: number = 5000
): number {
  const disponivel = saldoConta - compromissosPendentes - colchaoMinimo;
  return Math.max(0, disponivel);
}

// Exemplo:
// Saldo na conta: R$ 8.000
// Compromissos pendentes (fatura a vencer): R$ 0
// Colchão mínimo: R$ 5.000
// Sugestão: R$ 3.000 para investir
```

### 4. Cálculo do Dízimo

```typescript
function calcularDizimo(
  rendaBruta: number,
  percentualAtual: number // 0-10
): number {
  return rendaBruta * (percentualAtual / 100);
}

// Progressão sugerida:
// Mês 1-3: 2% (R$ 400)
// Mês 4-6: 5% (R$ 1.000)
// Mês 7+: 10% (R$ 2.000)
//
// Renda considerada: Tudo que entrar como "income" na conta
```

### 5. Alerta de Orçamento

```typescript
function verificarAlertaOrcamento(
  gasto: number,
  limite: number
): 'ok' | 'info' | 'warning' | 'critical' {
  const percentual = (gasto / limite) * 100;

  if (percentual >= 100) return 'critical';
  if (percentual >= 80) return 'warning';
  if (percentual >= 50) return 'info';
  return 'ok';
}

// Configuração de notificação:
// - 50%: Notificação apenas no app (info)
// - 80%: Notificação push/telegram (warning)
// - 100%: Notificação urgente + email (critical)
```

### 6. Projeção de Alívio de Parcelas

```typescript
function calcularAlivioParcelas(
  parcelas: Installment[],
  mesesFuturos: number = 6
): ProjecaoAlivio[] {
  const projecao: ProjecaoAlivio[] = [];
  const hoje = new Date();

  for (let i = 1; i <= mesesFuturos; i++) {
    const mesAlvo = addMonths(hoje, i);
    const parcelasQueTerminam = parcelas.filter(p =>
      isSameMonth(p.endDate, mesAlvo)
    );

    const valorLiberado = parcelasQueTerminam.reduce(
      (sum, p) => sum + p.installmentAmount,
      0
    );

    if (valorLiberado > 0) {
      projecao.push({
        mes: mesAlvo,
        valorLiberado,
        parcelas: parcelasQueTerminam.map(p => p.description),
      });
    }
  }

  return projecao;
}

// Projeção atual:
// Jan/26: +R$ 558 (Sivet + AmazonMktplc terminam)
// Fev/26: +R$ 1.349 (Abreutur + Amazon Market + PG Italiano + Vindi)
// Abr/26: +R$ 2.135 (Aramis + Nannai + Casas Bahia + AUVP)
```

## Regras de Classificação de Renda

### O que é Renda?

```typescript
const RENDA_PATTERNS = [
  // PIX da empresa (principal)
  { pattern: /GABRIEL\s+042|40952242000108/, type: 'salario' },

  // Outras rendas
  { pattern: /MATEUS GOMES/, type: 'aluguel' }, // Reembolso viagem (one-time)
  { pattern: /PPN TECNOLOGIA/, type: 'freelance' },
];

const NAO_E_RENDA = [
  // Estornos
  'ESTORNO',
  'DEVOLUCAO',
  'CANCELAMENTO',

  // Transferências próprias
  'GABRIEL LUCENA RAMOS', // Transferência para BTG

  // Reembolsos pontuais
  // (identificar manualmente)
];
```

### Tratamento de PIX Recebido

```typescript
function classificarPIXRecebido(detalhes: string): {
  tipo: 'renda' | 'reembolso' | 'transferencia' | 'outro';
  categoria?: string;
} {
  // Empresa (renda principal)
  if (detalhes.includes('40952242000108') || detalhes.includes('GABRIEL 042')) {
    return { tipo: 'renda', categoria: 'salario' };
  }

  // Transferência própria
  if (detalhes.includes('GABRIEL LUCENA RAMOS')) {
    return { tipo: 'transferencia' };
  }

  // Família (não é renda, mas não ignorar)
  if (detalhes.includes('FABIOLA') || detalhes.includes('BEATRIZ')) {
    return { tipo: 'outro', categoria: 'familia' };
  }

  // Outros - marcar para revisão
  return { tipo: 'outro' };
}
```

## Regras de Transferências Internas

### Ignorar em Cálculos

As seguintes transações NÃO devem contar como gasto/renda:

```typescript
const TRANSFERENCIAS_INTERNAS = [
  // Pagamento de cartão (já detalhado na fatura)
  'PAGTO CARTAO CREDITO',
  'PGTO DEBITO CONTA',

  // Transferência para investimentos
  'PIX OPEN FINANCE', // Para BTG

  // Transferência entre contas próprias
  // (identificar por nome = GABRIEL LUCENA RAMOS)
];
```

### Como Marcar

```typescript
// Ao importar, se identificar como transferência interna:
transaction.isIgnored = true;
transaction.categoryId = 'transferencia-interna';
transaction.notes = 'Transferência entre contas próprias';
```

## Regras de Parcelas

### Identificação

```typescript
const INSTALLMENT_REGEX = /PARC\s+(\d{2})\/(\d{2})/;

function parseInstallment(description: string): InstallmentInfo | null {
  const match = description.match(INSTALLMENT_REGEX);
  if (!match) return null;

  return {
    current: parseInt(match[1], 10),
    total: parseInt(match[2], 10),
  };
}

// Quando encontrar parcela:
// 1. Verificar se já existe registro em `installments`
// 2. Se não existir, criar com dados inferidos
// 3. Atualizar `currentInstallment`
// 4. Recalcular `endDate` se necessário
```

### Cálculo de Data de Término

```typescript
function calcularDataTermino(
  dataAtual: Date,
  parcelaAtual: number,
  totalParcelas: number
): Date {
  const mesesRestantes = totalParcelas - parcelaAtual;
  return addMonths(dataAtual, mesesRestantes);
}

// Exemplo: PARC 04/12 em Dezembro/2025
// Parcelas restantes: 12 - 4 = 8
// Término: Dezembro/2025 + 8 = Agosto/2026
```

## Regras de Orçamento

### Sugestão Automática de Limites

```typescript
function sugerirOrcamento(
  categoria: string,
  historicoGastos: number[], // últimos 3-6 meses
  disponivel: number
): number {
  // Média do histórico
  const media = historicoGastos.reduce((a, b) => a + b, 0) / historicoGastos.length;

  // Limite sugerido = média - 10% (meta de redução)
  const sugestao = media * 0.9;

  // Não pode exceder o disponível total
  return Math.min(sugestao, disponivel);
}
```

### Limites Padrão (quando sem histórico)

| Categoria | Limite Sugerido | % do Disponível |
|-----------|-----------------|-----------------|
| Alimentação | R$ 2.500 | 25% |
| Transporte | R$ 1.200 | 12% |
| Pets | R$ 500 | 5% |
| Saúde Variável | R$ 400 | 4% |
| Beleza | R$ 300 | 3% |
| Vestuário | R$ 400 | 4% |
| Lazer | R$ 600 | 6% |

## Regras de Assinaturas

### Detecção Automática

```typescript
function detectarAssinatura(
  transactions: Transaction[],
  mesesAnalise: number = 3
): PotentialSubscription[] {
  // Agrupar por merchant similar
  const grouped = groupByMerchant(transactions);

  // Identificar padrões recorrentes
  return grouped
    .filter(group => {
      // Aparece em pelo menos 2 dos últimos 3 meses
      const mesesUnicos = new Set(group.map(t => formatMonth(t.date)));
      return mesesUnicos.size >= 2;
    })
    .filter(group => {
      // Valor relativamente consistente (±10%)
      const valores = group.map(t => t.amount);
      const media = avg(valores);
      return valores.every(v => Math.abs(v - media) / media < 0.1);
    })
    .map(group => ({
      name: group[0].description,
      amount: avg(group.map(t => t.amount)),
      frequency: inferFrequency(group),
    }));
}
```

### Tracking de Compartilhamentos

```typescript
interface SubscriptionShare {
  name: string;
  email?: string;
  amount: number; // Quanto deve pagar
  isPaid: boolean;
  lastPaymentDate?: Date;
}

// Exemplo: Spotify Família
// - Assinatura: R$ 34,90
// - Compartilhado com: João (R$ 8,00), Maria (R$ 8,00)
// - A receber: R$ 16,00/mês
```

## Calendário Financeiro

### Datas Importantes

```typescript
const CALENDARIO = {
  // Entradas
  diaPagamento: 10, // Dia que recebe salário

  // Cartões
  fechamentoVisa: 4,
  fechamentoElo: 4,
  vencimentoCartoes: 16,

  // Fixos (aproximados)
  aluguel: 10, // PJBANK
  condominio: 10,
  energia: 18, // Varia
  cassi: 24,
  prudential: 15,
  ceub: 7,
  consorcio: 10,
  vivo: 21,
  icatu: 17,
};
```

### Fluxo de Caixa Típico

```
Dia 1-9:   Saldo baixo, aguardando pagamento
           Despesas: energia, CEUB, fixos
           Atenção: manter colchão de R$ 5.000

Dia 10:    💰 Pagamento recebido
           Saldo aumenta

Dia 10-16: Período de pagamentos
           Cartões (dia 16), aluguel, etc.

Dia 17-30: Período de gastos variáveis
           Monitorar orçamentos
```

## Métricas e KPIs

### Dashboard Principal

```typescript
interface DashboardMetrics {
  // Resumo do mês
  rendaRecebida: number;
  gastoTotal: number;
  saldoProjetado: number;

  // Por tipo
  gastosFixos: number;
  gastosVariaveis: number;
  parcelas: number;

  // Orçamento
  orcamentoTotal: number;
  orcamentoUsado: number;
  orcamentoRestante: number;

  // Saúde financeira
  taxaPoupanca: number; // (renda - gastos) / renda
  diasAteProximoPagamento: number;
  colchaoAtual: number;

  // Alertas ativos
  alertas: Alert[];
}
```

### Indicadores de Saúde

```typescript
function calcularSaudeFinanceira(metrics: DashboardMetrics): {
  score: number; // 0-100
  status: 'critico' | 'atencao' | 'ok' | 'otimo';
  recomendacoes: string[];
} {
  let score = 100;
  const recomendacoes: string[] = [];

  // Taxa de poupança negativa = crítico
  if (metrics.taxaPoupanca < 0) {
    score -= 40;
    recomendacoes.push('Gastos excedem a renda. Revisar orçamento urgente.');
  }

  // Colchão abaixo do mínimo
  if (metrics.colchaoAtual < 5000) {
    score -= 20;
    recomendacoes.push('Saldo na conta abaixo do recomendado (R$ 5.000).');
  }

  // Orçamento estourado
  if (metrics.orcamentoUsado > metrics.orcamentoTotal) {
    score -= 15;
    recomendacoes.push('Orçamento mensal excedido.');
  }

  // Muitos alertas ativos
  if (metrics.alertas.filter(a => !a.isRead).length > 3) {
    score -= 10;
    recomendacoes.push('Revisar alertas pendentes.');
  }

  const status =
    score < 40 ? 'critico' :
    score < 60 ? 'atencao' :
    score < 80 ? 'ok' : 'otimo';

  return { score, status, recomendacoes };
}
```

## Configurações do Usuário

### Defaults

```typescript
const DEFAULT_SETTINGS: UserSettings = {
  // Financeiro
  minimumBalance: 5000,
  savingsReservePercent: 0, // Começar sem, adicionar depois
  titheEnabled: false,
  tithePercent: 0,

  // Notificações
  notifications: {
    email: {
      enabled: true,
      weeklyReport: true,
      monthlyReport: true,
      budgetAlerts: true,
    },
    telegram: {
      enabled: false, // Habilitar quando configurar bot
      budgetAlerts: true,
      importReminders: true,
    },
  },

  // Preferências
  preferences: {
    theme: 'dark',
    currency: 'BRL',
    dateFormat: 'DD/MM/YYYY',
    startOfMonth: 1,
  },
};
```

---

*Regras de negócio - Ajustar conforme evolução do uso*
