/**
 * Category Repository
 * Handles all database operations for categories
 */

import { prisma } from '@/lib/prisma';
import { Category, Prisma } from '@prisma/client';

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

export class CategoryRepository {
  /**
   * Get all categories for a user (including system categories)
   */
  async findMany(userId: string): Promise<CategoryWithChildren[]> {
    // Get system categories (userId is null) and user's custom categories
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId: null }, // System categories
          { userId }, // User's custom categories
        ],
      },
      orderBy: [
        { isSystem: 'desc' }, // System categories first
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    // Build hierarchical structure
    return this.buildHierarchy(categories);
  }

  /**
   * Build hierarchical category structure
   */
  private buildHierarchy(categories: Category[]): CategoryWithChildren[] {
    const categoryMap = new Map<string, CategoryWithChildren>();
    const rootCategories: CategoryWithChildren[] = [];

    // First pass: create map of all categories
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build hierarchy
    categories.forEach((cat) => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories;
  }

  /**
   * Get a single category by ID
   */
  async findById(userId: string, id: string): Promise<Category | null> {
    return prisma.category.findFirst({
      where: {
        id,
        OR: [
          { userId: null }, // System categories
          { userId }, // User's categories
        ],
      },
    });
  }

  /**
   * Create a custom category
   */
  async create(
    userId: string,
    data: {
      name: string;
      slug: string;
      parentId?: string;
      icon?: string;
      color?: string;
      type: string;
    }
  ): Promise<Category> {
    // Verify parent exists and belongs to user or is system
    if (data.parentId) {
      const parent = await this.findById(userId, data.parentId);
      if (!parent) {
        throw new Error('Parent category not found');
      }
    }

    return prisma.category.create({
      data: {
        ...data,
        userId,
        isSystem: false,
      },
    });
  }

  /**
   * Update a category (only user's custom categories)
   */
  async update(
    userId: string,
    id: string,
    data: Prisma.CategoryUpdateInput
  ): Promise<Category> {
    // Verify ownership (must be user's category, not system)
    const existing = await prisma.category.findFirst({
      where: {
        id,
        userId, // Must be user's category
      },
    });

    if (!existing) {
      throw new Error('Category not found or is a system category');
    }

    return prisma.category.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a category (only user's custom categories)
   */
  async delete(userId: string, id: string): Promise<void> {
    // Verify ownership
    const existing = await prisma.category.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existing) {
      throw new Error('Category not found or is a system category');
    }

    // Check if category has children
    const children = await prisma.category.count({
      where: { parentId: id },
    });

    if (children > 0) {
      throw new Error('Cannot delete category with children');
    }

    await prisma.category.delete({
      where: { id },
    });
  }
}

export const categoryRepository = new CategoryRepository();

