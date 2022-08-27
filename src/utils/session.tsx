import type { GetServerSidePropsContext, GetServerSideProps } from 'next';
import type { Session } from 'next-auth';
import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { unstable_getServerSession } from 'next-auth';

import { authOptions } from '../pages/api/auth/[...nextauth]';
import { replaceUndefined } from '../utils/serialize';

interface SessionProps {
  session: Session;
}

interface GetPropsWithSessionOptions {
  callbackUrl?: string;
}

type GetPropsWithSession = (
  options?: GetPropsWithSessionOptions,
) => GetServerSideProps<SessionProps>;

export const getServerSession = async ({
  req,
  res,
}: GetServerSidePropsContext | CreateNextContextOptions): Promise<
  ReturnType<typeof unstable_getServerSession>
> => {
  const session = await unstable_getServerSession(req, res, authOptions);

  return session;
};

export const getPropsWithSession: GetPropsWithSession =
  (options = {}) =>
  async (ctx) => {
    const { callbackUrl } = options;

    try {
      const session = await getServerSession(ctx);
      if (!session) {
        return {
          redirect: {
            destination: `/auth/login${
              callbackUrl ? `?callbackUrl=${callbackUrl}` : ''
            }`,
            permanent: false,
          },
        };
      }

      return { props: { session: replaceUndefined(session, null) } };
    } catch (error) {
      return {
        redirect: {
          destination: `/auth/login${
            callbackUrl ? `?callbackUrl=${callbackUrl}` : ''
          }`,
          permanent: false,
        },
      };
    }
  };
