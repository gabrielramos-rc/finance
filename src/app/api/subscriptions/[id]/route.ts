/**
 * Subscription Detail API Routes
 * PATCH /api/subscriptions/:id - Update a subscription
 */

import { NextRequest } from 'next/server';
import { requireAuth, handleApiError, ApiError } from '@/lib/api/auth';
import { validateUUID } from '@/lib/api/validation';
import { subscriptionRepository } from '@/lib/db/repositories/subscription';

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

    const body = await request.json();

    const updateData: Record<string, unknown> = {};

    if (body.status !== undefined) {
      if (!['active', 'evaluate', 'cancelled'].includes(body.status)) {
        throw new ApiError(
          'VALIDATION_ERROR',
          'status must be "active", "evaluate", or "cancelled"',
          400
        );
      }
      updateData.status = body.status;
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }
    if (body.nextBillingDate !== undefined) {
      updateData.nextBillingDate = body.nextBillingDate ? new Date(body.nextBillingDate) : null;
    }
    if (body.sharedWith !== undefined) {
      updateData.sharedWith = body.sharedWith;
    }

    const subscription = await subscriptionRepository.update(user.id, id, updateData);

    return Response.json(subscription);
  } catch (error) {
    return handleApiError(error);
  }
}

