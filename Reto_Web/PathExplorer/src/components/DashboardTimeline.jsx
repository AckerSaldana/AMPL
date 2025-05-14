import React from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  alpha,
  Button
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SchoolIcon from "@mui/icons-material/School";
import { useNavigate } from "react-router-dom";

// Componente que muestra un elemento de la timeline
const DashboardTimelineItem = ({ item, isLast = false, profilePurple }) => {
  // Determinamos el tipo (certification o project)
  const isProject = item.type === "Project";
  
  // Extraemos el título real de la certificación o proyecto
  // Según el esquema de la BD, el título está en el campo 'title'
  const title = item.name || "Untitled"; 
  
  // Extraemos la fecha que queremos mostrar
  const dateDisplay = item.displayDate || "May 2025";

  return (
    <Box
      sx={{
        display: "flex",
        position: "relative",
        mb: isLast ? 0 : 3,
        ml: 3,
        p: 1.5,
        px: 2.5,
        backgroundColor: '#ffffff',
        borderRadius: 1,
        alignItems: "center", // Centrado vertical
        justifyContent: "space-between",
        border: `1px solid ${alpha(profilePurple, 0.1)}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}
    >
      {/* Punto de la timeline */}
      <Box
        sx={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          backgroundColor: profilePurple,
          position: "absolute",
          left: -31,
          top: "50%",
          transform: "translateY(-50%)",
          border: `2px solid white`,
          boxShadow: '0 0 0 2px rgba(0,0,0,0.03)'
        }}
      />
      
      {/* Contenido izquierdo */}
      <Box sx={{ flex: 1, pr: 2 }}>
        <Typography
          fontWeight={600}
          variant="subtitle2"
          sx={{
            color: "text.primary",
            fontSize: "0.9rem",
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{ 
            color: "text.secondary",
            fontSize: "0.8rem"
          }}
        >
          {item.type || "Certification"}
        </Typography>
      </Box>
      
      {/* Fecha a la derecha */}
      <Typography
        variant="caption"
        sx={{
          whiteSpace: "nowrap",
          color: "text.secondary",
          fontSize: "0.8rem",
          fontWeight: 500
        }}
      >
        {dateDisplay}
      </Typography>
    </Box>
  );
};

// Componente principal de Timeline
const DashboardTimeline = ({ items = [], profilePurple }) => {
  const navigate = useNavigate();
  
  // Si no hay items o no es un array, usamos datos de respaldo
  const fallbackItems = [
    { id: 1, type: "certification", title: "AWS Cloud Practitioner", displayDate: "May 2025" },
    { id: 2, type: "certification", title: "Azure Fundamentals", displayDate: "May 2025" },
    { id: 3, type: "certification", title: "Google Cloud Associate", displayDate: "May 2025" }
  ];
  
  // Nos aseguramos de que items sea un array y limitamos a 3 elementos
  const safeItems = Array.isArray(items) && items.length > 0 
    ? items.slice(0, 3) 
    : fallbackItems;

  // Debug - imprimimos en consola para ver los datos
  console.log("Timeline items:", safeItems);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        bgcolor: '#ffffff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        mb: 3
      }}
    >
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid',
        borderColor: alpha(profilePurple, 0.1),
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SchoolIcon 
            sx={{ 
              color: profilePurple, 
              mr: 1.5,
              fontSize: 20
            }} 
          />
          <Typography variant="h6" fontWeight={500} sx={{ fontSize: '1.125rem' }}>
            MyPath Timeline
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            endIcon={<ArrowForwardIcon sx={{ fontSize: '0.9rem' }} />}
            sx={{
              color: profilePurple,
              fontWeight: 400,
              fontSize: '0.75rem',
              textTransform: 'none',
              '&:hover': { bgcolor: 'transparent' }
            }}
            onClick={() => navigate('/mypath')}
          >
            View MyPath
          </Button>
        </Box>
      </Box>
      
      {/* Contenido de la timeline */}
      <Box
        sx={{
          position: "relative",
          ml: 2,
          p: 2,
          // Línea vertical de la timeline
          "&::before": {
            content: '""',
            position: "absolute",
            top: 16,
            bottom: 30,
            left: 16,
            width: 2,
            bgcolor: alpha(profilePurple, 0.2),
          }
        }}
      >
        {safeItems.map((item, index) => (
          <DashboardTimelineItem 
            key={index}
            item={item}
            isLast={index === safeItems.length - 1}
            profilePurple={profilePurple}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default DashboardTimeline;