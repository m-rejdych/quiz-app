import { useRouter } from 'next/router';
import { type SubmitHandler, type Path, useForm } from 'react-hook-form';
import { VStack, Button } from '@chakra-ui/react';

import LabeledInput from '../common/labeledInput';
import type { Field } from '../../types/auth/form';

interface Props<T extends object> {
  fields: Field<Extract<keyof T, string>>[];
  onSubmit: SubmitHandler<T>;
}

const AuthForm = <T extends object>({ fields, onSubmit }: Props<T>) => {
  const { pathname } = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<T>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <VStack spacing={6}>
        {fields.map(({ name, type, label, registerOptions }) => (
          <LabeledInput
            key={name}
            isInvalid={!!errors[name]}
            label={label}
            labelProps={{ htmlFor: name }}
            inputProps={{
              type,
              ...register(name as unknown as Path<T>, registerOptions),
            }}
            error={errors[name]?.message as string | undefined}
          />
        ))}
        <Button type="submit" isLoading={isSubmitting} colorScheme="teal">
          {pathname.includes('register') ? 'Register' : 'Login'}
        </Button>
      </VStack>
    </form>
  );
};

export default AuthForm;
