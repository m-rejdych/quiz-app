import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getToken } from 'next-auth/jwt';

export interface Context {
  userId?: number;
}

export const createContext = async (
  opts: CreateNextContextOptions,
): Promise<Context> => {
  const token = await getToken({ req: opts.req });
  if (!token?.id) return {};

  return { userId: token.id as number };
};
