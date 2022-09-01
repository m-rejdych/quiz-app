import type { FC } from 'react';
import type { Answer as PrismaAnswer } from '@prisma/client';
import { UnorderedList } from '@chakra-ui/react';

import QuestionsListItem from './listItem';

type Answer = Pick<PrismaAnswer, 'content' | 'isCorrect'>;

interface Question {
  title: string;
  answers: Answer[];
}

interface Props {
  questions: Question[];
  onDelete?: (title: string) => void;
}

const QuestionsList: FC<Props> = ({ questions, onDelete }) => (
  <UnorderedList listStyleType="none" spacing={2}>
    {questions.map((question) => (
      <QuestionsListItem
        key={`question-${question.title}`}
        question={question}
        onDelete={onDelete}
      />
    ))}
  </UnorderedList>
);

export default QuestionsList;
