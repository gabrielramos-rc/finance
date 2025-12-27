/**
 * Alerts API Routes
 * GET /api/alerts - List alerts
 */

import { NextRequest } from 'next/server';
import { requireAuth, handleApiError } from '@/lib/api/auth';
import { validateBoolean, validatePagination } from '@/lib/api/validation';
import { alertRepository } from '@/lib/db/repositories/alert';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const unreadOnly = validateBoolean(searchParams.get('unreadOnly'));
    const { limit } = validatePagination(searchParams.get('limit'));

    const alerts = await alertRepository.findMany(user.id, {
      unreadOnly,
      limit,
    });

    return Response.json({ data: alerts });
  } catch (error) {
    return handleApiError(error);
  }
}

