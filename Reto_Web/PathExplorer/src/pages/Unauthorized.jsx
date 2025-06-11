// src/pages/Unauthorized.jsx
import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';
import { useDarkMode } from '../contexts/DarkModeContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: darkMode ? '#121212' : '#f5f7fa',
      }}
    >
      <Paper
        elevation={darkMode ? 0 : 3}
        sx={{
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 500,
          borderRadius: 2,
          bgcolor: darkMode ? '#1a1a1a' : '#fff',
          border: darkMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
        }}
      >
        <LockIcon
          sx={{
            fontSize: 70,
            color: '#973EBC',
            mb: 2,
          }}
        />
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: darkMode ? '#fff' : 'inherit' }}>
          Acceso restringido
        </Typography>
        <Typography variant="body1" paragraph align="center" sx={{ mb: 4, color: darkMode ? 'rgba(255,255,255,0.7)' : 'inherit' }}>
          No tienes los permisos necesarios para acceder a esta página. Si crees que deberías tener acceso, contacta con tu administrador.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 8px rgba(151, 62, 188, 0.2)',
            }}
          >
            Volver al Inicio
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Unauthorized;