import type { NextPage, GetServerSideProps } from 'next';

import getSession from '../utils/getSession';

const Home: NextPage = () => {
  return <div></div>;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  if (!session) {
    return {
      redirect: {
        destination: '/auth',
      },
      props: {},
    };
  }

  return { props: { session } };
};

export default Home;
