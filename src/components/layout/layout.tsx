import type { FC, ReactElement } from 'react';
import { Box } from '@chakra-ui/react';

import TopBar from './topBar';

interface Props {
  children?: ReactElement;
}

const Layout: FC<Props> = ({ children }) => {
  return (
    <Box position="relative" top={16}>
      <TopBar />
      {children}
    </Box>
  );
};

export default Layout;
