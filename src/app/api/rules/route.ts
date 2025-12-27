/**
 * Categorization Rules API Routes
 * GET /api/rules - List categorization rules
 * POST /api/rules - Create a new rule
 */

import { NextRequest } from 'next/server';
import { requireAuth, handleApiError, ApiError } from '@/lib/api/auth';
import { validateUUID } from '@/lib/api/validation';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const rules = await prisma.categorizeRule.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        priority: 'desc',
      },
    });

    return Response.json({ data: rules });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    if (!body.pattern || !body.matchType || !body.categoryId) {
      throw new ApiError(
        'VALIDATION_ERROR',
        'Missing required fields: pattern, matchType, categoryId',
        400
      );
    }

    if (!['contains', 'startsWith', 'regex'].includes(body.matchType)) {
      throw new ApiError(
        'VALIDATION_ERROR',
        'matchType must be "contains", "startsWith", or "regex"',
        400
      );
    }

    validateUUID(body.categoryId, 'categoryId');

    const rule = await prisma.categorizeRule.create({
      data: {
        userId: user.id,
        pattern: body.pattern,
        matchType: body.matchType,
        categoryId: body.categoryId,
        priority: body.priority || 0,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return Response.json(rule, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

