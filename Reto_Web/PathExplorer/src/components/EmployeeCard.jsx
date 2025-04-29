import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ArrowForwardIos as ArrowForwardIosIcon,
  Work as WorkIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import UserProfileModal from "./UserProfileModal";

/**
 * Component for displaying employee information in a card
 * @param {Object} props - Component props
 * @param {Object} props.employee - Employee information
 * @param {function} props.onViewDetails - Function for viewing employee details
 * @param {boolean} props.useModal - Whether to use a modal for viewing details
 */
const EmployeeCard = ({ employee, onViewDetails, useModal = false }) => {
  const theme = useTheme();
  // Media queries más específicas para controlar cuándo cambiar el layout
  const isSmallScreen = useMediaQuery('(max-width:599px)');
  const isVerySmallScreen = useMediaQuery('(max-width:450px)');
  const isExtraSmallScreen = useMediaQuery('(max-width:320px)');
  
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Handler for viewing details
  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (useModal) {
      setModalOpen(true);
    } else {
      navigate(`/user/${employee.user_id}`);
    }
  };
  
  // Process skills to display
  const skillsToDisplay = employee.skills || [];
  
  // Get color based on assignment status
  const getAssignmentColor = (isAssigned) => {
    return isAssigned ? "#f44336" : "#4caf50"; // red if assigned, green if available
  };
  
  // Get label based on assignment
  const getAssignmentStatus = (isAssigned) => {
    return isAssigned ? "Assigned" : "Available";
  };
  
  // Determine how many skills to show based on screen size
  const getMaxSkillsToShow = () => {
    if (isSmallScreen) return 2;
    return 3;
  };

  return (
    <>
      <Paper 
        elevation={0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleViewDetails}
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
          p: isSmallScreen ? 2 : 3,
          // Asegurar que tenga un ancho mínimo para prevenir compresión
          minWidth: isSmallScreen ? "100%" : 240
        }}
      >
        {/* Header with image, name and status */}
        <Box sx={{ 
          display: "flex", 
          flexDirection: "column",
          width: "100%",
          mb: isSmallScreen ? 2 : 3,
        }}>
          {/* Primera fila: Avatar y Nombre */}
          <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
            width: "100%"
          }}>
            <Box sx={{
              display: "flex", 
              alignItems: "center",
              flex: 1,
              minWidth: 0, // Importante para que el contenido pueda contraerse
            }}>
              {/* Avatar con indicador de estado */}
              <Box sx={{ 
                position: "relative",
                flexShrink: 0 // Evita que el avatar se encoja
              }}>
                <Avatar
                  src={employee.profile_pic}
                  sx={{ 
                    width: isSmallScreen ? 48 : 56, 
                    height: isSmallScreen ? 48 : 56,
                    mr: 2,
                    border: "4px solid #fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                  }}
                >
                  {employee.name ? employee.name[0].toUpperCase() : "?"}
                </Avatar>
                
                {/* Status indicator as a small circle on the avatar */}
                <Box 
                  sx={{ 
                    position: "absolute", 
                    bottom: 3, 
                    right: 3, 
                    width: 10, 
                    height: 10, 
                    borderRadius: "50%",
                    bgcolor: getAssignmentColor(employee.isAssigned),
                    border: "2px solid white",
                    boxShadow: "0 0 4px rgba(0,0,0,0.1)"
                  }} 
                />
              </Box>
              
              {/* Nombre y puesto */}
              <Box sx={{
                flexGrow: 1,
                minWidth: 0, // Importante para permitir ellipsis
              }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={600}
                  sx={{ 
                    lineHeight: 1.2,
                    fontSize: isSmallScreen ? "0.875rem" : "0.95rem", // Nombre más pequeño
                    color: "#212121",
                    // Añadir ellipsis para nombres muy largos
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
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
                      fontSize: "0.65rem", // Rol más pequeño
                      fontWeight: 500,
                      // Añadir ellipsis para roles muy largos
                      maxWidth: "100%",
                      overflow: "hidden"
                    }}
                  >
                    <WorkIcon sx={{ fontSize: 10, mr: 0.5, opacity: 0.8, flexShrink: 0 }} />
                    <Typography
                      component="span"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: "0.65rem" // Asegurar que el texto del rol sea pequeño
                      }}
                    >
                      {employee.role}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            
            {/* Badge de estado - reposicionado para que no se corte */}
            <Box sx={{ 
              display: "flex", 
              alignItems: "flex-start",
              ml: 1,
              flexShrink: 0 // Asegura que no se comprima
            }}>
              <Chip
                label={getAssignmentStatus(employee.isAssigned)}
                size="small"
                sx={{
                  borderRadius: "12px",
                  fontSize: "0.7rem",
                  height: "24px",
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
                  '&:hover': {
                    bgcolor: employee.isAssigned 
                      ? "rgba(244, 67, 54, 0.12)" 
                      : "rgba(76, 175, 80, 0.12)",
                  },
                  transition: "all 0.2s ease",
                  // Garantizar que no se corte en pantallas pequeñas
                  "& .MuiChip-label": {
                    padding: "0 8px",
                    overflow: "visible" // Evita que se recorte el texto
                  },
                  whiteSpace: "nowrap",
                  minWidth: "fit-content",
                  alignSelf: "flex-start"
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Skills section */}
        <Box sx={{ 
          display: "flex",
          flexWrap: "wrap",
          gap: 0.7,
          mb: isSmallScreen ? 2 : 3,
          justifyContent: "flex-start"
        }}>
          {skillsToDisplay.slice(0, getMaxSkillsToShow()).map((skill, idx) => (
            <Chip
              key={idx}
              label={skill.name}
              size="small"
              sx={{
                height: 22, // Altura más pequeña
                fontSize: "0.7rem", // Texto más pequeño
                borderRadius: "12px",
                backgroundColor: "rgba(0,0,0,0.04)",
                color: "rgba(0,0,0,0.7)",
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: "rgba(0,0,0,0.08)",
                },
                // Asegurar que las skills largas se muestren correctamente
                maxWidth: "100%",
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                  padding: "0 6px" // Padding más pequeño
                }
              }}
            />
          ))}
          {skillsToDisplay.length > getMaxSkillsToShow() && (
            <Chip
              label={`+${skillsToDisplay.length - getMaxSkillsToShow()}`}
              size="small"
              sx={{
                height: 22, // Altura más pequeña
                fontSize: "0.7rem", // Texto más pequeño
                borderRadius: "12px",
                backgroundColor: "rgba(0,0,0,0.02)",
                color: "rgba(0,0,0,0.5)",
                border: "1px dashed rgba(0,0,0,0.1)",
                '&:hover': {
                  backgroundColor: "rgba(0,0,0,0.06)",
                },
                "& .MuiChip-label": {
                  padding: "0 6px" // Padding más pequeño
                }
              }}
            />
          )}
        </Box>
        
        {/* Availability information */}
        <Typography 
          sx={{ 
            color: "text.secondary",
            fontStyle: "italic",
            fontSize: "0.75rem", // Texto más pequeño
            mt: "auto",
            mb: 2,
            whiteSpace: "normal" // Permitir saltos de línea si es necesario
          }}
        >
          {employee.isAssigned 
            ? "Currently working on a project" 
            : "Available for project assignment"}
        </Typography>
        
        {/* View details button */}
        <Button
          variant="outlined"
          endIcon={<ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
          fullWidth
          onClick={handleViewDetails}
          sx={{
            borderRadius: 8,
            textTransform: "none",
            fontWeight: 600,
            py: 0.75, // Altura más pequeña
            borderColor: "#9c27b0",
            color: "#9c27b0",
            fontSize: "0.8rem", // Texto más pequeño
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
      </Paper>
      
      {/* Profile Modal - Only rendered when useModal is true */}
      {useModal && (
        <UserProfileModal 
          open={modalOpen} 
          onClose={() => setModalOpen(false)} 
          userId={employee.user_id} 
        />
      )}
    </>
  );
};

export default EmployeeCard;