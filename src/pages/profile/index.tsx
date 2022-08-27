import type { NextPage } from 'next';

import { getPropsWithSession } from '../../utils/session';
import { trpc } from '../../utils/trpc';

const Profile: NextPage = () => {
  const { data } = trpc.useQuery(['profile.get-data']);

  return <div>{data}</div>;
};

export const getServerSideProps = getPropsWithSession({
  callbackUrl: '/profile',
});

export default Profile;
