import { type SubmitHandler, type Path, useForm } from 'react-hook-form';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
} from '@chakra-ui/react';

import type { Field } from '../../types/auth/form';

interface Props<T extends object> {
  fields: Field<Extract<keyof T, string>>[];
  onSubmit: SubmitHandler<T>;
}

const AuthForm = <T extends object>({ fields, onSubmit }: Props<T>) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<T>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <VStack spacing={6}>
        {fields.map(({ name, type, label, registerOptions }) => (
          <FormControl key={name} isInvalid={!!errors[name]}>
            <FormLabel htmlFor={name}>{label}</FormLabel>
            <Input
              type={type}
              {...register(name as unknown as Path<T>, registerOptions)}
            />
            {errors[name] && (
              <FormErrorMessage>
                {errors[name]!.message as string}
              </FormErrorMessage>
            )}
          </FormControl>
        ))}
        <Button type="submit" isLoading={isSubmitting} colorScheme="teal">
          Login
        </Button>
      </VStack>
    </form>
  );
};

export default AuthForm;
