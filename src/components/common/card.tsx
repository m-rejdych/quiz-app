import { type FC } from 'react';
import { Box, type BoxProps } from '@chakra-ui/react';

interface Props extends BoxProps {
  clickable?: boolean;
}

const Card: FC<Props> = ({ children, clickable }) => (
  <Box
    role={clickable ? 'button' : 'presentation'}
    px={4}
    py={6}
    borderRadius="xl"
    borderWidth="1px"
    borderStyle="solid"
    borderColor="gray.600"
    bgColor="blackAlpha.300"
    cursor={clickable ? 'pointer' : 'default'}
    transition="all 100ms ease-in"
    boxShadow="sm"
    _hover={
      clickable
        ? {
            bgColor: 'blackAlpha.400',
            boxShadow: 'lg',
            transform: 'scale(1.005)',
          }
        : undefined
    }
  >
    {children}
  </Box>
);

export default Card;
