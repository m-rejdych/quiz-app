import * as trpc from '@trpc/server';
import { z } from 'zod';

import createRouter from '../createRouter';
import GameState from '../../models/state/game';

const gameRouter = createRouter()
  .middleware(({ ctx, next }) => {
    if (!ctx.userId) throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });

    return next({ ctx: { ...ctx, userId: ctx.userId } });
  })
  .query('get', {
    input: z.string(),
    resolve: ({ ctx: { state }, input }) => {
      const game = state.getGame(input);
      if (!game) {
        throw new trpc.TRPCError({ code: 'NOT_FOUND' });
      }

      return game.getReadonlyState({ exclude: 'pusher' });
    },
  })
  .mutation('create', {
    input: z.object({
      quizId: z.number(),
    }),
    resolve: async ({ ctx: { prisma, state, userId }, input: { quizId } }) => {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: { include: { answers: true } },
          author: { select: { id: true, username: true } },
        },
      });
      if (!quiz) {
        throw new trpc.TRPCError({ code: 'NOT_FOUND' });
      }
      if (quiz.authorId !== userId) {
        throw new trpc.TRPCError({
          code: 'FORBIDDEN',
          message: 'You can create games based only on your quizes.',
        });
      }

      const code = GameState.generateCode();
      const game = state.addGame(code, { code, quiz, pusher });

      return game.getReadonlyState({ exclude: 'pusher' });
    },
  });

export default gameRouter;
