import type { FC } from 'react';
import { UnorderedList, type ListProps } from '@chakra-ui/react';

import QuestionsListItem from './listItem';
import type {
  QuestionListItem,
  DeleteHandlerPayload,
} from '../../types/question/list';

interface Props {
  questions: QuestionListItem[];
  onDelete?: (data: DeleteHandlerPayload) => void;
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
