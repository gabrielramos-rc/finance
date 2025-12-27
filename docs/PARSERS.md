# Parsers - CSV e PDF

Este documento descreve como parsear os arquivos do Banco do Brasil.

## Extrato Bancário (CSV)

### Formato do Arquivo

- **Encoding:** ISO-8859-1 (Latin1) - NÃO é UTF-8
- **Delimitador:** Vírgula
- **Quote char:** Aspas duplas
- **Decimal:** Vírgula brasileira (1.234,56)
- **Data:** DD/MM/YYYY

### Estrutura

```csv
"Data","Lançamento","Detalhes","Nº documento","Valor","Tipo Lançamento"
"31/10/2025","Saldo Anterior","","","4.826,88",""
"04/11/2025","Pix - Recebido","04/11 08:13 04245590130 MATEUS GOMES P","40813056007021","1.064,00","Entrada"
"04/11/2025","Pix - Enviado","04/11 15:09 ISABELA SOARES","111001","-85,00","Saída"
"00/00/0000","Saldo do dia","","","10.027,99",""
```

### Colunas

| Coluna | Descrição | Tratamento |
|--------|-----------|------------|
| Data | Data da transação | Parse DD/MM/YYYY, ignorar "00/00/0000" |
| Lançamento | Tipo de operação | Usar para identificar tipo |
| Detalhes | Descrição adicional | Contém nome do destinatário/origem |
| Nº documento | ID interno do banco | Armazenar em metadata |
| Valor | Valor em BRL | Parse brasileiro, converter para number |
| Tipo Lançamento | Entrada/Saída/vazio | Usar para determinar sinal se necessário |

### Linhas Especiais (Ignorar)

```typescript
const SKIP_PATTERNS = [
  'Saldo Anterior',
  'Saldo do dia',
  'S A L D O',
];

// Data "00/00/0000" indica linha de saldo, não transação
```

### Tipos de Lançamento

```typescript
const TRANSACTION_TYPES = {
  // Entradas (income)
  'Pix - Recebido': 'income',
  'Transferência Recebida': 'income',
  'Depósito': 'income',
  'Crédito': 'income',

  // Saídas (expense)
  'Pix - Enviado': 'expense',
  'Pix Agendado': 'expense',
  'Pix Open Finance Envio': 'transfer', // Para conta própria
  'Pagamento de Boleto': 'expense',
  'Pagto cartão crédito': 'transfer', // Ignorar - detalhes na fatura
  'Pagto Energia Elétrica': 'expense',
  'Vivo Celular': 'expense',
  'BB Consórcio - Prestação': 'expense',
  'CASSI': 'expense',
  'Icatu Seguros': 'expense',
  'Tarifa MSG': 'expense',

  // Transferências internas (ignorar em cálculos)
  'Transferência Entre Contas': 'transfer',
};
```

### Parser Implementation

