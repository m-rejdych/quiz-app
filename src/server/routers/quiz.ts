import * as trpc from '@trpc/server';
import { z } from 'zod';

import createRouter from '../createRouter';
import { validateQuestionsOrThrow } from '../../utils/question/validation';

const quizRouter = createRouter()
  .middleware(({ ctx, next }) => {
    if (!ctx.userId) throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });

    return next({ ctx: { ...ctx, userId: ctx.userId } });
  })
  .mutation('create', {
    input: z.object({
      title: z.string(),
      questions: z
        .array(
          z.object({
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
        )
        .optional(),
    }),
    resolve: async ({
      ctx: { prisma, userId },
      input: { title, questions },
    }) => {
      validateQuestionsOrThrow(questions);

      const quiz = await prisma.quiz.create({
        data: { title, authorId: userId },
      });

      if (!questions?.length) return quiz;

      const questionsToCreate = questions.map(({ title }) =>
        prisma.question.create({ data: { title, quizId: quiz.id } }),
      );

      for await (const { id, title } of questionsToCreate) {
        const matchedAnswers = questions.find(
          ({ title: questionTitle }) => title === questionTitle,
        )?.answers;

        if (!matchedAnswers?.length) continue;

        await prisma.answer.createMany({
          data: matchedAnswers.map((answer) => ({ ...answer, questionId: id })),
        });
      }

      return quiz;
    },
  })
  .mutation('delete', {
    input: z.number(),
    resolve: async ({ ctx: { userId, prisma }, input }) => {
      const quiz = await prisma.quiz.findUnique({ where: { id: input } });
      if (!quiz) {
        throw new trpc.TRPCError({ code: 'NOT_FOUND' });
      }
      if (quiz.authorId !== userId) {
        throw new trpc.TRPCError({
          code: 'FORBIDDEN',
          message: 'You can remove only quizes, which you are author of.',
        });
      }

      await prisma.quiz.delete({ where: { id: quiz.id } });

      return true;
    },
  })
  .query('list', {
    resolve: async ({ ctx: { prisma, userId } }) => {
      const quizes = await prisma.quiz.findMany({
        where: { authorId: userId },
        orderBy: { title: 'desc' },
      });

      return quizes;
    },
  })
  .query('get-by-id', {
    input: z.number(),
    resolve: async ({ ctx: { prisma, userId }, input }) => {
      const quiz = await prisma.quiz.findUnique({
        where: { id: input },
        include: {
          questions: {
            include: { answers: { orderBy: { content: 'desc' } } },
            orderBy: { title: 'desc' },
          },
        },
      });
      if (!quiz) throw new trpc.TRPCError({ code: 'NOT_FOUND' });
      if (quiz.authorId !== userId)
        throw new trpc.TRPCError({ code: 'FORBIDDEN' });

      return quiz;
    },
  });

export default quizRouter;
