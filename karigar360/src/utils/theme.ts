// Light theme colors
const lightColors = {
  primary: '#2563EB', // Blue
  secondary: '#4F46E5', // Indigo
  success: '#10B981', // Green
  danger: '#EF4444', // Red
  error: '#EF4444', // Red (alias for error)
  warning: '#F59E0B', // Yellow
  info: '#3B82F6', // Light Blue
  light: '#F3F4F6', // Gray-100
  dark: '#1F2937', // Gray-800
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

// Dark theme colors
const darkColors = {
  primary: '#3B82F6', // Lighter Blue
  secondary: '#6366F1', // Lighter Indigo
  success: '#10B981', // Green (same)
  danger: '#EF4444', // Red (same)
  error: '#EF4444', // Red (same)
  warning: '#F59E0B', // Yellow (same)
  info: '#60A5FA', // Lighter Blue
  light: '#374151', // Darker Gray
  dark: '#F3F4F6', // Light Gray (inverted)
  white: '#1F2937', // Dark Gray (inverted)
  black: '#F9FAFB', // Light Gray (inverted)
  gray: {
    50: '#111827',
    100: '#1F2937',
    200: '#374151',
    300: '#4B5563',
    400: '#6B7280',
    500: '#9CA3AF',
    600: '#D1D5DB',
    700: '#E5E7EB',
    800: '#F3F4F6',
    900: '#F9FAFB',
  },
  background: '#111827',
  surface: '#1F2937',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  border: '#374151',
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
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