```typescript
// src/lib/parsers/csv-parser.ts
import Papa from 'papaparse';
import iconv from 'iconv-lite';

interface RawCSVRow {
  Data: string;
  'Lançamento': string;
  Detalhes: string;
  'Nº documento': string;
  Valor: string;
  'Tipo Lançamento': string;
}

interface ParsedTransaction {
  date: Date;
  description: string;
  originalDescription: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  documentNumber: string;
  metadata: {
    lancamento: string;
    tipoLancamento: string;
  };
}

export function parseCSV(buffer: Buffer): ParsedTransaction[] {
  // Converter de Latin1 para UTF-8
  const content = iconv.decode(buffer, 'iso-8859-1');

  const { data, errors } = Papa.parse<RawCSVRow>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (errors.length > 0) {
    console.error('CSV parse errors:', errors);
  }

  return data
    .filter(row => !shouldSkipRow(row))
    .map(row => transformRow(row));
}

function shouldSkipRow(row: RawCSVRow): boolean {
  // Ignorar linhas de saldo
  if (row.Data === '00/00/0000') return true;

  const skipPatterns = ['Saldo Anterior', 'Saldo do dia', 'S A L D O'];
  if (skipPatterns.some(p => row['Lançamento']?.includes(p))) return true;

  return false;
}

function transformRow(row: RawCSVRow): ParsedTransaction {
  const date = parseDate(row.Data);
  const amount = parseAmount(row.Valor);
  const type = determineType(row['Lançamento'], row['Tipo Lançamento'], amount);

  return {
    date,
    description: buildDescription(row),
    originalDescription: `${row['Lançamento']} - ${row.Detalhes}`,
    amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
    type,
    documentNumber: row['Nº documento'],
    metadata: {
      lancamento: row['Lançamento'],
      tipoLancamento: row['Tipo Lançamento'],
    },
  };
}

function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

function parseAmount(amountStr: string): number {
  // "1.234,56" -> 1234.56
  // "-85,00" -> -85.00
  const normalized = amountStr
    .replace(/\./g, '')  // Remove thousand separator
    .replace(',', '.');   // Replace decimal separator
  return parseFloat(normalized);
}

function buildDescription(row: RawCSVRow): string {
  // Extrair nome relevante do detalhe
  const detalhes = row.Detalhes || '';

  // Para PIX, extrair nome do destinatário/origem
  if (row['Lançamento'].includes('Pix')) {
    const match = detalhes.match(/\d{2}\/\d{2}\s+\d{2}:\d{2}\s+[\d\s]+(.+)/);
    if (match) return match[1].trim();
  }

  // Para pagamentos, usar descrição direta
  return detalhes || row['Lançamento'];
}
```

## Fatura de Cartão (PDF)

### Estrutura do PDF

O PDF do Banco do Brasil tem estrutura consistente:

```
Página 1: Resumo + Opções de pagamento
Página 2: Informações complementares + Início dos lançamentos
Página 3+: Lançamentos por categoria
Última página: Contatos
```

### Categorias do Banco

O banco já categoriza as transações:

```typescript
const BB_CATEGORIES = [
  'Pagamentos/Créditos',
  'Lazer',
  'Restaurantes',
  'Saúde',
  'Serviços',
  'Supermercados',
  'Vestuário',
  'Viagens',
  'Transporte',
  'Outros lançamentos',
  'Compras parceladas',
];
```

### Formato das Linhas

```
Data    Descrição                              País    Valor
05/11   RESTAURANTE OUTBACK BRASILIA           BR      R$ 150,00
08/11   CASCOL COMBUSTIVEIS BRASILIA           BR      R$ 100,00
13/08   SportCicle PARC 04/12 BRASILIA         BR      R$ 149,16
```

### Identificação de Parcelas

```typescript
// Padrão: DESCRIÇÃO PARC XX/YY CIDADE
const INSTALLMENT_REGEX = /(.+)\s+PARC\s+(\d{2})\/(\d{2})\s+(.+)/;

// Exemplo: "SportCicle PARC 04/12 BRASILIA"
// Groups: [1] = "SportCicle", [2] = "04", [3] = "12", [4] = "BRASILIA"
```

### Identificação de Cartões Adicionais

```
Gabriel L Ramos (Cartão 4256)     <- Titular
...transações...

Beatriz L Ramos (Cartão 6604)     <- Adicional
...transações...

Isabela S F Ramos (Cartão 4224)   <- Adicional
...transações...
```

### Parser Implementation

