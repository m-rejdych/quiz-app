import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';

import authRouter from '../../../server/routers/auth';

const appRouter = trpc.router().merge(authRouter);

export type AppRouter = typeof appRouter;

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => null,
});
