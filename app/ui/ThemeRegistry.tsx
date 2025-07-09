"use client";
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/theme/mui-theme';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}