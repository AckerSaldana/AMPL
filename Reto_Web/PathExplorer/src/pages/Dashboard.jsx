// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { useDarkMode } from "../contexts/DarkModeContext";
import { getDarkModeStyles } from "../styles/darkModeStyles";

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
const TimelineSkeleton = ({ profilePurple, darkMode }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 2,
      bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
      boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.03)',
      overflow: 'hidden',
      mb: 3
    }}
  >
    <Box sx={{ 
      p: 2, 
      borderBottom: '1px solid',
      borderColor: darkMode ? alpha(profilePurple, 0.3) : alpha(profilePurple, 0.1),
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
  const { darkMode } = useDarkMode();
  const darkModeStyles = getDarkModeStyles(darkMode);
  const theme = useTheme();
  
  // Estados básicos
  const [stats, setStats] = useState({
    activeProjects: 1,
    teamMembers: 7,
    myCertifications: 0,
    skillsMastered: 0,
    certsInProgress: 0
  });
  const [userRole, setUserRole] = useState("");
  const [popularSkills, setPopularSkills] = useState(DEFAULT_SKILLS.slice(0, 3));
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para certificaciones populares
  const [popularCertifications, setPopularCertifications] = useState(DEFAULT_CERTIFICATIONS.slice(0, 3));
  
  // Estados de carga separados para renderizado progresivo
  const [loadingStates, setLoadingStates] = useState({
    stats: true,
    skills: true,
    certifications: true
  });
  
  // Usamos el hook de timeline igual que en MyPath
  const { timelineItems, loading: timelineLoading, useMockData: usingMockTimeline } = useUserTimeline();
  
  const today = new Date();
  const options = { day: "numeric", month: "long", year: "numeric" };
  const formattedDate = today.toLocaleDateString("en-US", options);

  // Color original del perfil
  const profilePurple = '#9c27b0';

  // Optimized data fetching with parallel queries
  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setLoadingStates({ stats: true, skills: true, certifications: true });

      // Parallel data fetching
      const [
        userResult,
        certStatsResult,
        skillsCountResult,
        projectsResult,
        skillsDataResult,
        certificationsDataResult
      ] = await Promise.allSettled([
        // 1. User role and team
        supabase
          .from("User")
          .select("role, id_Team")
          .eq("user_id", user.id)
          .single(),

        // 2. Combined certification stats query
        supabase
          .from("UserCertifications")
          .select("status")
          .eq("user_ID", user.id),

        // 3. User skills count
        supabase
          .from("UserSkill")
          .select("skill_ID", { count: 'exact' })
          .eq("user_ID", user.id),

        // 4. User projects through role history
        supabase
          .from("RoleProjectHistory")
          .select("project_ID", { count: 'exact' })
          .eq("user_ID", user.id),

        // 5. Popular skills with usage data
        supabase
          .from("Skill")
          .select(`
            skill_ID,
            name,
            category,
            type,
            UserSkill!inner(user_ID)
          `)
          .limit(5),

        // 6. Popular certifications
        supabase
          .from("Certifications")
          .select(`
            certification_id,
            title,
            type,
            UserCertifications!inner(user_ID, status)
          `)
          .limit(5)
      ]);

      // Process results with error handling for each
      const newStats = { ...stats };
      let newUserRole = "";

      // 1. Process user data
      if (userResult.status === 'fulfilled' && userResult.value.data) {
        newUserRole = userResult.value.data.role || "";
        
        // Get team size if user has a team
        if (userResult.value.data.id_Team) {
          const { count } = await supabase
            .from("User")
            .select("*", { count: 'exact', head: true })
            .eq("id_Team", userResult.value.data.id_Team);
          newStats.teamMembers = count || 7;
        }
      }

      // 2. Process certification stats
      if (certStatsResult.status === 'fulfilled' && certStatsResult.value.data) {
        const certStats = certStatsResult.value.data.reduce((acc, cert) => {
          if (cert.status === 'approved') acc.approved++;
          else if (cert.status === 'pending') acc.pending++;
          return acc;
        }, { approved: 0, pending: 0 });
        
        newStats.myCertifications = certStats.approved;
        newStats.certsInProgress = certStats.pending;
      }

      // 3. Process skills count
      if (skillsCountResult.status === 'fulfilled') {
        newStats.skillsMastered = skillsCountResult.value.count || 0;
      }

      // 4. Process projects count
      if (projectsResult.status === 'fulfilled') {
        newStats.activeProjects = projectsResult.value.count || 1;
      }

      // Update stats immediately
      setStats(newStats);
      setUserRole(newUserRole);
      setLoadingStates(prev => ({ ...prev, stats: false }));

      // 5. Process popular skills
      if (skillsDataResult.status === 'fulfilled' && skillsDataResult.value.data) {
        const totalUsers = await supabase
          .from("User")
          .select("*", { count: 'exact', head: true });
        
        const totalCount = totalUsers.count || 100;
        
        const skillsWithStats = skillsDataResult.value.data.map(skill => ({
          id: skill.skill_ID,
          name: skill.name,
          category: skill.category || skill.type,
          popularityPercentage: Math.round((skill.UserSkill?.length / totalCount) * 100) || 50,
          userCount: skill.UserSkill?.length || 0,
          projectCount: Math.floor(Math.random() * 10) + 1
        }));
        
        setPopularSkills(skillsWithStats.length > 0 ? skillsWithStats : DEFAULT_SKILLS);
      }
      setLoadingStates(prev => ({ ...prev, skills: false }));

      // 6. Process popular certifications
      if (certificationsDataResult.status === 'fulfilled' && certificationsDataResult.value.data) {
        const totalUsers = await supabase
          .from("User")
          .select("*", { count: 'exact', head: true });
        
        const totalCount = totalUsers.count || 100;
        
        const certsWithStats = certificationsDataResult.value.data
          .map(cert => {
            const approvedCount = cert.UserCertifications?.filter(uc => uc.status === 'approved').length || 0;
            return {
              id: cert.certification_id,
              name: cert.title,
              category: cert.type,
              completions: approvedCount,
              popularity: Math.round((approvedCount / totalCount) * 100) || 50,
              iconType: getIconTypeFromCertType(cert.type)
            };
          })
          .sort((a, b) => b.completions - a.completions)
          .slice(0, 5);
        
        setPopularCertifications(certsWithStats.length > 0 ? certsWithStats : DEFAULT_CERTIFICATIONS);
      }
      setLoadingStates(prev => ({ ...prev, certifications: false }));

    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      setLoadingStates({ stats: false, skills: false, certifications: false });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <Box sx={{ 
      width: '100%',
      px: { xs: 2, sm: 3, md: 4 },
      pb: 4
    }}>
      {/* Header con información del usuario */}
      <Paper 
        elevation={0} 
        sx={{ 
          bgcolor: ACCENTURE_COLORS.accenturePurple,
          mb: 3,
          px: { xs: 2, sm: 3, md: 4 },
          py: 3,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${ACCENTURE_COLORS.accenturePurple} 0%, ${alpha(ACCENTURE_COLORS.accenturePurple, 0.8)} 100%)`,
          boxShadow: darkMode ? `0 4px 20px ${alpha(ACCENTURE_COLORS.accenturePurple, 0.5)}` : `0 4px 20px ${alpha(ACCENTURE_COLORS.accenturePurple, 0.3)}`
        }}
      >
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item xs={12}>
            <Typography variant="h4" fontWeight={600} gutterBottom sx={{ color: 'white' }}>
              Welcome back!
            </Typography>
            <Typography variant="body1" sx={{ color: alpha('#ffffff', 0.9) }}>
              Today is {formattedDate}
            </Typography>
          </Grid>
          {/* Icons removed as requested */}
        </Grid>
      </Paper>

      {/* Main Content Area */}
      <Box>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: darkMode ? alpha(profilePurple, 0.15) : alpha(profilePurple, 0.04),
                border: `1px solid ${darkMode ? alpha(profilePurple, 0.3) : alpha(profilePurple, 0.1)}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: darkMode ? `0 8px 24px ${alpha(profilePurple, 0.3)}` : `0 8px 24px ${alpha(profilePurple, 0.15)}`,
                  borderColor: darkMode ? alpha(profilePurple, 0.5) : alpha(profilePurple, 0.3),
                },
                ...darkModeStyles.cardStyles
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: profilePurple, width: 40, height: 40 }}>
                  <WorkOutlineIcon />
                </Avatar>
                <TrendingUpIcon sx={{ ml: 'auto', color: '#4caf50' }} />
              </Box>
              <Typography variant="h4" fontWeight={600}>
                {loadingStates.stats ? <Skeleton width={40} /> : stats.activeProjects}
              </Typography>
              <Typography variant="body2" color={theme.palette.text.secondary}>
                Active Projects
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: darkMode ? alpha(profilePurple, 0.15) : alpha(profilePurple, 0.04),
                border: `1px solid ${darkMode ? alpha(profilePurple, 0.3) : alpha(profilePurple, 0.1)}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: darkMode ? `0 8px 24px ${alpha(profilePurple, 0.3)}` : `0 8px 24px ${alpha(profilePurple, 0.15)}`,
                  borderColor: darkMode ? alpha(profilePurple, 0.5) : alpha(profilePurple, 0.3),
                },
                ...darkModeStyles.cardStyles
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: profilePurple, width: 40, height: 40 }}>
                  <GroupIcon />
                </Avatar>
              </Box>
              <Typography variant="h4" fontWeight={600}>
                {loadingStates.stats ? <Skeleton width={40} /> : stats.teamMembers}
              </Typography>
              <Typography variant="body2" color={theme.palette.text.secondary}>
                Team Members
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: darkMode ? alpha(profilePurple, 0.15) : alpha(profilePurple, 0.04),
                border: `1px solid ${darkMode ? alpha(profilePurple, 0.3) : alpha(profilePurple, 0.1)}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: darkMode ? `0 8px 24px ${alpha(profilePurple, 0.3)}` : `0 8px 24px ${alpha(profilePurple, 0.15)}`,
                  borderColor: darkMode ? alpha(profilePurple, 0.5) : alpha(profilePurple, 0.3),
                },
                ...darkModeStyles.cardStyles
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: profilePurple, width: 40, height: 40 }}>
                  <SchoolIcon />
                </Avatar>
                {stats.certsInProgress > 0 && (
                  <Chip 
                    label={`+${stats.certsInProgress}`} 
                    size="small" 
                    sx={{ 
                      ml: 'auto', 
                      bgcolor: '#ff9800', 
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem' 
                    }} 
                  />
                )}
              </Box>
              <Typography variant="h4" fontWeight={600}>
                {loadingStates.stats ? <Skeleton width={40} /> : stats.myCertifications}
              </Typography>
              <Typography variant="body2" color={theme.palette.text.secondary}>
                My Certifications
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Paper
              elevation={0}
              onClick={() => navigate('/user')}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: darkMode ? alpha(profilePurple, 0.15) : alpha(profilePurple, 0.04),
                border: `1px solid ${darkMode ? alpha(profilePurple, 0.3) : alpha(profilePurple, 0.1)}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: darkMode ? `0 8px 24px ${alpha(profilePurple, 0.3)}` : `0 8px 24px ${alpha(profilePurple, 0.15)}`,
                  borderColor: darkMode ? alpha(profilePurple, 0.5) : alpha(profilePurple, 0.3),
                },
                ...darkModeStyles.cardStyles
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: profilePurple, width: 40, height: 40 }}>
                  <CodeIcon />
                </Avatar>
                <ArrowUpwardIcon sx={{ ml: 'auto', color: '#4caf50' }} />
              </Box>
              <Typography variant="h4" fontWeight={600}>
                {loadingStates.stats ? <Skeleton width={40} /> : stats.skillsMastered}
              </Typography>
              <Typography variant="body2" color={theme.palette.text.secondary}>
                Skills Mastered
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} lg={8}>
            {/* Timeline - Moved to top */}
            <Box sx={{ mb: 3 }}>
              <DashboardTimeline 
                items={timelineItems} 
                profilePurple={profilePurple}
                loading={timelineLoading}
                darkMode={darkMode}
              />
            </Box>

            {/* Popular Skills Section */}
            <Paper 
              elevation={0} 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                border: `1px solid ${darkMode ? alpha(profilePurple, 0.3) : alpha(profilePurple, 0.1)}`,
                overflow: 'hidden',
                backgroundColor: darkMode ? '#1e1e1e' : '#ffffff'
              }}
            >
              <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid',
                borderColor: darkMode ? alpha(profilePurple, 0.3) : alpha(profilePurple, 0.1),
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon 
                    sx={{ 
                      color: profilePurple, 
                      mr: 1.5,
                      fontSize: 20
                    }} 
                  />
                  <Typography variant="h6" fontWeight={500} sx={{ fontSize: '1rem' }}>
                    Popular Skills in Company
                  </Typography>
                </Box>
                <Button 
                  size="small"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: '0.7rem' }} />}
                  onClick={() => navigate('/allskills')}
                  sx={{ 
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    color: profilePurple,
                    fontWeight: 400,
                    '&:hover': {
                      bgcolor: 'transparent'
                    }
                  }}
                >
                  View All Skills
                </Button>
              </Box>
              
              <Box sx={{ p: 2 }}>
                {loadingStates.skills ? (
                  // Skeleton loading for skills
                  Array.from({ length: 3 }).map((_, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
                    </Box>
                  ))
                ) : (
                  popularSkills.map((skill, index) => (
                    <Box
                      key={skill.id}
                      sx={{
                        mb: 2,
                        p: 2,
                        borderRadius: 1,
                        border: `1px solid ${darkMode ? alpha(profilePurple, 0.3) : alpha(profilePurple, 0.1)}`,
                        transition: 'all 0.2s',
                        bgcolor: darkMode ? alpha(profilePurple, 0.05) : 'transparent',
                        '&:hover': {
                          borderColor: darkMode ? alpha(profilePurple, 0.5) : alpha(profilePurple, 0.3),
                          bgcolor: darkMode ? alpha(profilePurple, 0.1) : alpha(profilePurple, 0.02),
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {skill.name}
                          </Typography>
                          <Typography variant="caption" color={theme.palette.text.secondary}>
                            {skill.category} • {skill.userCount} professionals • {skill.projectCount} projects
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${skill.popularityPercentage}%`}
                          size="small"
                          sx={{
                            bgcolor: profilePurple,
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={skill.popularityPercentage} 
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: darkMode ? alpha(profilePurple, 0.2) : alpha(profilePurple, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            bgcolor: profilePurple
                          }
                        }}
                      />
                    </Box>
                  ))
                )}
              </Box>
            </Paper>

            {/* Popular Certifications Section */}
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 2,
                border: `1px solid ${darkMode ? alpha(profilePurple, 0.3) : alpha(profilePurple, 0.1)}`,
                overflow: 'hidden',
                backgroundColor: darkMode ? '#1e1e1e' : '#ffffff'
              }}
            >
              <PopularCertifications 
                certifications={popularCertifications}
                loading={loadingStates.certifications}
                darkMode={darkMode}
              />
            </Paper>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} lg={4}>
            {/* Calendar */}
            <Box sx={{ maxHeight: { xs: '600px', sm: '700px', md: '800px', lg: '900px' } }}>
              <CalendarCompact userId={user?.id} darkMode={darkMode} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;