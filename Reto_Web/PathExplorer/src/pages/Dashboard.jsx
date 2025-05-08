// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Avatar,
  Chip,
  LinearProgress,
  Stack
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import dayjs from 'dayjs';

// Importar los componentes personalizados
import { CalendarCompact } from "../components/CalendarCompact";
import { PopularCertifications } from "../components/PopularCertifications";
import useAuth from "../hooks/useAuth";

// Iconos
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import CodeIcon from "@mui/icons-material/Code";
import SchoolIcon from "@mui/icons-material/School";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupIcon from "@mui/icons-material/Group";

// Datos de ejemplo garantizados para skills
const DEFAULT_SKILLS = [
  { id: 1, name: "JavaScript", category: "Development", popularityPercentage: 85, userCount: 45, projectCount: 8 },
  { id: 2, name: "React", category: "Frontend", popularityPercentage: 70, userCount: 32, projectCount: 6 },
  { id: 3, name: "Python", category: "Backend", popularityPercentage: 65, userCount: 28, projectCount: 5 }
];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeProjects: 1,
    teamMembers: 7
  });
  const [userRole, setUserRole] = useState("");
  const [popularSkills, setPopularSkills] = useState(DEFAULT_SKILLS);
  const [isLoading, setIsLoading] = useState(true);
  const [pathItems, setPathItems] = useState([
    {
      id: 1,
      title: "AWS Cloud Practitioner",
      type: "Certificate",
      date: null
    },
    {
      id: 2,
      title: "Advanced React Development",
      type: "Certificate", 
      date: "2025-04-15"
    },
    {
      id: 3,
      title: "Machine Learning Fundamentals",
      type: "Course",
      date: "2025-03-01"
    }
  ]);
  
  // Datos para las certificaciones populares
  const [popularCertifications, setPopularCertifications] = useState([
    {
      id: 1,
      name: "AWS Solutions Architect",
      category: "Cloud",
      completions: 842,
      popularity: 85,
      iconType: "Cloud"
    },
    {
      id: 2,
      name: "Full Stack React Development",
      category: "Development",
      completions: 734,
      popularity: 78,
      iconType: "Code"
    },
    {
      id: 3,
      name: "Data Science Professional",
      category: "Analytics",
      completions: 692,
      popularity: 75,
      iconType: "Analytics"
    }
  ]);
  
  const today = new Date();
  const options = { day: "numeric", month: "long", year: "numeric" };
  const formattedDate = today.toLocaleDateString("en-US", options);

  const navigate = useNavigate();

  // Color original del perfil
  const profilePurple = '#9c27b0';

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Obtener rol actual del usuario (simple y directo)
        try {
          const { data: userRoles } = await supabase
            .from('UserRole')
            .select('role_name')
            .eq('user_id', user.id)
            .limit(1);
          
          if (userRoles && userRoles.length > 0) {
            setUserRole(userRoles[0].role_name);
          }
        } catch (e) {
          console.error("Error obteniendo rol:", e);
        }
        
        // Estadísticas básicas
        try {
          const { data: projCount } = await supabase
            .from('UserRole')
            .select('project_id', { count: 'exact' })
            .eq('user_id', user.id);
            
          const { data: teamCount } = await supabase
            .from('UserRole')
            .select('user_id', { count: 'exact', distinct: true });
            
          setStats({
            activeProjects: projCount?.length || 1,
            teamMembers: teamCount?.length || 7
          });
        } catch (e) {
          console.error("Error obteniendo estadísticas:", e);
        }
        
        // INTENTO SIMPLIFICADO PARA OBTENER SKILLS
        try {
          // Primero, obtenemos directamente las 3 skills más populares 
          // Este enfoque simplifica bastante la consulta anterior
          const { data: skills } = await supabase
            .from('Skill')
            .select('skill_ID, name, category, type')
            .limit(3);
            
          if (skills && skills.length > 0) {
            // Transformamos los datos a un formato que podamos usar
            const formattedSkills = skills.map((skill, index) => ({
              id: skill.skill_ID,
              name: skill.name,
              category: skill.category || 'General',
              type: skill.type || 'Technical',
              // Datos de ejemplo para estadísticas
              popularityPercentage: 85 - (index * 10),
              userCount: 45 - (index * 5),
              projectCount: 8 - index
            }));
            
            setPopularSkills(formattedSkills);
          }
        } catch (e) {
          console.error("Error obteniendo skills:", e);
          // Mantenemos los datos de ejemplo por defecto
        }
      } catch (error) {
        console.error("Error general:", error);
      } finally {
        // Garantizamos que siempre salga del estado de carga
        setIsLoading(false);
      }
    };

    // Iniciamos la carga de datos
    fetchDashboardData();
    
    // Garantizamos que salga del estado de carga después de 3 segundos
    // incluso si algo falla
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [user]);

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        width: '100%',
        bgcolor: '#f9f7ff'
      }}>
        <CircularProgress sx={{ color: profilePurple }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: '#f9f7ff', 
      minHeight: '100vh',
      width: '100%',
      padding: { xs: 2, md: 3 }
    }}>
      {/* Welcome banner que abarca todo el ancho */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          background: profilePurple,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          color: "#ffffff",
          boxShadow: `0 4px 12px ${alpha(profilePurple, 0.2)}`,
          width: '100%'
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            Welcome back!
          </Typography>
          <Typography variant="body1">Today is {formattedDate}</Typography>
        </Box>
        <Box sx={{ mt: { xs: 2, md: 0 } }}>
          <Button
            variant="contained"
            onClick={() => navigate('/projects')}
            sx={{
              borderRadius: 28,
              px: 3,
              py: 1,
              textTransform: "none",
              fontWeight: 500,
              bgcolor: "#ffffff",
              color: profilePurple,
              "&:hover": {
                bgcolor: "#f5f5f5",
              },
            }}
          >
            View Active Projects
          </Button>
        </Box>
      </Paper>

      {/* Grid contenedor principal con 12 columnas */}
      <Grid container spacing={3}>
        {/* Stats Cards - Primera fila, 2 columnas del mismo ancho */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              height: '100%'
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha(profilePurple, 0.1),
                color: profilePurple,
                mr: 2,
                width: 40,
                height: 40
              }}
            >
              <WorkOutlineIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" color={profilePurple} fontWeight="medium">
                {stats.activeProjects}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Projects
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              height: '100%'
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha(profilePurple, 0.1),
                color: profilePurple,
                mr: 2,
                width: 40,
                height: 40
              }}
            >
              <PeopleOutlineIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" color={profilePurple} fontWeight="medium">
                {stats.teamMembers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Team Members
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Segunda fila - MyPath */}
        <Grid item xs={12} md={6}>
          {/* MyPath Timeline */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              mb: 3,
              width: '100%'
            }}
          >
            <Box sx={{ p: 2 }}>
              {/* Encabezado de MyPath */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 2
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
                    MyPath
                  </Typography>
                </Box>
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
                  View All
                </Button>
              </Box>

              {/* Contenido de MyPath - Lista de elementos */}
              <Box
                sx={{
                  position: "relative",
                  ml: 2,
                  height: "280px",
                  overflowY: "auto",
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
                {pathItems.map((item, index) => {
                  const isFirstItem = index === 0;
                  const isProject = item.type === "Project";
                  const color = isFirstItem
                    ? profilePurple
                    : isProject
                    ? profilePurple
                    : alpha(profilePurple, 0.7);
                  
                  // Determinar si debe mostrar "AI Suggested" para items sin fecha
                  const showAISuggested = !item.date;
                  
                  // Formatear la fecha si existe, o mostrar "Soon"
                  const formattedDate = !item.date 
                    ? "Soon" 
                    : (() => {
                        const [year, month, day] = item.date.split("-");
                        return `${month} | ${day} | ${year}`;
                      })();
                  
                  return (
                    <Box
                      key={item.id}
                      sx={{
                        display: "flex",
                        position: "relative",
                        mb: 3,
                        ml: 3,
                        p: 1.5,
                        backgroundColor: '#ffffff',
                        borderRadius: 1,
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        border: `1px solid ${alpha(profilePurple, 0.2)}`,
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
                            color: "text.primary",
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
                              ? profilePurple
                              : "text.secondary"
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
                          color: "text.disabled",
                          fontSize: "0.75rem",
                        }}
                      >
                        {formattedDate}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Paper>

          {/* Popular Certifications - Debajo de MyPath */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              width: '100%'
            }}
          >
            <PopularCertifications certifications={popularCertifications} />
          </Paper>
        </Grid>
        
        {/* Tercera columna - Calendario y Skills Populares */}
        <Grid item xs={12} md={6}>
          {/* Calendario y recordatorios */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              p: 2,
              width: '100%',
              mb: 3
            }}
          >
            {/* Encabezado del calendario */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 2
              }}
            >
              <Typography variant="h6" fontWeight={500} sx={{ fontSize: '1.125rem' }}>
                Schedule & Project Reminders
              </Typography>
            </Box>
            
            {/* Componente del calendario */}
            <Box 
              sx={{ 
                // Estilos para hacer el calendario más compacto
                '.MuiGrid-container': { 
                  mb: 0.5 // reducimos margen entre filas
                },
                // Hacemos los días más compactos
                '.MuiBox-root > .MuiGrid-container .MuiGrid-item > div': {
                  width: 32, 
                  height: 32,
                  my: 0.5
                }
              }}
            >
              <CalendarCompact userId={user?.id} />
            </Box>
          </Paper>
          
          {/* Popular Skills Section - Habilidades más populares en la empresa */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              width: '100%'
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 2,
                borderBottom: '1px solid',
                borderColor: alpha(profilePurple, 0.1)
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon 
                  sx={{ 
                    color: profilePurple, 
                    mr: 1.5,
                    fontSize: 20
                  }} 
                />
                <Typography variant="h6" fontWeight={500} sx={{ fontSize: '1.125rem' }}>
                  Most Popular Skills
                </Typography>
              </Box>
              <Button
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
              {/* Lista de Skills más Populares en la empresa */}
              <Stack spacing={3}>
                {popularSkills.map((skill) => (
                  <Box key={skill.id || skill.name}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {skill.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <GroupIcon sx={{ fontSize: 16, color: profilePurple, mr: 0.5 }} />
                        <Typography variant="caption" fontWeight="medium">
                          {skill.userCount} users
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 0.5 }}>
                      <LinearProgress
                        variant="determinate"
                        value={skill.popularityPercentage}
                        sx={{
                          height: 6,
                          borderRadius: 4,
                          bgcolor: alpha(profilePurple, 0.1),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: profilePurple
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        Available Projects: {skill.projectCount}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: profilePurple,
                          fontWeight: 500
                        }}
                      >
                        {skill.popularityPercentage}% adoption
                      </Typography>
                    </Box>
                    
                    {skill.category && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Category: {skill.category}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>

              {/* Skills Tags */}
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {popularSkills.map((skill) => (
                    <Chip
                      key={skill.id || skill.name}
                      label={skill.name}
                      size="small"
                      sx={{ 
                        bgcolor: alpha(profilePurple, 0.1),
                        color: profilePurple,
                        fontWeight: 400,
                        mb: 1
                      }}
                    />
                  ))}
                  {popularSkills
                    .filter(s => s.category)
                    .filter((s, i, arr) => arr.findIndex(t => t.category === s.category) === i)
                    .map((skill) => (
                      <Chip
                        key={`cat-${skill.category}`}
                        label={skill.category}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          borderColor: alpha(profilePurple, 0.3),
                          color: alpha(profilePurple, 0.8),
                          fontWeight: 400,
                          mb: 1
                        }}
                      />
                    ))
                  }
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;