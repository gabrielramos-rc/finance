/**
 * Transactions API Routes
 * GET /api/transactions - List transactions with filters
 * POST /api/transactions - Create a new transaction
 */

import { NextRequest } from 'next/server';
import { requireAuth, handleApiError, ApiError } from '@/lib/api/auth';
import { validateMonth, validatePagination, validateTransactionType, validateBoolean } from '@/lib/api/validation';
import { transactionRepository } from '@/lib/db/repositories/transaction';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const month = searchParams.get('month');
    const categoryId = searchParams.get('categoryId');
    const type = searchParams.get('type');
    const uncategorized = validateBoolean(searchParams.get('uncategorized') || undefined);
    const { limit, offset } = validatePagination(
      searchParams.get('limit') || undefined,
      searchParams.get('offset') || undefined
    );

    // Validate month if provided
    if (month) {
      validateMonth(month);
    }

    // Validate type if provided
    let validatedType: 'income' | 'expense' | 'transfer' | undefined;
    if (type) {
      validatedType = validateTransactionType(type);
    }

    // Validate categoryId if provided
    if (categoryId) {
      // UUID validation would go here, but we'll let Prisma handle it
    }

    // Get transactions
    const result = await transactionRepository.findMany(user.id, {
      month: month || undefined,
      categoryId: categoryId || undefined,
      type: validatedType,
      uncategorized,
      limit,
      offset,
    });

    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate required fields
    if (!body.date || !body.description || body.amount === undefined) {
      throw new ApiError(
        'VALIDATION_ERROR',
        'Missing required fields: date, description, amount',
        400
      );
    }

    // Create transaction
    const transaction = await transactionRepository.create(user.id, {
      date: new Date(body.date),
      description: body.description,
      originalDesc: body.originalDescription || body.description,
      amount: body.amount,
      type: body.type || (body.amount >= 0 ? 'income' : 'expense'),
      ...(body.categoryId && {
        category: {
          connect: { id: body.categoryId },
        },
      }),
      ...(body.accountId && {
        account: {
          connect: { id: body.accountId },
        },
      }),
      ...(body.creditCardId && {
        creditCard: {
          connect: { id: body.creditCardId },
        },
      }),
      isRecurring: body.isRecurring || false,
      isIgnored: body.isIgnored || false,
      notes: body.notes || null,
      metadata: body.metadata || {},
    });

    return Response.json(transaction, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

