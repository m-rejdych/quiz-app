import type { NextPage } from 'next';

import { getPropsWithSession } from '../utils/session';

const Home: NextPage = () => {
  return <div></div>;
};

export const getServerSideProps = getPropsWithSession();

export default Home;
