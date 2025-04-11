// src/components/dashboard/MyPathTimeline.jsx
import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme,
  CircularProgress
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import CodeIcon from "@mui/icons-material/Code";

export const MyPathTimeline = ({ items: initialItems }) => {
  const theme = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Simular carga de datos
  useEffect(() => {
    // Mostrar indicador de carga
    setLoading(true);
    
    // Simular llamada a API con retraso
    const timer = setTimeout(() => {
      setItems(initialItems || []);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [initialItems]);
  
  // Función para formatear fechas en el formato "MM | DD | YYYY"
  const formatDate = (dateString) => {
    if (!dateString) return "Soon";
    const [year, month, day] = dateString.split("-");
    return `${month} | ${day} | ${year}`;
  };
  
  // Ordenar los items por fecha
  const sortedItems = [...items].sort((a, b) => {
    if (!a.date) return -1;
    if (!b.date) return 1;
    return new Date(b.date) - new Date(a.date);
  });
  
  // Renderizar el contenido principal
  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress size={30} />
        </Box>
      );
    }
    
    if (sortedItems.length === 0) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
          <SchoolIcon sx={{ fontSize: 40, color: theme.palette.text.disabled, mb: 1 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            No hay elementos para mostrar
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box
        sx={{
          position: "relative",
          ml: 2,
          overflowY: "auto",
          overflowX: "hidden",
          height: "calc(100% - 40px)",
          // Timeline vertical line
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 8,
            width: 2,
            bgcolor: "#ccc",
          }
        }}
      >
        {sortedItems.map((item, index) => {
          const isFirstItem = index === 0;
          const isProject = item.type === "Project";
          const color = isFirstItem
            ? "#ccc"
            : isProject
            ? theme.palette.primary.main
            : theme.palette.secondary.main;

          // Determinar si debe mostrar "AI Suggested" para items con "Soon"
          const showAISuggested = !item.date;
          
          return (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                position: "relative",
                mb: 3,
                ml: 3,
                p: 1.5,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 1,
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              {/* Timeline dot */}
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  backgroundColor: color,
                  position: "absolute",
                  left: -22,
                  top: "20%",
                  transform: "translateY(-50%)",
                }}
              />
              {/* Left content */}
              <Box sx={{ flex: 1, pr: 2 }}>
                <Typography
                  fontWeight={600}
                  variant="subtitle2"
                  sx={{
                    color: theme.palette.text.primary,
                    fontSize: "0.9rem",
                    wordBreak: "break-word",
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ 
                    color: showAISuggested 
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary
                  }}
                >
                  {showAISuggested ? "AI Suggested Certificate" : item.type}
                </Typography>
              </Box>
              {/* Right date */}
              <Typography
                variant="caption"
                sx={{
                  whiteSpace: "nowrap",
                  color: theme.palette.text.disabled,
                  fontSize: "0.75rem",
                }}
              >
                {formatDate(item.date)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };
  
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 1,
        height: "100%",
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        overflow: "hidden",
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          MyPath
        </Typography>
      </Box>
      
      {renderContent()}
    </Paper>
  );
};