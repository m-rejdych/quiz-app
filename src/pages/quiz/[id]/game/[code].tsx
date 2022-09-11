import type { NextPage } from 'next';

import { getPropsWithSession } from '../../../../utils/session';

const Game: NextPage = () => {
  return <div>Hi</div>;
};

export const getServerSideProps = getPropsWithSession();

export default Game;
