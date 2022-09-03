import type { Answer as PrismaAnswer } from '@prisma/client';

type Answer = Pick<PrismaAnswer, 'content' | 'isCorrect'>;

export interface QuestionListItem {
  id?: number;
  answers: Answer[];
  title: string;
}

export interface UpdateHandlerPayload {
  id?: number;
  title: string;
}