```typescript
// src/lib/parsers/pdf-parser.ts
import pdf from 'pdf-parse';

interface RawPDFTransaction {
  date: string;
  description: string;
  country: string;
  amount: string;
  category: string;
  cardHolder: string;
}

interface ParsedPDFTransaction {
  date: Date;
  description: string;
  originalDescription: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  cardHolder: string;
  country: string;
  installmentInfo?: {
    current: number;
    total: number;
    originalDescription: string;
  };
  metadata: {
    bbCategory: string;
    isCredit: boolean;
  };
}

export async function parsePDF(buffer: Buffer): Promise<ParsedPDFTransaction[]> {
  const data = await pdf(buffer);
  const text = data.text;

  const transactions: ParsedPDFTransaction[] = [];
  let currentCategory = '';
  let currentCardHolder = '';

  const lines = text.split('\n');

  for (const line of lines) {
    // Detectar mudança de categoria
    const categoryMatch = detectCategory(line);
    if (categoryMatch) {
      currentCategory = categoryMatch;
      continue;
    }

    // Detectar mudança de titular
    const holderMatch = detectCardHolder(line);
    if (holderMatch) {
      currentCardHolder = holderMatch;
      continue;
    }

    // Tentar parsear como transação
    const transaction = parseTransactionLine(line, currentCategory, currentCardHolder);
    if (transaction) {
      transactions.push(transaction);
    }
  }

  return transactions;
}

function detectCategory(line: string): string | null {
  const categories = [
    'Pagamentos/Créditos',
    'Lazer',
    'Restaurantes',
    'Saúde',
    'Serviços',
    'Supermercados',
    'Vestuário',
    'Viagens',
    'Transporte',
    'Outros lançamentos',
    'Compras parceladas',
  ];

  for (const cat of categories) {
    if (line.trim() === cat) return cat;
  }
  return null;
}

function detectCardHolder(line: string): string | null {
  // "Gabriel L Ramos (Cartão 4256)"
  const match = line.match(/^(.+)\s+\(Cartão\s+(\d{4})\)$/);
  if (match) {
    return match[1].trim();
  }
  return null;
}

function parseTransactionLine(
  line: string,
  category: string,
  cardHolder: string
): ParsedPDFTransaction | null {
  // Padrão: DD/MM DESCRIÇÃO CIDADE BR R$ X.XXX,XX
  const regex = /^(\d{2}\/\d{2})\s+(.+?)\s+(BR|[A-Z]{2})\s+R\$\s*([\d.,\-]+)$/;
  const match = line.match(regex);

  if (!match) return null;

  const [, dateStr, description, country, amountStr] = match;

  // Parse amount
  const isNegative = amountStr.includes('-');
  const amount = parseAmount(amountStr.replace('-', ''));

  // Check for installment
  const installmentInfo = parseInstallment(description);

  return {
    date: parseDateFromInvoice(dateStr),
    description: installmentInfo?.cleanDescription || description.trim(),
    originalDescription: description.trim(),
    amount: isNegative ? Math.abs(amount) : -Math.abs(amount), // Créditos são negativos no PDF
    type: isNegative ? 'income' : 'expense',
    category,
    cardHolder,
    country,
    installmentInfo: installmentInfo?.info,
    metadata: {
      bbCategory: category,
      isCredit: isNegative,
    },
  };
}

function parseInstallment(description: string): {
  cleanDescription: string;
  info: { current: number; total: number; originalDescription: string };
} | null {
  const regex = /(.+)\s+PARC\s+(\d{2})\/(\d{2})\s+(.+)/;
  const match = description.match(regex);

  if (!match) return null;

  const [, name, current, total, city] = match;
  return {
    cleanDescription: `${name.trim()} - ${city.trim()}`,
    info: {
      current: parseInt(current, 10),
      total: parseInt(total, 10),
      originalDescription: description,
    },
  };
}

function parseDateFromInvoice(dateStr: string): Date {
  // DD/MM - precisa inferir o ano da fatura
  // Por enquanto, usar ano atual (será ajustado pelo contexto da fatura)
  const [day, month] = dateStr.split('/').map(Number);
  const year = new Date().getFullYear();
  return new Date(year, month - 1, day);
}

function parseAmount(amountStr: string): number {
  return parseFloat(
    amountStr
      .replace(/\./g, '')
      .replace(',', '.')
  );
}
```

### Extração de Metadados da Fatura

```typescript
interface InvoiceMetadata {
  cardType: 'visa' | 'elo';
  cardLastFour: string;
  month: string; // "dezembro"
  year: number;
  dueDate: Date;
  totalAmount: number;
  previousBalance: number;
  payments: number;
  purchases: number;
  futureInstallments: number;
}

function extractInvoiceMetadata(text: string): InvoiceMetadata {
  // Extrair do cabeçalho do PDF
  const monthMatch = text.match(/esta é sua fatura de\s+(\w+)/i);
  const totalMatch = text.match(/Valor\s+R\$([\d.,]+)/);
  const dueMatch = text.match(/Vencimento\s+(\d{2}\/\d{2}\/\d{4})/);

  // ... implementar extração completa
}
```

