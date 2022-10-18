import type { FC } from 'react';
import {
  TableContainer,
  Table,
  Thead,
  Tbody,
  Th,
  Tr,
  Flex,
  Heading,
  Text,
  FlexProps,
} from '@chakra-ui/react';

import LeaderboardRow from './row';
import type { GetGameQueryData, GameResult } from '../../../types/game/data';

interface Props {
  players: GetGameQueryData['players'] | GameResult['players'];
  currentQuestion?: GetGameQueryData['currentQuestion'];
  containerProps?: FlexProps;
  heading?: string;
}

const Leaderboard: FC<Props> = ({
  players,
  currentQuestion,
  containerProps,
  heading,
}) => {
  const renderRows = (): React.ReactElement => {
    if (Array.isArray(players)) {
      return (
        <>
          {players.map(({ id, user: { username }, score }) => (
            <LeaderboardRow key={id} username={username} score={score} />
          ))}
        </>
      );
    }

    return (
      <>
        {Object.entries({ ...players })
          .sort(([, a], [, b]) => (a.score < b.score ? 1 : -1))
          .map(
            ([
              id,
              {
                user: { username },
                questionAnswers,
                score,
              },
            ]) => (
              <LeaderboardRow
                key={id}
                username={username}
                score={score}
                currentQuestion={currentQuestion}
                questionAnswers={questionAnswers}
              />
            ),
          )}
      </>
    );
  };

  return (
    <Flex flexDirection="column" {...containerProps}>
      <Heading mb={6} alignSelf="center">
        {heading || 'Leaderboard'}
      </Heading>
      <TableContainer maxHeight="70vh">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Player</Th>
              <Th isNumeric>Score</Th>
            </Tr>
          </Thead>
          <Tbody>{renderRows()}</Tbody>
        </Table>
      </TableContainer>
      {heading && (
        <Text fontSize="2xl" alignSelf="center" color="gray.500" mt={6}>
          Leaderboard
        </Text>
      )}
    </Flex>
  );
};

export default Leaderboard;
