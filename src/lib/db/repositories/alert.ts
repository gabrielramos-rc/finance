/**
 * Alert Repository
 * Handles all database operations for alerts
 */

import { prisma } from '@/lib/prisma';
import { Alert, Prisma } from '@prisma/client';

export class AlertRepository {
  /**
   * Get alerts for a user
   */
  async findMany(
    userId: string,
    options: {
      unreadOnly?: boolean;
      limit?: number;
    } = {}
  ): Promise<Alert[]> {
    const { unreadOnly = false, limit = 20 } = options;

    return prisma.alert.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get a single alert by ID
   */
  async findById(userId: string, id: string): Promise<Alert | null> {
    return prisma.alert.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  /**
   * Create a new alert
   */
  async create(
    userId: string,
    data: {
      type: string;
      title: string;
      message: string;
      data?: Record<string, unknown>;
      sentVia?: string[];
    }
  ): Promise<Alert> {
    return prisma.alert.create({
      data: {
        ...data,
        userId,
        data: data.data || {},
        sentVia: data.sentVia || [],
      },
    });
  }

  /**
   * Mark alert as read
   */
  async markAsRead(userId: string, id: string): Promise<Alert> {
    // Verify ownership
    const existing = await prisma.alert.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Alert not found');
    }

    return prisma.alert.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * Mark all alerts as read for a user
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    return prisma.alert.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  /**
   * Delete an alert
   */
  async delete(userId: string, id: string): Promise<void> {
    // Verify ownership
    const existing = await prisma.alert.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Alert not found');
    }

    await prisma.alert.delete({
      where: { id },
    });
  }
}

export const alertRepository = new AlertRepository();

