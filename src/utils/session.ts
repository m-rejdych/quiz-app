import type {
  GetServerSidePropsContext,
  GetServerSideProps,
  GetServerSidePropsResult,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import type { Session } from 'next-auth';
import { unstable_getServerSession } from 'next-auth';

import { authOptions } from '../pages/api/auth/[...nextauth]';
import { replaceUndefined } from '../utils/format';

interface SessionProps {
  session: Session;
}

interface GetPropsWithSessionOpts {
  callbackUrl?: string;
  getServerSidePropsFn?: <T extends object>(
    ctx: GetServerSidePropsContext,
  ) => GetServerSidePropsResult<T> | Promise<GetServerSidePropsResult<T>>;
}

interface GetServerSessionOpts {
  req: GetServerSidePropsContext['req'] | NextApiRequest;
  res: GetServerSidePropsContext['res'] | NextApiResponse;
}

type GetPropsWithSession = (
  options?: GetPropsWithSessionOpts,
) => GetServerSideProps<SessionProps>;

export const getServerSession = async ({
  req,
  res,
}: GetServerSessionOpts): Promise<
  ReturnType<typeof unstable_getServerSession>
> => {
  const session = await unstable_getServerSession(req, res, authOptions);

  return session;
};

export const getPropsWithSession: GetPropsWithSession =
  (options = {}) =>
  async (ctx) => {
    const { callbackUrl: callbackUrlOpt, getServerSidePropsFn } = options;
    const callbackUrl = callbackUrlOpt ?? ctx.resolvedUrl;

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

      const result = await getServerSidePropsFn?.(ctx);
      if (result && ('redirect' in result || 'notFound' in result)) {
        return result;
      }

      return {
        ...result,
        props: { ...result?.props, session: replaceUndefined(session, null) },
      };
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
