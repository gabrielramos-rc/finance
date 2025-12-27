import path from 'node:path';
import type { PrismaConfig } from 'prisma';

const config: PrismaConfig = {
  schema: path.join(__dirname, 'schema.prisma'),

  migrate: {
    async url() {
      return process.env.DIRECT_URL || process.env.DATABASE_URL || '';
    },
  },
};

export default config;

