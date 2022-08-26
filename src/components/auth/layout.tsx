import Link from 'next/link';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import {
  Center,
  CloseButton,
  Box,
  Fade,
  Alert,
  AlertIcon,
  AlertTitle,
  Text,
} from '@chakra-ui/react';

import { AuthMode, ServerError } from '../../types/auth/form';

interface Props {
  children?: React.ReactNode;
  mode: AuthMode;
  error: ServerError;
}

const AuthLayout: NextPage<Props> = ({
  children,
  mode,
  error: { text, open, onClose, onAnimationEnd },
}) => {
  const { query } = useRouter();

  const renderLink = (): React.ReactNode => {
    const { callbackUrl } = query;
    const linkQuery = `?callbackUrl=${callbackUrl ?? '/'}`;

    switch (mode) {
      case AuthMode.Login:
        return (
          <Text mt={6} textAlign="center">
            Don't have an account?{' '}
            <Text
              as="span"
              color="red.300"
              _hover={{ textDecoration: 'underline' }}
            >
              <Link href={`/auth/register${linkQuery}`}>Register</Link>
            </Text>
          </Text>
        );
      case AuthMode.Register:
        return (
          <Text mt={6} textAlign="center">
            Already have an account?{' '}
            <Text
              as="span"
              color="red.300"
              _hover={{ textDecoration: 'underline' }}
            >
              <Link href={`/auth/login${linkQuery}`}>Login</Link>
            </Text>
          </Text>
        );
      default:
        return null;
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
          {children}
          {renderLink()}
        </Box>
      </Center>
      <Fade in={open} onAnimationEnd={onAnimationEnd}>
        <Alert
          status="error"
          position="fixed"
          bottom={64}
          left="50%"
          transform="translateX(-50%)"
          w="auto"
          maxW="90vw"
          boxShadow="2xl"
          borderRadius="md"
        >
          <AlertIcon />
          <AlertTitle>{text}</AlertTitle>
          <CloseButton onClick={onClose} />
        </Alert>
      </Fade>
    </>
  );
};
export default AuthLayout;
