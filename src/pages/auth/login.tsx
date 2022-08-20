import { type HTMLInputTypeAttribute, useState } from 'react';
import type { NextPage } from 'next';
import type { SubmitHandler, RegisterOptions } from 'react-hook-form';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';

import AuthLayout from '../../components/auth/layout';
import AuthForm from '../../components/auth/form';

interface Field<T extends string> {
  name: T;
  type: HTMLInputTypeAttribute;
  label: string;
  registerOptions: RegisterOptions;
}

interface FieldNames {
  email: string;
  password: string;
}

const emailPattern =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const passwordPattern =
  /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;

const FIELDS: Field<keyof FieldNames>[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    registerOptions: {
      required: 'Email is required.',
      pattern: {
        value: emailPattern,
        message: 'Invalid email.',
      },
    },
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    registerOptions: {
      required: 'Password is required.',
      pattern: {
        value: passwordPattern,
        message:
          'Password must be at least 6 characters long and contain numbers and special characters.',
      },
    },
  },
];

const Login: NextPage = () => {
  const [isServerError, setIsServerError] = useState(false);
  const router = useRouter();

  const onSubmit: SubmitHandler<FieldNames> = async (fields) => {
    const result = await signIn('credentials', {
      ...fields,
      redirect: false,
    });

    if (result?.ok) {
      const { callbackUrl } = router.query;
      await router.push((callbackUrl as string | undefined) ?? '/');
    } else {
      setIsServerError(true);
    }
  };

  return (
    <AuthLayout
      isError={isServerError}
      onErrorClose={() => setIsServerError(false)}
    >
      <AuthForm fields={FIELDS} onSubmit={onSubmit} />
    </AuthLayout>
  );
};

export default Login;
