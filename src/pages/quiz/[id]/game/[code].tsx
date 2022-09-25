import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Heading, Progress } from '@chakra-ui/react';

import { getPropsWithSession } from '../../../../utils/session';
import { trpc } from '../../../../utils/trpc';
import useGameSubscription from '../../../../hooks/useGameSubscription';

const Game: NextPage = () => {
  const { query } = useRouter();
  const { data, error, isLoading } = trpc.useQuery(
    ['game.get', query.code as string],
    {
      refetchOnWindowFocus: false,
    },
  );

  useGameSubscription(query.code as string);

  if (isLoading)
    return <Progress size="sm" colorScheme="teal" mx={8} isIndeterminate />;

  if (error)
    return (
      <Heading textAlign="center">
        {error.data?.httpStatus === 404 ? 'Game not found.' : error.message}
      </Heading>
    );

  return <div>{data?.code}</div>;
};

export const getServerSideProps = getPropsWithSession();

export default Game;