## Categorização Automática

### Estratégia

1. Primeiro, verificar regras customizadas do usuário (maior prioridade)
2. Segundo, usar categoria do banco (para PDFs)
3. Terceiro, aplicar patterns do sistema
4. Por último, marcar como "A Classificar"

### Patterns do Sistema

```yaml
# config/patterns.yaml

patterns:
  # Alimentação
  alimentacao-restaurantes:
    - "RESTAURANTE"
    - "BAR E"
    - "LANCHONETE"
    - "OUTBACK"
    - "SUBWAY"
    - "KFC"
    - "MCDONALDS"
    - "BURGER"
    - "PIZZA"
    - "PECORINO"
    - "CAMINITO"
    - "BARUC"

  alimentacao-delivery:
    - "IFOOD"
    - "IFD "
    - "IFD*"
    - "RAPPI"
    - "UBER EATS"
    - "ZDELIVERY"

  alimentacao-supermercado:
    - "SUPERMERCADO"
    - "SUPER ADEGA"
    - "ATACADAO"
    - "DONA AGUAS CLARAS"
    - "CARREFOUR"
    - "PAO DE ACUCAR"
    - "EXTRA"

  alimentacao-hortifruti:
    - "HORTIFRUTI"
    - "HORTFRUIT"
    - "SACOLAO"
    - "FEIRA"

  alimentacao-acougue:
    - "CAMPERIA"
    - "ACOUGUE"
    - "FRIGOR"

  # Transporte
  transporte-combustivel:
    - "COMBUSTIVEL"
    - "COMBUSTIVEIS"
    - "POSTO"
    - "CASCOL"
    - "IPIRANGA"
    - "SHELL"
    - "BR MANIA"
    - "PETROBRAS"

  transporte-uber:
    - "UBER"
    - "99APP"
    - "99 APP"
    - "CABIFY"

  transporte-estacionamento:
    - "ESTACIONAMENTO"
    - "ESTAPAR"
    - "ESTAC SHOPPING"
    - "PROPARK"

  # Assinaturas
  assinaturas-streaming:
    - "NETFLIX"
    - "DISNEY"
    - "SPOTIFY"
    - "DAZN"
    - "AMAZON PRIME"
    - "HBO"
    - "YOUTUBE"
    - "CRUNCHYROLL"

  assinaturas-produtividade:
    - "GOOGLE WORKSPACE"
    - "MICROSOFT"
    - "CLAUDE"
    - "ANTHROPIC"
    - "OPENAI"
    - "CHATGPT"
    - "GITHUB"
    - "NOTION"

  # Pets
  pets:
    - "COBASI"
    - "PETZ"
    - "PETSHOP"
    - "PET SHOP"
    - "SIVET"  # Veterinário
    - "VETERINAR"

  # Saúde
  saude-farmacia:
    - "DROGARIA"
    - "DROGASIL"
    - "DROGA"
    - "FARMACIA"
    - "RAIA"
    - "PACHECO"

  # ... mais patterns
```

### Implementação do Categorizador

