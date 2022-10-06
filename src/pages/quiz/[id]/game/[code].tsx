import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
  Heading,
  Progress,
  VStack,
  HStack,
  Avatar,
  Text,
  Flex,
  Divider,
} from '@chakra-ui/react';

import { getPropsWithSession } from '../../../../utils/session';
import { trpc } from '../../../../utils/trpc';
import useGameSubscription from '../../../../hooks/useGameSubscription';

const Game: NextPage = () => {
  const { query } = useRouter();
  const { data, error, isLoading } = trpc.useQuery(
    ['game.get', query.code as string],
    {
      refetchOnWindowFocus: false,
    },
  );
  const { members } = useGameSubscription(query.code as string);

  if (isLoading)
    return <Progress size="sm" colorScheme="teal" mx={8} isIndeterminate />;

  if (error)
    return (
      <Heading textAlign="center">
        {error.data?.httpStatus === 404 ? 'Game not found.' : error.message}
      </Heading>
    );

  return (
    <VStack spacing={6} alignItems="stretch" height="calc(100vh - 128px)">
      <Text fontSize="2xl" fontWeight="bold">
        Game code: <Text as="span">{data?.code}</Text>
      </Text>
      <Flex flex={1}>
        <VStack spacing={3} alignItems="stretch" flex={1}>
          <Text fontSize="2xl" fontWeight="bold">
            Spectators
          </Text>
          {Object.entries(members).map(([id, { name }]) => (
            <HStack spacing={3} key={id}>
              <Avatar size="sm" />
              <Text>{name}</Text>
            </HStack>
          ))}
        </VStack>
        <Divider orientation="vertical" mx={4} />
        <VStack spacing={3} alignItems="stretch" flex={1}>
          <Text fontSize="2xl" fontWeight="bold">
            Players
          </Text>
        </VStack>
      </Flex>
    </VStack>
  );
};

export const getServerSideProps = getPropsWithSession();

export default Game;
