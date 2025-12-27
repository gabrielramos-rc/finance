/**
 * TypeScript types for JSON fields in the database
 * These provide type safety for Prisma JSON columns
 */

// ============================================================================
// USER SETTINGS
// ============================================================================

export interface UserSettings {
  // Perfil
  email?: string;
  notificationEmail?: string;
  telegramChatId?: string;

  // Configurações financeiras (nested structure for compatibility)
  financial?: {
    expectedIncome?: number;
    minimumBalance?: number; // R$ 5.000 default
    tithe?: {
      enabled?: boolean;
      percent?: number; // 0-10, progressivo
    };
  };

  // Legacy flat structure (for backward compatibility)
  minimumBalance?: number; // R$ 5.000 default
  savingsReservePercent?: number; // % para reserva
  titheEnabled?: boolean;
  tithePercent?: number; // 0-10, progressivo

  // Notificações
  notifications?: {
    email?: {
      enabled?: boolean;
      weeklyReport?: boolean;
      monthlyReport?: boolean;
      budgetAlerts?: boolean;
    };
    telegram?: {
      enabled?: boolean;
      budgetAlerts?: boolean;
      importReminders?: boolean;
    };
  };

  // Preferências
  preferences?: {
    theme?: 'dark' | 'light' | 'system';
    currency?: 'BRL';
    dateFormat?: 'DD/MM/YYYY';
    startOfMonth?: number; // Dia que considera início do mês (default: 1)
  };
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  minimumBalance: 5000,
  savingsReservePercent: 10,
  titheEnabled: false,
  tithePercent: 0,
  notifications: {
    email: {
      enabled: true,
      weeklyReport: true,
      monthlyReport: true,
      budgetAlerts: true,
    },
    telegram: {
      enabled: false,
      budgetAlerts: true,
      importReminders: true,
    },
  },
  preferences: {
    theme: 'dark',
    currency: 'BRL',
    dateFormat: 'DD/MM/YYYY',
    startOfMonth: 1,
  },
};

// ============================================================================
// TRANSACTION METADATA
// ============================================================================

export interface TransactionMetadata {
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
  categorizedBy?: 'auto' | 'rule' | 'manual';
  confidence?: number; // 0-1 para auto-categorização
  matchedRule?: string; // ID da regra que categorizou
}

// ============================================================================
// SUBSCRIPTION SHARE
// ============================================================================

export interface SubscriptionShare {
  name: string;
  amount: number;
  paid?: boolean;
  paidAt?: string; // ISO date string
}

// ============================================================================
// IMPORT ERRORS
// ============================================================================

export interface ImportError {
  line?: number;
  message: string;
  data?: Record<string, unknown>;
}

// ============================================================================
// ALERT DATA
// ============================================================================

export interface AlertData {
  // Budget alerts
  categoryId?: string;
  categoryName?: string;
  budgetLimit?: number;
  currentSpent?: number;
  percentUsed?: number;

  // Import alerts
  importId?: string;
  fileName?: string;
  transactionsCount?: number;

  // Unknown merchant alerts
  transactionId?: string;
  merchantName?: string;

  // Generic
  [key: string]: unknown;
}

// ============================================================================
// CATEGORY TYPES
// ============================================================================

export type CategoryType =
  | 'fixed' // Custos fixos
  | 'variable' // Gastos variáveis
  | 'income' // Renda
  | 'transfer' // Transferências
  | 'investment' // Investimentos
  | 'subscription' // Assinaturas
  | 'system'; // Categorias do sistema

export type TransactionType = 'income' | 'expense' | 'transfer';

export type SubscriptionStatus = 'active' | 'evaluate' | 'cancelled';

export type InstallmentStatus = 'active' | 'completed' | 'cancelled';

export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type ImportFileType = 'csv-account' | 'pdf-visa' | 'pdf-elo';

export type AlertType =
  | 'budget_50'
  | 'budget_80'
  | 'budget_100'
  | 'unknown_merchant'
  | 'import_complete';

export type MatchType = 'contains' | 'startsWith' | 'regex';

export type AccountType = 'checking' | 'savings' | 'investment';

export type SubscriptionFrequency = 'monthly' | 'annual';


