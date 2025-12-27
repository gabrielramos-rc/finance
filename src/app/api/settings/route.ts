/**
 * Settings API Routes
 * GET /api/settings - Get user settings
 * PATCH /api/settings - Update user settings
 */

import { NextRequest } from 'next/server';
import { requireAuth, handleApiError } from '@/lib/api/auth';
import { userSettingsRepository } from '@/lib/db/repositories/user-settings';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const settings = await userSettingsRepository.get(user.id);

    return Response.json(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const settings = await userSettingsRepository.update(user.id, body);

    return Response.json(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

