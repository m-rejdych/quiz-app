import { withTRPC } from '@trpc/next';
import { ChakraProvider, cookieStorageManager } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';

import Layout from '../components/layout/layout';
import theme from '../theme';
import type { AppRouter } from './api/trpc/[trpc]';

const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => {
  return (
    <ChakraProvider colorModeManager={cookieStorageManager} theme={theme}>
      <SessionProvider session={session}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SessionProvider>
    </ChakraProvider>
  );
};

export default withTRPC<AppRouter>({
  config: ({ ctx }) => {
    return {
      url: `${process.env.NEXTAUTH_URL ?? ''}/api/trpc`,
      headers() {
        return {
          cookie: ctx?.req?.headers.cookie,
        };
      },
    };
  },
  ssr: true,
})(App);
