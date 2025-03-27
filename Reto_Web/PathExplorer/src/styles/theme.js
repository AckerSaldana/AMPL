// src/theme.js
import { lightBlue } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#973EBC',  // Main purple components
    },
    secondary: {
      main: '#00BFFF',  // default
    },
    accent: {
      main: '#FF69B4',  // default
    },
    text: {
      primary: '#000000', // Black text
      secondary: '#973EBC', // Subtitle text (Dark purple)
      white: '#FFFFFF', // White text
    }
  },
  shape: {
    borderRadius: 5,
  },
});

export default theme;
