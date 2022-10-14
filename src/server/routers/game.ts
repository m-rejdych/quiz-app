import * as trpc from '@trpc/server';
import { z } from 'zod';

import { ChannelEvent } from '../../types/game/events';
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

      return game.getReadonlyState({
        exclude: ['pusher', 'cleanupLoopInterval'],
      });
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

      return game.getReadonlyState({
        exclude: ['pusher', 'cleanupLoopInterval'],
      });
    },
  })
  .mutation('join', {
    input: z.string(),
    resolve: async ({ ctx: { userId, state, prisma }, input }) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true },
      });
      if (!user) {
        throw new trpc.TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found.',
        });
      }

      const game = state.getGame(input);
      if (!game) {
        throw new trpc.TRPCError({
          code: 'NOT_FOUND',
          message: 'Game not found.',
        });
      }

      if (game.getPlayer(userId)) {
        throw new trpc.TRPCError({
          code: 'BAD_REQUEST',
          message: 'Player already in game.',
        });
      }
      game.addPlayer(userId, { user });

      return game.getReadonlyState().players;
    },
  })
  .mutation('leave', {
    input: z.string(),
    resolve: ({ ctx: { userId, state }, input }) => {
      const game = state.getGame(input);
      if (!game) {
        throw new trpc.TRPCError({
          code: 'NOT_FOUND',
          message: 'Game not found.',
        });
      }
      game.removePlayer(userId);

      return game.getReadonlyState().players;
    },
  })
  .mutation('start', {
    input: z.string(),
    resolve: ({ ctx: { userId, state }, input }) => {
      const game = state.getGame(input);
      if (!game) {
        throw new trpc.TRPCError({
          code: 'NOT_FOUND',
          message: 'Game not found.',
        });
      }
      if (game.getReadonlyState().quiz?.authorId !== userId) {
        throw new trpc.TRPCError({ code: 'FORBIDDEN' });
      }

      game.start();
    },
  });

export default gameRouter;
