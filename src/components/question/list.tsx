import type { FC } from 'react';
import { UnorderedList, type ListProps } from '@chakra-ui/react';

import QuestionsListItem from './listItem';
import type {
  QuestionListItem,
  UpdateQuestionHandlerPayload,
} from '../../types/question/list';

interface Props {
  questions: QuestionListItem[];
  onDelete?: (data: UpdateQuestionHandlerPayload) => void | Promise<void>;
  onEditTitle?: (data: UpdateQuestionHandlerPayload) => void | Promise<void>;
  onAddAnswer?: (
    questionId: number,
  ) => (content: string) => boolean | Promise<boolean>;
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
