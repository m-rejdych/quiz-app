import type { NextPage } from 'next';
import type { Session } from 'next-auth';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Heading, Progress, Box } from '@chakra-ui/react';

import useGameSubscription from '../../../../hooks/useGameSubscription';
import GameInitialView from '../../../../components/game/initialView';
import GameStartingView from '../../../../components/game/startingView';
import GameFinishedView from '../../../../components/game/finishedView';
import QuestionStrtingView from '../../../../components/question/startingView';
import QuestionCurrentView from '../../../../components/question/currentView';
import QuestionFinishedView from '../../../../components/question/finishedView';
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

  const {
    currentQuestion,
    questionStartCountdown,
    questionCountdown,
    players,
    gameStage,
    authorId,
    questionStage,
    gameStartCountdown,
  } = data;

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
    if (!currentQuestion) return null;

    switch (questionStage) {
      case Stage.Starting:
        return (
          <QuestionStrtingView
            countdown={questionStartCountdown}
            title={currentQuestion.title}
          />
        );
      case Stage.Started:
        return (
          <QuestionCurrentView
            code={code}
            title={currentQuestion.title}
            answers={currentQuestion.answers}
            countdown={questionCountdown}
            isPlayer={session.user!.id.toString() in matchedMembers.players}
          />
        );
      case Stage.Finished:
        return (
          <QuestionFinishedView
            players={players}
            currentQuestion={currentQuestion}
          />
        );
      case Stage.NotStarted:
      default:
        return null;
    }
  };

  const renderMainContent = (): React.ReactNode => {
    switch (gameStage) {
      case Stage.NotStarted:
        return (
          <GameInitialView
            code={code}
            authorId={authorId}
            matchedMembers={matchedMembers}
            session={session as Required<Session>}
          />
        );
      case Stage.Starting:
        return (
          <GameStartingView
            matchedMembers={matchedMembers}
            countdown={gameStartCountdown}
          />
        );
      case Stage.Started:
        return renderQuestionContent();
      case Stage.Finished:
        return <GameFinishedView players={players} />;
      default:
        return null;
    }
  };

  return <Box height="calc(100vh - 128px)">{renderMainContent()}</Box>;
};

export const getServerSideProps = getPropsWithSession();

export default Game;
