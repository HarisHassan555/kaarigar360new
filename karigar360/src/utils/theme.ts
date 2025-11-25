// Modern Light theme colors - Vibrant Purple & Orange gradient theme
const lightColors = {
  primary: '#7C3AED', // Vibrant Purple
  primaryLight: '#A78BFA', // Light Purple
  primaryDark: '#5B21B6', // Dark Purple
  secondary: '#F97316', // Vibrant Orange
  secondaryLight: '#FB923C', // Light Orange
  secondaryDark: '#C2410C', // Dark Orange
  accent: '#EC4899', // Pink accent
  success: '#10B981', // Green
  danger: '#EF4444', // Red
  error: '#EF4444', // Red (alias for error)
  warning: '#F59E0B', // Yellow
  info: '#06B6D4', // Cyan
  light: '#F8FAFC', // Very light gray
  dark: '#0F172A', // Very dark slate
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  background: '#F8FAFC', // Very light slate
  backgroundSecondary: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  // Gradient colors
  gradient: {
    primary: ['#7C3AED', '#A78BFA'],
    secondary: ['#F97316', '#FB923C'],
    accent: ['#EC4899', '#F472B6'],
    success: ['#10B981', '#34D399'],
    purpleOrange: ['#7C3AED', '#F97316'],
    purplePink: ['#7C3AED', '#EC4899'],
  },
};

// Modern Dark theme colors
const darkColors = {
  primary: '#A78BFA', // Lighter Purple
  primaryLight: '#C4B5FD', // Very Light Purple
  primaryDark: '#7C3AED', // Purple
  secondary: '#FB923C', // Lighter Orange
  secondaryLight: '#FBBF24', // Light Orange
  secondaryDark: '#F97316', // Orange
  accent: '#F472B6', // Light Pink
  success: '#34D399', // Light Green
  danger: '#F87171', // Light Red
  error: '#F87171', // Light Red
  warning: '#FBBF24', // Light Yellow
  info: '#22D3EE', // Light Cyan
  light: '#1E293B', // Dark slate
  dark: '#F8FAFC', // Light (inverted)
  white: '#0F172A', // Very dark (inverted)
  black: '#F8FAFC', // Light (inverted)
  gray: {
    50: '#0F172A',
    100: '#1E293B',
    200: '#334155',
    300: '#475569',
    400: '#64748B',
    500: '#94A3B8',
    600: '#CBD5E1',
    700: '#E2E8F0',
    800: '#F1F5F9',
    900: '#F8FAFC',
  },
  background: '#0F172A', // Very dark slate
  backgroundSecondary: '#1E293B',
  surface: '#1E293B', // Dark slate
  surfaceElevated: '#334155',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  border: '#334155',
  borderLight: '#1E293B',
  // Gradient colors
  gradient: {
    primary: ['#A78BFA', '#C4B5FD'],
    secondary: ['#FB923C', '#FBBF24'],
    accent: ['#F472B6', '#F9A8D4'],
    success: ['#34D399', '#6EE7B7'],
    purpleOrange: ['#A78BFA', '#FB923C'],
    purplePink: ['#A78BFA', '#F472B6'],
  },
};

// Default export for backward compatibility (light theme)
export const colors = lightColors;

// Theme getter function
export const getThemeColors = (isDark: boolean) => {
  return isDark ? darkColors : lightColors;
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const shadows = {
  sm: {
    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  // Colored shadows for special effects
  primary: {
    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondary: {
    shadowColor: '#F97316',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
}; 