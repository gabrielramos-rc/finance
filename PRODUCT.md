# Finance - Sistema Pessoal de Gestão Financeira

## Visão Geral

**Finance** é um sistema pessoal de gestão financeira desenvolvido para ajudar a controlar gastos, planejar orçamentos e tomar decisões financeiras conscientes em um momento de transição de renda.

---

## O Problema

### Contexto
- Renda variável reduzida de ~R$ 40.000 para ~R$ 20.000/mês (50%)
- Custos fixos elevados que consomem ~85% da nova renda
- Múltiplas fontes de dados (banco, cartões de crédito)
- Falta de visibilidade sobre para onde o dinheiro vai
- Parcelas futuras comprometendo orçamento
- Muitas assinaturas (algumas compartilhadas, algumas esquecidas)
- Nenhum hábito atual de acompanhamento financeiro

### Consequências
- Impossibilidade de planejar investimentos
- Risco de gastar mais do que ganha
- Decisões financeiras no escuro
- Estresse desnecessário sobre dinheiro

---

## O Usuário

### Perfil Principal: Gabriel
- **Localização:** Brasília, Brasil
- **Renda:** Variável, mínimo R$ 20.000/mês líquido (empresa própria)
- **Família:** Casado com Isabela
- **Pets:** 2 Shiba Inus (Koda e Kuma)
- **Perfil técnico:** Desenvolvedor, confortável com terminal mas prefere interface visual
- **Perfil investidor:** Agressivo mas consciente, focado em constância
- **Bancos:** Banco do Brasil (conta + cartões), BTG (investimentos)

### Usuária Secundária: Isabela (esposa)
- Acesso para visualização
- Precisa de interface amigável
- Participará de revisões semanais (aspiracional)

---

## Solução

Um sistema web que:

1. **Importa dados financeiros** de extratos CSV e faturas PDF
2. **Categoriza transações** automaticamente com possibilidade de ajuste manual
3. **Calcula orçamentos** baseado em renda real, custos fixos e parcelas futuras
4. **Alerta sobre gastos** com níveis progressivos (50%, 80%, 100%+)
5. **Rastreia assinaturas** e identifica oportunidades de economia
6. **Projeta parcelas futuras** mostrando quando cada uma termina
7. **Sugere investimentos** baseado no saldo disponível
8. **Envia notificações** via Telegram e relatórios por email

---

## Fontes de Dados

### Banco do Brasil - Conta Corrente
- **Formato:** CSV
- **Estrutura:** Data, Lançamento, Detalhes, Nº documento, Valor, Tipo Lançamento
- **Encoding:** ISO-8859-1 (Latin1)
- **Frequência:** Mensal

### Banco do Brasil - Cartão VISA Infinite (Final 4256)
- **Formato:** PDF
- **Estrutura:** Categorizado pelo banco (Restaurantes, Serviços, etc.)
- **Frequência:** Mensal (fecha dia 4)

### Banco do Brasil - Cartão ELO Nanquim (Final 4405)
- **Formato:** PDF
- **Estrutura:** Categorizado pelo banco
- **Frequência:** Mensal (fecha dia 4)
- **Cartões adicionais:** Isabela (4224), Beatriz (6604)

### BTG Pactual (futuro)
- **Formato:** A definir
- **Uso:** Tracking de investimentos

---

## Estrutura de Categorias

### Fixos Essenciais
| Categoria | Subcategoria | Exemplo |
|-----------|--------------|---------|
| Moradia | Aluguel | PJBANK |
| Moradia | Condomínio | Residencial First |
| Moradia | Energia | Neoenergia |
| Saúde | Plano de Saúde | CASSI |
| Saúde | Seguro de Vida | Prudential |
| Educação | Faculdade | CEUB |
| Trabalho Doméstico | Diarista | Maria Teresa |
| Telecomunicações | Internet/Celular | Vivo |
| Consórcio | Veículo | BB Consórcio |

