import type { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
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

const AuthContainer: FC<Props> = ({
  children,
  mode,
  error: { text, open, onClose, onAnimationEnd },
}) => {
  const { query } = useRouter();

  const renderLink = (): React.ReactNode => {
    const { callbackUrl } = query;
    const linkQuery = callbackUrl ? `?callbackUrl=${callbackUrl}` : '';

    switch (mode) {
      case AuthMode.Login:
        return (
          <Text mt={6} textAlign="center">
            Don&#39;t have an account?{' '}
            <Text
              as="span"
              color="secondary.light"
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
              color="secondary.light"
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
    <Center height="calc(100vh - 64px)">
      <Box
        bgColor="blackAlpha.400"
        borderRadius="md"
        p={6}
        w={500}
        maxW="90vw"
        boxShadow="lg"
        position="relative"
      >
        {children}
        {renderLink()}
        <Fade in={open} onAnimationEnd={onAnimationEnd}>
          <Alert
            status="error"
            position="absolute"
            top="calc(100% + 64px)"
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
      </Box>
    </Center>
  );
};
export default AuthContainer;
