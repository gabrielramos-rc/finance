/**
 * Subscriptions API Routes
 * GET /api/subscriptions - List all subscriptions
 * POST /api/subscriptions - Create a new subscription
 */

import { NextRequest } from 'next/server';
import { requireAuth, handleApiError, ApiError } from '@/lib/api/auth';
import { subscriptionRepository } from '@/lib/db/repositories/subscription';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const result = await subscriptionRepository.findMany(user.id);

    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    if (!body.name || !body.amount || !body.frequency) {
      throw new ApiError(
        'VALIDATION_ERROR',
        'Missing required fields: name, amount, frequency',
        400
      );
    }

    if (!['monthly', 'annual'].includes(body.frequency)) {
      throw new ApiError(
        'VALIDATION_ERROR',
        'frequency must be "monthly" or "annual"',
        400
      );
    }

    const subscription = await subscriptionRepository.create(user.id, {
      name: body.name,
      amount: body.amount,
      frequency: body.frequency,
      categoryId: body.categoryId || null,
      nextBillingDate: body.nextBillingDate ? new Date(body.nextBillingDate) : null,
      sharedWith: body.sharedWith || [],
      status: body.status || 'active',
      notes: body.notes || null,
      detectedFrom: body.detectedFrom || null,
    });

    return Response.json(subscription, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

