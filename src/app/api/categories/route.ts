/**
 * Categories API Routes
 * GET /api/categories - List all categories (system + user)
 * POST /api/categories - Create a custom category
 */

import { NextRequest } from 'next/server';
import { requireAuth, handleApiError, ApiError } from '@/lib/api/auth';
import { categoryRepository } from '@/lib/db/repositories/category';
import { slugify } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const categories = await categoryRepository.findMany(user.id);

    return Response.json({ data: categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    if (!body.name || !body.type) {
      throw new ApiError(
        'VALIDATION_ERROR',
        'Missing required fields: name, type',
        400
      );
    }

    // Generate slug if not provided
    const slug = body.slug || slugify(body.name);

    const category = await categoryRepository.create(user.id, {
      name: body.name,
      slug,
      parentId: body.parentId || undefined,
      icon: body.icon || undefined,
      color: body.color || undefined,
      type: body.type,
    });

    return Response.json(category, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

