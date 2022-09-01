import { type FC, useState } from 'react';
import type { Answer as PrismaAnswer } from '@prisma/client';
import {
  SlideFade,
  ListItem,
  IconButton,
  HStack,
  Text,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

type Answer = Pick<PrismaAnswer, 'content' | 'isCorrect'>;

interface Question {
  title: string;
  answers: Answer[];
}

interface Props {
  question: Question;
  onDelete?: (title: string) => void;
}

const QuestionsListItem: FC<Props> = ({ question: { title }, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAnimationComplete = (): void => {
    if (!isDeleting || !onDelete) return;

    setTimeout(() => {
      onDelete(title);
    }, 150);
  };

  return (
    <SlideFade
      in={!isDeleting}
      offsetY="-20px"
      onAnimationComplete={handleAnimationComplete}
    >
      <ListItem>
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
          <Text>{title}</Text>
        </HStack>
      </ListItem>
    </SlideFade>
  );
};

export default QuestionsListItem;
