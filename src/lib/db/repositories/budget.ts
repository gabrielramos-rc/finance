/**
 * Budget Repository
 * Handles all database operations for budgets
 */

import { prisma } from '@/lib/prisma';
import { Budget, Prisma } from '@prisma/client';

export interface BudgetWithCategory extends Budget {
  category: {
    name: string;
    slug: string;
    icon: string | null;
  };
}

export interface BudgetSummary {
  totalLimit: number;
  totalSpent: number;
  totalRemaining: number;
}

export class BudgetRepository {
  /**
   * Get budgets for a user for a specific month
   */
  async findMany(
    userId: string,
    month: string // YYYY-MM format
  ): Promise<{ data: BudgetWithCategory[]; summary: BudgetSummary }> {
    const [year, monthNum] = month.split('-').map(Number);
    const monthStart = new Date(year, monthNum - 1, 1);

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: monthStart,
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
            icon: true,
          },
        },
      },
      orderBy: {
        category: {
          name: 'asc',
        },
      },
    });

    // Calculate summary
    const totalLimit = budgets.reduce((sum, b) => sum + Number(b.limit), 0);
    
    // Calculate spent from transactions (this would ideally be a separate query or cached)
    // For now, we'll return 0 and calculate in the service layer
    const totalSpent = 0;
    const totalRemaining = totalLimit - totalSpent;

    return {
      data: budgets as BudgetWithCategory[],
      summary: {
        totalLimit,
        totalSpent,
        totalRemaining,
      },
    };
  }

  /**
   * Get or create budget for a category in a month
   */
  async upsert(
    userId: string,
    categoryId: string,
    month: string, // YYYY-MM format
    data: {
      limit: number;
      alertAt50?: boolean;
      alertAt80?: boolean;
      alertAt100?: boolean;
    }
  ): Promise<Budget> {
    const [year, monthNum] = month.split('-').map(Number);
    const monthStart = new Date(year, monthNum - 1, 1);

    return prisma.budget.upsert({
      where: {
        userId_categoryId_month: {
          userId,
          categoryId,
          month: monthStart,
        },
      },
      update: {
        limit: data.limit,
        alertAt50: data.alertAt50 ?? true,
        alertAt80: data.alertAt80 ?? true,
        alertAt100: data.alertAt100 ?? true,
      },
      create: {
        userId,
        categoryId,
        month: monthStart,
        limit: data.limit,
        alertAt50: data.alertAt50 ?? true,
        alertAt80: data.alertAt80 ?? true,
        alertAt100: data.alertAt100 ?? true,
      },
    });
  }

  /**
   * Delete a budget
   */
  async delete(userId: string, categoryId: string, month: string): Promise<void> {
    const [year, monthNum] = month.split('-').map(Number);
    const monthStart = new Date(year, monthNum - 1, 1);

    await prisma.budget.deleteMany({
      where: {
        userId,
        categoryId,
        month: monthStart,
      },
    });
  }
}

export const budgetRepository = new BudgetRepository();

