import type { FC } from 'react';
import type { Prisma } from '@prisma/client';
import Image from 'next/image';
import { HStack, VStack, Text, Divider, Box } from '@chakra-ui/react';

import man from '../../images/man.png';

type ProfileWithUser = Prisma.ProfileGetPayload<{
  include: { user: { select: { id: true; email: true; username: true } } };
}>;

interface Props {
  profile: ProfileWithUser;
  isMe?: boolean;
}

const ProfileHeader: FC<Props> = ({
  profile: {
    user: { username, email },
  },
  isMe,
}) => {
  return (
    <HStack spacing={10} justifyContent="center">
      <Image src={man} width={200} height={200} alt="avatar" />
      <Box height={200}>
        <Divider orientation="vertical" />
      </Box>
      <VStack spacing={2} alignItems="flex-start">
        <Text fontSize="4xl">{username}</Text>
        {isMe && (
          <Text fontSize="xl" color="gray.500">
            {email}
          </Text>
        )}
      </VStack>
    </HStack>
  );
};

export default ProfileHeader;
