import type { NextPage } from 'next';

import { getPropsWithSession } from '../../utils/session';

const Profile: NextPage = () => {
  return <div></div>;
};

export const getServerSideProps = getPropsWithSession({
  callbackUrl: '/profile',
});

export default Profile;
