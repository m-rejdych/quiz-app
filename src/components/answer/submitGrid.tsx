import { type FC, useState } from 'react';
import type { Answer } from '@prisma/client';
import { Grid, GridItem, Button, Flex, Text } from '@chakra-ui/react';

import useAuthError from '../../hooks/useAuthError';
import { trpc } from '../../utils/trpc';

interface Props {
  code: string;
  answers: Pick<Answer, 'id' | 'content'>[];
  isPlayer: boolean;
}

const SubmitGrid: FC<Props> = ({ answers, code, isPlayer }) => {
  const [isAnswered, setIsAnswered] = useState(false);
  const submitAnswer = trpc.useMutation('answer.submit');
  const onError = useAuthError();

  const handleSubmit = async (id: number): Promise<void> => {
    if (!isPlayer) return;

    try {
      await submitAnswer.mutateAsync({ code, answerId: id });
      setIsAnswered(true);
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
    }
  };

  const getColumnsCount = (): number => {
    if (answers.length <= 1) return 1;
    if (answers.length <= 4) return 2;
    return 3;
  };

  const rowsCount = Math.ceil(answers.length / getColumnsCount());

  return isAnswered ? (
    <Flex alignItems="center" justifyContent="center" height="100%">
      <Text fontSize="2xl" fontWeight="bold">
        Your answer has been submitted!
      </Text>
    </Flex>
  ) : (
    <Grid
      gap={6}
      templateColumns={`repeat(${getColumnsCount()}, 1fr)`}
      templateRows={`repeat(${rowsCount}, 1fr)`}
      height="100%"
    >
      {answers.map(({ id, content }) => (
        <GridItem key={id} width="100%" height="100%">
          <Button
            width="100%"
            height="100%"
            colorScheme="gray"
            cursor={isPlayer ? 'pointer' : 'default'}
            onClick={() => handleSubmit(id)}
          >
            {content}
          </Button>
        </GridItem>
      ))}
    </Grid>
  );
};

export default SubmitGrid;
