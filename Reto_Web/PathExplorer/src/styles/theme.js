import { createTheme } from '@mui/material/styles';

export const getDesignTokens = (mode) => {
  const isDark = mode === 'dark';

  const palette = {
    mode,
    primary: {
      main: isDark ? '#c450ff' : '#9c27b0',
    },
    secondary: {
      main: isDark ? '#4d7fff' : '#0041f0',
    },
    background: {
      default: isDark ? '#1a1a2e' : '#f5f7fa',
      paper: isDark ? '#222' : '#fff',
    },
    text: {
      primary: isDark ? '#ffffff' : '#000000',
      secondary: isDark ? '#b8b8b0' : '#30096E',
      lightGray: isDark ? 'rgba(255,255,255,0.7)' : '#666',
    },
    accenture: {
      colors: isDark ? ACCENTURE_COLORS_DARK : ACCENTURE_COLORS,
    },
    states: {
      success: isDark ? '#4ADE80' : "#22A565",
      warning: isDark ? '#FBBF24' : "#F2994A",
      error: isDark ? '#EF4444' : "#E53935",
    },
  };

  return {
    palette,
    shape: {
      borderRadius: 5,
    },
    typography: {
      fontFamily: 'Graphik-Medium, sans-serif',
    },
  };
};

const ACCENTURE_COLORS = { // Core Purples
  corePurple1: "#a100ff", // Primary Purple
  corePurple2: "#7500c0", // Secondary Purple
  corePurple3: "#460073", // Dark Purple
  
  // Accent Purples
  accentPurple1: "#b455aa", // Accent Purple 1
  accentPurple2: "#a055f5", // Accent Purple 2
  accentPurple3: "#be82ff", // Accent Purple 3
  accentPurple4: "#dcafff", // Accent Purple 4
  accentPurple5: "#e6dcff", // Accent Purple 5
  
  // Custom Purple
  accenturePurple: "#9c27b0", // Profile purple used in dashboard
  
  // Secondary Colors
  blue: "#0041f0",        // Blue
  lightBlue: "#00ffff",   // Light Blue
  green: "#64ff50",       // Green    #54d842
  blueGreen: "#05f0a5",   // Blue Green
  red: "#ff3246",         // Red
  pink: "#ff50a0",        // Pink
  orange: "#ff7800",      // Orange
  yellow: "#ffeb32",      // Yellow
  
  // Neutrals
  black: "#000000",
  darkGray: "#96968c",
  lightGray: "#e6e6dc",
  white: "#ffffff" };

const ACCENTURE_COLORS_DARK = { 
  // Core Purples - Versiones más brillantes y saturadas para dark mode
  corePurple1: "#c450ff", // Primary Purple - más brillante
  corePurple2: "#9d2ae6", // Secondary Purple - más brillante
  corePurple3: "#6b1a99", // Dark Purple - menos oscuro
  
  // Accent Purples - Ajustados para mejor contraste
  accentPurple1: "#d277cc", // Accent Purple 1 - más brillante
  accentPurple2: "#bc7aff", // Accent Purple 2 - más brillante
  accentPurple3: "#d19fff", // Accent Purple 3 - más brillante
  accentPurple4: "#e8c7ff", // Accent Purple 4 - ligeramente más brillante
  accentPurple5: "#f0e6ff", // Accent Purple 5 - mantenido claro para contraste
  
  // Custom Purple
  accenturePurple: "#ba68c8", // Profile purple - más brillante
  
  // Secondary Colors - Versiones más vibrantes
  blue: "#4d7fff",        // Blue - más brillante
  lightBlue: "#66ffff",   // Light Blue - más brillante
  green: "#7eff66",       // Green - más brillante
  blueGreen: "#33f5b8",   // Blue Green - más brillante
  red: "#ff5566",         // Red - más brillante
  pink: "#ff7ab8",        // Pink - más brillante
  orange: "#ff9533",      // Orange - más brillante
  yellow: "#fff066",      // Yellow - más brillante
  
  // Neutrals - Invertidos para dark mode
  black: "#ffffff",       // Blanco para texto en dark mode
  darkGray: "#b8b8b0",    // Gris más claro
  lightGray: "#3a3a36",   // Gris oscuro para fondos
  white: "#1a1a1a"       // Negro para fondos en dark mode
};

export const lightTheme = createTheme(getDesignTokens('light'));
export const darkTheme = createTheme(getDesignTokens('dark'));