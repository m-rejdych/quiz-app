import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Heading, Progress, Text, Flex, Divider } from '@chakra-ui/react';

import { getPropsWithSession } from '../../../../utils/session';
import { trpc } from '../../../../utils/trpc';
import useGameSubscription from '../../../../hooks/useGameSubscription';
import MembersList from '../../../../components/game/membersList';
import type { Members } from '../../../../types/game/members';

interface MatchedMembers {
  spectators: Members;
  players: Members;
}

const Game: NextPage = () => {
  const { query } = useRouter();
  const { data, error, isLoading } = trpc.useQuery(
    ['game.get', query.code as string],
    {
      refetchOnWindowFocus: false,
    },
  );
  const { members } = useGameSubscription(query.code as string);

  if (isLoading)
    return <Progress size="sm" colorScheme="teal" mx={8} isIndeterminate />;

  if (error)
    return (
      <Heading textAlign="center">
        {error.data?.httpStatus === 404 ? 'Game not found.' : error.message}
      </Heading>
    );

  if (!data) return null;

  const matchedMembers = Object.entries(members).reduce(
    (acc, [id, info]) => {
      if (
        data.players &&
        Object.keys(data.players).some((playerId) => playerId.toString() === id)
      ) {
        acc.players[id] = info;
      } else {
        acc.spectators[id] = info;
      }

      return acc;
    },
    { spectators: {}, players: {} } as MatchedMembers,
  );

  return (
    <Flex flexDirection="column" height="calc(100vh - 128px)">
      <Text fontSize="2xl" fontWeight="bold" mb={6}>
        Game code: <Text as="span">{data?.code}</Text>
      </Text>
      <Flex flex={1}>
        <MembersList
          title="Spectators"
          members={matchedMembers.spectators}
          flex={1}
        />
        <Divider orientation="vertical" mx={4} />
        <MembersList
          title="Players"
          members={matchedMembers.players}
          flex={1}
        />
      </Flex>
    </Flex>
  );
};

export const getServerSideProps = getPropsWithSession();

export default Game;
