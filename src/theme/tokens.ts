/**
 * VEYTRIX design system tokens.
 * Same brand language as the website: deep space background, violet-to-cyan
 * gradient identity for "AI generation", warm amber for credits/monetization.
 * Swap the hex values here if the actual VEYTRIX brand kit differs — every
 * screen consumes these tokens rather than hardcoded colors.
 */

export const palette = {
  violet50: '#f2ecff',
  violet400: '#9b7bff',
  violet500: '#7c5cff',
  violet600: '#6244e0',
  cyan400: '#4fd3e8',
  cyan500: '#22b8d1',
  amber400: '#f0a84c',
  amber500: '#d98f2e',
  red400: '#f0596e',
  green400: '#4ade80',

  ink950: '#0a0b10',
  ink900: '#12131b',
  ink800: '#191b25',
  ink700: '#232633',
  ink600: '#313544',
  ink500: '#4a4f61',
  ink400: '#6b7185',
  ink200: '#a9aebd',
  ink100: '#d3d6de',
  white: '#ffffff',
};

export const darkTheme = {
  mode: 'dark' as const,
  bg: palette.ink950,
  bgElevated: palette.ink900,
  surface: palette.ink800,
  surfaceAlt: palette.ink700,
  border: palette.ink600,
  textPrimary: palette.white,
  textSecondary: palette.ink200,
  textMuted: palette.ink400,
  accent: palette.violet500,
  accentAlt: palette.cyan400,
  credit: palette.amber400,
  danger: palette.red400,
  success: palette.green400,
  gradient: [palette.violet500, palette.cyan400] as const,
};

export const lightTheme = {
  mode: 'light' as const,
  bg: '#f6f5fb',
  bgElevated: '#ffffff',
  surface: '#ffffff',
  surfaceAlt: '#eef0f7',
  border: '#e2e4ee',
  textPrimary: palette.ink950,
  textSecondary: palette.ink500,
  textMuted: palette.ink400,
  accent: palette.violet600,
  accentAlt: palette.cyan500,
  credit: palette.amber500,
  danger: '#d0304a',
  success: '#1a9d56',
  gradient: [palette.violet600, palette.cyan500] as const,
};

export type Theme = Omit<typeof darkTheme, 'mode'> & { mode: 'dark' | 'light' };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };

export const typography = {
  display: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h1: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h2: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  tiny: { fontSize: 10, fontWeight: '500' as const, letterSpacing: 0.5 },
};
