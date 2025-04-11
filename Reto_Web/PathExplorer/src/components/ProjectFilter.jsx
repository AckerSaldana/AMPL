// src/components/ProjectFilter.jsx
import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';

/**
 * Componente para filtrar proyectos por su estado
 * @param {string} activeFilter - El filtro actualmente activo
 * @param {function} setActiveFilter - Función para cambiar el filtro activo
 */
const ProjectFilter = ({ activeFilter, setActiveFilter }) => {
  // Lista de filtros disponibles
  const filters = [
    { id: 'all', label: 'All projects', icon: <GridViewIcon sx={{ mr: 1 }} /> },
    { id: 'Completed', label: 'Completed', icon: <CheckCircleOutlineIcon sx={{ mr: 1 }} /> },
    { id: 'In Progress', label: 'Ongoing', icon: <ScheduleIcon sx={{ mr: 1 }} /> },
    { id: 'On Hold', label: 'Not started', icon: <PauseCircleOutlineIcon sx={{ mr: 1 }} /> },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      {filters.map((filter) => (
        <Button
          key={filter.id}
          fullWidth
          sx={{
            justifyContent: 'flex-start',
            py: 1.5,
            px: 3,
            borderRadius: 2,
            mb: 1,
            color: activeFilter === filter.id ? 'primary.main' : 'text.secondary',
            bgcolor: activeFilter === filter.id ? 'rgba(151, 62, 188, 0.08)' : 'transparent',
            '&:hover': {
              bgcolor: activeFilter === filter.id ? 'rgba(151, 62, 188, 0.12)' : 'rgba(0, 0, 0, 0.04)',
            },
            textTransform: 'none',
            fontWeight: activeFilter === filter.id ? 600 : 400,
            transition: 'all 0.2s ease',
          }}
          onClick={() => setActiveFilter(filter.id)}
        >
          {filter.icon}
          <Typography variant="body2">{filter.label}</Typography>
        </Button>
      ))}
    </Box>
  );
};

export default ProjectFilter;