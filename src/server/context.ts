import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getToken } from 'next-auth/jwt';

export interface Context {
  userId?: number;
}

export const createContext = async ({
  req,
}: CreateNextContextOptions): Promise<Context> => {
  const token = await getToken({ req });
  if (!token?.id) return {};

  return { userId: token.id as number };
};
