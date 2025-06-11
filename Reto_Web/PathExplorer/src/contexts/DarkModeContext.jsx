import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ACCENTURE_COLORS } from '../styles/styles';

const DarkModeContext = createContext();

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

export const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: ACCENTURE_COLORS.corePurple1,
        secondary: darkMode ? ACCENTURE_COLORS.accentPurple3 : ACCENTURE_COLORS.corePurple3,
        dark: ACCENTURE_COLORS.corePurple2,
        light: ACCENTURE_COLORS.accentPurple3,
        accent: ACCENTURE_COLORS.accentPurple2,
      },
      secondary: {
        main: ACCENTURE_COLORS.blue,
      },
      accent: {
        main: ACCENTURE_COLORS.pink,
      },
      background: {
        default: darkMode ? '#121212' : '#fafafa',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#000000',
        secondary: darkMode ? 'rgba(255, 255, 255, 0.7)' : ACCENTURE_COLORS.corePurple3,
        white: '#FFFFFF',
      },
      chart: {
        purple: ACCENTURE_COLORS.corePurple1,
        lightPurple: ACCENTURE_COLORS.accentPurple3,
        blue: ACCENTURE_COLORS.blue,
        lightBlue: ACCENTURE_COLORS.lightBlue,
        green: ACCENTURE_COLORS.green,
        blueGreen: ACCENTURE_COLORS.blueGreen,
        red: ACCENTURE_COLORS.red,
        pink: ACCENTURE_COLORS.pink,
        orange: ACCENTURE_COLORS.orange,
        yellow: ACCENTURE_COLORS.yellow,
      },
      divider: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
    shape: {
      borderRadius: 5,
    },
    typography: {
      fontFamily: 'Graphik-Medium, sans-serif',
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </DarkModeContext.Provider>
  );
};