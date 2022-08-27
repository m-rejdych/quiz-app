import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import type { NextPage, GetServerSideProps } from 'next';
import type { SubmitHandler } from 'react-hook-form';

import AuthLayout from '../../components/auth/layout';
import AuthForm from '../../components/auth/form';
import { getSeverSession } from '../../utils/session';
import { trpc } from '../../utils/trpc';
import { REGISTER_FIELDS } from '../../constants/auth/form';
import {
  type RegisterFieldNames,
  ServerError,
  AuthMode,
} from '../../types/auth/form';

const Register: NextPage = () => {
  const [serverError, setServerError] = useState<Omit<ServerError, 'onClose'>>({
    open: false,
    text: '',
  });
  const register = trpc.useMutation('register');
  const router = useRouter();

  const handleSubmit: SubmitHandler<RegisterFieldNames> = async (fields) => {
    try {
      await register.mutateAsync(fields);
      const { email, password } = fields;

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        const { callbackUrl } = router.query;
        await router.push((callbackUrl as string | undefined) ?? '/');
      } else {
        setServerError({ open: true, text: 'Invalid email or password.' });
      }
    } catch (error: any) {
      setServerError({
        open: true,
        text:
          error.data.httpStatus === 400
            ? 'Invalid credentials.'
            : 'Email already in use.',
      });
    }
  };

  return (
    <AuthLayout
      mode={AuthMode.Register}
      error={{
        ...serverError,
        onClose: () => setServerError((prev) => ({ ...prev, open: false })),
        onAnimationEnd: () => setServerError((prev) => ({ ...prev, text: '' })),
      }}
    >
      <AuthForm fields={REGISTER_FIELDS} onSubmit={handleSubmit} />
    </AuthLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSeverSession(ctx);
  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return { props: {} };
};

export default Register;
