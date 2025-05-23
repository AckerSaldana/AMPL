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
  useTheme,
  Skeleton
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import dayjs from 'dayjs';
import { ACCENTURE_COLORS } from "../styles/styles";

// Importar los componentes personalizados
import { CalendarCompact } from "../components/CalendarCompact";
import { PopularCertifications } from "../components/PopularCertifications";
import DashboardTimeline from "../components/DashboardTimeline";
import useAuth from "../hooks/useAuth";
import useUserTimeline from "../hooks/useUserTimeline";

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

// Datos de respaldo para timeline
const DEFAULT_TIMELINE_ITEMS = [
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
];

// Función auxiliar para obtener el tipo de icono según el tipo de certificación
const getIconTypeFromCertType = (type) => {
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

// Componente Skeleton para Timeline mientras carga
const TimelineSkeleton = ({ profilePurple }) => (
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
    </Box>
    
    <Box sx={{ p: 3 }}>
      {Array.from(new Array(3)).map((_, index) => (
        <Box key={index} sx={{ display: 'flex', mb: 3, ml: 4 }}>
          <Skeleton variant="circular" width={16} height={16} sx={{ position: 'absolute', left: 30, mt: 1.5 }} />
          <Skeleton variant="rounded" height={80} sx={{ flexGrow: 1, borderRadius: 1 }} />
        </Box>
      ))}
    </Box>
  </Paper>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estados básicos
  const [stats, setStats] = useState({
    activeProjects: 1,
    teamMembers: 7,
    myCertifications: 0,
    skillsMastered: 0,
    certsInProgress: 0
  });
  const [userRole, setUserRole] = useState("");
  const [popularSkills, setPopularSkills] = useState(DEFAULT_SKILLS);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para certificaciones populares
  const [popularCertifications, setPopularCertifications] = useState(DEFAULT_CERTIFICATIONS);
  
  // Usamos el hook de timeline igual que en MyPath
  const { timelineItems, loading: timelineLoading, useMockData: usingMockTimeline } = useUserTimeline();
  
  const today = new Date();
  const options = { day: "numeric", month: "long", year: "numeric" };
  const formattedDate = today.toLocaleDateString("en-US", options);

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
        
        // NUEVO: Obtener conteo de certificaciones aprobadas y pendientes del usuario
        try {
          // 1. Consulta para certificaciones aprobadas
          const { data: approvedCerts, error: approvedError, count: approvedCount } = await supabase
            .from('UserCertifications')
            .select('*', { count: 'exact' })
            .eq('user_ID', user.id)
            .eq('status', 'approved');
            
          if (approvedError) throw approvedError;
          
          // 2. Consulta para certificaciones pendientes
          const { data: pendingCerts, error: pendingError, count: pendingCount } = await supabase
            .from('UserCertifications')
            .select('*', { count: 'exact' })
            .eq('user_ID', user.id)
            .eq('status', 'pending');
            
          if (pendingError) throw pendingError;
          
          console.log(`Certificaciones aprobadas: ${approvedCount}, Pendientes: ${pendingCount}`);
          
          // 3. Obtener conteo de skills del usuario
          const { data: userSkills, error: userSkillsError, count: totalSkillCount } = await supabase
            .from('UserSkill')
            .select('*', { count: 'exact' })
            .eq('user_ID', user.id);
            
          if (userSkillsError) throw userSkillsError;
          
          console.log(`Skills totales del usuario: ${totalSkillCount}`);
          
          // Estadísticas básicas
          const { data: projCount } = await supabase
            .from('UserRole')
            .select('project_id', { count: 'exact' })
            .eq('user_id', user.id);
            
          const { data: teamCount } = await supabase
            .from('UserRole')
            .select('user_id', { count: 'exact', distinct: true });
            
          // Actualizar las estadísticas
          setStats({
            activeProjects: projCount?.length || 1,
            teamMembers: teamCount?.length || 7,
            myCertifications: approvedCount || 0,  
            skillsMastered: totalSkillCount || 0,
            certsInProgress: pendingCount || 1
          });
          
        } catch (e) {
          console.error("Error obteniendo conteo de certificaciones:", e);
          
          // En caso de error, obtenemos al menos las estadísticas básicas
          try {
            const { data: projCount } = await supabase
              .from('UserRole')
              .select('project_id', { count: 'exact' })
              .eq('user_id', user.id);
              
            const { data: teamCount } = await supabase
              .from('UserRole')
              .select('user_id', { count: 'exact', distinct: true });
              
            setStats(prevStats => ({
              ...prevStats,
              activeProjects: projCount?.length || 1,
              teamMembers: teamCount?.length || 7
            }));
          } catch (statsError) {
            console.error("Error obteniendo estadísticas:", statsError);
          }
        }
        
        // INTENTO SIMPLIFICADO PARA OBTENER SKILLS
        try {
          // Primero, obtenemos directamente las 3 skills más populares 
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

        // Obtener certificaciones populares - Método mejorado
        try {
          console.log("Obteniendo certificaciones populares");
          
          // 1. Primero, obtenemos el número total de usuarios en la empresa
          const { data: totalUsers, error: totalUsersError, count: totalUsersCount } = await supabase
            .from('UserRole')
            .select('user_id', { count: 'exact', distinct: true });
            
          if (totalUsersError) throw totalUsersError;
          
          const totalCompanyUsers = totalUsersCount || 1; // Evitar división por cero
          console.log(`Total de usuarios en la empresa: ${totalCompanyUsers}`);
          
          // 2. Obtener todas las certificaciones aprobadas, agrupadas por ID
          const { data: certCompletions, error: certError } = await supabase
            .from('UserCertifications')
            .select('certification_ID, status')
            .eq('status', 'approved');
            
          if (certError) throw certError;
          
          // 3. Contar usuarios por certificación
          const certCounts = {};
          certCompletions.forEach(cert => {
            const certId = cert.certification_ID;
            certCounts[certId] = (certCounts[certId] || 0) + 1;
          });
          
          // 4. Convertir a array y ordenar por popularidad
          const sortedCerts = Object.entries(certCounts)
            .map(([id, count]) => ({ 
              id, 
              count, 
              // Calcular porcentaje de usuarios que tienen esta certificación
              percentage: Math.round((count / totalCompanyUsers) * 100) 
            }))
            .sort((a, b) => b.count - a.count);
            
          console.log("Certificaciones ordenadas por completados:", sortedCerts);
          
          // 5. Obtener los detalles de las certificaciones más populares (top 3)
          if (sortedCerts.length > 0) {
            const topCertIds = sortedCerts.slice(0, 3).map(cert => cert.id);
            
            // Obtener detalles de estas certificaciones
            const { data: certDetails, error: certDetailsError } = await supabase
              .from('Certifications')
              .select('certification_id, title, type, issuer')
              .in('certification_id', topCertIds);
              
            if (certDetailsError) throw certDetailsError;
            
            // 6. Formatear los datos para el componente
            const formattedCertifications = topCertIds
              .map(id => {
                // Buscar info de popularidad
                const popularityInfo = sortedCerts.find(c => c.id === id);
                
                // Buscar detalles de la certificación
                const detailInfo = certDetails.find(c => c.certification_id === id);
                
                if (!detailInfo) return null;
                
                return {
                  id: id,
                  name: detailInfo.title,
                  category: detailInfo.type || 'General',
                  completions: popularityInfo.count,
                  popularity: popularityInfo.percentage,
                  iconType: getIconTypeFromCertType(detailInfo.type)
                };
              })
              .filter(cert => cert !== null);
            
            if (formattedCertifications.length > 0) {
              console.log("Certificaciones populares formateadas:", formattedCertifications);
              setPopularCertifications(formattedCertifications);
              // Salimos con las certificaciones formateadas
              return;
            }
          }
          
          // Si no hay certificaciones aprobadas o no se pudieron formatear, intentamos un enfoque simplificado
          console.log("Usando enfoque simplificado para certificaciones");
          
          // Obtener las 3 primeras certificaciones disponibles
          const { data: certifications, error: simpleCertError } = await supabase
            .from('Certifications')
            .select('certification_id, title, type, issuer')
            .limit(3);
            
          if (simpleCertError) throw simpleCertError;
          
          if (certifications && certifications.length > 0) {
            // Asignar datos de popularidad simulados
            const formattedCertifications = certifications.map((cert, index) => ({
              id: cert.certification_id,
              name: cert.title,
              category: cert.type || 'General',
              completions: Math.round(totalCompanyUsers * (0.8 - (index * 0.2))), // Datos simulados descendentes
              popularity: 80 - (index * 15),    // Datos simulados descendentes
              iconType: getIconTypeFromCertType(cert.type)
            }));
            
            console.log("Certificaciones simplificadas:", formattedCertifications);
            setPopularCertifications(formattedCertifications);
          }
        } catch (e) {
          console.error("Error obteniendo certificaciones populares:", e);
          // En caso de error, mantenemos los datos por defecto
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
      }}>
        <CircularProgress sx={{ color: profilePurple }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
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
                {stats.myCertifications}
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
                {stats.certsInProgress} in progress
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
                {stats.skillsMastered}
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

      {/* Main Content Grid - RESPONSIVE LAYOUT */}
      <Grid container spacing={3}>
        {/* Row 1: Calendar - Smaller width */}
        <Grid item xs={12} md={5} lg={3.5}>
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                bgcolor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                overflow: 'hidden',
                border: `1px solid ${alpha(profilePurple, 0.15)}`,
                width: '100%',
                height: 'fit-content'
              }}
            >
              <CalendarCompact userId={user?.id} />
            </Paper>
          </Box>
        </Grid>

        {/* Timeline - Larger width */}
        <Grid item xs={12} md={7} lg={4.5}>
          <Box sx={{ height: '100%' }}>
            {timelineLoading ? (
              <TimelineSkeleton profilePurple={profilePurple} />
            ) : (
              <DashboardTimeline 
                items={timelineItems || DEFAULT_TIMELINE_ITEMS} 
                profilePurple={profilePurple}
              />
            )}
            {!timelineLoading && usingMockTimeline && (
              <Box sx={{ 
                mt: 1, 
                px: 2, 
                display: 'flex', 
                alignItems: 'center', 
                color: alpha(profilePurple, 0.7),
                fontSize: '0.75rem'
              }}>
                <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                  Showing sample data. Real data will appear when available.
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Skills y Certifications - Responsive stack */}
        <Grid item xs={12} md={12} lg={4}>
          <Stack spacing={2}>
            {/* Popular Skills - Arriba */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                bgcolor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                overflow: 'hidden',
                border: `1px solid ${alpha(profilePurple, 0.15)}`,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 2,
                  borderBottom: '1px solid',
                  borderColor: alpha(profilePurple, 0.1)
                }}
              >
                <TrendingUpIcon 
                  sx={{ 
                    color: profilePurple, 
                    mr: 1.5,
                    fontSize: 20
                  }} 
                />
                <Typography variant="h6" fontWeight={500} sx={{ fontSize: '1rem' }}>
                  Most Popular Skills
                </Typography>
              </Box>
              
              <Box sx={{ p: 2 }}>
                <Stack spacing={2}>
                  {popularSkills.map((skill) => (
                    <Box key={skill.id || skill.name}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        mb: 1 
                      }}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                          {skill.name}
                        </Typography>
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
                      
                      <LinearProgress
                        variant="determinate"
                        value={skill.popularityPercentage}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha(profilePurple, 0.1),
                          mb: 0.5,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: profilePurple,
                            borderRadius: 3
                          }
                        }}
                      />
                      
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Chip
                          label={skill.category}
                          size="small"
                          sx={{ 
                            height: 20,
                            fontSize: '0.7rem',
                            bgcolor: alpha(profilePurple, 0.08),
                            color: profilePurple
                          }}
                        />
                        <Chip
                          label={`${skill.userCount} users`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            height: 20,
                            fontSize: '0.7rem',
                            borderColor: alpha(profilePurple, 0.2),
                            color: 'text.secondary'
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Paper>

            {/* Popular Certifications - Abajo */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                bgcolor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                overflow: 'hidden',
                border: `1px solid ${alpha(profilePurple, 0.15)}`,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <PopularCertifications certifications={popularCertifications} />
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;