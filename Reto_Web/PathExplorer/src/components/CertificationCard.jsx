// src/components/CertificationCard.jsx
import { Paper, Typography, Box, Button, Chip } from "@mui/material";
import React from "react";

export const CertificationCard = ({ 
  title, 
  url, 
  skills = [], 
  backgroundImage = '/default-certification.jpg',
  isListView = false,
  duration = "40 hours",
  level = "Beginner"
}) => {
  // Función para abrir el URL del curso en una nueva pestaña
  const handleTakeCourse = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Función para manejar el clic en "Details" (puedes personalizarla según necesites)
  const handleViewDetails = () => {
    // Aquí podrías implementar una navegación a una página de detalles o mostrar un modal
    console.log("Ver detalles de:", title);
  };

  return (
    <Paper
      elevation={1}
      sx={{
        height: "auto",
        borderRadius: 2,
        overflow: "hidden",
        display: "flex",
        flexDirection: isListView ? "row" : "column",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
        },
      }}
    >
      {/* Main image area */}
      <Box
        sx={{
          height: isListView ? "100%" : 200,
          width: isListView ? 200 : "100%", 
          position: "relative",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          flexShrink: 0,
        }}
      >
        {/* Skills tags */}
        <Box 
          sx={{ 
            position: "absolute", 
            top: 12, 
            left: 12, 
            display: "flex",
            gap: 0.75,
            flexWrap: "wrap",
            maxWidth: isListView ? "180px" : "auto",
          }}
        >
          {skills.map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              size="small"
              sx={{
                bgcolor: "#973EBC", // Usar el color primario del tema para todas las skills
                color: "white",
                fontWeight: 500,
                fontSize: "0.7rem",
                height: 24,
                borderRadius: "16px",
                mb: 0.5,
              }}
            />
          ))}
        </Box>
      </Box>
      
      {/* Bottom bar with title and action button */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          bgcolor: "#ffffff",
          borderTop: isListView ? "none" : "1px solid #f0f0f0",
          flex: 1,
        }}
      >
        <Box>
          <Typography
            sx={{
              color: "#333",
              fontWeight: 600,
              fontSize: "1rem",
              mb: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {title}
          </Typography>
          
          {isListView && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2 }}>
              {skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  sx={{
                    bgcolor: "#973EBC",
                    color: "white",
                    fontSize: "0.7rem",
                    height: 24,
                  }}
                />
              ))}
            </Box>
          )}
          
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, fontSize: "0.85rem" }}
          >
            Duration: {duration}
          </Typography>
        </Box>
        
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleTakeCourse} // Agregar el manejador de eventos para abrir la URL
            sx={{
              bgcolor: "#973EBC",
              color: "#fff",
              textTransform: "none", 
              px: 3,
              fontSize: "0.8rem",
              boxShadow: "none",
              borderRadius: "20px",
              "&:hover": {
                bgcolor: "#7b2e9e",
                boxShadow: "0 4px 8px rgba(151, 62, 188, 0.3)",
              }
            }}
          >
            Take course
          </Button>
          
          <Button
            variant="text"
            size="small"
            onClick={handleViewDetails} // Agregar el manejador de eventos para ver detalles
            sx={{
              color: "#973EBC",
              textTransform: "none",
              fontSize: "0.8rem",
            }}
          >
            Details
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default CertificationCard;