import * as trpcNext from '@trpc/server/adapters/next';

import createRouter from '../../../server/createRouter';
import authRouter from '../../../server/routers/auth';
import profileRouter from '../../../server/routers/profile';
import { createContext } from '../../../server/context';

const appRouter = createRouter()
  .merge('auth.', authRouter)
  .merge('profile.', profileRouter);

export type AppRouter = typeof appRouter;

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
});
