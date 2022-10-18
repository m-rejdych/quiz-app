import type { FC, ReactElement } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Container } from '@chakra-ui/react';

import TopBar from './topBar';

interface Props {
  children?: ReactElement;
}

const Layout: FC<Props> = ({ children }) => {
  const { data: session } = useSession();
  const { pathname } = useRouter();

  const isAuthPage = pathname.includes('/auth');

  return (
    <Container
      maxW="container.lg"
      py={8}
      position="relative"
      mt={isAuthPage ? 0 : 16}
    >
      {isAuthPage || <TopBar />}
      {(!isAuthPage && !session) || children}
    </Container>
  );
};

export default Layout;
