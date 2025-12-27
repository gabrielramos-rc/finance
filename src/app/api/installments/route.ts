/**
 * Installments API Routes
 * GET /api/installments - List all active installments
 */

import { NextRequest } from 'next/server';
import { requireAuth, handleApiError } from '@/lib/api/auth';
import { installmentRepository } from '@/lib/db/repositories/installment';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const result = await installmentRepository.findMany(user.id);

    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

