import type { FC } from 'react';
import { Flex, Text } from '@chakra-ui/react';

import useAuthStore from '../../store/auth';

const TopBar: FC = () => {
  const username = useAuthStore((state) => state.session?.user?.name);

  return (
    <Flex
      position="fixed"
      top={0}
      left={0}
      right={0}
      height={16}
      bgColor="blackAlpha.400"
      boxShadow="sm"
      alignItems="center"
      justifyContent="flex-end"
    >
      <Text fontWeight={700} mr={8}>{username}</Text>
    </Flex>
  );
};

export default TopBar;
