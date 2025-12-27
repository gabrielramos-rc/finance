/**
 * Budget Detail API Routes
 * PUT /api/budgets/:categoryId - Create or update budget for a category
 */

import { NextRequest } from 'next/server';
import { requireAuth, handleApiError, ApiError } from '@/lib/api/auth';
import { validateUUID, validateMonth } from '@/lib/api/validation';
import { budgetRepository } from '@/lib/db/repositories/budget';

interface RouteParams {
  params: Promise<{ categoryId: string }>;
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await requireAuth();
    const { categoryId } = await params;
    validateUUID(categoryId, 'categoryId');

    const body = await request.json();

    if (!body.month || !body.limit) {
      throw new ApiError(
        'VALIDATION_ERROR',
        'Missing required fields: month, limit',
        400
      );
    }

    validateMonth(body.month);

    if (typeof body.limit !== 'number' || body.limit < 0) {
      throw new ApiError(
        'VALIDATION_ERROR',
        'limit must be a positive number',
        400
      );
    }

    const budget = await budgetRepository.upsert(user.id, categoryId, body.month, {
      limit: body.limit,
      alertAt50: body.alertAt50,
      alertAt80: body.alertAt80,
      alertAt100: body.alertAt100,
    });

    return Response.json(budget);
  } catch (error) {
    return handleApiError(error);
  }
}

