/**
 * Transaction Categorize API Route
 * POST /api/transactions/:id/categorize - Categorize a transaction and optionally create a rule
 */

import { NextRequest } from 'next/server';
import { requireAuth, handleApiError, ApiError } from '@/lib/api/auth';
import { validateUUID } from '@/lib/api/validation';
import { transactionRepository } from '@/lib/db/repositories/transaction';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    validateUUID(id, 'id');

    const body = await request.json();

    if (!body.categoryId) {
      throw new ApiError('VALIDATION_ERROR', 'categoryId is required', 400);
    }

    validateUUID(body.categoryId, 'categoryId');

    // Update transaction category
    const transaction = await transactionRepository.updateCategory(
      user.id,
      id,
      body.categoryId
    );

    // Optionally create a categorization rule
    if (body.createRule && body.rulePattern && body.ruleMatchType) {
      await prisma.categorizeRule.create({
        data: {
          userId: user.id,
          pattern: body.rulePattern,
          matchType: body.ruleMatchType,
          categoryId: body.categoryId,
          priority: body.priority || 0,
        },
      });
    }

    return Response.json({
      transaction,
      ruleCreated: body.createRule || false,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

