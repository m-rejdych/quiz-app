import type { FC } from 'react';

import {
  Heading,
  Flex,
  Divider,
  VStack,
  Text,
} from '@chakra-ui/react';
import MembersList from './membersList';
import type { MatchedMembers } from '../../types/game/members';

interface Props {
  matchedMembers: MatchedMembers;
  countdown: number;
}

const StartingView: FC<Props> = ({ matchedMembers, countdown }) => (
  <VStack spacing={6} height="100%">
    <Heading>Get ready! The game is starting!</Heading>
    <Text fontSize="2xl">Time left: {countdown}</Text>
    <Flex flex={1} alignSelf="stretch">
      <MembersList
        title="Spectators"
        members={matchedMembers.spectators}
        flex={1}
      />
      <Divider orientation="vertical" mx={4} />
      <MembersList title="Players" members={matchedMembers.players} flex={1} />
    </Flex>
  </VStack>
);

export default StartingView;
