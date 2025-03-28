// src/components/dashboard/PopularCertifications.jsx
import React from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme, 
  Card, 
  CardContent, 
  Avatar,
  Chip,
  Button
} from "@mui/material";
import { alpha } from "@mui/material/styles";

// Iconos
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import StorageIcon from "@mui/icons-material/Storage";
import CodeIcon from "@mui/icons-material/Code";
import WorkIcon from "@mui/icons-material/Work";
import CodeOffIcon from "@mui/icons-material/CodeOff";
import CloudIcon from "@mui/icons-material/Cloud";
import DataObjectIcon from "@mui/icons-material/DataObject";
import SecurityIcon from "@mui/icons-material/Security";
import AnalyticsIcon from "@mui/icons-material/Analytics";

export const PopularCertifications = ({ certifications }) => {
  const theme = useTheme();
  
  // Función para obtener el icono según el tipo
  const getIconByType = (iconType) => {
    switch (iconType) {
      case 'Storage': return <StorageIcon />;
      case 'Code': return <CodeIcon />;
      case 'Work': return <WorkIcon />;
      case 'CodeOff': return <CodeOffIcon />;
      case 'Cloud': return <CloudIcon />;
      case 'DataObject': return <DataObjectIcon />;
      case 'Security': return <SecurityIcon />;
      case 'Analytics': return <AnalyticsIcon />;
      default: return <EmojiEventsIcon />;
    }
  };
  
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        height: '100%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main, mr: 2 }}>
          <EmojiEventsIcon />
        </Avatar>
        <Typography variant="h6" fontWeight="bold">Certificaciones populares</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button 
          size="small"
          color="secondary"
          endIcon={<ArrowForwardIosIcon sx={{ fontSize: '0.8rem' }} />}
          sx={{ 
            textTransform: 'none',
            fontSize: '0.8rem'
          }}
        >
          Ver todas
        </Button>
      </Box>
      
      <Box sx={{ px: 0.5 }}>
        {certifications.map((cert) => (
          <Card 
            key={cert.id}
            elevation={0}
            sx={{
              mb: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha(theme.palette.secondary.main, 0.2),
              transition: 'all 0.2s ease',
              overflow: 'visible',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: `0 8px 15px ${alpha(theme.palette.secondary.main, 0.15)}`,
              }
            }}
          >
            <CardContent sx={{ py: 2, px: 2, position: 'relative' }}>
              {/* Indicador de popularidad */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: -10, 
                  right: 16,
                  px: 1,
                  py: 0.5,
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  color: '#fff',
                  bgcolor: theme.palette.secondary.main,
                  borderRadius: 1,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  zIndex: 1,
                }}
              >
                {cert.popularity}% popular
              </Box>
            
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: theme.palette.secondary.main,
                    mr: 1.5
                  }}
                >
                  {getIconByType(cert.iconType)}
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight="bold" gutterBottom>
                    {cert.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={cert.category} 
                      size="small"
                      sx={{ 
                        height: 20,
                        fontSize: '0.7rem',
                        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                        color: theme.palette.secondary.main,
                        fontWeight: 'medium'
                      }}
                    />
                    
                    <Typography variant="caption" color="text.secondary">
                      {cert.completions} certificaciones
                    </Typography>
                  </Box>
                  
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    endIcon={<OpenInNewIcon fontSize="small" />}
                    sx={{
                      mt: 1.5,
                      borderRadius: 1,
                      textTransform: 'none',
                      opacity: 0.9,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Ver detalles
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Paper>
  );
};