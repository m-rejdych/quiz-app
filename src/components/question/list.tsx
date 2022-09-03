import type { FC } from 'react';
import { UnorderedList, type ListProps } from '@chakra-ui/react';

import QuestionsListItem from './listItem';
import type {
  QuestionListItem,
  UpdateHandlerPayload,
} from '../../types/question/list';

interface Props {
  questions: QuestionListItem[];
  onDelete?: (data: UpdateHandlerPayload) => void | Promise<void>;
  onEditTitle?: (data: UpdateHandlerPayload) => void | Promise<void>;
  listProps?: ListProps;
}

const QuestionsList: FC<Props> = ({ questions, listProps, ...rest }) => (
  <UnorderedList listStyleType="none" spacing={3} {...listProps}>
    {questions.map((question) => (
      <QuestionsListItem
        key={`question-${question.title}`}
        question={question}
        {...rest}
      />
    ))}
  </UnorderedList>
);

export default QuestionsList;
