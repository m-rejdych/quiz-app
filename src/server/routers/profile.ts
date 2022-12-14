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
        id: z.number().optional(),
      })
      .optional(),
    resolve: async ({ input, ctx: { prisma, userId } }) => {
      const id = input?.id ?? userId;

      const profile = await prisma.profile.findUnique({
        where: { userId: id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
          gender: true,
        },
      });
      if (!profile) throw new trpc.TRPCError({ code: 'NOT_FOUND' });

      return profile;
    },
  })
  .mutation('update', {
    input: z.object({
      id: z.number(),
      data: z.object({
        firstName: z.string().or(z.null()).optional(),
        lastName: z.string().or(z.null()).optional(),
        avatarUrl: z.string().or(z.null()).optional(),
        genderId: z.number().or(z.null()).optional(),
      }),
    }),
    resolve: async ({ input: { id, data }, ctx: { prisma, userId } }) => {
      const foundProfile = await prisma.profile.findUnique({ where: { id } });
      if (!foundProfile) throw new trpc.TRPCError({ code: 'NOT_FOUND' });
      if (foundProfile.userId !== userId)
        throw new trpc.TRPCError({ code: 'FORBIDDEN' });

      return prisma.profile.update({ where: { id }, data });
    },
  });
export default profileRouter;
