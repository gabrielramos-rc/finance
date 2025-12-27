# Categorias

## Hierarquia Completa

```
📁 FIXOS ESSENCIAIS
├── 🏠 Moradia
│   ├── Aluguel
│   ├── Condomínio
│   └── Energia
├── 🏥 Saúde
│   ├── Plano de Saúde (CASSI)
│   └── Seguro de Vida (Prudential)
├── 🎓 Educação
│   └── Faculdade (CEUB)
├── 🧹 Trabalho Doméstico
│   └── Diarista
├── 📱 Telecomunicações
│   ├── Internet/Celular (Vivo)
│   └── Chip Extra (Vivo Easy)
└── 🚗 Consórcio
    └── Veículo (BB)

📁 CONSTRUÇÃO DE FUTURO
├── 🏦 Previdência
│   └── Privada (Icatu)
├── 📈 Investimentos
│   └── Aportes (BTG)
└── ⛪ Dízimo
    └── Contribuição

📁 ASSINATURAS
├── 💼 Produtividade
│   ├── Claude Max
│   ├── Google Workspace
│   ├── Microsoft 365
│   └── Apple (iCloud)
├── 📚 Educação
│   ├── Brilliant (anual)
│   └── AUVP
├── 📺 Streaming
│   ├── Disney+
│   ├── DAZN
│   ├── Spotify
│   ├── Amazon Prime
│   ├── Amazon Prime Canais
│   ├── Crunchyroll (anual)
│   └── Amazon Ad-free
├── 💪 Fitness
│   └── Gympass/Wellhub
├── 👔 Profissional
│   └── LinkedIn Premium (anual)
├── 🎁 Benefícios
│   └── Clube Livelo
└── ❤️ Doações
    └── Aldeias

📁 PARCELAS
└── (Tracking individual por compra)

📁 VARIÁVEIS
├── 🍽️ Alimentação
│   ├── Restaurantes
│   ├── Delivery (iFood)
│   ├── Supermercado
│   ├── Hortifruti
│   └── Açougue
├── 🚗 Transporte
│   ├── Combustível
│   ├── Uber/99
│   └── Estacionamento
├── 🐕 Pets
│   ├── Ração/Petshop
│   └── Veterinário
├── 💊 Saúde Variável
│   ├── Farmácia
│   └── Consultas
├── 💇 Beleza
│   ├── Barbearia
│   └── Cosméticos
├── 👔 Vestuário
│   ├── Roupas
│   └── Acessórios
├── 🎬 Lazer
│   ├── Cinema
│   ├── Viagens
│   └── Entretenimento
└── 👨‍👩‍👧 Família
    └── Transferências

📁 SISTEMA
├── ❓ A Classificar
├── 🚫 Ignorar
└── 🔄 Transferência Interna
```

## Configuração YAML

