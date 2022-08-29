import type { FC, ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import { useRouter } from 'next/router';

import TopBar from './topBar';

interface Props {
  children?: ReactElement;
}

const Layout: FC<Props> = ({ children }) => {
  const { pathname } = useRouter();

  const isAuthPage = pathname.includes('/auth');

  return (
    <Box position="relative" top={isAuthPage ? 0 : 16}>
      {isAuthPage || <TopBar />}
      {children}
    </Box>
  );
};

export default Layout;
