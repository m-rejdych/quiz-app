import { type FC, useState } from 'react';
import type { Answer as PrismaAnswer } from '@prisma/client';
import {
  ListItem,
  SlideFade,
  Radio,
  Text,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

import Editable from '../editable/editable';
import type { UpdateAnswerPayload } from '../../types/answer/list';

type Answer = Pick<PrismaAnswer, 'content' | 'isCorrect'> & { id?: number };

interface Props {
  answer: Answer;
  onCorrectSelect?: (data: UpdateAnswerPayload) => void | Promise<void>;
  onDelete?: (data: UpdateAnswerPayload) => void | Promise<void>;
  onEditContent?: (data: UpdateAnswerPayload) => void | Promise<void>;
  withIsCorrectLabel?: boolean;
}

const AnswersListItem: FC<Props> = ({
  answer: { id, content, isCorrect },
  onCorrectSelect,
  onDelete,
  onEditContent,
  withIsCorrectLabel,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAnimationComplete = (): void => {
    if (!isDeleting || !onDelete) return;

    setTimeout(() => {
      onDelete({ id, content });
    }, 150);
  };

  const handleEditContent = async (newContent: string): Promise<void> => {
    if (newContent === content) return;

    onEditContent?.({ id, content: newContent });
  };

  return (
    <SlideFade
      in={!isDeleting}
      offsetY="-20px"
      onAnimationComplete={handleAnimationComplete}
    >
      <ListItem
        display="flex"
        alignItems="center"
        justifyContent={onCorrectSelect ? 'space-between' : 'flex-start'}
      >
        <HStack spacing={2}>
          {onDelete && (
            <IconButton
              size="sm"
              variant="outline"
              colorScheme="red"
              icon={<DeleteIcon />}
              aria-label="delete-answer"
              onClick={() => setIsDeleting(true)}
            />
          )}
          {onEditContent ? (
            <HStack spacing={2}>
              <Editable
                onSubmit={handleEditContent}
                defaultValue={content}
                fontSize="sm"
                isPreviewFocusable={false}
              />
              {withIsCorrectLabel && isCorrect && (
                <Text as="span" fontSize="sm" color="gray.500">
                  {` (correct answer)`}
                </Text>
              )}
            </HStack>
          ) : (
            <Text>
              {content}
              {withIsCorrectLabel && isCorrect && (
                <Text as="span" fontSize="sm" color="gray.500">
                  {` (correct answer)`}
                </Text>
              )}
            </Text>
          )}
        </HStack>
        {onCorrectSelect && (
          <Radio
            value={content}
            isChecked={isCorrect}
            onChange={(e) => onCorrectSelect({ id, content: e.target.value })}
            colorScheme="teal"
          />
        )}
      </ListItem>
    </SlideFade>
  );
};

export default AnswersListItem;
