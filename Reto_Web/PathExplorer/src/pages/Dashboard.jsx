// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  useTheme, 
  Button,
  Container
} from "@mui/material";
import { alpha } from "@mui/material/styles";

// Componentes personalizados
import { IconInfo } from "../components/IconInfo";
import { CertificationGrid } from "../components/CertificationGrid";
import { MyPathTimeline } from "../components/MyPathTimeline";
import { CalendarWithReminders } from "../components/CalendarWithReminders";
import { UserSkillsList } from "../components/UserSkillsList";
import { PopularCertifications } from "../components/PopularCertifications";

import useAuth from "../hooks/useAuth";

// Iconos
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const Dashboard = () => {
  const theme = useTheme();
  const { user, role } = useAuth();
  const [pathItems, setPathItems] = useState([]);

  const today = new Date();
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);
  const finalDate = formattedDate;

  // Efecto para cargar datos de path
  useEffect(() => {
    // Datos de ejemplo para la ruta de desarrollo
    const mockPathData = [
      {
        id: 1,
        title: "Advanced React and Node JS Certificate",
        type: "AI Suggested Certificate",
        date: null,
      },
      {
        id: 2,
        title: "Certificate: AWS Certified Solutions Architect",
        type: "Certificate",
        date: "2025-02-26",
      },
      {
        id: 3,
        title: "Netflix Database Management",
        type: "Project",
        date: "2025-02-20",
      },
      {
        id: 4,
        title: "Disney App Project",
        type: "Project",
        date: "2025-01-20",
      }
    ];

    // Simular una llamada a API
    setTimeout(() => {
      setPathItems(mockPathData);
    }, 500);
  }, []);

  // Datos de ejemplo para eventos del calendario (ahora recordatorios)
  const calendarEvents = [
    {
      id: 1,
      date: "12 Feb 2025",
      title: "React Certification"
    },
    {
      id: 2,
      date: "15 Feb 2025",
      title: "HTML Certification"
    },
    {
      id: 3,
      date: "20 Feb 2025",
      title: "Vite course"
    },
    {
      id: 4,
      date: "28 Feb 2025",
      title: "From Zero to Hero: Python Masterclass"
    }
  ];
  
  // Datos de ejemplo para certificaciones más populares
  const topCertifications = [
    { 
      id: 1, 
      name: "AWS Certified Cloud Practitioner", 
      category: "Cloud",
      completions: 258,
      popularity: 92,
      iconType: "Storage"
    },
    { 
      id: 2, 
      name: "React Professional Developer", 
      category: "Frontend",
      completions: 189,
      popularity: 87,
      iconType: "Code"
    },
    { 
      id: 3, 
      name: "Scrum Master Professional", 
      category: "Metodologías",
      completions: 173,
      popularity: 83,
      iconType: "Work"
    }
  ];
  
  // Determinar qué conjunto de habilidades mostrar según el rol
  const userRole = role || "Full Stack";

  return (
    <Box sx={{ 
      pt: 2, 
      pb: 4, 
      px: { xs: 2, md: 3 }, 
      bgcolor: '#f8f9fa',
      minHeight: "calc(100vh - 60px)" 
    }}>
      {/* Banner superior con bienvenida personalizada */}
      <Paper 
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          background: `linear-gradient(135deg, #8e24aa 0%, #9c27b0 100%)`,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff',
          boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            Welcome back ! 
          </Typography>
          <Typography variant="body1">
            Today is {finalDate}
          </Typography>
        </Box>
        <Box sx={{ mt: { xs: 2, md: 0 } }}>
          <Button 
            variant="contained" 
            sx={{ 
              borderRadius: 8, 
              px: 3, 
              py: 1,
              textTransform: 'none',
              fontWeight: 500,
              bgcolor: '#ffffff',
              color: '#8e24aa',
              '&:hover': {
                bgcolor: '#f5f5f5',
              }
            }}
          >
            Explorar certificaciones
          </Button>
        </Box>
      </Paper>

      {/* Certificaciones Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <Paper
            sx={{
              p: 2,
              bgcolor: '#fff',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <Box 
              sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: '50%', 
                bgcolor: alpha('#9c27b0', 0.1), 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 2
              }}
            >
              <InsertDriveFileIcon sx={{ color: '#9c27b0' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="medium" color="#9c27b0">
                15
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available Certifications
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper
            sx={{
              p: 2,
              bgcolor: '#fff',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <Box 
              sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: '50%', 
                bgcolor: alpha('#2196f3', 0.1), 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 2
              }}
            >
              <CheckCircleIcon sx={{ color: '#2196f3' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="medium" color="#2196f3">
                6
              </Typography>
              <Typography variant="body2" color="text.secondary">
              Completed Certifications
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper
            sx={{
              p: 2,
              bgcolor: '#fff',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <Box 
              sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: '50%', 
                bgcolor: alpha('#ff9800', 0.1), 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 2
              }}
            >
              <PendingIcon sx={{ color: '#ff9800' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="medium" color="#ff9800">
                2
              </Typography>
              <Typography variant="body2" color="text.secondary">
                On progress certifications
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Sección principal */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: -1.5 }}>
        {/* Columna izquierda con calendario y MyPath */}
        <Box sx={{ 
          width: { xs: '100%', md: '370px' }, 
          padding: 1.5,
          flexShrink: 0
        }}>
          <Box sx={{ mb: 3 }}>
            <Paper
              sx={{
                bgcolor: '#fff',
                borderRadius: 2,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                overflow: 'hidden'
              }}
            >
              <CalendarWithReminders events={calendarEvents} />
            </Paper>
          </Box>
          
          <Box>
            <MyPathTimeline items={pathItems} />
          </Box>
        </Box>
        
        {/* Columna derecha con habilidades, certificaciones y más */}
        <Box sx={{ 
          flex: 1,
          padding: 1.5,
          minWidth: { xs: '100%', md: 0 }
        }}>
          {/* Fila superior: Skills y Certificaciones populares */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 3, mx: -1.5 }}>
            {/* Top Skills */}
            <Box sx={{ 
              width: { xs: '100%', lg: '50%' }, 
              px: 1.5, 
              mb: { xs: 3, lg: 0 } 
            }}>
              <UserSkillsList userRole={userRole} />
            </Box>
            
            {/* Certificaciones populares */}
            <Box sx={{ width: { xs: '100%', lg: '50%' }, px: 1.5 }}>
              <PopularCertifications certifications={topCertifications} />
            </Box>
          </Box>
          
          {/* Certificaciones Grid */}
          <Box>
            <CertificationGrid />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;