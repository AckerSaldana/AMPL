// src/pages/Unauthorized.jsx
import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f7fa',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 500,
          borderRadius: 2,
        }}
      >
        <LockIcon
          sx={{
            fontSize: 70,
            color: '#973EBC',
            mb: 2,
          }}
        />
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Acceso restringido
        </Typography>
        <Typography variant="body1" paragraph align="center" sx={{ mb: 4 }}>
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