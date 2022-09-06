import type { FC } from 'react';
import { UnorderedList, type ListProps } from '@chakra-ui/react';

import QuestionsListItem from './listItem';
import type {
  QuestionListItem,
  UpdateQuestionPayload,
} from '../../types/question/list';
import type { UpdateAnswerPayload } from '../../types/answer/list';

interface Props {
  questions: QuestionListItem[];
  onDelete?: (data: UpdateQuestionPayload) => void | Promise<void>;
  onEditTitle?: (data: UpdateQuestionPayload) => void | Promise<void>;
  onAddAnswer?: (
    questionId: number,
  ) => (content: string) => boolean | Promise<boolean>;
  onDeleteAnswer?: (data: UpdateAnswerPayload) => void | Promise<void>;
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
