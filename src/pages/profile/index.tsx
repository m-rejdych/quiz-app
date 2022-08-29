import type { NextPage } from 'next';

import ProfileHeader from '../../components/profile/profileHeader';
import useAuthError from '../../hooks/useAuthError';
import { getPropsWithSession } from '../../utils/session';
import { trpc } from '../../utils/trpc';

const MyProfile: NextPage = () => {
  const onError = useAuthError();
  const { data } = trpc.useQuery(['profile.get-data'], { onError });

  return data ? (
    <div>
      <ProfileHeader profile={data} isMe />
    </div>
  ) : null;
};

export const getServerSideProps = getPropsWithSession();

export default MyProfile;
