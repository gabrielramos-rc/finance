/**
 * Transaction Detail API Routes
 * GET /api/transactions/:id - Get a single transaction
 * PATCH /api/transactions/:id - Update a transaction
 * DELETE /api/transactions/:id - Delete a transaction
 */

import { NextRequest } from 'next/server';
import { requireAuth, handleApiError, ApiError } from '@/lib/api/auth';
import { validateUUID } from '@/lib/api/validation';
import { transactionRepository } from '@/lib/db/repositories/transaction';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    validateUUID(id, 'id');

    const transaction = await transactionRepository.findById(user.id, id);

    if (!transaction) {
      throw new ApiError('NOT_FOUND', 'Transaction not found', 404);
    }

    return Response.json(transaction);
  } catch (error) {
    return handleApiError(error);
  }
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

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (body.categoryId !== undefined) {
      updateData.categoryId = body.categoryId;
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }
    if (body.isIgnored !== undefined) {
      updateData.isIgnored = body.isIgnored;
    }
    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    const transaction = await transactionRepository.update(user.id, id, updateData);

    return Response.json(transaction);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    validateUUID(id, 'id');

    await transactionRepository.delete(user.id, id);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

