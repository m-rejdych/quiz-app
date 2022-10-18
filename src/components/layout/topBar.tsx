import type { FC } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  Flex,
  HStack,
  Text,
  Avatar,
  IconButton,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { MdLogout } from 'react-icons/md';

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
        <Text
          cursor="pointer"
          color="primary.light"
          fontWeight={700}
          fontSize="xl"
        >
          Quiz app
        </Text>
      </Link>
      <Flex>
        <Link href="/profile">
          <HStack spacing={4} cursor="pointer">
            <Text fontWeight={700}>{data.user?.name}</Text>
            <Avatar size="sm" />
          </HStack>
        </Link>
        <Tooltip label="Logout">
          <IconButton
            ml={4}
            aria-label="logout"
            icon={<Icon as={MdLogout} />}
            onClick={() => signOut()}
          />
        </Tooltip>
      </Flex>
    </Flex>
  );
};

export default TopBar;
