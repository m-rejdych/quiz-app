import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getToken } from 'next-auth/jwt';

import { prisma } from './prisma';
import { pusher } from './pusher';
import { state } from './state';

export interface Context {
  userId?: number;
  prisma: typeof prisma;
  pusher: typeof pusher;
  state: typeof state;
}

export const createContext = async ({
  req,
}: CreateNextContextOptions): Promise<Context> => {
  const token = await getToken({ req });
  if (!token?.id) return { prisma, pusher, state };

  return { userId: token.id, prisma, pusher, state };
};
