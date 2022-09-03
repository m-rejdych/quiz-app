import * as trpc from '@trpc/server';
import type { Answer as PrismaAnswer } from '@prisma/client';

import { isDuplicated } from '../validation';

type Answer = Pick<PrismaAnswer, 'content' | 'isCorrect'>;

interface Question {
  title: string;
  answers?: Answer[];
}

export const validateQuestionsOrThrow = (
  questions: Question[] | undefined,
): never | void => {
  if (!questions?.length) return;

  if (questions.some(isDuplicated('title'))) {
    throw new trpc.TRPCError({
      code: 'BAD_REQUEST',
      message: 'Duplicated question titles.',
    });
  }

  if (questions.some(({ answers }) => answers?.some(isDuplicated('content')))) {
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
};
