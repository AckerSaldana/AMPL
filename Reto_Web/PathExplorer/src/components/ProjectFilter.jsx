// src/components/ProjectFilter.jsx
import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import { alpha } from '@mui/material/styles';
import { ACCENTURE_COLORS } from '../styles/styles';

/**
 * Componente para filtrar proyectos por su estado
 * @param {string} activeFilter - El filtro actualmente activo
 * @param {function} setActiveFilter - Función para cambiar el filtro activo
 */
const ProjectFilter = ({ activeFilter, setActiveFilter, disabled }) => {
  // Lista de filtros disponibles
  const filters = [
    { 
      id: 'all', 
      label: 'All projects', 
      icon: <GridViewIcon sx={{ mr: 1 }} />,
      color: ACCENTURE_COLORS.corePurple1
    },
    { 
      id: 'Completed', 
      label: 'Completed', 
      icon: <CheckCircleOutlineIcon sx={{ mr: 1 }} />,
      color: "#22A565"
    },
    { 
      id: 'In Progress', 
      label: 'Ongoing', 
      icon: <ScheduleIcon sx={{ mr: 1 }} />,
      color: ACCENTURE_COLORS.corePurple2
    },
    { 
      id: 'On Hold', 
      label: 'On Hold', 
      icon: <PauseCircleOutlineIcon sx={{ mr: 1 }} />,
      color: ACCENTURE_COLORS.orange
    },
    { 
      id: 'Not Started', 
      label: 'Not Started', 
      icon: <DoNotDisturbIcon sx={{ mr: 1 }} />,
      color: ACCENTURE_COLORS.blue
    },
  ];

  return (
    <Box sx={{ mt: 0.5 }}>
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;
        return (
          <Box 
            key={filter.id}
            sx={{
              borderRadius: 2,
              mb: 0.5, // Aumentado el margen entre botones
              px: 3,
              py: 0.5,
            }}
          >
            <Button
              fullWidth
              disabled={disabled}
              sx={{
                justifyContent: 'flex-start',
                py: 2, // Aumentado significativamente el padding vertical para mayor altura
                px: 2,
                borderRadius: 1.5,
                color: ACCENTURE_COLORS.darkGray,
                bgcolor: isActive ? alpha(filter.color, 0.08) : 'transparent',
                '&:hover': {
                  bgcolor: isActive ? alpha(filter.color, 0.12) : alpha(ACCENTURE_COLORS.corePurple1, 0.04),
                },
                textTransform: 'none',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 48, // Establecer una altura mínima
              }}
              onClick={() => setActiveFilter(filter.id)}
            >
              {React.cloneElement(filter.icon, { 
                sx: { 
                  mr: 1.5, // Aumentado el margen para mejorar la apariencia con botones más altos
                  color: ACCENTURE_COLORS.darkGray,
                  transition: 'all 0.2s ease',
                  fontSize: '1.3rem', // Aumentado ligeramente el tamaño del icono
                } 
              })}
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.2s ease',
                  fontSize: '0.9rem', // Aumentado ligeramente el tamaño del texto
                }}
              >
                {filter.label}
              </Typography>
            </Button>
          </Box>
        );
      })}
    </Box>
  );
};

export default ProjectFilter;