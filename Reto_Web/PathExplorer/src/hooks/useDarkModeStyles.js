import { useDarkMode } from '../contexts/DarkModeContext';
import { useMemo } from 'react';

/**
 * Hook personalizado para manejar estilos de dark mode
 * Esto ayuda a prevenir problemas de tree-shaking en producción
 */
export const useDarkModeStyles = () => {
  const { darkMode } = useDarkMode();
  
  const styles = useMemo(() => ({
    // Backgrounds
    mainBg: darkMode ? '#121212' : 'transparent',
    paperBg: darkMode ? '#1e1e1e' : '#ffffff',
    cardBg: darkMode ? 'rgba(255,255,255,0.03)' : 'transparent',
    sectionBg: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
    
    // Text colors
    primaryText: darkMode ? '#ffffff' : 'inherit',
    secondaryText: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
    
    // Borders
    borderColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0,0,0,0.08)',
    
    // Purple accents
    purpleBg: darkMode ? 'rgba(161, 0, 255, 0.15)' : 'rgba(161, 0, 255, 0.08)',
    purpleText: darkMode ? '#a67aff' : '#a100ff',
    purpleBorder: darkMode ? 'rgba(161, 0, 255, 0.3)' : 'rgba(161, 0, 255, 0.2)',
    
    // Scrollbar
    scrollbarTrack: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    scrollbarThumb: darkMode ? 'rgba(161, 0, 255, 0.3)' : '#e6dcff',
    scrollbarThumbHover: darkMode ? 'rgba(161, 0, 255, 0.5)' : '#dcafff',
  }), [darkMode]);
  
  return { darkMode, styles };
};