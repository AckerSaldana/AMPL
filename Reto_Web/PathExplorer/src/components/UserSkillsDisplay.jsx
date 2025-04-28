import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Divider,
  useTheme,
  alpha
} from "@mui/material";
import { supabase } from "../supabase/supabaseClient";

// Icons
import CodeIcon from "@mui/icons-material/Code";
import PsychologyIcon from "@mui/icons-material/Psychology";

// Colores de Accenture definidos en el PDF
const accentureColors = {
  corePurple1: "#a100ff", // Primary
  corePurple2: "#7500c0", // Darker purple
  corePurple3: "#460073", // Darkest purple
  accentPurple: "#be82ff", // Light purple
};

const UserSkillsDisplay = ({ userId }) => {
  const theme = useTheme();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función auxiliar para determinar el tipo de habilidad
  const isTechnicalSkill = (skill) => {
    if (!skill.type) return true; // Por defecto consideramos técnica si no hay tipo
    
    const type = typeof skill.type === 'string' ? skill.type.toLowerCase() : '';
    return type === 'technical' || 
           type === 'hard' || 
           type.includes('tech') || 
           type.includes('programming') ||
           type.includes('develop');
  };
  
  const isSoftSkill = (skill) => {
    if (!skill.type) return false;
    
    const type = typeof skill.type === 'string' ? skill.type.toLowerCase() : '';
    return type === 'soft' || 
           type === 'personal' ||
           type.includes('soft') ||
           type.includes('personal') ||
           type.includes('communication') ||
           type.includes('leader');
  };

  useEffect(() => {
    const fetchUserSkills = async () => {
      try {
        setLoading(true);
        
        // Paso 1: Obtener las UserSkills del usuario
        const { data: userSkillsData, error: skillsError } = await supabase
          .from("UserSkill")
          .select(`
            user_ID, 
            skill_ID,
            proficiency,
            year_Exp
          `)
          .eq("user_ID", userId);
          
        if (skillsError) throw skillsError;
        
        if (!userSkillsData || userSkillsData.length === 0) {
          setSkills([]);
          return;
        }
        
        // Paso 2: Obtener los detalles de las skills referenciadas
        const skillIds = userSkillsData.map(item => item.skill_ID);
        
        const { data: skillDetails, error: detailsError } = await supabase
          .from("Skill")
          .select("*")
          .in("skill_ID", skillIds);
          
        if (detailsError) throw detailsError;
        
        // Paso 3: Combinar los datos
        const processedSkills = userSkillsData.map(userSkill => {
          // Encontrar los detalles de esta skill
          const skillDetail = skillDetails.find(s => s.skill_ID === userSkill.skill_ID);
          
          return {
            id: userSkill.skill_ID,
            name: skillDetail?.name || `Skill #${userSkill.skill_ID}`,
            category: skillDetail?.category || "Uncategorized",
            description: skillDetail?.description || "",
            type: skillDetail?.type || "Technical", 
            proficiency: userSkill.proficiency || "Intermediate",
            years: userSkill.year_Exp || 0
          };
        });
        
        // Sort skills by years of experience
        processedSkills.sort((a, b) => b.years - a.years);
        
        setSkills(processedSkills);
      } catch (error) {
        console.error("Error fetching user skills:", error);
        setError("Failed to load skills.");
        setSkills([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUserSkills();
    }
  }, [userId]);

  if (loading) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 100, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: alpha(accentureColors.corePurple1, 0.1)
        }}
      >
        <CircularProgress size={30} sx={{ color: accentureColors.corePurple1 }} />
      </Paper>
    );
  }

  // Separate skills by type
  const technicalSkills = skills.filter(isTechnicalSkill);
  const softSkills = skills.filter(isSoftSkill);

  // Si no hay habilidades, mostrar un mensaje sencillo
  if (technicalSkills.length === 0 && softSkills.length === 0) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 3,
          borderRadius: 2,
          bgcolor: '#ffffff',
          border: '1px solid',
          borderColor: alpha(accentureColors.corePurple1, 0.1)
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            fontWeight: "bold", 
            display: 'flex', 
            alignItems: 'center',
            color: '#333333'
          }}
        >
          <CodeIcon sx={{ mr: 1, color: accentureColors.corePurple1 }} />
          Skills
        </Typography>
        <Divider sx={{ mb: 2, borderColor: alpha(accentureColors.corePurple1, 0.1) }} />
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
          No skills listed
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        borderRadius: 2, 
        bgcolor: '#ffffff',
        border: '1px solid',
        borderColor: alpha(accentureColors.corePurple1, 0.1)
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2, 
          fontWeight: "bold", 
          display: 'flex', 
          alignItems: 'center',
          color: '#333333'
        }}
      >
        Skills
      </Typography>
      
      <Divider sx={{ mb: 2.5, borderColor: alpha(accentureColors.corePurple1, 0.1) }} />
      
      {/* Technical Skills */}
      {technicalSkills.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mb: 1.5, 
              fontWeight: 500, 
              fontSize: '0.875rem', 
              display: 'flex', 
              alignItems: 'center',
              color: accentureColors.corePurple2
            }}
          >
            <CodeIcon sx={{ fontSize: 16, mr: 0.8, color: accentureColors.corePurple2 }} />
            Technical
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {technicalSkills.map((skill) => (
              <Chip
                key={skill.id}
                label={`${skill.name}${skill.years > 0 ? ` · ${skill.years}y` : ''}`}
                sx={{
                  bgcolor: alpha(accentureColors.corePurple1, 0.08),
                  color: accentureColors.corePurple2,
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  height: 28,
                  borderRadius: '14px',
                  '&:hover': {
                    bgcolor: alpha(accentureColors.corePurple1, 0.15),
                  },
                  boxShadow: `0 1px 2px ${alpha('#000', 0.05)}`,
                  border: '1px solid',
                  borderColor: alpha(accentureColors.corePurple1, 0.12),
                  transition: 'all 0.2s ease-in-out'
                }}
              />
            ))}
          </Box>
        </Box>
      )}
      
      {/* Soft Skills */}
      {softSkills.length > 0 && (
        <Box>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mb: 1.5, 
              fontWeight: 500, 
              fontSize: '0.875rem', 
              display: 'flex', 
              alignItems: 'center',
              color: accentureColors.accentPurple
            }}
          >
            <PsychologyIcon sx={{ fontSize: 16, mr: 0.8, color: accentureColors.accentPurple }} />
            Soft Skills
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {softSkills.map((skill) => (
              <Chip
                key={skill.id}
                label={`${skill.name}${skill.years > 0 ? ` · ${skill.years}y` : ''}`}
                sx={{
                  bgcolor: alpha(accentureColors.accentPurple, 0.08),
                  color: accentureColors.corePurple3,
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  height: 28,
                  borderRadius: '14px',
                  '&:hover': {
                    bgcolor: alpha(accentureColors.accentPurple, 0.15),
                  },
                  boxShadow: `0 1px 2px ${alpha('#000', 0.05)}`,
                  border: '1px solid',
                  borderColor: alpha(accentureColors.accentPurple, 0.12),
                  transition: 'all 0.2s ease-in-out'
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default UserSkillsDisplay;