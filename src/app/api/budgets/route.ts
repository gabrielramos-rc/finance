/**
 * Budgets API Routes
 * GET /api/budgets - List budgets for a month
 */

import { NextRequest } from 'next/server';
import { requireAuth, handleApiError } from '@/lib/api/auth';
import { validateMonth } from '@/lib/api/validation';
import { budgetRepository } from '@/lib/db/repositories/budget';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Get month from query or use current month
    const monthParam = searchParams.get('month');
    const month = monthParam || format(new Date(), 'yyyy-MM');

    validateMonth(month);

    const result = await budgetRepository.findMany(user.id, month);

    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