### Construção de Futuro
| Categoria | Subcategoria | Exemplo |
|-----------|--------------|---------|
| Previdência | Privada | Icatu |
| Investimentos | Aportes | Transferências BTG |
| Dízimo | - | 10% da renda (meta) |

### Assinaturas
| Categoria | Subcategoria | Exemplos |
|-----------|--------------|----------|
| Assinaturas | Produtividade | Claude Max, Google Workspace |
| Assinaturas | Educação | Brilliant (anual), AUVP |
| Assinaturas | Streaming | Disney+, DAZN, Spotify, Prime |
| Assinaturas | Fitness | Gympass/Wellhub |
| Assinaturas | Outros | Livelo, LinkedIn (anual), Apple, Microsoft |

### Parcelas
- Rastreamento individual por compra
- Data de início, parcela atual, total de parcelas
- Projeção de término
- Impacto mensal no orçamento

### Variáveis
| Categoria | Subcategorias |
|-----------|---------------|
| Alimentação | Restaurantes, Delivery (iFood), Supermercado, Hortifruti |
| Transporte | Combustível, Uber/99, Estacionamento |
| Pets | Ração/Petshop, Veterinário |
| Saúde Variável | Farmácia, Consultas avulsas |
| Beleza | Barbearia, Cosméticos |
| Vestuário | Roupas, Acessórios |
| Lazer | Cinema, Viagens, Entretenimento |
| Família | Transferências (pais, irmã) |

---

## Funcionalidades

### MVP (Fase 1)

#### 1. Upload e Processamento de Dados
- Upload manual de arquivos CSV (extrato) e PDF (faturas)
- Parser automático para formato Banco do Brasil
- Detecção de encoding e formato de data brasileiro
- Validação de dados importados
- Histórico de imports

#### 2. Categorização de Transações
- Categorização automática baseada em regras e padrões
- Sugestão de categoria com confiança
- Possibilidade de correção manual
- Aprendizado: correções manuais viram regras futuras
- Bulk editing para múltiplas transações

#### 3. Dashboard Principal
- Resumo do mês atual
- Renda recebida vs esperada
- Gastos por categoria (gráfico)
- Barra de progresso do orçamento
- Alertas ativos
- Saldo disponível estimado

#### 4. Sistema de Orçamentos
- Definição de limites por categoria
- Cálculo automático de "quanto posso gastar"
- Considera: renda - fixos - parcelas - reserva
- Alertas progressivos:
  - 🟢 Info (50%): "Você gastou metade do orçamento de Alimentação"
  - 🟡 Warning (80%): "Atenção: 80% do orçamento de Alimentação usado"
  - 🔴 Critical (100%+): "Orçamento de Alimentação estourado!"

#### 5. Gestão de Parcelas
- Lista de todas as compras parceladas
- Status: parcela atual / total
- Valor mensal
- Data de término
- Projeção de alívio: "Em Abril você terá R$ 2.100 a menos de parcelas"

#### 6. Gestão de Assinaturas
- Lista de todas as assinaturas detectadas
- Diferenciação: mensal vs anual
- Cálculo de custo mensal equivalente
- Campo "compartilhado com" e "valor a receber"
- Status: essencial / avaliar / cancelar

#### 7. Relatórios Básicos
- Visão mensal de gastos
- Comparativo mês anterior
- Evolução de categorias
- Export para PDF

### Fase 2 (Notificações)

#### 8. Integração Telegram
- Bot pessoal para notificações
- Alertas de orçamento em tempo real
- Lembrete de upload: "Fatura fechou, hora de atualizar!"
- Comando para consultar saldo/orçamento

#### 9. Relatórios por Email
- Resumo semanal (segundas)
- Análise mensal (dia 5)
- Revisão trimestral
- Relatório anual

### Fase 3 (Investimentos)

#### 10. Sugestão de Investimento
- Cálculo de "quanto sobrou para investir"
- Considera margem de segurança
- Histórico de aportes
- Meta mensal de investimento

