import { useRouter } from 'next/router';
import type { TRPCClientErrorLike } from '@trpc/client';

import type { AppRouter } from '../pages/api/trpc/[trpc]';

type ErrorHandler = (error: TRPCClientErrorLike<AppRouter>) => void;

const useAuthError = (): ErrorHandler => {
  const router = useRouter();

  const handleError: ErrorHandler = (error, errCb?: ErrorHandler) => {
    errCb?.(error);

    if (error.data?.httpStatus === 401) {
      router.push(`/auth/login?callbackUrl=${router.asPath}`);
    }
  };

  return handleError;
};

export default useAuthError;
