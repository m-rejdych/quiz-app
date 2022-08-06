import type { AppProps } from 'next/app';
import { withTRPC } from '@trpc/next';

import type { AppRouter } from './api/trpc/[trpc]';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
export default withTRPC<AppRouter>({
  config: () => {
    return {
      url: `${process.env.URL as string}/api/trpc`,
    };
  },
  ssr: true,
})(MyApp);
