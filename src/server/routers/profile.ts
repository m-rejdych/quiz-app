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
        id: z.number(),
      })
      .optional(),
    resolve: async ({ input, ctx: { prisma, userId } }) => {
      const id = input?.id ?? userId;

      const profile = await prisma.profile.findUnique({
        where: { userId: id },
      });
      if (!profile) throw new trpc.TRPCError({ code: 'NOT_FOUND' });

      return profile;
    },
  });
export default profileRouter;
