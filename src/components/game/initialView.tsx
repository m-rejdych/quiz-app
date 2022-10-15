import type { FC } from 'react';
import type { Session } from 'next-auth';
import { Flex, Text, Button, Box, Divider } from '@chakra-ui/react';

import MembersList from './membersList';
import useAuthError from '../../hooks/useAuthError';
import { trpc } from '../../utils/trpc';
import type { GetGameQueryData } from '../../types/game/data';
import type { Members } from '../../types/game/members';

interface MatchedMembers {
  spectators: Members;
  players: Members;
}

interface Props {
  data: GetGameQueryData;
  members: Members;
  session: Required<Session>;
}

const InitialView: FC<Props> = ({ data, members, session }) => {
  const onError = useAuthError();
  const joinGame = trpc.useMutation('game.join');
  const leaveGame = trpc.useMutation('game.leave');
  const startGame = trpc.useMutation('game.start');

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

  const isAuthor = data.quiz?.authorId === session.user.id;

  const togglePlayerState = async (): Promise<void> => {
    try {
      if (isPlayer) {
        await leaveGame.mutateAsync(data.code);
      } else {
        await joinGame.mutateAsync(data.code);
      }
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
    }
  };

  const handleStartGame = async (): Promise<void> => {
    try {
      await startGame.mutateAsync(data.code);
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
    }
  };

  return (
    <Flex flexDirection="column">
      <Flex alignItems="center" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold" mb={6}>
          Game code: <Text as="span">{data?.code}</Text>
        </Text>
        <Box>
          <Button
            colorScheme={isPlayer ? 'red' : 'teal'}
            onClick={togglePlayerState}
          >
            {isPlayer ? 'Leave game' : 'Join game'}
          </Button>
          {isAuthor && (
            <Button
              colorScheme="yellow"
              ml={3}
              disabled={!Object.keys(matchedMembers.players).length}
              onClick={handleStartGame}
            >
              Start game
            </Button>
          )}
        </Box>
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

export default InitialView;
