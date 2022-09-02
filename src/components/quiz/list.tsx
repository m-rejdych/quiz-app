import type { FC } from 'react';
import type { Quiz } from '@prisma/client';
import { VStack, Text } from '@chakra-ui/react';

interface Props {
  quizes: Quiz[];
}

const QuizesList: FC<Props> = ({ quizes }) => {
  return (
    <VStack spacing={3} alignItems="stretch">
      {quizes.map(({ title, id }) => (
        <Text key={id}>{title}</Text>
      ))}
    </VStack>
  );
};

export default QuizesList;
