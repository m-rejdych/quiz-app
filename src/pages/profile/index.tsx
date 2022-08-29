import type { NextPage } from 'next';
import { VStack } from '@chakra-ui/react';

import ProfileHeader from '../../components/profile/profileHeader';
import ProfileData from '../../components/profile/profileData';
import useAuthError from '../../hooks/useAuthError';
import { getPropsWithSession } from '../../utils/session';
import { trpc } from '../../utils/trpc';

const MyProfile: NextPage = () => {
  const onError = useAuthError();
  const { data } = trpc.useQuery(['profile.get-data'], { onError });

  return data ? (
    <VStack spacing={10} alignItems="stretch">
      <ProfileHeader user={data.user} isMe />
      <ProfileData profile={data} isMe />
    </VStack>
  ) : null;
};

export const getServerSideProps = getPropsWithSession();

export default MyProfile;
