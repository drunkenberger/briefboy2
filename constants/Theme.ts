import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const ScreenSize = {
  width: screenWidth,
  height: screenHeight,
  isSmall: screenWidth < 375,
  isMedium: screenWidth >= 375 && screenWidth < 768,
  isLarge: screenWidth >= 768,
};

export const Colors = {
  // Primary colors
  primary: '#111827',
  primaryLight: '#374151',
  primaryDark: '#000000',
  
  // Accent colors
  accent: '#10B981',
  accentLight: '#34D399',
  accentDark: '#059669',
  
  // Background colors
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceLight: '#F9FAFB',
  surfaceDark: '#F3F4F6',
  
  // Text colors
  text: '#111827',
  textSecondary: '#4B5563',
  textTertiary: '#6B7280',
  textLight: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Status colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',
  
  // Special colors
  gold: '#FFD700',
  recordRed: '#EF4444',
};

export const Typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    black: 'System',
  },
  
  // Font sizes
  fontSize: {
    xs: ScreenSize.isSmall ? 11 : 12,
    sm: ScreenSize.isSmall ? 13 : 14,
    base: ScreenSize.isSmall ? 15 : 16,
    lg: ScreenSize.isSmall ? 17 : 18,
    xl: ScreenSize.isSmall ? 19 : 20,
    '2xl': ScreenSize.isSmall ? 22 : 24,
    '3xl': ScreenSize.isSmall ? 26 : 28,
    '4xl': ScreenSize.isSmall ? 30 : 32,
    '5xl': ScreenSize.isSmall ? 36 : 40,
  },
  
  // Font weights
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  // Base spacing unit
  unit: 4,
  
  // Spacing scale
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  
  // Container padding
  container: {
    small: ScreenSize.isSmall ? 16 : 20,
    medium: ScreenSize.isSmall ? 20 : 24,
    large: ScreenSize.isSmall ? 24 : 32,
  },
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  colored: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  }),
};

export const Animation = {
  // Duration presets
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  // Spring animation configs
  spring: {
    fast: {
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    },
    normal: {
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    },
    bouncy: {
      useNativeDriver: true,
      speed: 20,
      bounciness: 15,
    },
  },
  
  // Timing animation configs
  timing: {
    fast: {
      duration: 150,
      useNativeDriver: true,
    },
    normal: {
      duration: 300,
      useNativeDriver: true,
    },
    slow: {
      duration: 500,
      useNativeDriver: true,
    },
  },
};

export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  animation: Animation,
  screenSize: ScreenSize,
};

export default Theme;