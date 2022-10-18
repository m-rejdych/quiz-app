import type { NextPage } from 'next';
import { VStack, Heading, Center, Progress } from '@chakra-ui/react';

import AddQuizButton from '../components/quiz/addButton';
import QuizesList from '../components/quiz/list';
import useAuthError from '../hooks/useAuthError';
import { trpc } from '../utils/trpc';
import { getPropsWithSession } from '../utils/session';

const Home: NextPage = () => {
  const onError = useAuthError();
  const { data, isLoading } = trpc.useQuery(['quiz.list'], { onError });

  const renderContent = (): React.ReactNode => {
    if (isLoading) {
      return (
        <Center height="100%" width="100%">
          <Progress
            size="sm"
            colorScheme="teal"
            mx={8}
            width="100%"
            isIndeterminate
          />
        </Center>
      );
    }

    if (!data) return null;

    if (!data.length)
      return (
        <Center height="100%" width="100%">
          <Heading color="gray.500">
            You don&#39;t have any quizes yet. Time to add one!
          </Heading>
        </Center>
      );

    return <QuizesList quizes={data} />;
  };

  return (
    <VStack spacing={6} alignItems="flex-start" height="100%">
      <AddQuizButton />
      {renderContent()}
    </VStack>
  );
};

export const getServerSideProps = getPropsWithSession();

export default Home;
