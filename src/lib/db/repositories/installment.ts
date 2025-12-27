/**
 * Installment Repository
 * Handles all database operations for installments
 */

import { prisma } from '@/lib/prisma';
import { Installment, Prisma } from '@prisma/client';

export interface InstallmentWithRelations extends Installment {
  creditCard?: {
    cardName: string;
    lastFourDigits: string;
  } | null;
  category?: {
    name: string;
    slug: string;
    icon: string | null;
  } | null;
}

export interface InstallmentSummary {
  monthlyImpact: number;
  totalRemaining: number;
}

export interface InstallmentProjection {
  month: string; // YYYY-MM
  relief: number; // Amount that will be freed
  items: string[]; // Descriptions of installments ending
}

export class InstallmentRepository {
  /**
   * Get all active installments for a user
   */
  async findMany(userId: string): Promise<{
    data: InstallmentWithRelations[];
    summary: InstallmentSummary;
    projection: InstallmentProjection[];
  }> {
    const installments = await prisma.installment.findMany({
      where: {
        userId,
        status: 'active',
      },
      include: {
        creditCard: {
          select: {
            cardName: true,
            lastFourDigits: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
            icon: true,
          },
        },
      },
      orderBy: {
        endDate: 'asc',
      },
    });

    // Calculate summary
    const monthlyImpact = installments.reduce(
      (sum, inst) => sum + Number(inst.installmentAmount),
      0
    );
    const totalRemaining = installments.reduce(
      (sum, inst) => {
        const remaining = inst.totalInstallments - inst.currentInstallment;
        return sum + Number(inst.installmentAmount) * remaining;
      },
      0
    );

    // Build projection (group by end month)
    const projectionMap = new Map<string, InstallmentProjection>();
    
    installments.forEach((inst) => {
      const endMonth = inst.endDate.toISOString().slice(0, 7); // YYYY-MM
      const existing = projectionMap.get(endMonth);
      
      if (existing) {
        existing.relief += Number(inst.installmentAmount);
        existing.items.push(inst.description);
      } else {
        projectionMap.set(endMonth, {
          month: endMonth,
          relief: Number(inst.installmentAmount),
          items: [inst.description],
        });
      }
    });

    const projection = Array.from(projectionMap.values()).sort(
      (a, b) => a.month.localeCompare(b.month)
    );

    return {
      data: installments as InstallmentWithRelations[],
      summary: {
        monthlyImpact,
        totalRemaining,
      },
      projection,
    };
  }

  /**
   * Get a single installment by ID
   */
  async findById(userId: string, id: string): Promise<InstallmentWithRelations | null> {
    return prisma.installment.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        creditCard: {
          select: {
            cardName: true,
            lastFourDigits: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
            icon: true,
          },
        },
      },
    });
  }

  /**
   * Create a new installment
   */
  async create(
    userId: string,
    data: Prisma.InstallmentCreateInput
  ): Promise<Installment> {
    return prisma.installment.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  /**
   * Update an installment (e.g., when a payment is made)
   */
  async update(
    userId: string,
    id: string,
    data: Prisma.InstallmentUpdateInput
  ): Promise<Installment> {
    // Verify ownership
    const existing = await prisma.installment.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Installment not found');
    }

    return prisma.installment.update({
      where: { id },
      data,
    });
  }
}

export const installmentRepository = new InstallmentRepository();

