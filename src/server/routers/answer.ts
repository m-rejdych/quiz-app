import * as trpc from '@trpc/server';
import { z } from 'zod';

import createRouter from '../createRouter';
import { Stage } from '../../types/game/events';

const answerRotuer = createRouter()
  .middleware(({ ctx, next }) => {
    if (!ctx.userId) throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });

    return next({ ctx: { ...ctx, userId: ctx.userId } });
  })
  .mutation('add', {
    input: z.object({
      questionId: z.number(),
      answer: z.object({
        content: z.string(),
        isCorrect: z.boolean(),
      }),
    }),
    resolve: async ({
      ctx: { prisma, userId },
      input: { questionId, answer },
    }) => {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        select: { quiz: { select: { authorId: true } } },
      });
      if (!question) throw new trpc.TRPCError({ code: 'NOT_FOUND' });
      if (question.quiz.authorId !== userId)
        throw new trpc.TRPCError({ code: 'FORBIDDEN' });

      const matchedAnswer = await prisma.answer.findFirst({
        where: {
          content: { equals: answer.content, mode: 'insensitive' },
          questionId,
        },
      });
      if (matchedAnswer)
        throw new trpc.TRPCError({
          code: 'BAD_REQUEST',
          message: 'Answer of this content already exists.',
        });

      const newAnswer = await prisma.answer.create({
        data: { ...answer, questionId },
      });

      return newAnswer;
    },
  })
  .mutation('update', {
    input: z.object({
      id: z.number(),
      answer: z.object({
        content: z.string().min(1).optional(),
        isCorrect: z.boolean().optional(),
      }),
    }),
    resolve: async ({ ctx: { prisma, userId }, input: { id, answer } }) => {
      const matchedAnswer = await prisma.answer.findUnique({
        where: { id },
        select: {
          isCorrect: true,
          content: true,
          question: {
            select: { id: true, quiz: { select: { authorId: true } } },
          },
        },
      });
      if (!matchedAnswer) throw new trpc.TRPCError({ code: 'NOT_FOUND' });
      if (matchedAnswer.question.quiz.authorId !== userId)
        throw new trpc.TRPCError({ code: 'FORBIDDEN' });

      if (answer.content) {
        const sameContentAnswer = await prisma.answer.findFirst({
          where: {
            questionId: matchedAnswer.question.id,
            content: answer.content,
            NOT: { id },
          },
        });
        if (sameContentAnswer)
          throw new trpc.TRPCError({
            code: 'BAD_REQUEST',
            message: 'Answer of this content already exists.',
          });
      }

      const updatedAnswer = await prisma.answer.update({
        where: { id },
        data: answer,
      });

      if (updatedAnswer.isCorrect && !matchedAnswer.isCorrect) {
        const questionAnswers = await prisma.answer.findMany({
          select: { id: true },
          where: {
            questionId: updatedAnswer.questionId,
            isCorrect: true,
            NOT: { id: updatedAnswer.id },
          },
        });

        await prisma.answer.updateMany({
          where: { id: { in: questionAnswers.map(({ id }) => id) } },
          data: { isCorrect: false },
        });
      } else if (!updatedAnswer.isCorrect && matchedAnswer.isCorrect) {
        const [lastAnswer] = await prisma.answer.findMany({
          where: { questionId: updatedAnswer.questionId },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true },
        });

        if (lastAnswer) {
          await prisma.answer.update({
            where: { id: lastAnswer.id },
            data: { isCorrect: true },
          });
        }
      }

      return updatedAnswer;
    },
  })
  .mutation('delete', {
    input: z.number(),
    resolve: async ({ ctx: { prisma, userId }, input }) => {
      const matchedAnswer = await prisma.answer.findUnique({
        where: { id: input },
        select: {
          isCorrect: true,
          question: {
            select: { id: true, quiz: { select: { authorId: true } } },
          },
        },
      });
      if (!matchedAnswer) throw new trpc.TRPCError({ code: 'NOT_FOUND' });
      if (matchedAnswer.question.quiz.authorId !== userId)
        throw new trpc.TRPCError({ code: 'FORBIDDEN' });

      await prisma.answer.delete({ where: { id: input } });

      if (matchedAnswer.isCorrect) {
        const [lastAnswer] = await prisma.answer.findMany({
          where: { questionId: matchedAnswer.question.id },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true },
        });
        if (lastAnswer) {
          await prisma.answer.update({
            where: { id: lastAnswer.id },
            data: { isCorrect: true },
          });
        }
      }

      return true;
    },
  })
  .mutation('submit', {
    input: z.object({
      code: z.string(),
      answerId: z.number(),
    }),
    resolve: async ({ ctx: { state, userId }, input: { code, answerId } }) => {
      const game = state.getGame(code);
      if (!game) {
        throw new trpc.TRPCError({
          code: 'NOT_FOUND',
          message: 'Game not found.',
        });
      }

      const player = game.getPlayer(userId);
      if (!player) {
        throw new trpc.TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a player in this game.',
        });
      }

      const { questionCountdown, questionStage } = game.getReadonlyState();
      if (questionStage !== Stage.Started) {
        throw new trpc.TRPCError({
          code: 'BAD_REQUEST',
          message: 'Round is not started yet.',
        });
      }

      const currentQuestion = game.currentQuestion;
      if (!currentQuestion) {
        throw new trpc.TRPCError({
          code: 'BAD_REQUEST',
          message: 'Current question not available.',
        });
      }

      const answer = currentQuestion.answers.find(({ id }) => id === answerId);
      if (!answer) {
        throw new trpc.TRPCError({
          code: 'BAD_REQUEST',
          message: 'This answer does not exist.',
        });
      }

      if (player.getReadonlyState().questionAnswers[currentQuestion.id]) {
        throw new trpc.TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have already answered to this question.',
        });
      }

      player.submitAnswer(currentQuestion.id, {
        answerId,
        timeLeft: questionCountdown,
        isCorrect: answer.isCorrect,
      });
    },
  });

export default answerRotuer;
