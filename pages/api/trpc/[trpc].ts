import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { z } from 'zod';

import authRouter from '../../../server/routers/auth';

const appRouter = trpc
  .router()
  .query('hello', {
    input: z.string(),
    resolve: ({ input }) => {
      return `Hi ${input}`;
    },
  })
  .merge(authRouter);

export type AppRouter = typeof appRouter;

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => null,
});
