import type { Answer as PrismaAnswer } from '@prisma/client';

import type UpdatePayload from '../common/UpdatePayload';

type Answer = Pick<PrismaAnswer, 'content' | 'isCorrect'>;

export interface QuestionListItem {
  id?: number;
  answers: Answer[];
  title: string;
}

export type UpdateQuestionPayload = UpdatePayload<'title'>;
