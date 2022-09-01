import { type FC } from 'react';
import type { Answer as PrismaAnswer } from '@prisma/client';
import { UnorderedList, type ListProps } from '@chakra-ui/react';

import AnswersListItem from './listItem';

type Answer = Pick<PrismaAnswer, 'content' | 'isCorrect'>;

interface Props {
  answers: Answer[];
  onCorrectSelect?: (content: string) => void;
  onDelete?: (content: string) => void;
  listProps?: ListProps;
  withIsCorrectLabel?: boolean;
}

const AnswersList: FC<Props> = ({ answers, listProps, ...rest }) => (
  <UnorderedList listStyleType="none" spacing={3} {...listProps}>
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
