import React from 'react';
import { Box, Typography } from '@mui/material';
import { useDarkMode } from '../contexts/DarkModeContext';

/**
 * Componente de debug para verificar que dark mode funciona en producción
 * Puedes agregarlo temporalmente en App.jsx para verificar
 */
export const DarkModeDebug = () => {
  const { darkMode } = useDarkMode();
  
  if (process.env.NODE_ENV === 'production') {
    return null; // No mostrar en producción final
  }
  
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        p: 1,
        bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderRadius: 1,
        zIndex: 9999,
      }}
    >
      <Typography variant="caption" sx={{ color: darkMode ? '#fff' : '#000' }}>
        Dark Mode: {darkMode ? 'ON' : 'OFF'}
      </Typography>
    </Box>
  );
};