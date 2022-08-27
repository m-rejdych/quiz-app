import type { FC } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Flex, HStack, Text, Avatar } from '@chakra-ui/react';

const TopBar: FC = () => {
  const { data } = useSession();

  if (!data) return null;

  return (
    <Flex
      position="fixed"
      top={0}
      left={0}
      right={0}
      height={16}
      px={8}
      bgColor="blackAlpha.400"
      boxShadow="sm"
      alignItems="center"
      justifyContent="space-between"
    >
      <Link href="/">
        <Text cursor="pointer" color="primary.light" fontWeight={700} fontSize="xl">Quiz app</Text>
      </Link>
      <Link href="/profile">
        <HStack spacing={4} cursor="pointer">
          <Text fontWeight={700}>{data.user?.name}</Text>
          <Avatar size="sm" />
        </HStack>
      </Link>
    </Flex>
  );
};

export default TopBar;
