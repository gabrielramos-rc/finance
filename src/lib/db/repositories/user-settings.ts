/**
 * User Settings Repository
 * Handles all database operations for user settings
 */

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { UserSettings } from '@/types/database';

export class UserSettingsRepository {
  /**
   * Get user settings
   */
  async get(userId: string): Promise<UserSettings> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Return default settings if none exist
    const settings = (user.settings as UserSettings) || this.getDefaultSettings();
    return settings;
  }

  /**
   * Update user settings
   */
  async update(
    userId: string,
    updates: Partial<UserSettings>
  ): Promise<UserSettings> {
    const current = await this.get(userId);
    const merged = { ...current, ...updates };

    await prisma.user.update({
      where: { id: userId },
      data: {
        settings: merged as unknown as Prisma.InputJsonValue,
      },
    });

    return merged;
  }

  /**
   * Get default settings
   */
  private getDefaultSettings(): UserSettings {
    return {
      financial: {
        expectedIncome: 20000,
        minimumBalance: 5000,
        tithe: {
          enabled: false,
          percent: 5,
        },
      },
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
    };
  }
}

export const userSettingsRepository = new UserSettingsRepository();

