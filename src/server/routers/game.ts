import * as trpc from '@trpc/server';
import { z } from 'zod';
import createRouter from '../createRouter';
import GameState from '../../models/state/game';
import PlayerState from '../../models/state/player';

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

      const {
        quiz: { authorId },
        ...readonlyGameState
      } = game.getReadonlyState({
        exclude: [
          'pusher',
          'cleanupLoopInterval',
          'currentStageTimeout',
          'currentQuestionIndex',
        ],
      });

      return {
        ...readonlyGameState,
        players: PlayerState.formatPlayers(readonlyGameState.players),
        authorId,
        currentQuestion: game.formattedCurrentQuestion,
      };
    },
  })
  .query('get-result', {
    input: z.object({
      quizId: z.number(),
      resultId: z.number(),
    }),
    resolve: async ({ ctx: { prisma }, input: { quizId, resultId } }) => {
      const gameResult = await prisma.gameResult.findUnique({
        where: { id: resultId },
        include: {
          players: {
            orderBy: { score: 'desc' },
            include: { user: { select: { id: true, username: true } } },
          },
        },
      });
      if (!gameResult) {
        throw new trpc.TRPCError({
          code: 'NOT_FOUND',
          message: 'Game result not found.',
        });
      }
      if (gameResult.quizId !== quizId) {
        throw new trpc.TRPCError({
          code: 'BAD_REQUEST',
          message: 'Quiz and result are not related.',
        });
      }

      return gameResult;
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
          questions: {
            include: {
              answers: { select: { id: true, content: true, isCorrect: true } },
            },
          },
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

      return {
        ...game.getReadonlyState({
          exclude: [
            'pusher',
            'cleanupLoopInterval',
            'currentStageTimeout',
            'currentQuestionIndex',
            'quiz',
          ],
        }),
        authorId: quiz.authorId,
        currentQuestion: game.formattedCurrentQuestion,
      };
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
      await game.addPlayer(userId, {
        user,
        questionAnswers: game
          .getReadonlyState()
          .quiz.questions.reduce((acc, { id }) => ({ ...acc, [id]: null }), {}),
      });

      return PlayerState.formatPlayers(game.getReadonlyState().players);
    },
  })
  .mutation('leave', {
    input: z.string(),
    resolve: async ({ ctx: { userId, state }, input }) => {
      const game = state.getGame(input);
      if (!game) {
        throw new trpc.TRPCError({
          code: 'NOT_FOUND',
          message: 'Game not found.',
        });
      }
      await game.removePlayer(userId);

      return PlayerState.formatPlayers(game.getReadonlyState().players);
    },
  })
  .mutation('start', {
    input: z.string(),
    resolve: async ({ ctx: { userId, state }, input }) => {
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

      await game.start();
    },
  });

export default gameRouter;
