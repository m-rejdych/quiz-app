import type { NextPage } from 'next';
import { useRouter } from 'next/router';

const Quiz: NextPage = () => {
  const { query } = useRouter();

  return <div>{query.id}</div>;
};

export default Quiz;
