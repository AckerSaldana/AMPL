import React from "react";
import { Box, Typography, Paper, useMediaQuery, useTheme } from "@mui/material";

/**
 * Componente para mostrar estadísticas generales con el diseño de la imagen de referencia
 * @param {Object} props - Propiedades del componente
 * @param {React.Component} props.icon - Componente de icono a mostrar
 * @param {string} props.title - Título de la estadística
 * @param {number|string} props.value - Valor de la estadística
 * @param {string} props.bgColor - Color de fondo del icono (formato rgba o hex)
 */
const StatCard = ({ icon: Icon, title, value, bgColor, darkMode = false }) => {
  const theme = useTheme();
  
  // Media queries más específicos para un comportamiento responsivo más preciso
  const isSmallScreen = useMediaQuery('(max-width:599px)');
  const isMediumScreen = useMediaQuery('(min-width:600px) and (max-width:959px)');
  const isLargeScreen = useMediaQuery('(min-width:960px)');
  const isExtraSmallScreen = useMediaQuery('(max-width:320px)');
  
  // Calculamos los tamaños dependiendo del breakpoint para evitar compresión
  const getIconSize = () => {
    if (isExtraSmallScreen) return 32;
    if (isSmallScreen) return 36;
    return 42;
  };
  
  const getFontSize = () => {
    if (isExtraSmallScreen) return "1.25rem";
    if (isSmallScreen) return "1.5rem";
    return "2rem";
  };
  
  const getLayout = () => {
    // En pantallas extra pequeñas o cuando hay poco espacio horizontal, usamos layout horizontal
    if (isExtraSmallScreen) return "row";
    
    // En pantallas pequeñas a medianas, adaptamos según sea necesario
    if (isSmallScreen) return "row";
    
    // En tablets y dispositivos medianos, podría ser mejor un layout vertical
    if (isMediumScreen) return "row";
    
    // En pantallas grandes, volvemos al layout horizontal
    return "row";
  };
  
  const iconSize = getIconSize();
  const fontSize = getFontSize();
  const layout = getLayout();
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: isExtraSmallScreen ? 1.5 : (isSmallScreen ? 2 : 3), 
        borderRadius: 2,
        height: "100%",
        display: "flex",
        alignItems: "center",
        width: "100%",
        boxSizing: "border-box",
        // Ensure the card doesn't get squished too much
        minWidth: isExtraSmallScreen ? "100%" : 180,
        backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
        boxShadow: darkMode ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.04)'
      }}
    >
      <Box sx={{ 
        display: "flex", 
        alignItems: "center",
        flexDirection: layout,
        width: "100%",
        justifyContent: "flex-start", // Align content to start for better spacing
        textAlign: layout === "column" ? "center" : "left"
      }}>
        <Box
          sx={{
            width: iconSize,
            height: iconSize,
            borderRadius: "50%",
            bgcolor: bgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: layout === "row" ? 2 : 0,
            mb: layout === "column" ? 1.5 : 0,
            flexShrink: 0 // Prevent the icon from shrinking
          }}
        >
          <Icon sx={{ 
            color: "white",
            fontSize: iconSize * 0.55 // Scale icon with container
          }} />
        </Box>
        <Box sx={{
          flex: 1,
          minWidth: 0 // Allow the box to shrink below its content size
        }}>
          <Typography 
            variant={isSmallScreen ? "h5" : "h4"} 
            fontWeight={500} 
            color={darkMode ? '#ffffff' : bgColor.replace("20", "").replace("30", "")}
            sx={{
              mb: 0.5,
              fontSize,
              lineHeight: 1.2,
              // Ensure very long numbers don't break layout
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {value}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
              // Handle long titles
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
            }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default StatCard;