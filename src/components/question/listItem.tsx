import { type FC, useState } from 'react';
import {
  SlideFade,
  Collapse,
  ListItem,
  IconButton,
  HStack,
  VStack,
  Flex,
  Text,
} from '@chakra-ui/react';
import { DeleteIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

import AnswersList from '../answer/list';
import AddAnswerButton from '../answer/addButton';
import Editable from '../editable/editable';
import type {
  QuestionListItem,
  UpdateQuestionPayload,
} from '../../types/question/list';
import type { UpdateAnswerPayload } from '../../types/answer/list';

interface Props {
  question: QuestionListItem;
  onDelete?: (data: UpdateQuestionPayload) => void | Promise<void>;
  onEditTitle?: (data: UpdateQuestionPayload) => void | Promise<void>;
  onAddAnswer?: (
    questionId: number,
  ) => (content: string) => boolean | Promise<boolean>;
  onDeleteAnswer?: (data: UpdateAnswerPayload) => void | Promise<void>;
  onEditAnswerContent?: (data: UpdateAnswerPayload) => void | Promise<void>;
}

const QuestionsListItem: FC<Props> = ({
  question: { id, title, answers },
  onDelete,
  onEditTitle,
  onAddAnswer,
  onDeleteAnswer,
  onEditAnswerContent,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isListIn, setIsListIn] = useState(false);
  const [hideList, setHideList] = useState(true);

  const handleItemAnimationComplete = (): void => {
    if (!isDeleting || !onDelete) return;

    setTimeout(() => {
      onDelete({ id, title });
    }, 150);
  };

  const toggleAnswersList = (): void => {
    if (!answers.length) return;

    if (isListIn) {
      setTimeout(() => {
        setHideList(true);
      }, 150);
    } else {
      setHideList(false);
    }

    setIsListIn((prev) => !prev);
  };

  const handleEditTitle = async (newTitle: string): Promise<void> => {
    if (title === newTitle) return;

    await onEditTitle?.({ id, title: newTitle });
  };

  return (
    <SlideFade
      in={!isDeleting}
      offsetY="-20px"
      onAnimationComplete={handleItemAnimationComplete}
    >
      <ListItem>
        <VStack spacing={3} alignItems="stretch">
          <Flex alignItems="center">
            <HStack spacing={2} flex={1}>
              {onDelete && (
                <IconButton
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  aria-label="delete-question"
                  icon={<DeleteIcon />}
                  onClick={() => setIsDeleting(true)}
                />
              )}
              {onEditTitle ? (
                <Editable
                  flex={1}
                  previewProps={{ fontWeight: 'bold' }}
                  onSubmit={handleEditTitle}
                  defaultValue={title}
                  isPreviewFocusable={false}
                />
              ) : (
                <Text fontWeight="bold">{title}</Text>
              )}
              {!!answers.length && (
                <IconButton
                  aria-label="toggle-answers-list"
                  size="sm"
                  icon={isListIn ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  onClick={toggleAnswersList}
                />
              )}
            </HStack>
          </Flex>
          <Collapse in={isListIn}>
            <AnswersList
              withIsCorrectLabel
              answers={answers}
              listProps={{ hidden: hideList, listStyleType: 'unset' }}
              onDelete={onDeleteAnswer}
              onEditContent={onEditAnswerContent}
            />
          </Collapse>
          {onAddAnswer && id && (
            <Flex alignItems="center" my={3} minH={10}>
              <Text mr={2} fontWeight="bold">
                Add answer
              </Text>
              <AddAnswerButton isOpen onAdd={onAddAnswer(id)} />
            </Flex>
          )}
        </VStack>
      </ListItem>
    </SlideFade>
  );
};

export default QuestionsListItem;
