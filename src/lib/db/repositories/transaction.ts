/**
 * Transaction Repository
 * Handles all database operations for transactions
 */

import { prisma } from '@/lib/prisma';
import { Prisma, Transaction } from '@prisma/client';

export interface TransactionFilters {
  month?: string; // YYYY-MM format
  categoryId?: string;
  type?: 'income' | 'expense' | 'transfer';
  uncategorized?: boolean;
  limit?: number;
  offset?: number;
}

export interface TransactionWithRelations extends Transaction {
  category?: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
    parent?: {
      name: string;
      slug: string;
    } | null;
  } | null;
  creditCard?: {
    cardName: string;
    lastFourDigits: string;
  } | null;
}

export interface PaginatedTransactions {
  data: TransactionWithRelations[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export class TransactionRepository {
  /**
   * Get transactions for a user with filters
   */
  async findMany(
    userId: string,
    filters: TransactionFilters = {}
  ): Promise<PaginatedTransactions> {
    const {
      month,
      categoryId,
      type,
      uncategorized = false,
      limit = 100,
      offset = 0,
    } = filters;

    // Build date filter for month
    const dateFilter: Prisma.DateTimeFilter = {};
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);
      dateFilter.gte = startDate;
      dateFilter.lte = endDate;
    }

    // Build where clause
    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(dateFilter.gte && { date: dateFilter }),
      ...(categoryId && { categoryId }),
      ...(type && { type }),
      ...(uncategorized && { categoryId: null }),
    };

    // Get total count
    const total = await prisma.transaction.count({ where });

    // Get transactions with relations
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
            parent: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
        creditCard: {
          select: {
            cardName: true,
            lastFourDigits: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return {
      data: transactions as TransactionWithRelations[],
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  /**
   * Get a single transaction by ID
   */
  async findById(userId: string, id: string): Promise<TransactionWithRelations | null> {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
            parent: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
        creditCard: {
          select: {
            cardName: true,
            lastFourDigits: true,
          },
        },
      },
    });

    return transaction as TransactionWithRelations | null;
  }

  /**
   * Create a new transaction
   */
  async create(
    userId: string,
    data: Prisma.TransactionCreateInput
  ): Promise<Transaction> {
    return prisma.transaction.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  /**
   * Update a transaction
   */
  async update(
    userId: string,
    id: string,
    data: Prisma.TransactionUpdateInput
  ): Promise<Transaction> {
    // Verify ownership
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Transaction not found');
    }

    return prisma.transaction.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a transaction
   */
  async delete(userId: string, id: string): Promise<void> {
    // Verify ownership
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Transaction not found');
    }

    await prisma.transaction.delete({
      where: { id },
    });
  }

  /**
   * Update transaction category
   */
  async updateCategory(
    userId: string,
    id: string,
    categoryId: string | null
  ): Promise<Transaction> {
    return this.update(userId, id, {
      category: categoryId
        ? { connect: { id: categoryId } }
        : { disconnect: true },
    });
  }
}

export const transactionRepository = new TransactionRepository();

