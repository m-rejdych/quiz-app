import * as trpc from '@trpc/server';
import { z } from 'zod';

import createRouter from '../createRouter';
import { validateQuestionsOrThrow } from '../../utils/question/validation';

const questionRouter = createRouter()
  .middleware(({ ctx, next }) => {
    if (!ctx.userId) throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });

    return next({ ctx: { ...ctx, userId: ctx.userId } });
  })
  .mutation('delete-question', {
    input: z.number(),
    resolve: async ({ ctx: { prisma, userId }, input }) => {
      const question = await prisma.question.findUnique({
        where: { id: input },
        select: { quiz: { select: { authorId: true } } },
      });
      if (!question) throw new trpc.TRPCError({ code: 'NOT_FOUND' });
      if (question.quiz.authorId !== userId)
        throw new trpc.TRPCError({ code: 'FORBIDDEN' });

      await prisma.question.delete({ where: { id: input } });

      return true;
    },
  })
  .mutation('add', {
    input: z.object({
      quizId: z.number(),
      question: z.object({
        title: z.string(),
        answers: z
          .array(
            z.object({
              content: z.string(),
              isCorrect: z.boolean(),
            }),
          )
          .optional(),
      }),
    }),
    resolve: async ({
      ctx: { prisma, userId },
      input: { quizId, question },
    }) => {
      validateQuestionsOrThrow([question]);

      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        select: { authorId: true },
      });
      if (!quiz) throw new trpc.TRPCError({ code: 'NOT_FOUND' });
      if (quiz.authorId !== userId)
        throw new trpc.TRPCError({ code: 'FORBIDDEN' });

      const newQuestion = await prisma.question.create({
        data: { title: question.title, quizId },
      });

      if (question.answers?.length) {
        await prisma.answer.createMany({
          data: question.answers.map((answer) => ({
            ...answer,
            questionId: newQuestion.id,
          })),
        });
      }

      return newQuestion;
    },
  })
  .mutation('update', {
    input: z.object({
      id: z.number(),
      question: z.object({
        title: z.string().optional(),
      }),
    }),
    resolve: async ({ ctx: { userId, prisma }, input: { id, question } }) => {
      const matchedQuestion = await prisma.question.findUnique({
        where: { id },
        select: { quiz: { select: { authorId: true } } },
      });
      if (!matchedQuestion) throw new trpc.TRPCError({ code: 'NOT_FOUND' });
      if (matchedQuestion.quiz.authorId !== userId)
        throw new trpc.TRPCError({ code: 'FORBIDDEN' });

      const updatedQuestion = await prisma.question.update({
        where: { id },
        data: question,
      });

      return updatedQuestion;
    },
  });

export default questionRouter;
