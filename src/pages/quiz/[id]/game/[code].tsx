import type { NextPage } from 'next';
import { useRouter } from 'next/router';

import { getPropsWithSession } from '../../../../utils/session';
import useGameSubscription from '../../../../hooks/useGameSubscription';

const Game: NextPage = () => {
  const { query } = useRouter();

  useGameSubscription(query.code as string);

  return <div>Hi</div>;
};

export const getServerSideProps = getPropsWithSession();

export default Game;
