import type { NextPage } from 'next';
import { VStack } from '@chakra-ui/react';

import AddQuizButton from '../components/quiz/addButton';
import QuizesList from '../components/quiz/list';
import { trpc } from '../utils/trpc';
import { getPropsWithSession } from '../utils/session';

const Home: NextPage = () => {
  const { data } = trpc.useQuery(['quiz.list']);

  return (
    <VStack spacing={6} alignItems="flex-start">
      <AddQuizButton />
      {data && <QuizesList quizes={data} />}
    </VStack>
  );
};

export const getServerSideProps = getPropsWithSession();

export default Home;
