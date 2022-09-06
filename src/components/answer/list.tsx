import { type FC } from 'react';
import type { Answer as PrismaAnswer } from '@prisma/client';
import { UnorderedList, type ListProps } from '@chakra-ui/react';

import AnswersListItem from './listItem';
import type { UpdateAnswerPayload } from '../../types/answer/list';

type Answer = Pick<PrismaAnswer, 'content' | 'isCorrect'> & { id?: number };

interface Props {
  answers: Answer[];
  onCorrectSelect?: (content: string) => void;
  onDelete?: (data: UpdateAnswerPayload) => void | Promise<void>;
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
