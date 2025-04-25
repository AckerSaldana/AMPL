import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  Work as WorkIcon,
  Circle as CircleIcon
} from "@mui/icons-material";

/**
 * Componente para mostrar la información de un empleado en una tarjeta
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.employee - Información del empleado
 * @param {function} props.onViewDetails - Función para ver detalles del empleado
 */
const EmployeeCard = ({ employee, onViewDetails }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Manejadores para el menú
  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };
  
  // Procesar habilidades para mostrar
  const skillsToDisplay = employee.skills || [];
  
  // Obtener color basado en estado de asignación
  const getAssignmentColor = (isAssigned) => {
    return isAssigned ? "#f44336" : "#4caf50"; // rojo si asignado, verde si disponible
  };
  
  // Obtener etiqueta basada en asignación
  const getAssignmentStatus = (isAssigned) => {
    return isAssigned ? "Assigned" : "Available";
  };
  
  return (
    <Paper 
      elevation={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails(employee.user_id)}
      sx={{ 
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "all 0.25s ease",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered ? "0 8px 24px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
        overflow: "hidden",
        border: "1px solid",
        borderColor: isHovered ? "#9c27b0" : "rgba(0,0,0,0.04)",
        "&:hover": {
          borderColor: "#9c27b0",
        },
        p: 3
      }}
    >
      {/* Cabecera con imagen, nombre y estado */}
      <Box sx={{ 
        display: "flex", 
        alignItems: "flex-start", 
        justifyContent: "space-between",
        width: "100%",
        mb: 3
      }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={employee.profile_pic}
              sx={{ 
                width: 56, 
                height: 56,
                mr: 2,
                border: "4px solid #fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
              }}
            >
              {employee.name ? employee.name[0].toUpperCase() : "?"}
            </Avatar>
            
            {/* Indicador de estado como un pequeño círculo en el avatar */}
            <Box 
              sx={{ 
                position: "absolute", 
                bottom: 3, 
                left: 3, 
                width: 12, 
                height: 12, 
                borderRadius: "50%",
                bgcolor: getAssignmentColor(employee.isAssigned),
                border: "2px solid white",
                boxShadow: "0 0 4px rgba(0,0,0,0.1)"
              }} 
            />
          </Box>
          
          <Box>
            <Typography 
              variant="h6" 
              fontWeight={600}
              sx={{ 
                lineHeight: 1.2,
                fontSize: "1.1rem",
                color: "#212121"
              }}
            >
              {employee.name} {employee.last_name}
            </Typography>
            
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              mt: 0.3
            }}>
              <Box 
                sx={{ 
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(156, 39, 176, 0.08)",
                  color: "#9c27b0",
                  px: 1,
                  py: 0.3,
                  borderRadius: 4,
                  fontSize: "0.7rem",
                  fontWeight: 500
                }}
              >
                <WorkIcon sx={{ fontSize: 12, mr: 0.5, opacity: 0.8 }} />
                {employee.role}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Acciones a la derecha */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* Status badge */}
          <Chip
            label={getAssignmentStatus(employee.isAssigned)}
            size="small"
            sx={{
              borderRadius: "12px",
              fontSize: "0.75rem",
              height: "28px",
              fontWeight: 500,
              bgcolor: employee.isAssigned 
                ? "rgba(244, 67, 54, 0.08)" 
                : "rgba(76, 175, 80, 0.08)",
              color: employee.isAssigned 
                ? "#f44336" 
                : "#4caf50",
              border: employee.isAssigned 
                ? "1px solid rgba(244, 67, 54, 0.2)" 
                : "1px solid rgba(76, 175, 80, 0.2)",
              mr: 1,
              '&:hover': {
                bgcolor: employee.isAssigned 
                  ? "rgba(244, 67, 54, 0.12)" 
                  : "rgba(76, 175, 80, 0.12)",
              },
              transition: "all 0.2s ease",
            }}
          />
          
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{
              color: "text.secondary",
              '&:hover': {
                bgcolor: "rgba(0,0,0,0.04)"
              }
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Sección de habilidades */}
      <Box sx={{ 
        display: "flex",
        flexWrap: "wrap",
        gap: 0.7,
        mb: 3,
      }}>
        {skillsToDisplay.slice(0, 3).map((skill, idx) => (
          <Chip
            key={idx}
            label={skill.name}
            size="small"
            sx={{
              height: 24,
              fontSize: "0.75rem",
              borderRadius: "12px",
              backgroundColor: "rgba(0,0,0,0.04)",
              color: "rgba(0,0,0,0.7)",
              fontWeight: 500,
              '&:hover': {
                backgroundColor: "rgba(0,0,0,0.08)",
              }
            }}
          />
        ))}
        {skillsToDisplay.length > 3 && (
          <Chip
            label={`+${skillsToDisplay.length - 3}`}
            size="small"
            sx={{
              height: 24,
              fontSize: "0.75rem",
              borderRadius: "12px",
              backgroundColor: "rgba(0,0,0,0.02)",
              color: "rgba(0,0,0,0.5)",
              border: "1px dashed rgba(0,0,0,0.1)",
              '&:hover': {
                backgroundColor: "rgba(0,0,0,0.06)",
              }
            }}
          />
        )}
      </Box>
      
      {/* Información de disponibilidad */}
      <Typography 
        sx={{ 
          color: "text.secondary",
          fontStyle: "italic",
          fontSize: "0.875rem",
          mt: "auto",
          mb: 2
        }}
      >
        {employee.isAssigned 
          ? "Currently working on a project" 
          : "Available for project assignment"}
      </Typography>
      
      {/* Botón de ver detalles */}
      <Button
        variant="outlined"
        endIcon={<ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
        fullWidth
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails(employee.user_id);
        }}
        sx={{
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          py: 1,
          borderColor: "#9c27b0",
          color: "#9c27b0",
          fontSize: "0.875rem",
          transition: "all 0.2s ease",
          '&:hover': {
            borderColor: "#7b1fa2",
            backgroundColor: "rgba(156, 39, 176, 0.04)",
            boxShadow: "0 2px 8px rgba(156, 39, 176, 0.15)"
          }
        }}
      >
        View Details
      </Button>
      
      {/* Menú de acciones */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            minWidth: 180,
          }
        }}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          onViewDetails(employee.user_id);
        }}>
          View Profile
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>Assign to Project</MenuItem>
        <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
      </Menu>
    </Paper>
  );
};

export default EmployeeCard;