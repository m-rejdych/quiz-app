import type { FC } from 'react';
import type { Answer } from '@prisma/client';
import { VStack, Heading, Text, Box } from '@chakra-ui/react';

import AnswersSubmitGrid from '../answer/submitGrid';

interface Props {
  code: string;
  title: string;
  countdown: number;
  answers: Pick<Answer, 'id' | 'content'>[];
}

const CurrentQuestionView: FC<Props> = ({ title, countdown, ...rest }) => (
  <VStack height="100%" spacing={6} justifyContent="center">
    <Heading>{title}</Heading>
    <Text fontSize="2xl">Time left: {countdown}</Text>
    <Box alignSelf="stretch" height="50vh">
      <AnswersSubmitGrid {...rest} />
    </Box>
  </VStack>
);

export default CurrentQuestionView;
