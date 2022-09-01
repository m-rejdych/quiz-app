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

type Answer = Pick<PrismaAnswer, 'content' | 'isCorrect'>;

interface Props {
  answer: Answer;
  onCorrectSelect?: (content: string) => void;
  onDelete?: (content: string) => void;
  withIsCorrectLabel?: boolean;
}

const AnswersListItem: FC<Props> = ({
  answer: { content, isCorrect },
  onCorrectSelect,
  onDelete,
  withIsCorrectLabel,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAnimationComplete = (): void => {
    if (!isDeleting || !onDelete) return;

    setTimeout(() => {
      onDelete(content);
    }, 150);
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
          <Text>
            {content}
            {withIsCorrectLabel && isCorrect && (
              <Text as="span" fontSize="sm" color="gray.500">
                {` (correct answer)`}
              </Text>
            )}
          </Text>
        </HStack>
        {onCorrectSelect && (
          <Radio
            value={content}
            isChecked={isCorrect}
            onChange={(e) => onCorrectSelect(e.target.value)}
            colorScheme="teal"
          />
        )}
      </ListItem>
    </SlideFade>
  );
};

export default AnswersListItem;
