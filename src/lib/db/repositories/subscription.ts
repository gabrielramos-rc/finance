/**
 * Subscription Repository
 * Handles all database operations for subscriptions
 */

import { prisma } from '@/lib/prisma';
import { Subscription, Prisma } from '@prisma/client';

export interface SubscriptionWithCategory extends Subscription {
  category?: {
    name: string;
    slug: string;
    icon: string | null;
  } | null;
}

export interface SubscriptionSummary {
  monthlyTotal: number;
  annualTotal: number;
  toReceive: number; // Amount to receive from shared subscriptions
}

export class SubscriptionRepository {
  /**
   * Get all subscriptions for a user
   */
  async findMany(userId: string): Promise<{
    data: SubscriptionWithCategory[];
    summary: SubscriptionSummary;
  }> {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        status: 'active',
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
        name: 'asc',
      },
    });

    // Calculate summary
    let monthlyTotal = 0;
    let annualTotal = 0;
    let toReceive = 0;

    subscriptions.forEach((sub) => {
      const amount = Number(sub.amount);
      const sharedWith = (sub.sharedWith as Array<{ name: string; amount: number; isPaid?: boolean }>) || [];

      if (sub.frequency === 'monthly') {
        monthlyTotal += amount;
        // Calculate what user should receive from shared subscriptions
        const userShare = sharedWith.reduce((sum, share) => {
          return sum + (share.isPaid ? 0 : share.amount);
        }, 0);
        toReceive += userShare;
      } else if (sub.frequency === 'annual') {
        annualTotal += amount;
        // Annual subscriptions: calculate monthly provision
        monthlyTotal += amount / 12;
        const userShare = sharedWith.reduce((sum, share) => {
          return sum + (share.isPaid ? 0 : share.amount / 12);
        }, 0);
        toReceive += userShare / 12;
      }
    });

    return {
      data: subscriptions as SubscriptionWithCategory[],
      summary: {
        monthlyTotal,
        annualTotal,
        toReceive,
      },
    };
  }

  /**
   * Get a single subscription by ID
   */
  async findById(userId: string, id: string): Promise<SubscriptionWithCategory | null> {
    return prisma.subscription.findFirst({
      where: {
        id,
        userId,
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
    });
  }

  /**
   * Create a new subscription
   */
  async create(
    userId: string,
    data: Prisma.SubscriptionCreateInput
  ): Promise<Subscription> {
    return prisma.subscription.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  /**
   * Update a subscription
   */
  async update(
    userId: string,
    id: string,
    data: Prisma.SubscriptionUpdateInput
  ): Promise<Subscription> {
    // Verify ownership
    const existing = await prisma.subscription.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Subscription not found');
    }

    return prisma.subscription.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a subscription
   */
  async delete(userId: string, id: string): Promise<void> {
    // Verify ownership
    const existing = await prisma.subscription.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Subscription not found');
    }

    await prisma.subscription.delete({
      where: { id },
    });
  }
}

export const subscriptionRepository = new SubscriptionRepository();

