import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PrismaConfig } from 'prisma';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: PrismaConfig = {
  schema: path.join(__dirname, 'schema.prisma'),

  migrate: {
    async url() {
      // Use DIRECT_URL for migrations (direct connection)
      // Fall back to DATABASE_URL if DIRECT_URL is not set
      const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
      if (!url) {
        throw new Error(
          'DATABASE_URL or DIRECT_URL environment variable is required. Please set it in .env.local'
        );
      }
      return url;
    },
    seed: 'npx tsx prisma/seed.ts',
  },
};

export default config;

