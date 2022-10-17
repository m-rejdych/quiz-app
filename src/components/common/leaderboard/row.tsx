import type { FC } from 'react';
import { Tr, Td, Flex } from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';

import type { GetGameQueryData } from '../../../types/game/data';

type Players = GetGameQueryData['players'];

interface Props {
  username: string;
  score: number;
  currentQuestion?: GetGameQueryData['currentQuestion'];
  questionAnswers?: Players[keyof Players]['questionAnswers'];
}

const LeaderboardRow: FC<Props> = ({
  username,
  score,
  currentQuestion,
  questionAnswers,
}) => {
  const getIcon = (): React.ReactNode => {
    if (!currentQuestion || !questionAnswers) return null;

    return questionAnswers[currentQuestion.id]?.isCorrect ? (
      <CheckIcon ml={3} color="teal.500" />
    ) : (
      <CloseIcon ml={3} color="red.500" />
    );
  };

  return (
    <Tr>
      <Td fontWeight="bold">
        <Flex alignItems="center">
          {username}
          {getIcon()}
        </Flex>
      </Td>
      <Td isNumeric>{score}</Td>
    </Tr>
  );
};

export default LeaderboardRow;
