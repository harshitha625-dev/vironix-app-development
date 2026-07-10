import React, { createContext, useContext, useMemo, useState } from 'react';
import { darkTheme, lightTheme, Theme } from './tokens';

type ThemeMode = 'dark' | 'light' | 'system';

const ThemeContext = createContext<{
  theme: Theme;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}>({ theme: darkTheme, mode: 'dark', setMode: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);
  const value = useMemo(() => ({ theme, mode, setMode }), [theme, mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
