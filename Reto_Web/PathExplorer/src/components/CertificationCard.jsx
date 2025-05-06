import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  alpha,
  useTheme,
  Tooltip,
  IconButton
} from "@mui/material";
import { 
  Info as InfoIcon
} from "@mui/icons-material";

/**
 * Componente mejorado para tarjetas de certificación que sigue las pautas de diseño de Accenture
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título de la certificación
 * @param {string} props.url - URL del curso
 * @param {Array} props.skills - Lista de habilidades asociadas
 * @param {string} props.backgroundImage - URL de la imagen de fondo
 * @param {boolean} props.isListView - Indica si se muestra en vista de lista
 * @param {string} props.duration - Duración del curso o emisor
 * @param {string} props.level - Nivel de dificultad
 */
export const CertificationCard = ({ 
  title, 
  url, 
  skills = [], 
  backgroundImage = '/default-certification.jpg',
  isListView = false,
  duration = "40 hours",
  level = "Beginner"
}) => {
  const theme = useTheme();
  
  // Colores de Accenture según las directrices
  const corePurple1 = "#a100ff"; // Core Purple 1
  const corePurple2 = "#7500c0"; // Core Purple 2
  const corePurple3 = "#460073"; // Core Purple 3
  
  // Función para abrir el URL del curso en una nueva pestaña
  const handleTakeCourse = (e) => {
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Función para manejar el clic en "Details"
  const handleViewDetails = (e) => {
    e.stopPropagation();
    // Aquí podrías implementar una navegación a una página de detalles o mostrar un modal
    console.log("Ver detalles de:", title);
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        overflow: "hidden",
        transition: "all 0.2s ease",
        border: `1px solid ${alpha('#000', 0.08)}`,
        bgcolor: "white",
        "&:hover": {
          boxShadow: `0 4px 12px ${alpha(corePurple1, 0.12)}`,
          borderColor: alpha(corePurple1, 0.15),
        },
        position: "relative",
      }}
    >
      {/* Imagen de la certificación */}
      <CardMedia
        component="div"
        sx={{
          height: 0,
          paddingTop: "56.25%", // 16:9 aspect ratio
          width: "100%",
          position: "relative",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `linear-gradient(180deg, rgba(65, 0, 115, 0.8) 0%, rgba(65, 0, 115, 0.4) 40%, rgba(65, 0, 115, 0) 100%)`,
            zIndex: 1
          }
        }}
      >
        {/* Skills tags se muestran sobre la imagen */}
        <Box 
          sx={{ 
            position: "absolute", 
            top: 12, 
            left: 12, 
            display: "flex",
            gap: 0.75,
            flexWrap: "wrap",
            maxWidth: "calc(100% - 24px)",
            zIndex: 2
          }}
        >
          {skills.slice(0, 3).map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              size="small"
              sx={{
                bgcolor: alpha(corePurple1, 0.2),
                color: "white",
                fontWeight: 500,
                fontSize: "0.7rem",
                height: 24,
                borderRadius: "4px",
                mb: 0.5,
                backdropFilter: "blur(4px)",
                border: "1px solid",
                borderColor: alpha("#fff", 0.3),
                "& .MuiChip-label": {
                  px: 1,
                }
              }}
            />
          ))}
          {skills.length > 3 && (
            <Chip
              label={`+${skills.length - 3}`}
              size="small"
              sx={{
                bgcolor: alpha("#fff", 0.2),
                color: "white",
                fontWeight: 500,
                fontSize: "0.7rem",
                height: 24,
                borderRadius: "4px",
                mb: 0.5,
                backdropFilter: "blur(4px)",
                border: "1px solid",
                borderColor: alpha("#fff", 0.3),
              }}
            />
          )}
        </Box>
      </CardMedia>
      
      {/* Contenido de la certificación */}
      <CardContent
        sx={{
          p: 2.5,
          pb: "16px !important", // Sobrescribe el padding-bottom aplicado por MaterialUI
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          position: "relative",
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: "1rem",
              mb: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.4,
              color: "#333",
              minHeight: "2.8rem", // Mantiene altura consistente para títulos
            }}
          >
            {title}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            {duration}
          </Typography>
        </Box>
        
        {/* Botones de acción */}
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            mt: 1.5
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={handleTakeCourse}
            sx={{
              bgcolor: corePurple1,
              fontWeight: 500,
              textTransform: "none",
              px: 2,
              fontSize: "0.8rem",
              borderRadius: 6,
              "&:hover": {
                bgcolor: corePurple2,
                boxShadow: `0 2px 8px ${alpha(corePurple1, 0.25)}`,
              },
              transition: "background-color 0.2s, box-shadow 0.2s",
              height: 32,
            }}
          >
            Take course
          </Button>
          
          <Tooltip title="View details">
            <IconButton
              size="small"
              onClick={handleViewDetails}
              sx={{
                color: corePurple3,
                bgcolor: alpha(corePurple1, 0.08),
                "&:hover": {
                  bgcolor: alpha(corePurple1, 0.15),
                },
                transition: "background-color 0.2s",
                width: 32,
                height: 32,
              }}
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CertificationCard;