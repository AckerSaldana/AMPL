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
  Stack,
  Divider,
  IconButton,
  Tooltip,
  useTheme
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
import PieChartOutlineIcon from "@mui/icons-material/PieChartOutline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

// Datos de ejemplo garantizados para skills
const DEFAULT_SKILLS = [
  { id: 1, name: "JavaScript", category: "Development", popularityPercentage: 85, userCount: 45, projectCount: 8 },
  { id: 2, name: "React", category: "Frontend", popularityPercentage: 70, userCount: 32, projectCount: 6 },
  { id: 3, name: "Python", category: "Backend", popularityPercentage: 65, userCount: 28, projectCount: 5 }
];

// Datos de ejemplo para certificaciones (como fallback)
const DEFAULT_CERTIFICATIONS = [
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
  
  // Estado para certificaciones populares
  const [popularCertifications, setPopularCertifications] = useState(DEFAULT_CERTIFICATIONS);
  
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

        // Obtener certificaciones populares usando la función RPC
        try {
          console.log("Obteniendo certificaciones populares con RPC");
          
          const { data: popularCerts, error } = await supabase
            .rpc('get_popular_certifications', { limit_count: 3 });
            
          if (error) {
            console.error("Error en RPC:", error);
            throw error;
          }
            
          console.log("Datos obtenidos de RPC:", popularCerts);
            
          if (popularCerts && popularCerts.length > 0) {
            // Mapea los resultados al formato del componente
            const formattedCerts = popularCerts.map(cert => {
              // Función para obtener el tipo de icono según el tipo de certificación
              const getIconType = (type) => {
                const typeMap = {
                  'Cloud Computing': 'Cloud',
                  'Development': 'Code',
                  'Project Management': 'Work',
                  'Cybersecurity': 'Security',
                  'Data': 'DataObject',
                  'Analytics': 'Analytics',
                  'Human Resources': 'PeopleAlt',
                  'Leadership': 'Work'
                };
                
                return typeMap[type] || 'EmojiEvents';
              };
              
              return {
                id: cert.cert_id,
                name: cert.title,
                category: cert.type || 'General',
                completions: cert.completions,
                popularity: cert.popularity_percentage,
                iconType: getIconType(cert.type)
              };
            });
            
            console.log("Certificaciones formateadas:", formattedCerts);
            setPopularCertifications(formattedCerts);
          } else {
            console.log("No se encontraron certificaciones populares, usando datos por defecto");
          }
        } catch (e) {
          console.error("Error obteniendo certificaciones populares con RPC:", e);
          console.log("Intentando enfoque alternativo sin RPC");
          
          // Método alternativo si la función RPC falla
          try {
            console.log("Comenzando a obtener certificaciones populares con método alternativo");
            
            // First, we'll count the number of users for each certification
            const { data: userCertsData, error: userCertsError } = await supabase
              .from('UserCertifications')
              .select('certification_ID, status');
              
            if (userCertsError) throw userCertsError;
            
            console.log("Certificaciones de usuarios obtenidas:", userCertsData);
            
            // Filter approved certifications and count them
            const certCounts = {};
            userCertsData
              .filter(cert => cert.status === 'approved')
              .forEach(cert => {
                const certId = cert.certification_ID;
                certCounts[certId] = (certCounts[certId] || 0) + 1;
              });
            
            // Convert to array and sort by count (descending)
            const sortedCerts = Object.entries(certCounts)
              .map(([id, count]) => ({ id, count }))
              .sort((a, b) => b.count - a.count);
            
            console.log("Certificaciones ordenadas por popularidad:", sortedCerts);
            
            // Get top 3 certification IDs
            const topCertIds = sortedCerts.slice(0, 3).map(item => item.id);
            
            if (topCertIds.length > 0) {
              console.log("IDs de las certificaciones más populares:", topCertIds);
              
              // Get details for these certifications
              const { data: certDetails, error: certDetailsError } = await supabase
                .from('Certifications')
                .select('certification_id, title, type, issuer');
                
              if (certDetailsError) throw certDetailsError;
              
              console.log("Detalles de certificaciones obtenidos:", certDetails);
              
              // Calculate total completions for percentage
              const totalCompletions = sortedCerts.reduce((sum, cert) => sum + cert.count, 0);
              
              // Map certification IDs to their details and format for the component
              const formattedCertifications = topCertIds
                .map(id => {
                  // Find count info
                  const countInfo = sortedCerts.find(c => c.id === id);
                  
                  // Find matching certification details
                  // Notice we're checking if certification_id matches the ID
                  const detailInfo = certDetails.find(
                    c => c.certification_id === id
                  );
                  
                  if (!detailInfo) {
                    console.log(`No se encontraron detalles para certificación con ID: ${id}`);
                    return null;
                  }
                  
                  // Map certification type to icon type
                  const getIconType = (type) => {
                    const typeMap = {
                      'Cloud Computing': 'Cloud',
                      'Development': 'Code',
                      'Project Management': 'Work',
                      'Cybersecurity': 'Security',
                      'Data': 'DataObject',
                      'Analytics': 'Analytics',
                      'Human Resources': 'PeopleAlt',
                      'Leadership': 'Work'
                    };
                    
                    return typeMap[type] || 'EmojiEvents';
                  };
                  
                  // Calculate popularity percentage
                  const popularity = Math.round((countInfo.count / totalCompletions) * 100);
                  
                  return {
                    id: id,
                    name: detailInfo.title,
                    category: detailInfo.type || 'General',
                    completions: countInfo.count,
                    popularity: popularity,
                    iconType: getIconType(detailInfo.type)
                  };
                })
                .filter(cert => cert !== null); // Remove any nulls
              
              if (formattedCertifications.length > 0) {
                console.log("Certificaciones populares formateadas:", formattedCertifications);
                setPopularCertifications(formattedCertifications);
              } else {
                console.log("No se pudieron formatear certificaciones, usando datos por defecto");
              }
            }
          } catch (innerError) {
            console.error("Error en método alternativo:", innerError);
            // Mantener datos por defecto
          }
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

      {/* Welcome banner con diseño minimalista */}
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
          width: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            Welcome back!
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Today is {formattedDate}
          </Typography>
        </Box>
        <Box sx={{ mt: { xs: 2, md: 0 }, position: 'relative', zIndex: 2 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/projects')}
            sx={{
              borderRadius: '50px',
              px: 3,
              py: 1,
              textTransform: "none",
              fontWeight: 500,
              bgcolor: "#ffffff",
              color: profilePurple,
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              "&:hover": {
                bgcolor: "#f5f5f5",
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
              },
            }}
          >
            View Active Projects
          </Button>
        </Box>
      </Paper>

      {/* Stats Cards - Diseño minimalista con gradientes sutiles */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              display: "flex",
              flexDirection: 'column',
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              height: '100%',
              position: 'relative',
              border: `1px solid ${alpha(profilePurple, 0.2)}`,
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                background: profilePurple
              }
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
              Active Projects
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <Typography variant="h3" color="text.primary" fontWeight="medium" sx={{ lineHeight: 1 }}>
                {stats.activeProjects}
              </Typography>
              
              <Avatar
                sx={{
                  bgcolor: alpha(profilePurple, 0.1),
                  color: profilePurple,
                  width: 36,
                  height: 36
                }}
              >
                <WorkOutlineIcon fontSize="small" />
              </Avatar>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mt: 1.5, 
              color: '#4caf50', 
              fontSize: '0.8rem' 
            }}>
              <ArrowUpwardIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
              <Typography variant="caption" fontWeight="medium">
                +2 from last month
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              display: "flex",
              flexDirection: 'column',
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              height: '100%',
              position: 'relative',
              border: `1px solid ${alpha(profilePurple, 0.2)}`,
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                background: profilePurple
              }
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
              Team Members
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <Typography variant="h3" color="text.primary" fontWeight="medium" sx={{ lineHeight: 1 }}>
                {stats.teamMembers}
              </Typography>
              
              <Avatar
                sx={{
                  bgcolor: alpha(profilePurple, 0.1),
                  color: profilePurple,
                  width: 36,
                  height: 36
                }}
              >
                <PeopleOutlineIcon fontSize="small" />
              </Avatar>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mt: 1.5, 
              color: '#4caf50', 
              fontSize: '0.8rem' 
            }}>
              <ArrowUpwardIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
              <Typography variant="caption" fontWeight="medium">
                +3 new this week
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              display: "flex",
              flexDirection: 'column',
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              height: '100%',
              position: 'relative',
              border: `1px solid ${alpha(profilePurple, 0.2)}`,
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                background: profilePurple
              }
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
              My Certifications
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <Typography variant="h3" color="text.primary" fontWeight="medium" sx={{ lineHeight: 1 }}>
                3
              </Typography>
              
              <Avatar
                sx={{
                  bgcolor: alpha(profilePurple, 0.1),
                  color: profilePurple,
                  width: 36,
                  height: 36
                }}
              >
                <SchoolIcon fontSize="small" />
              </Avatar>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mt: 1.5, 
              color: '#ff9800', 
              fontSize: '0.8rem' 
            }}>
              <Typography variant="caption" fontWeight="medium">
                1 in progress
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              display: "flex",
              flexDirection: 'column',
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              height: '100%',
              position: 'relative',
              border: `1px solid ${alpha(profilePurple, 0.2)}`,
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                background: profilePurple
              }
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
              Skills Mastered
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <Typography variant="h3" color="text.primary" fontWeight="medium" sx={{ lineHeight: 1 }}>
                8
              </Typography>
              
              <Avatar
                sx={{
                  bgcolor: alpha(profilePurple, 0.1),
                  color: profilePurple,
                  width: 36,
                  height: 36
                }}
              >
                <CodeIcon fontSize="small" />
              </Avatar>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mt: 1.5, 
              color: '#4caf50', 
              fontSize: '0.8rem' 
            }}>
              <ArrowUpwardIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
              <Typography variant="caption" fontWeight="medium">
                +2 this quarter
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Column 1: Skills y Calendar */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* MyPath Timeline con diseño renovado */}
            <Grid item xs={12}>
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
                      View All
                    </Button>
                    
                    <IconButton size="small" sx={{ ml: 0.5, color: alpha(profilePurple, 0.6) }}>
                      <MoreHorizIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                
                {/* Contenido de MyPath - Lista de elementos (Diseño Original) */}
                <Box
                  sx={{
                    position: "relative",
                    ml: 2,
                    p: 2,
                    // Timeline vertical line - centrada
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 16,
                      bottom: 38,
                      left: 16,
                      width: 2,
                      bgcolor: alpha(profilePurple, 0.2),
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
                          px: 2.5,
                          backgroundColor: '#ffffff',
                          borderRadius: 1,
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          border: `1px solid ${alpha(profilePurple, 0.1)}`,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                            borderColor: alpha(profilePurple, 0.2)
                          }
                        }}
                      >
                        {/* Timeline dot - centrado verticalmente */}
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            backgroundColor: color,
                            position: "absolute",
                            left: -31,
                            top: "50%",
                            transform: "translateY(-50%)",
                            border: `2px solid white`,
                            boxShadow: '0 0 0 2px rgba(0,0,0,0.03)'
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
                                : "text.secondary",
                              fontWeight: showAISuggested ? 500 : 400
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
                            color: "text.secondary",
                            fontSize: "0.75rem",
                          }}
                        >
                          {formattedDate}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            </Grid>
          
            {/* Calendar Component */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2,
                  bgcolor: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                  border: `1px solid ${alpha(profilePurple, 0.15)}`
                }}
              >
                <CalendarCompact userId={user?.id} />
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Column 2: Skills y Certifications */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            {/* Popular Skills Section */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2,
                  bgcolor: '#ffffff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  mb: 3,
                  overflow: 'hidden'
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
                  {/* Lista de Skills más Populares con barras de progreso pero diseño mejorado */}
                  <Stack spacing={3}>
                    {popularSkills.map((skill) => (
                      <Box key={skill.id || skill.name}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          mb: 1 
                        }}>
                          <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'text.primary' }}>
                            {skill.name}
                          </Typography>
                          <Tooltip title={`${skill.userCount} users have this skill`}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <GroupIcon sx={{ fontSize: 16, color: profilePurple, mr: 0.5 }} />
                              <Typography variant="caption" fontWeight="medium">
                                {skill.userCount}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Box>
                        
                        <Box sx={{ mb: 0.5 }}>
                          <LinearProgress
                            variant="determinate"
                            value={skill.popularityPercentage}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: alpha(profilePurple, 0.1),
                              '& .MuiLinearProgress-bar': {
                                bgcolor: `linear-gradient(90deg, ${profilePurple}, ${alpha(profilePurple, 0.7)})`,
                                borderRadius: 4
                              }
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                              label={skill.category}
                              size="small"
                              sx={{ 
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 500,
                                bgcolor: alpha(profilePurple, 0.08),
                                color: alpha(profilePurple, 0.8)
                              }}
                            />
                            <Chip
                              label={`${skill.projectCount} projects`}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 500,
                                borderColor: alpha(profilePurple, 0.2),
                                color: 'text.secondary'
                              }}
                            />
                          </Box>
                          
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: profilePurple,
                              fontWeight: 600
                            }}
                          >
                            {skill.popularityPercentage}%
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Paper>
            </Grid>
            
            {/* Popular Certifications */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2,
                  bgcolor: '#ffffff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                  height: '100%'
                }}
              >
                <PopularCertifications certifications={popularCertifications} />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;