#### 11. Tracking de Patrimônio
- Integração com BTG (manual inicialmente)
- Evolução do patrimônio
- Alocação atual vs desejada
- Sugestões de rebalanceamento

### Fase 4 (Inteligência)

#### 12. Insights Automáticos
- "Você gastou 30% a mais em restaurantes este mês"
- "Sua conta de energia subiu 15%"
- "Você tem 3 assinaturas de streaming, considere consolidar"

#### 13. Simulador de Cenários
- "Se eu cancelar X, economizo Y/ano"
- "Se eu reduzir alimentação em 20%, consigo investir Z"
- Projeção de patrimônio em N anos

---

## Arquitetura Técnica

### Stack Proposta

```
Frontend:
├── Next.js 14 (App Router)
├── React 18
├── TypeScript
├── Tailwind CSS
├── Shadcn/ui (componentes)
├── Recharts (gráficos)
└── React Query (data fetching)

Backend:
├── Next.js API Routes
├── TypeScript
├── Prisma (ORM)
├── PDF-parse (parser PDF)
├── Papaparse (parser CSV)
└── Node-telegram-bot-api

Database:
└── PostgreSQL (Supabase)

Infraestrutura:
├── Vercel (frontend + API)
├── Supabase (database + auth)
└── Resend (emails)
```

### Modelo de Dados (Simplificado)

```
User
├── id
├── name
├── email
└── telegramChatId

Account (conta bancária)
├── id
├── userId
├── bankName
├── accountType
└── currentBalance

CreditCard
├── id
├── userId
├── bankName
├── cardName
├── lastFourDigits
├── closingDay
└── dueDay

Transaction
├── id
├── userId
├── accountId / creditCardId
├── date
├── description
├── amount
├── type (income/expense)
├── categoryId
├── subcategoryId
├── isRecurring
├── installmentInfo (JSON)
└── importedFrom

Category
├── id
├── name
├── type (fixed/variable/investment)
├── icon
├── color
└── budgetLimit

Subscription
├── id
├── userId
├── name
├── amount
├── frequency (monthly/annual)
├── categoryId
├── sharedWith (JSON)
├── amountToReceive
└── status (essential/evaluate/cancel)

Budget
├── id
├── userId
├── categoryId
├── month
├── limit
├── spent
└── alerts (JSON)

Installment
├── id
├── userId
├── description
├── totalAmount
├── installmentAmount
├── currentInstallment
├── totalInstallments
├── startDate
├── endDate
└── creditCardId

Import
├── id
├── userId
├── fileName
├── fileType (csv/pdf)
├── importDate
├── transactionCount
├── status
└── errors (JSON)
```

---

## Fluxo de Uso

### Fluxo Mensal Típico

```
Dia 4-5 (faturas fecham)
│
├─► Telegram: "Suas faturas VISA e ELO fecharam. Hora de fazer upload!"
│
▼
Upload dos PDFs das faturas
│
├─► Sistema processa e categoriza
├─► Novas parcelas detectadas
├─► Assinaturas atualizadas
│
▼
Dashboard atualizado com dados do mês
│
▼
Durante o mês
│
├─► Alertas de orçamento conforme gasta
├─► Telegram: "Você atingiu 80% do orçamento de Alimentação"
│
▼
Fim do mês (dia 28-30)
│
├─► Upload do extrato CSV
├─► Reconciliação de dados
│
▼
Sugestão de investimento
│
├─► "Você pode investir R$ X este mês"
│
▼
Email com relatório mensal
│
└─► Revisão com Isabela (semanal/mensal)
```

---

## Configurações Iniciais

### Dados do Usuário
```yaml
nome: Gabriel Lucena Ramos
email: [a definir]
telegram: [a configurar]

renda:
  tipo: variável
  minimo_mensal: 20000
  fonte_principal: "GABRIEL 042... (empresa)"

banco_principal:
  nome: Banco do Brasil
  agencia: 3603

cartoes:
  - tipo: VISA Infinite
    final: 4256
    vencimento: 16
    fechamento: 4
  - tipo: ELO Nanquim
    final: 4405
    vencimento: 16
    fechamento: 4
    adicionais:
      - nome: Isabela
        final: 4224
      - nome: Beatriz
        final: 6604

investimentos:
  corretora: BTG Pactual
  reserva_emergencia: 105000
  perfil: agressivo
```

