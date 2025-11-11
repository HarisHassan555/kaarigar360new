import { useAppSelector } from '../store/hooks';
import { getThemeColors } from '../utils/theme';

export const useTheme = () => {
  const darkMode = useAppSelector((state) => state.user.preferences.darkMode);
  const colors = getThemeColors(darkMode);
  
  return {
    colors,
    isDark: darkMode,
  };
};

