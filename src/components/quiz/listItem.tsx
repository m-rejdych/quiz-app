import type { FC } from 'react';
import type { Quiz } from '@prisma/client';
import Link from 'next/link';
import { Text } from '@chakra-ui/react';

import Card from '../common/card';

interface Props {
  quiz: Quiz;
  isLink?: boolean;
}

const QuizesListItem: FC<Props> = ({
  quiz: { id, title, createdAt },
  isLink,
}) => {
  const card = (
    <Card clickable>
      <Text fontSize="lg">{title}</Text>
      <Text color="gray.500" fontSize="xs">
        Created at: {createdAt.toString()}
      </Text>
    </Card>
  );

  return isLink ? (
    <Link href={`/quiz/${id}`}>
      <a>{card}</a>
    </Link>
  ) : (
    card
  );
};

export default QuizesListItem;
