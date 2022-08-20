import type { NextPage } from 'next';
import {
  Center,
  CloseButton,
  Box,
  Fade,
  Alert,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/react';

interface Props {
  children?: React.ReactNode;
  isError: boolean;
  onErrorClose: () => void;
}

const AuthLayout: NextPage<Props> = ({ children, isError, onErrorClose }) => (
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
      </Box>
    </Center>
    <Fade in={isError}>
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
          Something went wrong. Make sure you entered valid credentials.{' '}
        </AlertTitle>
        <CloseButton onClick={onErrorClose} />
      </Alert>
    </Fade>
  </>
);

export default AuthLayout;
