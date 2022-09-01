import type { FC } from 'react';
import type { Answer as PrismaAnswer } from '@prisma/client';
import { UnorderedList, type ListProps } from '@chakra-ui/react';

import QuestionsListItem from './listItem';

type Answer = Pick<PrismaAnswer, 'content' | 'isCorrect'>;

interface Question {
  title: string;
  answers: Answer[];
}

interface Props {
  questions: Question[];
  onDelete?: (title: string) => void;
  listProps?: ListProps;
}

const QuestionsList: FC<Props> = ({ questions, onDelete, listProps }) => (
  <UnorderedList listStyleType="none" spacing={3} {...listProps}>
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
