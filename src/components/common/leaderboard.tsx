import type { FC } from 'react';
import {
  TableContainer,
  Table,
  Thead,
  Tbody,
  Th,
  Tr,
  Td,
  Flex,
  Heading,
  FlexProps,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';

import type { GetGameQueryData } from '../../types/game/data';

type Players = GetGameQueryData['players'];

interface Props {
  players: Players;
  currentQuestion?: GetGameQueryData['currentQuestion'];
  containerProps?: FlexProps;
}

const Leaderboard: FC<Props> = ({
  players,
  currentQuestion,
  containerProps,
}) => {
  const getIcon = (
    answers: Players[keyof Players]['questionAnswers'],
  ): React.ReactNode => {
    if (!currentQuestion) return null;

    return answers[currentQuestion.id]?.isCorrect ? (
      <CheckIcon ml={3} color="teal.500" />
    ) : (
      <CloseIcon ml={3} color="red.500" />
    );
  };

  return (
    <Flex flexDirection="column" {...containerProps}>
      <Heading mb={6} alignSelf="center">
        Leaderboard
      </Heading>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Player</Th>
              <Th isNumeric>Score</Th>
            </Tr>
          </Thead>
          <Tbody>
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
                  <Tr key={id}>
                    <Td fontWeight="bold">
                      <Flex alignItems="center">
                        {username} {getIcon(questionAnswers)}
                      </Flex>
                    </Td>
                    <Td isNumeric>{score}</Td>
                  </Tr>
                ),
              )}
          </Tbody>
        </Table>
      </TableContainer>
    </Flex>
  );
};
export default Leaderboard;
