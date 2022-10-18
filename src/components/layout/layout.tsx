import type { FC, ReactElement } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Container, Icon, Link, Tooltip } from '@chakra-ui/react';
import { ImGithub } from 'react-icons/im';

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
      height={isAuthPage ? '100vh' : 'calc(100vh - 128px)'}
    >
      {isAuthPage || <TopBar />}
      {(!isAuthPage && !session) || children}
      <Tooltip label="GitHub">
        <Link
          position="fixed"
          bottom={6}
          right={6}
          target="_blank"
          href="https://github.com/m-rejdych/quiz-app"
          color="gray.500"
        >
          <Icon aria-label="github-link" as={ImGithub} />
        </Link>
      </Tooltip>
    </Container>
  );
};

export default Layout;
