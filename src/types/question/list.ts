import type { Answer as PrismaAnswer } from '@prisma/client';

type Answer = Pick<PrismaAnswer, 'content' | 'isCorrect'>;

type UpdatePayload<T extends string> = {
  [K in T]: string;
} & {
  id?: number;
};

export interface QuestionListItem {
  id?: number;
  answers: Answer[];
  title: string;
}

export type UpdateQuestionHandlerPayload = UpdatePayload<'title'>;
