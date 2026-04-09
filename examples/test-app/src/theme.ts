import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import { useColorScheme, type ColorSchemeName } from 'react-native';

export interface AppColors {
  accent: string;
  accentContrast: string;
  accentMuted: string;
  accentSoft: string;
  card: string;
  cardStrong: string;
  danger: string;
  dangerContrast: string;
  field: string;
  line: string;
  lineStrong: string;
  mode: 'dark' | 'light';
  overlay: string;
  panel: string;
  surface: string;
  tabBar: string;
  text: string;
  textSoft: string;
}

const brand = '#8232FF';

const darkColors: AppColors = {
  accent: brand,
  accentContrast: '#ffffff',
  accentMuted: '#2b1b4a',
  accentSoft: 'rgba(130, 50, 255, 0.18)',
  card: '#111113',
  cardStrong: '#17171a',
  danger: '#7a2338',
  dangerContrast: '#ffffff',
  field: '#0d0d0f',
  line: '#26262b',
  lineStrong: '#3a3a40',
  mode: 'dark',
  overlay: 'rgba(0, 0, 0, 0.72)',
  panel: '#0d0d0f',
  surface: '#050505',
  tabBar: '#101013',
  text: '#f5f5f5',
  textSoft: '#a1a1aa',
};

const lightColors: AppColors = {
  accent: brand,
  accentContrast: '#ffffff',
  accentMuted: '#efe7ff',
  accentSoft: 'rgba(130, 50, 255, 0.12)',
  card: '#ffffff',
  cardStrong: '#f7f7fa',
  danger: '#8f2740',
  dangerContrast: '#ffffff',
  field: '#ffffff',
  line: '#d7d9e0',
  lineStrong: '#b8bcc7',
  mode: 'light',
  overlay: 'rgba(16, 18, 27, 0.24)',
  panel: '#ffffff',
  surface: '#f3f4f7',
  tabBar: '#ffffff',
  text: '#11131a',
  textSoft: '#616675',
};

export function getAppColors(scheme?: ColorSchemeName): AppColors {
  return scheme === 'light' ? lightColors : darkColors;
}

export function useAppColors(): AppColors {
  return getAppColors(useColorScheme());
}

export function getNavigationTheme(colors: AppColors): Theme {
  const baseTheme = colors.mode === 'light' ? DefaultTheme : DarkTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: colors.surface,
      border: colors.line,
      card: colors.surface,
      notification: colors.accent,
      primary: colors.accent,
      text: colors.text,
    },
  };
}
