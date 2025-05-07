// src/components/UserSkillsList.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Stack,
  CircularProgress,
  Button,
  Avatar,
  alpha
} from "@mui/material";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";

// Icons
import CodeIcon from "@mui/icons-material/Code";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import DataObjectIcon from "@mui/icons-material/DataObject";
import CloudIcon from "@mui/icons-material/Cloud";
import JavascriptIcon from "@mui/icons-material/Javascript";
import AnalyticsIcon from "@mui/icons-material/Analytics";

export const UserSkillsList = ({ userRole, userId }) => {
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(userRole || "Behavioral Health Expert");
  const navigate = useNavigate();
  
  // Theme color - match with profile purple color
  const profilePurple = '#9c27b0';

  useEffect(() => {
    const fetchSkillsUsage = async () => {
      try {
        setIsLoading(true);
        
        if (!userId) {
          throw new Error("User ID is required");
        }

        // 1. Obtener los skill_ids usados en RoleSkill
        const { data: roleSkillData, error: roleSkillError } = await supabase
          .from('RoleSkill')
          .select('skill_id');

        if (roleSkillError) throw roleSkillError;
        
        // Extraer los IDs únicos de skills
        const skillIds = [...new Set(roleSkillData.map(item => item.skill_id))];
        
        if (skillIds.length === 0) {
          // Datos de fallback si no hay skills
          setSkills([
            { name: "Frontend Dev", usagePercentage: 30, projectCount: 3 },
            { name: "UX/UI Designer", usagePercentage: 20, projectCount: 2 },
            { name: "Front End Developer", usagePercentage: 20, projectCount: 2 },
            { name: "Back End Developer", usagePercentage: 20, projectCount: 2 },
            { name: "Behavioral Health Expert", usagePercentage: 10, projectCount: 1 }
          ]);
          return;
        }

        // 2. Obtener el número total de roles para calcular porcentajes
        const { data: roleCount, error: countError } = await supabase
          .from('RoleSkill')
          .select('role_name', { count: 'exact' });

        if (countError) throw countError;
        
        const totalRoles = roleCount.length;

        // 3. Obtener el uso de cada skill (cuántos roles la requieren)
        const skillUsage = {};
        
        for (const skill_id of skillIds) {
          const { data: rolesWithSkill, error: usageError } = await supabase
            .from('RoleSkill')
            .select('role_name')
            .eq('skill_id', skill_id);
            
          if (usageError) throw usageError;
          
          // Contar cuántos roles usan esta skill
          skillUsage[skill_id] = rolesWithSkill.length;
        }

        // 4. Obtener nombres de skills desde tabla Skill
        const { data: skillNames, error: namesError } = await supabase
          .from('Skill')
          .select('skill_ID, name')
          .in('skill_ID', skillIds);

        if (namesError) throw namesError;

        // 5. Calcular proyectos disponibles para cada skill
        const { data: projectsData, error: projectsError } = await supabase
          .from('Project')
          .select('projectID');

        if (projectsError) throw projectsError;
        
        const totalProjects = projectsData?.length || 10;
        
        // 6. Calcular porcentajes y formatear resultados
        const formattedSkills = skillIds.map(skillId => {
          // Encontrar el nombre de la skill
          const skillInfo = skillNames.find(s => s.skill_ID === skillId);
          const skillName = skillInfo ? skillInfo.name : `Skill ${skillId}`;
          
          // Calcular el porcentaje de uso
          const usageCount = skillUsage[skillId] || 0;
          const usagePercentage = Math.round((usageCount / totalRoles) * 100);
          
          // Calcular proyectos disponibles (aquí usamos un valor aleatorio entre 1-5 como ejemplo)
          // En un caso real, necesitarías una relación entre proyectos y skills
          const projectCount = Math.max(1, Math.floor(usagePercentage / 10));
          
          return {
            name: skillName,
            usagePercentage: usagePercentage,
            projectCount: projectCount
          };
        });
        
        // 7. Ordenar skills por porcentaje de uso y tomar los top 5
        const topSkills = formattedSkills
          .sort((a, b) => b.usagePercentage - a.usagePercentage)
          .slice(0, 5);
          
        // Si no hay suficientes skills, usar datos de ejemplo
        if (topSkills.length < 5) {
          setSkills([
            { name: "Frontend Dev", usagePercentage: 30, projectCount: 3 },
            { name: "UX/UI Designer", usagePercentage: 20, projectCount: 2 },
            { name: "Front End Developer", usagePercentage: 20, projectCount: 2 },
            { name: "Back End Developer", usagePercentage: 20, projectCount: 2 },
            { name: "Behavioral Health Expert", usagePercentage: 10, projectCount: 1 }
          ]);
        } else {
          setSkills(topSkills);
        }

        // Fetch user role if not provided
        if (!userRole) {
          const { data: userRoleData, error: roleError } = await supabase
            .from('UserRole')
            .select('role_name')
            .eq('user_id', userId)
            .single();

          if (!roleError && userRoleData) {
            setRole(userRoleData.role_name);
          }
        }
      } catch (err) {
        console.error("Error fetching skills usage:", err.message);
        setError(err.message);
        // Fallback data
        setSkills([
          { name: "Frontend Dev", usagePercentage: 30, projectCount: 3 },
          { name: "UX/UI Designer", usagePercentage: 20, projectCount: 2 },
          { name: "Front End Developer", usagePercentage: 20, projectCount: 2 },
          { name: "Back End Developer", usagePercentage: 20, projectCount: 2 },
          { name: "Behavioral Health Expert", usagePercentage: 10, projectCount: 1 }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkillsUsage();
  }, [userId, userRole]);

  // Get the appropriate icon for a skill
  const getSkillIcon = (skillName) => {
    const iconMap = {
      "JavaScript": <JavascriptIcon fontSize="small" />,
      "Python": <CodeIcon fontSize="small" />,
      "Cloud": <CloudIcon fontSize="small" />,
      "AWS": <CloudIcon fontSize="small" />,
      "Data": <AnalyticsIcon fontSize="small" />,
      "Analytics": <AnalyticsIcon fontSize="small" />,
      "Storage": <StorageOutlinedIcon fontSize="small" />,
      "Database": <StorageOutlinedIcon fontSize="small" />,
      "API": <DataObjectIcon fontSize="small" />,
      "Front": <CodeIcon fontSize="small" />,
      "Back": <StorageOutlinedIcon fontSize="small" />,
      "UX": <CodeIcon fontSize="small" />,
      "UI": <CodeIcon fontSize="small" />,
      "Designer": <CodeIcon fontSize="small" />,
    };

    // Check if skill name contains any of the keys
    for (const [key, icon] of Object.entries(iconMap)) {
      if (skillName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }

    // Default icon
    return <CodeIcon fontSize="small" />;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={24} sx={{ color: profilePurple }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', p: 2, color: 'error.main' }}>
        <Typography variant="body2">Error loading skills usage</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid',
        borderColor: alpha(profilePurple, 0.1)
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CodeIcon 
            sx={{ 
              color: profilePurple, 
              mr: 1.5,
              fontSize: 20
            }} 
          />
          <Typography variant="h6" fontWeight={500} sx={{ fontSize: '1.125rem' }}>
            Key Skills ({role})
          </Typography>
        </Box>
        <Button
          endIcon={<ArrowForwardIosIcon sx={{ fontSize: '0.7rem' }} />}
          sx={{
            color: profilePurple,
            fontWeight: 400,
            fontSize: '0.75rem',
            textTransform: 'none',
            '&:hover': { bgcolor: 'transparent' }
          }}
          onClick={() => navigate('/skills')}
        >
          View All
        </Button>
      </Box>
      
      <Box sx={{ p: 2 }}>
        {/* Skills List - Now showing project usage percentage */}
        <Stack spacing={3}>
          {skills.map((skill) => (
            <Box key={skill.name}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="subtitle1" fontWeight={500}>
                  {skill.name}
                </Typography>
                <Typography variant="caption" fontWeight="medium" sx={{ ml: 1 }}>
                  {skill.usagePercentage}%
                </Typography>
              </Box>
              
              <Box sx={{ mb: 0.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={skill.usagePercentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(profilePurple, 0.1),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: profilePurple
                    }
                  }}
                />
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                Available Projects: {skill.projectCount}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Skills Tags */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
            Skills
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {skills.map((skill) => (
              <Chip
                key={skill.name}
                label={skill.name}
                sx={{ 
                  bgcolor: alpha(profilePurple, 0.1),
                  color: profilePurple,
                  fontWeight: 400,
                  mb: 1
                }}
              />
            ))}
            <Chip
              label="HTML & CSS"
              sx={{ 
                bgcolor: alpha(profilePurple, 0.1),
                color: profilePurple,
                fontWeight: 400,
                mb: 1
              }}
            />
            <Chip
              label="JavaScript"
              sx={{ 
                bgcolor: alpha(profilePurple, 0.1),
                color: profilePurple,
                fontWeight: 400,
                mb: 1
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserSkillsList;