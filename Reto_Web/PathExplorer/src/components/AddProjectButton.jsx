// src/components/AddProjectButton.jsx
import React from 'react';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

/**
 * Botón para agregar un nuevo proyecto
 * @param {function} onClick - Función a ejecutar cuando se hace clic en el botón
 */
const AddProjectButton = ({ onClick }) => {
  return (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      fullWidth
      onClick={onClick}
      sx={{
        py: 1.5,
        bgcolor: '#973EBC',
        borderRadius: 1.5,
        textTransform: 'none',
        fontWeight: 500,
        boxShadow: 'none',
        '&:hover': {
          bgcolor: '#973EBC',
          boxShadow: 'none',
        },
      }}
    >
      Add Project
    </Button>
  );
};

export default AddProjectButton;