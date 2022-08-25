import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import type { NextPage } from 'next';
import type { SubmitHandler } from 'react-hook-form';

import AuthLayout from '../../components/auth/layout';
import AuthForm from '../../components/auth/form';
import { trpc } from '../../utils/trpc';
import { REGISTER_FIELDS } from '../../constants/auth/form';
import { type RegisterFieldNames, AuthMode } from '../../types/auth/form';

const Register: NextPage = () => {
  const [isServerError, setIsServerError] = useState(false);
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
        setIsServerError(true);
      }
    } catch (error) {
      setIsServerError(true);
    }
  };

  return (
    <AuthLayout
      mode={AuthMode.Register}
      isError={isServerError}
      onErrorClose={() => setIsServerError(false)}
    >
      <AuthForm fields={REGISTER_FIELDS} onSubmit={handleSubmit} />
    </AuthLayout>
  );
};

export default Register;
