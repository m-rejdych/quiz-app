import { type FC } from 'react';
import type { Answer as PrismaAnswer } from '@prisma/client';
import { UnorderedList } from '@chakra-ui/react';

import AnswersListItem from './listItem';

type Answer = Pick<PrismaAnswer, 'content' | 'isCorrect'>;

interface Props {
  answers: Answer[];
  onCorrectSelect?: (content: string) => void;
  onDelete?: (content: string) => void;
}

const AnswersList: FC<Props> = ({ answers, ...rest }) => (
  <UnorderedList listStyleType="none" spacing={2}>
    {answers.map((answer) => (
      <AnswersListItem
        key={`answer-${answer.content}`}
        answer={answer}
        {...rest}
      />
    ))}
  </UnorderedList>
);

export default AnswersList;
