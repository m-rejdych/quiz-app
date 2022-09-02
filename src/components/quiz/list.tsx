import type { FC } from 'react';
import type { Quiz } from '@prisma/client';
import { VStack, Text } from '@chakra-ui/react';

import QuizesListItem from './listItem';

interface Props {
  quizes: Quiz[];
}

const QuizesList: FC<Props> = ({ quizes }) => {
  return (
    <VStack spacing={3} alignItems="stretch" width="100%">
      {quizes.map((quiz) => (
        <QuizesListItem isLink key={quiz.id} quiz={quiz} />
      ))}
    </VStack>
  );
};

export default QuizesList;
