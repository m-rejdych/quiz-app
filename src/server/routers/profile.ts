import * as trpc from '@trpc/server';
import { z } from 'zod';

import createRouter from '../../server/createRouter';

const profileRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.userId) throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });

    return next({ ctx: { ...ctx, userId: ctx.userId } });
  })
  .query('get-data', {
    input: z
      .object({
        id: z.string().or(z.number()),
      })
      .optional(),
    resolve: ({ ctx }) => {
      return ctx.userId;
    },
  });
export default profileRouter;
