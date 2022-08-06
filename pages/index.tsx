import type { NextPage } from 'next';

import { trpc } from '../utils/trpc';

const Home: NextPage = () => {
  const { data } = trpc.useQuery(['hello', 'world']);

  if (!data) return <div>Loading...</div>;

  return <div>{data}</div>;
};

export default Home;
