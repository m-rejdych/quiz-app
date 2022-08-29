import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { VStack, Flex, Text } from '@chakra-ui/react';

import ProfileHeader from '../../components/profile/profileHeader';
import ProfileData from '../../components/profile/profileData';
import useAuthError from '../../hooks/useAuthError';
import { trpc } from '../../utils/trpc';
import { getPropsWithSession } from '../../utils/session';

const Profile: NextPage = () => {
  const { data: session } = useSession();
  const { query } = useRouter();
  const onError = useAuthError();
  const { data, error } = trpc.useQuery(
    ['profile.get-data', { id: parseInt(query.id as string, 10) || 0 }],
    {
      retry: (count, error) => {
        if (!error.data) return count <= 3;

        return error.data.httpStatus === 404 ? false : count <= 3;
      },
      onError,
    },
  );

  if (error?.data?.httpStatus === 404)
    return (
      <Flex justifyContent="center" alignItems="center">
        <Text fontSize="2xl">Profile not found</Text>
      </Flex>
    );

  const isMe = !!data && !!session && data.userId === session?.user?.id;

  return data ? (
    <VStack spacing={10} alignItems="stretch">
      <ProfileHeader user={data.user} isMe={isMe} />
      <ProfileData profile={data} isMe={isMe} />
    </VStack>
  ) : null;
};

export const getServerSideProps = getPropsWithSession();

export default Profile;
