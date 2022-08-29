import type { FC, ReactElement } from 'react';
import { Container } from '@chakra-ui/react';
import { useRouter } from 'next/router';

import TopBar from './topBar';

interface Props {
  children?: ReactElement;
}

const Layout: FC<Props> = ({ children }) => {
  const { pathname } = useRouter();

  const isAuthPage = pathname.includes('/auth');

  return (
    <Container
      maxW="container.xl"
      py={8}
      position="relative"
      mt={isAuthPage ? 0 : 16}
    >
      {isAuthPage || <TopBar />}
      {children}
    </Container>
  );
};

export default Layout;
