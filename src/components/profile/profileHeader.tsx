import type { FC } from 'react';
import type { User } from '@prisma/client';
import Image from 'next/image';
import { HStack, VStack, Text, Divider, Box } from '@chakra-ui/react';

import man from '../../images/man.png';

interface Props {
  user: Omit<User, 'password'>;
  isMe?: boolean;
}

const ProfileHeader: FC<Props> = ({ user: { username, email }, isMe }) => (
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

export default ProfileHeader;
