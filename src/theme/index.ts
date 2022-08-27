import {
  type ThemeConfig,
  extendTheme,
  theme as chakraTheme,
} from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    primary: {
      light: chakraTheme.colors.teal[300],
      main: chakraTheme.colors.teal[500],
      dark: chakraTheme.colors.teal[700],
    },
    secondary: {
      light: chakraTheme.colors.red[300],
      main: chakraTheme.colors.red[500],
      dark: chakraTheme.colors.red[700],
    },
  },
});

export default theme;
