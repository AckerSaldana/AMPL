// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#973EBC',  // Tu morado principal actual
      secondary: '#30096E', // Texto púrpura oscuro
      dark: '#7D2E99',
      light: '#B96EDE',
      accent: '#9C42BD', // Core Purple extraído de la imagen (nuevo)
    },
    secondary: {
      main: '#00BFFF',  // default
    },
    accent: {
      main: '#FF69B4',  // default
    },
    text: {
      primary: '#000000',
      secondary: '#30096E',
      white: '#FFFFFF',
    },
    chart: {
      purple: '#973EBC',      
      lightPurple: '#B96EDE', 
      blue: '#6A5ACD',        
      lightBlue: '#88B8FF',   
      green: '#67B99A',       
      blueGreen: '#5DADE2',  
      red: '#C45A89',         
      pink: '#DA70D6',        
      orange: '#E07A5F',   
      yellow: '#E2C044',      
    }
  },
  shape: {
    borderRadius: 5,
  },
});

export default theme;
