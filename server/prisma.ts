import { PrismaClient } from '@prisma/client';

const __prod__ = process.env.NODE_ENV === 'production';

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: __prod__ ? ['error'] : ['query', 'info', 'warn', 'error'],
  });

if (!__prod__) {
  global.prisma = prisma;
}