```yaml
# config/categories.yaml

categories:
  # ============================================
  # FIXOS ESSENCIAIS
  # ============================================
  - slug: moradia
    name: Moradia
    type: fixed
    icon: "🏠"
    color: "#3B82F6"
    children:
      - slug: moradia-aluguel
        name: Aluguel
        keywords: ["PJBANK", "ALUGUEL"]
      - slug: moradia-condominio
        name: Condomínio
        keywords: ["CONDOMINIO", "RESIDENCIAL FIRST"]
      - slug: moradia-energia
        name: Energia
        keywords: ["NEOENERGIA", "ENERGIA", "LUZ"]

  - slug: saude-fixa
    name: Saúde (Fixo)
    type: fixed
    icon: "🏥"
    color: "#EF4444"
    children:
      - slug: saude-plano
        name: Plano de Saúde
        keywords: ["CASSI"]
      - slug: saude-seguro-vida
        name: Seguro de Vida
        keywords: ["PRUDENT", "PRUDENTIAL"]

  - slug: educacao
    name: Educação
    type: fixed
    icon: "🎓"
    color: "#8B5CF6"
    children:
      - slug: educacao-faculdade
        name: Faculdade
        keywords: ["CEUB", "CENTRO E U B"]

  - slug: trabalho-domestico
    name: Trabalho Doméstico
    type: fixed
    icon: "🧹"
    color: "#F59E0B"
    children:
      - slug: diarista
        name: Diarista
        keywords: ["MARIA TEREZINHA", "MARIA TERESA"]

  - slug: telecom
    name: Telecomunicações
    type: fixed
    icon: "📱"
    color: "#10B981"
    children:
      - slug: telecom-principal
        name: Internet/Celular
        keywords: ["VIVO CELULAR", "VIVO MOVEL"]
      - slug: telecom-extra
        name: Chip Extra
        keywords: ["VIVO EASY"]

  - slug: consorcio
    name: Consórcio
    type: fixed
    icon: "🚗"
    color: "#6366F1"
    children:
      - slug: consorcio-veiculo
        name: Veículo
        keywords: ["BB CONSORCIO", "BB ADMIN CONS"]

  # ============================================
  # CONSTRUÇÃO DE FUTURO
  # ============================================
  - slug: previdencia
    name: Previdência
    type: investment
    icon: "🏦"
    color: "#14B8A6"
    children:
      - slug: previdencia-privada
        name: Privada
        keywords: ["ICATU"]

  - slug: investimentos
    name: Investimentos
    type: investment
    icon: "📈"
    color: "#22C55E"
    children:
      - slug: investimentos-aportes
        name: Aportes
        keywords: ["BTG", "PIX OPEN FINANCE"]

  - slug: dizimo
    name: Dízimo
    type: investment
    icon: "⛪"
    color: "#A855F7"
    children:
      - slug: dizimo-contribuicao
        name: Contribuição

  # ============================================
  # ASSINATURAS
  # ============================================
  - slug: assinaturas
    name: Assinaturas
    type: variable
    icon: "📺"
    color: "#EC4899"
    children:
      - slug: assinaturas-produtividade
        name: Produtividade
        keywords: ["CLAUDE", "ANTHROPIC", "GOOGLE WORKSPACE", "MICROSOFT", "APPLE COM BILL"]
      - slug: assinaturas-educacao
        name: Educação
        keywords: ["BRILLIANT", "AUVP"]
      - slug: assinaturas-streaming
        name: Streaming
        keywords: ["DISNEY", "DAZN", "SPOTIFY", "AMAZON PRIME", "NETFLIX", "HBO", "CRUNCHYROLL"]
      - slug: assinaturas-fitness
        name: Fitness
        keywords: ["GYMPASS", "WELLHUB"]
      - slug: assinaturas-profissional
        name: Profissional
        keywords: ["LINKEDIN"]
      - slug: assinaturas-beneficios
        name: Benefícios
        keywords: ["LIVELO", "CLUBE LIVELO"]
      - slug: assinaturas-doacoes
        name: Doações
        keywords: ["ALDEIAS"]

  # ============================================
  # VARIÁVEIS
  # ============================================
  - slug: alimentacao
    name: Alimentação
    type: variable
    icon: "🍽️"
    color: "#F97316"
    budgetSuggestion: 3000
    children:
      - slug: alimentacao-restaurantes
        name: Restaurantes
        keywords: ["RESTAURANTE", "BAR E", "OUTBACK", "SUBWAY", "KFC", "MCDONALDS", "BURGER", "PIZZA", "PECORINO", "CAMINITO", "BARUC", "BERTOLO", "CHICAGO PRIME"]
      - slug: alimentacao-delivery
        name: Delivery
        keywords: ["IFOOD", "IFD ", "IFD*", "RAPPI", "UBER EATS"]
      - slug: alimentacao-supermercado
        name: Supermercado
        keywords: ["SUPERMERCADO", "SUPER ADEGA", "ATACADAO", "DONA AGUAS CLARAS", "CARREFOUR"]
      - slug: alimentacao-hortifruti
        name: Hortifruti
        keywords: ["HORTIFRUTI", "HORTFRUIT", "FEDERAL QUEIJOS"]
      - slug: alimentacao-acougue
        name: Açougue
        keywords: ["CAMPERIA", "ACOUGUE"]

  - slug: transporte
    name: Transporte
    type: variable
    icon: "🚗"
    color: "#0EA5E9"
    budgetSuggestion: 1500
    children:
      - slug: transporte-combustivel
        name: Combustível
        keywords: ["COMBUSTIVEL", "COMBUSTIVEIS", "POSTO", "CASCOL", "IPIRANGA", "SHELL"]
      - slug: transporte-uber
        name: Uber/99
        keywords: ["UBER", "99APP", "99 APP"]
      - slug: transporte-estacionamento
        name: Estacionamento
        keywords: ["ESTACIONAMENTO", "ESTAPAR", "ESTAC SHOPPING", "PROPARK"]

  - slug: pets
    name: Pets
    type: variable
    icon: "🐕"
    color: "#D97706"
    budgetSuggestion: 600
    children:
      - slug: pets-petshop
        name: Ração/Petshop
        keywords: ["COBASI", "PETZ", "PETSHOP", "PET SHOP"]
      - slug: pets-veterinario
        name: Veterinário
        keywords: ["SIVET", "VETERINAR"]

  - slug: saude-variavel
    name: Saúde Variável
    type: variable
    icon: "💊"
    color: "#DC2626"
    budgetSuggestion: 500
    children:
      - slug: saude-farmacia
        name: Farmácia
        keywords: ["DROGARIA", "DROGASIL", "DROGA", "FARMACIA", "RAIA", "PACHECO", "DROGAFUJI"]
      - slug: saude-consultas
        name: Consultas
        keywords: ["PSICOLOG", "NUTRI", "GESTALT", "AMANDA CASE"]

  - slug: beleza
    name: Beleza
    type: variable
    icon: "💇"
    color: "#F472B6"
    budgetSuggestion: 400
    children:
      - slug: beleza-barbearia
        name: Barbearia
        keywords: ["BARBEARIA", "BARBER"]
      - slug: beleza-cosmeticos
        name: Cosméticos
        keywords: ["COSMETICOS", "LOCCITANE", "BEL COSMETICOS"]

  - slug: vestuario
    name: Vestuário
    type: variable
    icon: "👔"
    color: "#8B5CF6"
    budgetSuggestion: 500
    children:
      - slug: vestuario-roupas
        name: Roupas
        keywords: ["MEIAO", "ANACAPRI", "ARAMIS", "LIVE ", "CHILLI BEANS", "CENTAURO", "NIKE", "ADIDAS"]
      - slug: vestuario-acessorios
        name: Acessórios
        keywords: ["ACESSORIO", "RELOGIO"]

  - slug: lazer
    name: Lazer
    type: variable
    icon: "🎬"
    color: "#6366F1"
    budgetSuggestion: 800
    children:
      - slug: lazer-cinema
        name: Cinema
        keywords: ["CINE ", "CINEMA", "INGRESSO.COM"]
      - slug: lazer-viagens
        name: Viagens
        keywords: ["HOTEL", "HOTEIS", "TREND VIAGENS", "ABREUTUR", "NANNAI", "MOBILIDADE METRO"]
      - slug: lazer-entretenimento
        name: Entretenimento
        keywords: ["INGRESSO", "SHOW", "TEATRO"]

  - slug: familia
    name: Família
    type: variable
    icon: "👨‍👩‍👧"
    color: "#EC4899"
    children:
      - slug: familia-transferencias
        name: Transferências
        keywords: ["FABIOLA", "ALEXANDRE", "BEATRIZ"]

  # ============================================
  # SISTEMA
  # ============================================
  - slug: a-classificar
    name: A Classificar
    type: system
    icon: "❓"
    color: "#9CA3AF"
    isSystem: true

  - slug: ignorar
    name: Ignorar
    type: system
    icon: "🚫"
    color: "#6B7280"
    isSystem: true

  - slug: transferencia-interna
    name: Transferência Interna
    type: transfer
    icon: "🔄"
    color: "#64748B"
    isSystem: true
    keywords: ["PIX OPEN FINANCE", "PAGTO CARTAO CREDITO"]
```

