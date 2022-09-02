import * as trpc from '@trpc/server';
import { z } from 'zod';

import createRouter from '../createRouter';

const isDuplicated =
  <T extends object>(key: keyof T) =>
  (item: T, index: number, self: T[]) =>
    self.some(
      (otherItem, otherIndex) =>
        item[key] === otherItem[key] && index !== otherIndex,
    );

const quizRouter = createRouter()
  .middleware(({ ctx, next }) => {
    if (!ctx.userId) throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });

    return next({ ctx: { ...ctx, userId: ctx.userId } });
  })
  .mutation('create-quiz', {
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
      if (questions) {
        if (questions.some(isDuplicated('title'))) {
          throw new trpc.TRPCError({
            code: 'BAD_REQUEST',
            message: 'Duplicated question titles.',
          });
        }

        if (
          questions.some(({ answers }) =>
            answers?.some(isDuplicated('content')),
          )
        ) {
          throw new trpc.TRPCError({
            code: 'BAD_REQUEST',
            message: 'Duplicated answer contents.',
          });
        }

        questions.forEach(({ answers }) => {
          if (!answers?.length) return;

          let correctCount = 0;

          for (const { isCorrect } of answers) {
            if (isCorrect) correctCount++;
            if (correctCount > 1) break;
          }

          if (correctCount !== 1) {
            throw new trpc.TRPCError({
              code: 'BAD_REQUEST',
              message: 'One answer has to be marked as correct.',
            });
          }
        });
      }

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
  });

export default quizRouter;
