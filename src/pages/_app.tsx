import type { AppProps } from 'next/app';
import superjson from 'superjson';
import { withTRPC } from '@trpc/next';
import { ChakraProvider, cookieStorageManager } from '@chakra-ui/react';

import type { AppRouter } from './api/trpc/[trpc]';
import theme from '../theme';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider colorModeManager={cookieStorageManager} theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default withTRPC<AppRouter>({
  config: () => {
    return {
      url: '/api/trpc',
    };
  },
  ssr: true,
})(MyApp);
