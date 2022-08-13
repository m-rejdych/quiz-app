import { type HTMLInputTypeAttribute, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import {
  useForm,
  type RegisterOptions,
  type SubmitHandler,
} from 'react-hook-form';
import {
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Button,
  VStack,
  Box,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  CloseButton,
  Fade,
} from '@chakra-ui/react';

interface Field<T extends string> {
  type: HTMLInputTypeAttribute;
  label: string;
  name: T;
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
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<FieldNames>();
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
    <>
      <Center height="100vh">
        <Box
          bgColor="blackAlpha.400"
          borderRadius="md"
          p={6}
          w={500}
          maxW="90vw"
          boxShadow="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <VStack spacing={6}>
              {FIELDS.map(({ name, type, label, registerOptions }) => (
                <FormControl key={name} isInvalid={!!errors[name]}>
                  <FormLabel htmlFor={name}>{label}</FormLabel>
                  <Input type={type} {...register(name, registerOptions)} />
                  {errors[name] && (
                    <FormErrorMessage>{errors[name]!.message}</FormErrorMessage>
                  )}
                </FormControl>
              ))}
              <Button type="submit" isLoading={isSubmitting} colorScheme="teal">
                Login
              </Button>
            </VStack>
          </form>
        </Box>
      </Center>
      <Fade in={isServerError}>
        <Alert
          status="error"
          position="fixed"
          bottom={64}
          left="50%"
          transform="translateX(-50%)"
          w={605}
          maxW="90vw"
          boxShadow="2xl"
          borderRadius="md"
        >
          <AlertIcon />
          <AlertTitle>
            Something went wrong. Make sure you entered valid credentials.
          </AlertTitle>
          <CloseButton onClick={() => setIsServerError(false)} />
        </Alert>
      </Fade>
    </>
  );
};

export default Login;
