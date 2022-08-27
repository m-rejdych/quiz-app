import create from 'zustand';
import type { Session } from 'next-auth';

interface AuthStore {
  session: Session | null;
  setSession: (session: Session | null) => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  setSession: (session) => set((state) => ({ ...state, session })),
}));

export default useAuthStore;
