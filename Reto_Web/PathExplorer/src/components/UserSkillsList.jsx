// src/components/dashboard/UserSkillsList.jsx
import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme, 
  Card, 
  CardContent, 
  Avatar,
  Button
} from "@mui/material";
import { alpha } from "@mui/material/styles";

// Iconos
import CodeIcon from "@mui/icons-material/Code";
import LaptopIcon from "@mui/icons-material/Laptop";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import DataObjectIcon from "@mui/icons-material/DataObject";
import CloudIcon from "@mui/icons-material/Cloud";
import SecurityIcon from "@mui/icons-material/Security";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import JavascriptIcon from "@mui/icons-material/Javascript";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

// Datos de ejemplo para habilidades basadas en el rol
const getFrontendSkills = () => [
  { name: "React", projects: 32 },
  { name: "JavaScript", projects: 45 },
  { name: "TypeScript", projects: 28 },
  { name: "UI/UX", projects: 15 },
  { name: "Angular", projects: 12 }
];

const getBackendSkills = () => [
  { name: "Node.js", projects: 24 },
  { name: "Python", projects: 36 },
  { name: "SQL", projects: 40 },
  { name: "MongoDB", projects: 18 },
  { name: "AWS", projects: 22 }
];

const getFullstackSkills = () => [
  { name: "React", projects: 25 },
  { name: "Node.js", projects: 22 },
  { name: "MongoDB", projects: 20 },
  { name: "TypeScript", projects: 30 },
  { name: "AWS", projects: 15 }
];

export const UserSkillsList = ({ userRole }) => {
  const theme = useTheme();
  const [skills, setSkills] = useState([]);
  
  // Cargar habilidades basadas en el rol
  useEffect(() => {
    let skillsData;
    switch(userRole) {
      case "Frontend":
        skillsData = getFrontendSkills();
        break;
      case "Backend":
        skillsData = getBackendSkills();
        break;
      default:
        skillsData = getFullstackSkills();
    }
    setSkills(skillsData);
  }, [userRole]);
  
  // Función para obtener el icono por tipo de skill
  const getSkillIcon = (type) => {
    switch (type) {
      case 'JavaScript':
      case 'TypeScript':
        return <JavascriptIcon fontSize="small" />;
      case 'React':
      case 'Angular':
      case 'Vue':
        return <LaptopIcon fontSize="small" />;
      case 'Node.js':
      case 'Express':
        return <CodeIcon fontSize="small" />;
      case 'Python':
      case 'Django':
      case 'Flask':
        return <CodeIcon fontSize="small" />;
      case 'SQL':
      case 'PostgreSQL':
      case 'MongoDB':
        return <StorageOutlinedIcon fontSize="small" />;
      case 'UI/UX':
      case 'Figma':
        return <DesignServicesIcon fontSize="small" />;
      case 'AWS':
      case 'Azure':
      case 'GCP':
        return <CloudIcon fontSize="small" />;
      case 'DevOps':
      case 'Docker':
      case 'Kubernetes':
        return <DataObjectIcon fontSize="small" />;
      case 'Mobile':
      case 'React Native':
      case 'Flutter':
        return <PhoneIphoneIcon fontSize="small" />;
      case 'AI/ML':
        return <AutoFixHighIcon fontSize="small" />;
      default:
        return <CodeIcon fontSize="small" />;
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
        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, mr: 2 }}>
          <CodeIcon />
        </Avatar>
        <Typography variant="h6" fontWeight="bold">
          Top Skills ({userRole})
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button 
          size="small" 
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
        {skills.map((skill) => (
          <Card
            key={skill.name}
            elevation={0}
            sx={{
              mb: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.2),
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: `0 6px 15px ${alpha(theme.palette.primary.main, 0.15)}`,
              }
            }}
          >
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 38, 
                      height: 38, 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      mr: 2
                    }}
                  >
                    {getSkillIcon(skill.name)}
                  </Avatar>
                  
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {skill.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {skill.projects} proyectos disponibles
                    </Typography>
                  </Box>
                </Box>
              
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Paper>
  );
};