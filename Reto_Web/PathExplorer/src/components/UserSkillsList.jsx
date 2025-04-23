// src/components/dashboard/UserSkillsList.jsx
import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Paper,  
  Card, 
  CardContent, 
  Avatar,
  Button,
  CircularProgress
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
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
  const theme = useTheme();
  const [skills, setSkills] = useState([]);
  const [roleName, setRoleName] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setIsLoading(true);
        
        const { data: userSkills, error: queryError } = await supabase
        .from('UserSkill')
        .select('skill_ID, proficiency')
        .eq('user_ID', userId)
        .limit(5);

        if (queryError) throw queryError;       

        // Obtener los nombres de las skills
        const skillIds = userSkills.map(s => s.skill_ID);

        if (skillIds.length === 0) {
          setSkills([]);
          return;
        }

        const { data: skillNames, error: skillError } = await supabase
        .from('Skill')
        .select('skill_ID, name')
        .in('skill_ID', skillIds);

        if (skillError) throw skillError;

        const skillMap = Object.fromEntries(skillNames.map(s => [s.skill_ID, s.name]));

        setSkills(userSkills.map(s => ({
          name: skillMap[s.skill_ID] || 'Unknown',
          proficiency: s.proficiency || 0
        })));
        } catch (error) {
        console.error("Error fetching skills:", error);
        setError(error.message);
        setSkills(getFallbackSkills(userRole));
  } finally {
    setIsLoading(false);
  }
};

const fetchUserRole = async () => {
  const { data, error } = await supabase
    .from('UserRole')
    .select('role_name')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error("Error fetching user role:", error);
  } else {
    setRoleName(data?.role_name || 'Full Stack');
  }
};


    if (userId) {
      fetchSkills();
      fetchUserRole();
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

  const iconList = [
    <CodeIcon fontSize="small" />,
    <LaptopIcon fontSize="small" />,
    <StorageOutlinedIcon fontSize="small" />,
    <DataObjectIcon fontSize="small" />,
    <CloudIcon fontSize="small" />,
    <SecurityIcon fontSize="small" />,
    <AnalyticsIcon fontSize="small" />,
    <JavascriptIcon fontSize="small" />,
    <DesignServicesIcon fontSize="small" />,
    <PhoneIphoneIcon fontSize="small" />,
    <AutoFixHighIcon fontSize="small" />
  ];
  
  const getSkillIcon = (skillName) => {
    const index = [...skillName].reduce((acc, char) => acc + char.charCodeAt(0), 0) % iconList.length;
    return iconList[index];
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
          Top Skills ({roleName || 'Full Stack'})
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

                    <Typography variant="caption" color="text.secondary" display="block">
                      Proficiency: <Box component="span" fontWeight="bold" display="inline">{skill.proficiency}</Box>
                    </Typography>

                    <Typography variant="caption" color="text.secondary" display="block">
                      Available Projects: <Box component="span" fontWeight="bold" display="inline">{Math.floor(Math.random() * 10) + 1}</Box>
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