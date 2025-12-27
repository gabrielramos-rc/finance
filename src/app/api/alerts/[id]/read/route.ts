/**
 * Alert Read API Route
 * PATCH /api/alerts/:id/read - Mark alert as read
 */

import { NextRequest } from 'next/server';
import { requireAuth, handleApiError } from '@/lib/api/auth';
import { validateUUID } from '@/lib/api/validation';
import { alertRepository } from '@/lib/db/repositories/alert';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    validateUUID(id, 'id');

    const alert = await alertRepository.markAsRead(user.id, id);

    return Response.json(alert);
  } catch (error) {
    return handleApiError(error);
  }
}

