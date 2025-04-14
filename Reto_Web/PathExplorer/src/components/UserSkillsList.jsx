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
  Button,
  CircularProgress
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { supabase } from "../supabase/supabaseClient";

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

export const UserSkillsList = ({ userRole, userId }) => {
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user skills based on role
        let query = supabase
          .from('UserSkill')
          .select(`skill_ID, 
            user_ID, 
            proficiency,
            Skill (
            name, 
            category,
            type
            )
            `)
          .eq('user_ID', userId)

        if (userRole) {
          query = query.eq('name', userRole.toLowerCase());
        }

        const { data, error: queryError } = await query
          .order('name', { ascending: false })
          .limit(5);

        if (queryError) throw queryError;

        if (data && data.length > 0) {
          setSkills(data);
        } else {
          // Fallback data
          setSkills(getFallbackSkills(userRole));
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
        setError(error.message);
        setSkills(getFallbackSkills(userRole));
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchSkills();
    }
  }, [userRole, userId]);

  // Fallback skills data
  const getFallbackSkills = (role) => {
    const commonSkills = [
      { name: "JavaScript", projects: 32 },
      { name: "React", projects: 28 },
      { name: "Node.js", projects: 25 },
      { name: "HTML/CSS", projects: 22 },
      { name: "Git", projects: 18 }
    ];

    const frontendSkills = [
      { name: "React", projects: 45 },
      { name: "JavaScript", projects: 42 },
      { name: "TypeScript", projects: 28 },
      { name: "HTML/CSS", projects: 35 },
      { name: "UI/UX", projects: 15 }
    ];

    const backendSkills = [
      { name: "Node.js", projects: 36 },
      { name: "Python", projects: 32 },
      { name: "SQL", projects: 28 },
      { name: "Docker", projects: 22 },
      { name: "API Design", projects: 18 }
    ];

    switch(role) {
      case "Frontend":
        return frontendSkills;
      case "Backend":
        return backendSkills;
      default:
        return commonSkills;
    }
  };

  // Función para obtener el icono por tipo de skill
  const getSkillIcon = (skillName) => {
    const lowerSkill = skillName.toLowerCase();
    
    if (lowerSkill.includes('react') || lowerSkill.includes('javascript') || lowerSkill.includes('typescript')) {
      return <JavascriptIcon fontSize="small" />;
    }
    if (lowerSkill.includes('node') || lowerSkill.includes('python') || lowerSkill.includes('java')) {
      return <CodeIcon fontSize="small" />;
    }
    if (lowerSkill.includes('html') || lowerSkill.includes('css') || lowerSkill.includes('ui/ux')) {
      return <LaptopIcon fontSize="small" />;
    }
    if (lowerSkill.includes('sql') || lowerSkill.includes('database') || lowerSkill.includes('mongodb')) {
      return <StorageOutlinedIcon fontSize="small" />;
    }
    if (lowerSkill.includes('docker') || lowerSkill.includes('kubernetes') || lowerSkill.includes('devops')) {
      return <CloudIcon fontSize="small" />;
    }
    if (lowerSkill.includes('git') || lowerSkill.includes('github') || lowerSkill.includes('version')) {
      return <DataObjectIcon fontSize="small" />;
    }
    if (lowerSkill.includes('security') || lowerSkill.includes('cyber') || lowerSkill.includes('auth')) {
      return <SecurityIcon fontSize="small" />;
    }
    if (lowerSkill.includes('analytics') || lowerSkill.includes('data') || lowerSkill.includes('ai')) {
      return <AnalyticsIcon fontSize="small" />;
    }
    if (lowerSkill.includes('mobile') || lowerSkill.includes('ios') || lowerSkill.includes('android')) {
      return <PhoneIphoneIcon fontSize="small" />;
    }
    return <CodeIcon fontSize="small" />;
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={24} />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3, height: '100%', textAlign: 'center' }}>
        <Typography color="error">Error loading skills</Typography>
      </Paper>
    );
  }
  
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
          Top Skills ({userRole || 'Full Stack'})
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
          View All
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
                      {skill.projects} Available Projects
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