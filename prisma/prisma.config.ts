import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PrismaConfig } from 'prisma';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: PrismaConfig = {
  schema: path.join(__dirname, 'schema.prisma'),

  migrate: {
    async url() {
      return process.env.DIRECT_URL || process.env.DATABASE_URL || '';
    },
  },
};

export default config;

