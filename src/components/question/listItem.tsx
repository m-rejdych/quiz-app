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
import type {
  QuestionListItem,
  DeleteHandlerPayload,
} from '../../types/question/list';

interface Props {
  question: QuestionListItem;
  onDelete?: (data: DeleteHandlerPayload) => void;
}

const QuestionsListItem: FC<Props> = ({
  question: { id, title, answers },
  onDelete,
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

  return (
    <SlideFade
      in={!isDeleting}
      offsetY="-20px"
      onAnimationComplete={handleItemAnimationComplete}
    >
      <ListItem>
        <VStack spacing={3} alignItems="stretch">
          <Flex justifyContent="space-between" alignItems="center">
            <HStack spacing={2}>
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
              <Text fontWeight="bold">{title}</Text>
            </HStack>
            {!!answers.length && (
              <IconButton
                aria-label="toggle-answers-list"
                size="sm"
                icon={isListIn ? <ChevronUpIcon /> : <ChevronDownIcon />}
                onClick={toggleAnswersList}
              />
            )}
          </Flex>
          <Collapse in={isListIn}>
            <AnswersList
              withIsCorrectLabel
              answers={answers}
              listProps={{ hidden: hideList, listStyleType: 'unset' }}
            />
          </Collapse>
        </VStack>
      </ListItem>
    </SlideFade>
  );
};

export default QuestionsListItem;
