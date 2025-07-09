import { createTheme } from '@mui/material/styles';
import { colors } from './colors';

const theme = createTheme({
  palette: {
    primary: {
      main: colors.brand.main,
      light: colors.brand[300], // o qualsiasi shade
    },
    secondary: {
      main: colors.blue[500],
    },
    text: {
      primary: colors.black.text,
    },
    grey: {
      100: colors.gray.border,
      200: colors.gray.background,
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif', // se usato anche in Tailwind
  },
});

export default theme;
