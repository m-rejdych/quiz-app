import type { FC, ReactElement } from 'react';
import { useRouter } from 'next/router';
import { Box } from '@chakra-ui/react';

interface Props {
  children?: ReactElement;
}

const Layout: FC<Props> = ({ children }) => {
  const { pathname } = useRouter();

  return pathname.includes('/auth') ? (
    children ?? null
  ) : (
    <Box position="relative" top={16}>
      {children}
    </Box>
  );
};

export default Layout;