### Custos Fixos Identificados
```yaml
moradia:
  aluguel: 1900  # PJBANK
  condominio: 1130  # Residencial First
  energia: 470  # Neoenergia

saude:
  plano: 2202  # CASSI
  seguro_vida_gabriel: 373  # Prudential
  seguro_vida_isabela: 519  # Prudential

educacao:
  faculdade_isabela: 1786  # CEUB (12 meses restantes)

trabalho_domestico:
  diarista: 850  # Maria Teresa

previdencia:
  icatu: 513

telecom:
  vivo: 156
  vivo_easy: 38

consorcio:
  bb: 456  # Veículo contemplado

seguros:
  bb_seguros: 56
```

### Assinaturas Identificadas
```yaml
mensais:
  - nome: Gympass/Wellhub
    valor: 290
    categoria: fitness
  - nome: Claude Max
    valor: 600
    categoria: produtividade
    nota: "Investimento em renda extra"
  - nome: DAZN
    valor: 100
    categoria: streaming
  - nome: Google Workspace
    valor: 98
    categoria: produtividade
  - nome: Disney+
    valor: 67
    categoria: streaming
    compartilhado: true
  - nome: Microsoft 365
    valor: 60
    categoria: produtividade
  - nome: Aldeias
    valor: 60
    categoria: doacao
  - nome: Clube Livelo
    valor: 45
    categoria: beneficios
  - nome: Spotify
    valor: 41
    categoria: streaming
    compartilhado: true
  - nome: Vivo Easy
    valor: 38
    categoria: telecom
  - nome: Apple (iCloud/Apps)
    valor: 70
    categoria: produtividade
  - nome: Microsoft (outro)
    valor: 29
    categoria: produtividade
  - nome: Amazon Prime
    valor: 20
    categoria: streaming
  - nome: Amazon Prime Canais
    valor: 28
    categoria: streaming
  - nome: Amazon Ad-free
    valor: 10
    categoria: streaming

anuais:
  - nome: LinkedIn Premium
    valor_anual: 420
    valor_mensal_equiv: 35
    categoria: profissional
  - nome: Brilliant
    valor_anual: 360
    valor_mensal_equiv: 30
    categoria: educacao
  - nome: Crunchyroll
    valor_anual: 200
    valor_mensal_equiv: 17
    categoria: streaming
```

---

## Metas e KPIs

### Metas de Curto Prazo (3 meses)
- [ ] Visibilidade completa de todos os gastos
- [ ] Categorização de 95%+ das transações
- [ ] Orçamentos definidos para todas as categorias variáveis
- [ ] Redução de 20% em gastos não essenciais
- [ ] Sistema de alertas funcionando

### Metas de Médio Prazo (6 meses)
- [ ] Saldo positivo consistente todo mês
- [ ] Investimento mínimo de R$ 1.000/mês
- [ ] Todas as parcelas mapeadas até o fim
- [ ] Revisão semanal com Isabela estabelecida
- [ ] Dízimo iniciado (mesmo que 5%)

### Metas de Longo Prazo (12 meses)
- [ ] Custos fixos reduzidos em 15%
- [ ] CEUB finalizado (R$ 1.786/mês liberados)
- [ ] Maioria das parcelas quitadas
- [ ] Diversificação de investimentos iniciada
- [ ] Dízimo em 10%

---

## Decisões de Design

### Princípios
1. **Simplicidade:** Interface limpa, sem excesso de informação
2. **Acionável:** Cada tela deve levar a uma ação clara
3. **Honesto:** Mostrar a realidade, mesmo que dura
4. **Progressivo:** Começar simples, adicionar complexidade conforme necessário
5. **Offline-first:** Funcionar mesmo com internet instável

