import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Heading, Progress, Flex } from '@chakra-ui/react';

import { trpc } from '../../../../utils/trpc';
import useAuthError from '../../../../hooks/useAuthError';
import Leaderboard from '../../../../components/common/leaderboard';

const Result: NextPage = () => {
  const { query } = useRouter();
  const onError = useAuthError();
  const { data, error, isLoading } = trpc.useQuery(
    [
      'game.get-result',
      {
        quizId: parseInt(query.id as string, 10),
        resultId: parseInt(query.resultId as string, 10),
      },
    ],
    { onError },
  );

  if (error) {
    return <Heading textAlign="center">{error.message}</Heading>;
  }

  if (isLoading) {
    return <Progress size="sm" colorScheme="teal" mx={8} isIndeterminate />;
  }

  if (!data) return null;

  const { players } = data;

  const getHeading = (): string => {
    const highscore = players.reduce(
      (currentHighscore, { score }) =>
        score > currentHighscore ? score : currentHighscore,
      0,
    );
    const winners = players.filter(({ score }) => score === highscore);

    let heading = 'Game results - ';

    if (winners.length === 1) {
      heading += `the winner is ${winners[0].user.username}`;
    } else {
      heading += `the winners are ${winners
        .map(({ user: { username } }) => username)
        .join(', ')}`;
    }

    return heading;
  };

  return (
    <Flex
      height="calc(100vh - 128px)"
      alignItems="center"
      justifyContent="center"
    >
      <Leaderboard
        players={players}
        heading={getHeading()}
        containerProps={{ height: '100%', flex: 1, justifyContent: 'center' }}
      />
    </Flex>
  );
};

export default Result;
