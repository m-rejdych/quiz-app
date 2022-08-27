import { useEffect } from 'react';
import type { Session } from 'next-auth';

import useAuthStore from '../store/auth';

type VoidCb = () => void;

type UseSessionSetup = (
  session: Session,
  initCb?: VoidCb,
  cleanup?: VoidCb,
) => void;

const useSessionSetup: UseSessionSetup = (session, initCb, cleanup) => {
  const storedSession = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    if (!storedSession) {
      setSession(session);
    }

    initCb?.();

    return cleanup;
  }, []);
};

export default useSessionSetup;
