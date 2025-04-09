// src/theme.js
import { lightBlue } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#973EBC',  // Main purple components
      dark: '#7D2E99' ,
      light: '#B96EDE'

    },
    secondary: {
      main: '#00BFFF',  // default
    },
    accent: {
      main: '#FF69B4',  // default
    },
    text: {
      primary: '#000000', // Black text
      secondary: '#30096E', // Subtitle text (Dark purple)
      white: '#FFFFFF', // White text}
    }
  },
  shape: {
    borderRadius: 5,
  },
});

export default theme;
