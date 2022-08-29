import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getToken } from 'next-auth/jwt';

import { prisma } from './prisma';

export interface Context {
  userId?: number;
  prisma: typeof prisma;
}

export const createContext = async ({
  req,
}: CreateNextContextOptions): Promise<Context> => {
  const token = await getToken({ req });
  if (!token?.id) return { prisma };

  return { userId: token.id, prisma };
};
