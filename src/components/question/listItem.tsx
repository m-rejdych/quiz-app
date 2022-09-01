import { type FC, useState } from 'react';
import type { Answer as PrismaAnswer } from '@prisma/client';
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

type Answer = Pick<PrismaAnswer, 'content' | 'isCorrect'>;

interface Question {
  title: string;
  answers: Answer[];
}

interface Props {
  question: Question;
  onDelete?: (title: string) => void;
}

const QuestionsListItem: FC<Props> = ({
  question: { title, answers },
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isListIn, setIsListIn] = useState(false);
  const [hideList, setHideList] = useState(true);

  const handleItemAnimationComplete = (): void => {
    if (!isDeleting || !onDelete) return;

    setTimeout(() => {
      onDelete(title);
    }, 150);
  };

  const toggleAnswersList = (): void => {
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
            <IconButton
              aria-label="toggle-answers-list"
              size="sm"
              icon={isListIn ? <ChevronUpIcon /> : <ChevronDownIcon />}
              onClick={toggleAnswersList}
            />
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
