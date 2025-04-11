// src/components/IconInfo.jsx
import React from "react";
import { Box, Paper, Typography, Avatar, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";

export const IconInfo = ({ icon: Icon, title, value, color = "primary" }) => {
  const theme = useTheme();
  
  // Función para obtener el color según el tipo
  const getColor = () => {
    switch (color) {
      case "primary":
        return theme.palette.primary.main;
      case "secondary":
        return theme.palette.secondary.main;
      case "accent":
        return "#ff9800"; // Color naranja para "accent"
      default:
        return theme.palette.primary.main;
    }
  };
  
  const colorMain = getColor();
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: "100%",
        display: "flex",
        alignItems: "center",
        borderRadius: 2,
        boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
        transition: "transform 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
        },
      }}
    >
      {/* Icono con fondo */}
      <Avatar
        sx={{
          bgcolor: alpha(colorMain, 0.1),
          color: colorMain,
          width: 50,
          height: 50,
          mr: 2,
        }}
      >
        <Icon />
      </Avatar>
      
      {/* Información */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" fontWeight="bold" color={colorMain}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
    </Paper>
  );
};