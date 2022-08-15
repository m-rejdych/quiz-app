import type { GetServerSidePropsContext, GetServerSideProps } from 'next';
import type { Session } from 'next-auth';
import { unstable_getServerSession } from 'next-auth';

import { authOptions } from '../pages/api/auth/[...nextauth]';
import { replaceUndefined } from '../utils/serialize';

interface Props {
  session: Session;
}

interface GetPropsWithSessionOptions {
  callbackUrl?: string;
}

type GetPropsWithSession = (
  options?: GetPropsWithSessionOptions,
) => GetServerSideProps<Props>;

const getSession = async ({
  req,
  res,
}: GetServerSidePropsContext): Promise<
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
      const session = await getSession(ctx);
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
      console.log(error);
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