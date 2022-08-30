import * as trpc from '@trpc/server';

import createRouter from '../createRouter';

const genderRouter = createRouter()
  .middleware(({ ctx, next }) => {
    if (!ctx.userId) throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });

    return next({ ctx: { ...ctx, userId: ctx.userId } });
  })
  .query('list', {
    resolve: async ({ ctx: { prisma } }) => {
      const genders = await prisma.gender.findMany();

      return genders;
    },
  });

export default genderRouter;