## Merchants Conhecidos

```yaml
# config/merchants.yaml

merchants:
  # Identificação por nome exato ou pattern

  # === ALIMENTAÇÃO ===
  "OUTBACK": alimentacao-restaurantes
  "SUBWAY": alimentacao-restaurantes
  "KFC": alimentacao-restaurantes
  "MCDONALDS": alimentacao-restaurantes
  "BURGER KING": alimentacao-restaurantes
  "PECORINO": alimentacao-restaurantes
  "BARUC RESTAURANTE": alimentacao-restaurantes
  "CHICAGO PRIME": alimentacao-restaurantes
  "BERTOLO": alimentacao-restaurantes
  "BACIO DI LATTE": alimentacao-restaurantes
  "RICHESSE": alimentacao-restaurantes
  "UNIVERSITARIO COZINHA": alimentacao-restaurantes
  "ARROZ CARRETEIRO": alimentacao-restaurantes
  "RESTAURANTE PRATICITA": alimentacao-restaurantes
  "PAO DOURADO": alimentacao-restaurantes
  "SABOR DO CAFE": alimentacao-restaurantes

  "IFOOD": alimentacao-delivery
  "RAPPI": alimentacao-delivery

  "DONA AGUAS CLARAS": alimentacao-supermercado
  "SUPER ADEGA": alimentacao-supermercado
  "ATACADAO DIA A DIA": alimentacao-supermercado

  "HORTIFRUTI JM": alimentacao-hortifruti
  "HORTFRUIT JM": alimentacao-hortifruti
  "FEDERAL QUEIJOS": alimentacao-hortifruti

  "CAMPERIA": alimentacao-acougue

  # === TRANSPORTE ===
  "CASCOL COMBUSTIVEIS": transporte-combustivel
  "POSTO DE COMBUSTIVEIS": transporte-combustivel

  "UBER": transporte-uber
  "99APP": transporte-uber

  "ESTAPAR": transporte-estacionamento
  "ESTAC SHOPPING": transporte-estacionamento
  "PROPARK": transporte-estacionamento

  # === PETS ===
  "COBASI": pets-petshop
  "PETZ": pets-petshop
  "SIVET": pets-veterinario

  # === SAÚDE ===
  "DROGARIA ROSARIO": saude-farmacia
  "RAIA DROGASIL": saude-farmacia
  "DROGAFUJI": saude-farmacia

  "SEMPRE VIVA GESTALT": saude-consultas
  "AMANDA CASE PSICOLOGIA": saude-consultas
  "LUIZA JACOME FRANCO NUTRI": saude-consultas

  # === BELEZA ===
  "BARBEARIABEST": beleza-barbearia
  "LOCCITANE": beleza-cosmeticos
  "BEL COSMETICOS": beleza-cosmeticos

  # === ASSINATURAS ===
  "DISNEY PLUS": assinaturas-streaming
  "SPOTIFY": assinaturas-streaming
  "DAZN": assinaturas-streaming
  "AMAZON PRIME": assinaturas-streaming
  "AMAZON SERVICOS": assinaturas-streaming

  "CLAUDE.AI": assinaturas-produtividade
  "ANTHROPIC": assinaturas-produtividade
  "GOOGLE WORKSPACE": assinaturas-produtividade
  "APPLE COM BILL": assinaturas-produtividade
  "MICROSOFT": assinaturas-produtividade

  "BRILLIANT.ORG": assinaturas-educacao
  "AUVP": assinaturas-educacao

  "GYMPASS": assinaturas-fitness
  "WELLHUB": assinaturas-fitness

  "LINKEDIN": assinaturas-profissional

  "CLUBE LIVELO": assinaturas-beneficios

  "ALDEIAS": assinaturas-doacoes

  # === FIXOS ===
  "PJBANK": moradia-aluguel
  "CONDOMINIO DO RESIDENCIAL": moradia-condominio
  "NEOENERGIA": moradia-energia
  "CASSI": saude-plano
  "PRUDENT": saude-seguro-vida
  "CEUB": educacao-faculdade
  "CENTRO E U B": educacao-faculdade
  "MARIA TEREZINHA": diarista
  "VIVO CELULAR": telecom-principal
  "VIVO MOVEL": telecom-principal
  "VIVO EASY": telecom-extra
  "BB CONSORCIO": consorcio-veiculo
  "BB ADMIN CONS": consorcio-veiculo
  "ICATU": previdencia-privada

  # === TRANSFERÊNCIAS INTERNAS ===
  "PIX OPEN FINANCE": transferencia-interna
  "PAGTO CARTAO CREDITO": transferencia-interna
```

## Regras de Prioridade

1. **Regra customizada do usuário** (prioridade máxima)
2. **Merchant exato** do config/merchants.yaml
3. **Keyword match** do config/categories.yaml
4. **Categoria do banco** (para PDFs)
5. **"A Classificar"** (quando nada match)

## Alertas para Merchants Desconhecidos

Quando uma transação não é categorizada automaticamente:

1. Criar registro em `alerts` com type = `unknown_merchant`
2. Enviar notificação (Telegram/Email) dependendo das configurações
3. Mostrar no dashboard para classificação manual
4. Quando usuário classificar, oferecer criar regra

```typescript
interface UnknownMerchantAlert {
  type: 'unknown_merchant';
  title: 'Transação não categorizada';
  message: 'TAGUATINGA BRASILIA - R$ 155,96';
  data: {
    transactionId: string;
    description: string;
    amount: number;
    date: string;
    suggestedCategories: string[]; // Baseado em heurísticas
  };
}
```

---

*Configuração de categorias - Ajustar conforme uso*
