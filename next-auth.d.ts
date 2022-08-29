import NextAuth, { type DefaultUser }  from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user?: User;
  }

  interface User {
    id: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: number;
  }
}