### Decisões Técnicas
1. **Monorepo:** Frontend e backend no mesmo repositório
2. **Server Components:** Usar React Server Components onde possível
3. **Edge Functions:** Para operações rápidas
4. **Incremental Static Regeneration:** Para dashboards
5. **Optimistic Updates:** Para melhor UX

### Decisões de UX
1. **Mobile-first:** Priorizar visualização em celular
2. **Dark mode:** Suporte desde o início
3. **Português:** Interface 100% em português brasileiro
4. **Acessível:** Seguir WCAG 2.1 AA
5. **Feedback visual:** Confirmações claras de ações

---

## Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Esquecer de fazer upload | Alto | Lembretes via Telegram |
| Categorização errada | Médio | Revisão mensal + aprendizado |
| Mudança de formato do banco | Alto | Parser modular e adaptável |
| Dados sensíveis expostos | Crítico | Auth robusta, dados encriptados |
| Perda de motivação | Alto | Gamificação leve, celebrar vitórias |

---

## Cronograma Sugerido

### Sprint 1: Fundação
- Setup do projeto (Next.js, Prisma, Supabase)
- Modelo de dados básico
- Parser CSV do extrato bancário
- Upload e listagem de transações

### Sprint 2: Categorização
- Parser PDF das faturas
- Sistema de categorias
- Categorização automática básica
- Interface de correção manual

### Sprint 3: Dashboard
- Dashboard principal
- Gráficos de gastos por categoria
- Resumo do mês
- Alertas visuais

### Sprint 4: Orçamentos
- Definição de orçamentos
- Cálculo de gastos vs limite
- Sistema de alertas (50/80/100%)
- Sugestão de orçamento

### Sprint 5: Parcelas e Assinaturas
- Gestão de parcelas
- Projeção de término
- Gestão de assinaturas
- Tracking de compartilhamentos

### Sprint 6: Notificações
- Bot Telegram
- Alertas em tempo real
- Lembretes de upload
- Relatórios por email

---

## Glossário

| Termo | Definição |
|-------|-----------|
| Parcela | Pagamento dividido de uma compra (sem juros) |
| Assinatura | Pagamento recorrente por serviço |
| Categoria Fixa | Gasto que não varia (aluguel, plano de saúde) |
| Categoria Variável | Gasto que pode ser controlado (alimentação, lazer) |
| Reserva de Emergência | Dinheiro guardado para imprevistos (ideal: 6-12 meses de gastos) |
| Dízimo | Contribuição religiosa de 10% da renda |
| Previdência | Investimento de longo prazo para aposentadoria |
| Consórcio | Sistema de compra coletiva (sem juros, com taxa de administração) |

---

## Anexos

### A. Formato do CSV (Banco do Brasil)
```csv
"Data","Lançamento","Detalhes","Nº documento","Valor","Tipo Lançamento"
"31/10/2025","Saldo Anterior","","","4.826,88",""
"04/11/2025","Pix - Recebido","04/11 08:13 04245590130 MATEUS GOMES P","40813056007021","1.064,00","Entrada"
```

### B. Estrutura do PDF (Fatura Banco do Brasil)
- Página 1: Resumo e opções de pagamento
- Página 2: Informações complementares e início dos lançamentos
- Páginas 3+: Lançamentos por categoria
- Última página: Contatos

### C. Categorias do Banco (mapeamento)
| Categoria BB | Categoria Finance |
|--------------|-------------------|
| Restaurantes | Alimentação > Restaurantes |
| Supermercados | Alimentação > Supermercado |
| Serviços | (múltiplas - requer análise) |
| Saúde | Saúde Variável |
| Transporte | Transporte |
| Vestuário | Vestuário |
| Viagens | Lazer > Viagens |
| Lazer | Lazer |
| Outros lançamentos | (análise individual) |
| Compras parceladas | Parcelas |

---

*Documento criado em: Dezembro 2025*
*Última atualização: Dezembro 2025*
*Versão: 1.0*
