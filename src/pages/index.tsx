import type { NextPage } from 'next';

import useSessionSetup from '../hooks/useSessionSetup';
import { getPropsWithSession } from '../utils/session';
import type { SessionProps } from '../utils/session';

const Home: NextPage<SessionProps> = ({ session }) => {
  useSessionSetup(session);

  return <div></div>;
};

export const getServerSideProps = getPropsWithSession({ callbackUrl: '/' });

export default Home;
