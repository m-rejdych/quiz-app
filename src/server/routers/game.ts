import * as trpc from '@trpc/server';

import createRouter from '../createRouter';
import { generateCode } from '../../utils/game';

const gameRouter = createRouter()
  .middleware(({ ctx, next }) => {
    if (!ctx.userId) throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });

    return next({ ctx: { ...ctx, userId: ctx.userId } });
  })
  .mutation('generate-code', {
    resolve: () => {
      const code = generateCode();

      return code;
    },
  });

export default gameRouter;
