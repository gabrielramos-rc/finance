/**
 * Rule Detail API Routes
 * DELETE /api/rules/:id - Delete a categorization rule
 */

import { NextRequest } from 'next/server';
import { requireAuth, handleApiError, ApiError } from '@/lib/api/auth';
import { validateUUID } from '@/lib/api/validation';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    validateUUID(id, 'id');

    // Verify ownership
    const rule = await prisma.categorizeRule.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!rule) {
      throw new ApiError('NOT_FOUND', 'Rule not found', 404);
    }

    await prisma.categorizeRule.delete({
      where: { id },
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