```typescript
// src/lib/parsers/categorizer.ts
import yaml from 'js-yaml';
import fs from 'fs';

interface PatternConfig {
  patterns: Record<string, string[]>;
}

class Categorizer {
  private patterns: Map<string, string[]>;
  private userRules: Map<string, string>; // pattern -> categoryId

  constructor() {
    this.patterns = this.loadSystemPatterns();
    this.userRules = new Map();
  }

  private loadSystemPatterns(): Map<string, string[]> {
    const config = yaml.load(
      fs.readFileSync('config/patterns.yaml', 'utf8')
    ) as PatternConfig;

    return new Map(Object.entries(config.patterns));
  }

  async loadUserRules(userId: string): Promise<void> {
    const rules = await prisma.categorizeRule.findMany({
      where: { userId, isActive: true },
      orderBy: { priority: 'desc' },
    });

    for (const rule of rules) {
      this.userRules.set(rule.pattern.toUpperCase(), rule.categoryId);
    }
  }

  categorize(description: string, bbCategory?: string): {
    categorySlug: string;
    confidence: number;
    matchedBy: 'user-rule' | 'bb-category' | 'system-pattern' | 'none';
  } {
    const upperDesc = description.toUpperCase();

    // 1. Check user rules first (highest priority)
    for (const [pattern, categoryId] of this.userRules) {
      if (upperDesc.includes(pattern)) {
        return {
          categorySlug: categoryId,
          confidence: 1.0,
          matchedBy: 'user-rule',
        };
      }
    }

    // 2. Map BB category if available
    if (bbCategory) {
      const mapped = this.mapBBCategory(bbCategory);
      if (mapped) {
        return {
          categorySlug: mapped,
          confidence: 0.9,
          matchedBy: 'bb-category',
        };
      }
    }

    // 3. Check system patterns
    for (const [categorySlug, patterns] of this.patterns) {
      for (const pattern of patterns) {
        if (upperDesc.includes(pattern.toUpperCase())) {
          return {
            categorySlug,
            confidence: 0.8,
            matchedBy: 'system-pattern',
          };
        }
      }
    }

    // 4. No match - needs manual classification
    return {
      categorySlug: 'a-classificar',
      confidence: 0,
      matchedBy: 'none',
    };
  }

  private mapBBCategory(bbCategory: string): string | null {
    const mapping: Record<string, string> = {
      'Restaurantes': 'alimentacao-restaurantes',
      'Supermercados': 'alimentacao-supermercado',
      'Serviços': null, // Muito genérico, deixar para patterns
      'Saúde': 'saude-farmacia',
      'Transporte': 'transporte',
      'Vestuário': 'vestuario',
      'Viagens': 'lazer-viagens',
      'Lazer': 'lazer',
      'Pagamentos/Créditos': null, // Ignorar
      'Outros lançamentos': null,
      'Compras parceladas': null, // Processar separadamente
    };

    return mapping[bbCategory] || null;
  }
}

export const categorizer = new Categorizer();
```

## Tratamento de Erros

### Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| Encoding errado | CSV não é UTF-8 | Usar iconv-lite com ISO-8859-1 |
| Data inválida | Formato inesperado | Fallback para regex flexível |
| Valor não parseia | Formato diferente | Normalizar separadores |
| PDF corrompido | Download incompleto | Validar tamanho/checksum |
| Categoria não encontrada | Nova categoria do banco | Log + alert para revisar |

### Validação

```typescript
function validateParsedTransactions(
  transactions: ParsedTransaction[]
): { valid: ParsedTransaction[]; errors: ParseError[] } {
  const valid: ParsedTransaction[] = [];
  const errors: ParseError[] = [];

  for (const tx of transactions) {
    const issues: string[] = [];

    // Validar data
    if (isNaN(tx.date.getTime())) {
      issues.push(`Data inválida: ${tx.date}`);
    }

    // Validar valor
    if (isNaN(tx.amount) || tx.amount === 0) {
      issues.push(`Valor inválido: ${tx.amount}`);
    }

    // Validar descrição
    if (!tx.description || tx.description.length < 2) {
      issues.push(`Descrição inválida: ${tx.description}`);
    }

    if (issues.length > 0) {
      errors.push({ transaction: tx, issues });
    } else {
      valid.push(tx);
    }
  }

  return { valid, errors };
}
```

## Deduplicação

### Estratégia

Transações são consideradas duplicadas se:
- Mesma data
- Mesmo valor (com margem de R$ 0,01)
- Descrição similar (Levenshtein > 0.8)

```typescript
function isDuplicate(
  newTx: ParsedTransaction,
  existingTx: Transaction
): boolean {
  // Mesma data
  if (!isSameDay(newTx.date, existingTx.date)) return false;

  // Mesmo valor (com margem)
  if (Math.abs(newTx.amount - existingTx.amount) > 0.01) return false;

  // Descrição similar
  const similarity = levenshteinSimilarity(
    newTx.description.toUpperCase(),
    existingTx.description.toUpperCase()
  );
  if (similarity < 0.8) return false;

  return true;
}
```

---

*Documento técnico para implementação de parsers*
