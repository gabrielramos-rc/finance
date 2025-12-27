/**
 * Dashboard API Route
 * GET /api/dashboard - Get consolidated dashboard data
 */

import { NextRequest } from 'next/server';
import { requireAuth, handleApiError } from '@/lib/api/auth';
import { validateMonth } from '@/lib/api/validation';
import { transactionRepository } from '@/lib/db/repositories/transaction';
import { budgetRepository } from '@/lib/db/repositories/budget';
import { alertRepository } from '@/lib/db/repositories/alert';
import { userSettingsRepository } from '@/lib/db/repositories/user-settings';
import { format } from 'date-fns';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Get month from query or use current month
    const monthParam = searchParams.get('month');
    const month = monthParam || format(new Date(), 'yyyy-MM');
    validateMonth(month);

    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    // Get user settings for expected income
    const settings = await userSettingsRepository.get(user.id);
    const expectedIncome = settings.financial?.expectedIncome || 0;

    // Get transactions for the month
    const transactions = await transactionRepository.findMany(user.id, {
      month,
      limit: 1000, // Get all for calculations
    });

    // Calculate income and expenses
    let received = 0;
    let fixed = 0;
    let variable = 0;
    let installments = 0;

    transactions.data.forEach((tx) => {
      const amount = Number(tx.amount);
      if (tx.type === 'income') {
        received += amount;
      } else if (tx.type === 'expense') {
        // Check if it's an installment
        const isInstallment = tx.metadata && typeof tx.metadata === 'object' && 'installmentNumber' in tx.metadata;
        if (isInstallment) {
          installments += Math.abs(amount);
        } else {
          // Check category type to determine fixed vs variable
          // For now, we'll use a simple heuristic based on category
          // This could be improved by checking category.type
          variable += Math.abs(amount);
        }
      }
    });

    // Get installments monthly impact
    const installmentsData = await prisma.installment.findMany({
      where: {
        userId: user.id,
        status: 'active',
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      select: {
        installmentAmount: true,
      },
    });

    const installmentsImpact = installmentsData.reduce(
      (sum, inst) => sum + Number(inst.installmentAmount),
      0
    );

    // Get budgets
    const budgets = await budgetRepository.findMany(user.id, month);

    // Get recent transactions (last 5)
    const recentTransactions = await transactionRepository.findMany(user.id, {
      month,
      limit: 5,
    });

    // Get unread alerts
    const alerts = await alertRepository.findMany(user.id, {
      unreadOnly: true,
      limit: 5,
    });

    // Calculate top categories
    const categoryTotals = new Map<string, { amount: number; name: string }>();
    transactions.data.forEach((tx) => {
      if (tx.type === 'expense' && tx.category) {
        const categoryId = tx.category.id;
        const amount = Math.abs(Number(tx.amount));
        const existing = categoryTotals.get(categoryId) || { amount: 0, name: tx.category.name };
        categoryTotals.set(categoryId, {
          amount: existing.amount + amount,
          name: existing.name,
        });
      }
    });

    const topCategories = Array.from(categoryTotals.entries())
      .map(([id, data]) => ({
        category: data.name,
        amount: data.amount,
        percentage: 0, // Will calculate below
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const totalExpenses = variable + fixed + installmentsImpact;
    topCategories.forEach((cat) => {
      cat.percentage = totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0;
    });

    // Calculate investment suggestion
    const currentBalance = 0; // Would come from account balance
    const minimumBalance = settings.financial?.minimumBalance || 5000;
    const commitments = installmentsImpact; // Simplified
    const available = currentBalance - commitments - minimumBalance;

    return Response.json({
      period: {
        month,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      income: {
        received,
        expected: expectedIncome,
        percentOfExpected: expectedIncome > 0 ? (received / expectedIncome) * 100 : 0,
      },
      expenses: {
        fixed,
        variable,
        installments: installmentsImpact,
        total: fixed + variable + installmentsImpact,
      },
      balance: {
        projected: received - (fixed + variable + installmentsImpact),
        current: currentBalance,
      },
      budgets: {
        total: budgets.summary.totalLimit,
        used: budgets.summary.totalSpent,
        remaining: budgets.summary.totalRemaining,
        alerts: budgets.data
          .filter((b) => {
            const spent = 0; // Would calculate from transactions
            const percentage = b.limit > 0 ? (spent / Number(b.limit)) * 100 : 0;
            return percentage >= 50;
          })
          .map((b) => ({
            category: b.category.name,
            percentage: 0, // Would calculate
            level: 'warning' as const,
          })),
      },
      topCategories,
      recentTransactions: recentTransactions.data.slice(0, 5),
      alerts: alerts.map((a) => ({
        type: a.type,
        message: a.message,
        isRead: a.isRead,
      })),
      investmentSuggestion: {
        available: available > 0 ? available : 0,
        reason: available <= 0 ? 'Gastos excedem renda este mês' : 'Saldo disponível para investimento',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

