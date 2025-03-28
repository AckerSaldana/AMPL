// src/components/CertificationCard.jsx
import { Paper, Typography, Box, Button, Chip } from "@mui/material";
import React from "react";

export const CertificationCard = ({ title, url, skills = [], backgroundImage = '/default-certification.jpg' }) => {
  return (
    <Paper
      elevation={1}
      sx={{
        height: "auto",
        borderRadius: 2,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Main image area */}
      <Box
        sx={{
          height: 200,
          position: "relative",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
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
          }}
        >
          {skills.map((skill, index) => {
            // Determinar el color basado en el skill
            let bgColor;
            switch(skill) {
              case "Cloud":
                bgColor = "#9c27b0"; // Morado
                break;
              case "Python":
                bgColor = "#9c27b0"; // Morado
                break;
              case "SQL":
                bgColor = "#8e24aa"; // Morado más oscuro
                break;
              case "AWS":
                bgColor = "#2196f3"; // Azul
                break;
              case "Azure":
                bgColor = "#00bcd4"; // Cyan
                break;
              case "Cybersecurity":
                bgColor = "#9c27b0"; // Morado
                break;
              case "Networks":
              case "Networking":
                bgColor = "#673ab7"; // Morado azulado
                break;
              case "ISC2":
              case "Kali":
                bgColor = "#9c27b0"; // Morado
                break;
              default:
                bgColor = "#9c27b0"; // Morado por defecto
            }
            
            return (
              <Chip
                key={index}
                label={skill}
                size="small"
                sx={{
                  bgcolor: bgColor,
                  color: "white",
                  fontWeight: 500,
                  fontSize: "0.7rem",
                  height: 24,
                  borderRadius: "16px",
                }}
              />
            );
          })}
        </Box>
      </Box>
      
      {/* Bottom bar with title and action button */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#ffffff",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <Typography
          sx={{
            color: "#333",
            fontWeight: 500,
            fontSize: "0.95rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </Typography>
        
        <Button
          variant="contained"
          size="small"
          sx={{
            bgcolor: "#9e9e9e",
            color: "#fff",
            textTransform: "none", 
            minWidth: 0,
            px: 2,
            ml: 1,
            fontSize: "0.8rem",
            boxShadow: "none",
            "&:hover": {
              bgcolor: "#757575",
              boxShadow: "none",
            }
          }}
        >
          Take
        </Button>
      </Box>
    </Paper>
  );
};