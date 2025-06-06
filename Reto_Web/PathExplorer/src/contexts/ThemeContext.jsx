
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ACCENTURE_COLORS, ACCENTURE_COLORS_DARK } from '../styles/styles';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeContextProvider');
  }
  return context;
};

export const ThemeContextProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  // Save theme preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleThemeMode = () => {
    setDarkMode(!darkMode);
  };

  // Get current color palette based on theme mode
  const currentColors = darkMode ? ACCENTURE_COLORS_DARK : ACCENTURE_COLORS;

  // Create MUI theme with Accenture colors
  const muiTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: currentColors.corePurple1,
        secondary: currentColors.corePurple2,
        dark: currentColors.corePurple3,
        light: currentColors.accentPurple3,
      },
      secondary: {
        main: currentColors.blue,
        light: currentColors.lightBlue,
      },
      background: {
        default: darkMode ? '#121212' : '#fafafa',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: currentColors.black, // This will be white in dark mode
        secondary: darkMode ? currentColors.darkGray : '#30096E',
        white: currentColors.white, // This will be dark in dark mode
      },
      divider: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      action: {
        hover: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        selected: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
      },
      // Custom color palette for charts and other elements
      chart: {
        purple: currentColors.accenturePurple,
        lightPurple: currentColors.accentPurple3,
        blue: currentColors.blue,
        lightBlue: currentColors.lightBlue,
        green: currentColors.green,
        blueGreen: currentColors.blueGreen,
        red: currentColors.red,
        pink: currentColors.pink,
        orange: currentColors.orange,
        yellow: currentColors.yellow,
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: 'Graphik-Medium, sans-serif',
    },
    components: {
      // Override MUI components to use Accenture styling
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 12,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  const value = {
    darkMode,
    toggleThemeMode,
    colors: currentColors,
    theme: muiTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={muiTheme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};