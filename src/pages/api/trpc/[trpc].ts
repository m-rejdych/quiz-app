import * as trpcNext from '@trpc/server/adapters/next';

import createRouter from '../../../server/createRouter';
import authRouter from '../../../server/routers/auth';
import profileRouter from '../../../server/routers/profile';
import genderRouter from '../../../server/routers/gender';
import quizRouter from '../../../server/routers/quiz';
import { createContext } from '../../../server/context';

const appRouter = createRouter()
  .merge('auth.', authRouter)
  .merge('profile.', profileRouter)
  .merge('gender.', genderRouter)
  .merge('quiz.', quizRouter);

export type AppRouter = typeof appRouter;

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
});
