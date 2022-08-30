import type { NextPage } from 'next';

import AddQuizButton from '../components/quiz/addButton';
import { getPropsWithSession } from '../utils/session';

const Home: NextPage = () => {
  return (
    <div>
      <AddQuizButton />
    </div>
  );
};

export const getServerSideProps = getPropsWithSession();

export default Home;
