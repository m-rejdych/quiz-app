import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Heading, Progress, Box } from '@chakra-ui/react';

import useGameSubscription from '../../../../hooks/useGameSubscription';
import InitialView from '../../../../components/game/initialView';
import GameStartingView from '../../../../components/game/startingView';
import { getPropsWithSession } from '../../../../utils/session';
import { Stage } from '../../../../types/game/events';
import type { MatchedMembers } from '../../../../types/game/members';

const Game: NextPage = () => {
  const { query } = useRouter();
  const code = query.code as string;
  const {
    members,
    gameData: { data, error, isLoading },
  } = useGameSubscription(code);
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

  const renderQuestionContent = (): React.ReactNode => {
    switch (data.questionStage) {
      case Stage.Starting:
        return <Box>Question is starting in {data.questionStartCountdown}</Box>;
      case Stage.Started:
        return (
          <Box>
            Current question{' '}
            {data.quiz.questions[data.currentQuestionIndex]?.title}{' '}
            {data.questionCountdown}
          </Box>
        );
      case Stage.Finished:
        return <Box>Question has finished</Box>;
      case Stage.NotStarted:
      default:
        return null;
    }
  };

  const renderMainContent = (): React.ReactNode => {
    switch (data.gameStage) {
      case Stage.NotStarted:
        return (
          <InitialView
            data={data}
            matchedMembers={matchedMembers}
            session={session as Required<Session>}
          />
        );
      case Stage.Starting:
        return (
          <GameStartingView
            matchedMembers={matchedMembers}
            countdown={data.gameStartCountdown}
          />
        );
      case Stage.Started:
        return renderQuestionContent();
      case Stage.Finished:
        return <Box>Game has finished</Box>;
      default:
        return null;
    }
  };

  return <Box height="calc(100vh - 128px)">{renderMainContent()}</Box>;
};

export const getServerSideProps = getPropsWithSession();

export default Game;
