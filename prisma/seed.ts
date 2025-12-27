/**
 * Prisma Seed Script
 * Populates the database with system categories from config/categories.yaml
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';

// Initialize Prisma client with adapter (same as src/lib/prisma.ts)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface CategoryChild {
  name: string;
  icon?: string;
  description?: string;
  ignored?: boolean;
  children?: Record<string, CategoryChild>;
}

interface CategoryGroup {
  name: string;
  icon: string;
  color: string;
  type: string;
  description?: string;
  hidden?: boolean;
  children?: Record<string, CategoryChild>;
}

interface CategoriesConfig {
  version: string;
  categories: Record<string, CategoryGroup>;
  default_budgets?: Record<string, { percent: number; suggested_limit: number }>;
}

async function main() {
  console.log('🌱 Starting seed...');

  // Read and parse categories.yaml
  const configPath = join(process.cwd(), 'config', 'categories.yaml');
  const configContent = readFileSync(configPath, 'utf-8');
  const config: CategoriesConfig = parse(configContent);

  console.log(`📖 Loaded categories config v${config.version}`);

  let categoryCount = 0;
  let sortOrder = 0;

  // Process each top-level category group
  for (const [groupSlug, group] of Object.entries(config.categories)) {
    console.log(`\n📁 Processing group: ${group.name}`);

    // Create the top-level category
    // For system categories (userId = null), we need to check if it exists first
    // since we can't use null in the unique constraint where clause
    let parentCategory = await prisma.category.findFirst({
      where: {
        slug: groupSlug,
        userId: null,
        isSystem: true,
      },
    });

    if (parentCategory) {
      // Update existing system category
      parentCategory = await prisma.category.update({
        where: { id: parentCategory.id },
        data: {
          name: group.name,
          icon: group.icon,
          color: group.color,
          type: group.type,
          isSystem: true,
          sortOrder: sortOrder++,
        },
      });
    } else {
      // Create new system category
      parentCategory = await prisma.category.create({
        data: {
          name: group.name,
          slug: groupSlug,
          icon: group.icon,
          color: group.color,
          type: group.type,
          isSystem: true,
          sortOrder: sortOrder++,
          userId: null,
        },
      });
    }

    categoryCount++;
    console.log(`  ✅ Created/updated: ${group.name}`);

    // Process children if any
    if (group.children) {
      await processChildren(
        group.children,
        parentCategory.id,
        groupSlug,
        group.type,
        1
      );
    }
  }

  // Get final count
  const totalCategories = await prisma.category.count({
    where: { isSystem: true },
  });

  console.log(`\n✨ Seed completed! ${totalCategories} system categories created.`);
}

async function processChildren(
  children: Record<string, CategoryChild>,
  parentId: string,
  parentSlug: string,
  parentType: string,
  depth: number
): Promise<void> {
  const indent = '  '.repeat(depth + 1);
  let childOrder = 0;

  for (const [childSlug, child] of Object.entries(children)) {
    const fullSlug = `${parentSlug}-${childSlug}`;

    // For system categories (userId = null), find first then update or create
    let category = await prisma.category.findFirst({
      where: {
        slug: fullSlug,
        userId: null,
        isSystem: true,
      },
    });

    if (category) {
      // Update existing system category
      category = await prisma.category.update({
        where: { id: category.id },
        data: {
          name: child.name,
          icon: child.icon,
          type: parentType,
          parentId: parentId,
          isSystem: true,
          sortOrder: childOrder++,
        },
      });
    } else {
      // Create new system category
      category = await prisma.category.create({
        data: {
          name: child.name,
          slug: fullSlug,
          icon: child.icon,
          type: parentType,
          parentId: parentId,
          isSystem: true,
          sortOrder: childOrder++,
          userId: null,
        },
      });
    }

    console.log(`${indent}📂 ${child.name}`);

    // Process nested children (subcategories)
    if (child.children) {
      await processChildren(
        child.children,
        category.id,
        fullSlug,
        parentType,
        depth + 1
      );
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });


