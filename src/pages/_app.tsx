import { withTRPC } from '@trpc/next';
import { ChakraProvider, cookieStorageManager } from '@chakra-ui/react';
import type { AppProps } from 'next/app';

import Layout from '../components/layout/layout';
import theme from '../theme';
import type { AppRouter } from './api/trpc/[trpc]';

const App = ({ Component, pageProps, router: { pathname } }: AppProps) => {
  return (
    <ChakraProvider colorModeManager={cookieStorageManager} theme={theme}>
      {pathname.includes('/auth') ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </ChakraProvider>
  );
};

export default withTRPC<AppRouter>({
  config: () => {
    return {
      url: '/api/trpc',
    };
  },
  ssr: true,
})(App);
