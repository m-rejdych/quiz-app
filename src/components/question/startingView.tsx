import type { FC } from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';

interface Props {
  countdown: number;
  title: string;
}

const StartingView: FC<Props> = ({ countdown, title }) => (
  <Flex
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    height="100%"
  >
    <Heading mb={6}>{title}</Heading>
    <Text fontSize="2xl">Time left: {countdown}</Text>
  </Flex>
);

export default StartingView;
