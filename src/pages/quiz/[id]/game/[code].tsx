import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import {
  Heading,
  Progress,
  Text,
  Flex,
  Divider,
  Button,
} from '@chakra-ui/react';

import { getPropsWithSession } from '../../../../utils/session';
import useGameSubscription from '../../../../hooks/useGameSubscription';
import useAuthError from '../../../../hooks/useAuthError';
import MembersList from '../../../../components/game/membersList';
import type { Members } from '../../../../types/game/members';

interface MatchedMembers {
  spectators: Members;
  players: Members;
}

const Game: NextPage = () => {
  const { query } = useRouter();
  const {
    members,
    gameData: { data, error, isLoading },
    joinGame,
    leaveGame,
    onAuthError,
  } = useGameSubscription(query.code as string);
  const { data: session } = useSession();

  if (isLoading)
    return <Progress size="sm" colorScheme="teal" mx={8} isIndeterminate />;

  if (error)
    return (
      <Heading textAlign="center">
        {error.data?.httpStatus === 404 ? 'Game not found.' : error.message}
      </Heading>
    );

  if (!data || !session?.user) return null;

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

  const isPlayer = session.user.id.toString() in matchedMembers.players;

  const handleClick = async (): Promise<void> => {
    try {
      if (isPlayer) {
        await leaveGame.mutateAsync(query.code as string);
      } else {
        await joinGame.mutateAsync(query.code as string);
      }
    } catch (error) {
      onAuthError(error as Parameters<typeof onAuthError>[0]);
    }
  };
  console.log(data);

  return (
    <Flex flexDirection="column" height="calc(100vh - 128px)">
      <Flex alignItems="center" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold" mb={6}>
          Game code: <Text as="span">{data?.code}</Text>
        </Text>
        <Button colorScheme="teal" onClick={handleClick}>
          {isPlayer ? 'Leave game' : 'Join game'}
        </Button>
      </Flex>
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
