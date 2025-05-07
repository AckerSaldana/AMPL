// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  useTheme,
  Button,
  CircularProgress,
  Avatar,
  Chip,
  LinearProgress,
  Stack,
  IconButton
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import dayjs from 'dayjs';

// Importar los componentes personalizados
// Nota: Asegúrate de que estos archivos existan en tu proyecto
import useAuth from "../hooks/useAuth";

// Iconos
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import EventIcon from "@mui/icons-material/Event";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CodeIcon from "@mui/icons-material/Code";

const Dashboard = () => {
  const theme = useTheme();
  const { user, role } = useAuth();
  const [stats, setStats] = useState({
    activeProjects: 1,
    teamMembers: 7,
    pendingTasks: 0
  });
  const [userRole, setUserRole] = useState("Behavioral Health Expert");
  const [skills, setSkills] = useState([
    { name: "Frontend Dev", usagePercentage: 30, projectCount: 3 },
    { name: "UX/UI Designer", usagePercentage: 20, projectCount: 2 },
    { name: "Front End Developer", usagePercentage: 20, projectCount: 2 },
    { name: "Back End Developer", usagePercentage: 20, projectCount: 2 },
    { name: "Behavioral Health Expert", usagePercentage: 10, projectCount: 1 }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado del calendario
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [projectDeadlines, setProjectDeadlines] = useState([]);

  const today = new Date();
  const options = { day: "numeric", month: "long", year: "numeric" };
  const formattedDate = today.toLocaleDateString("en-US", options);

  const navigate = useNavigate();

  // Funciones para el calendario
  const handlePrevMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Generar calendario para el mes actual
  const generateCalendarDays = () => {
    const firstDayOfMonth = currentDate.startOf('month');
    const daysInMonth = currentDate.daysInMonth();
    const startDayOfWeek = firstDayOfMonth.day(); // 0 = Domingo, 1 = Lunes, etc.
    
    // Días del mes anterior para completar la primera semana
    const prevMonth = currentDate.subtract(1, 'month');
    const daysInPrevMonth = prevMonth.daysInMonth();
    
    let days = [];
    
    // Días del mes anterior
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({
        day: daysInPrevMonth - startDayOfWeek + i + 1,
        isCurrentMonth: false,
        date: prevMonth.endOf('month').subtract(startDayOfWeek - i - 1, 'day')
      });
    }
    
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        isToday: i === dayjs().date() && currentDate.month() === dayjs().month() && currentDate.year() === dayjs().year(),
        isSelected: i === selectedDate.date() && currentDate.month() === selectedDate.month() && currentDate.year() === selectedDate.year(),
        date: dayjs(currentDate).date(i)
      });
    }
    
    // Días del mes siguiente para completar la última semana
    const totalDaysShown = Math.ceil(days.length / 7) * 7;
    const nextMonth = currentDate.add(1, 'month');
    
    for (let i = 1; days.length < totalDaysShown; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: nextMonth.startOf('month').add(i - 1, 'day')
      });
    }
    
    // Agrupar en semanas
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return weeks;
  };

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Este método podría ser tan complejo como necesitas para obtener datos reales
        // Para esta demo, simplificaremos y usaremos datos estáticos que coinciden con la captura de pantalla
        
        setUserRole("Behavioral Health Expert");
        
        // Skills basadas en la captura de pantalla
        setSkills([
          { name: "Frontend Dev", usagePercentage: 30, projectCount: 3 },
          { name: "UX/UI Designer", usagePercentage: 20, projectCount: 2 },
          { name: "Front End Developer", usagePercentage: 20, projectCount: 2 },
          { name: "Back End Developer", usagePercentage: 20, projectCount: 2 },
          { name: "Behavioral Health Expert", usagePercentage: 10, projectCount: 1 }
        ]);
        
        // Estadísticas basadas en la captura de pantalla
        setStats({
          activeProjects: 1,
          teamMembers: 7,
          pendingTasks: 0
        });
        
        // No hay fechas límite de proyectos próximas
        setProjectDeadlines([]);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
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
        <CircularProgress sx={{ color: '#9c27b0' }} />
      </Box>
    );
  }

  // Using the purple from the screenshot
  const profilePurple = '#9c27b0';
  const calendarWeeks = generateCalendarDays();

  return (
    <Box sx={{ 
      bgcolor: '#f9f7ff', 
      minHeight: '100vh',
      width: '100%',
      padding: { xs: 2, md: 3 }
    }}>
      {/* Welcome banner with profile style purple */}
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

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3, width: '100%' }}>
        <Grid item xs={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha(profilePurple, 0.1),
                color: profilePurple,
                mr: 2
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

        <Grid item xs={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha(profilePurple, 0.1),
                color: profilePurple,
                mr: 2
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

        <Grid item xs={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha(profilePurple, 0.1),
                color: profilePurple,
                mr: 2
              }}
            >
              <AssignmentOutlinedIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" color={profilePurple} fontWeight="medium">
                {stats.pendingTasks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Tasks
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3} sx={{ width: '100%' }}>
        {/* Left Section - Schedule & Projects */}
        <Grid item xs={12} lg={8}>
          {/* Schedule & Reminders */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              mb: 3,
              overflow: 'hidden',
              width: '100%'
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 2,
                pb: 0
              }}
            >
              <EventIcon 
                sx={{ 
                  color: profilePurple, 
                  mr: 1.5,
                  fontSize: 20
                }} 
              />
              <Typography variant="h6" fontWeight={500} sx={{ fontSize: '1.125rem' }}>
                Schedule & Reminders
              </Typography>
            </Box>

            <Box sx={{ p: 2 }}>
              {/* Month & Year */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 2
                }}
              >
                <Typography variant="subtitle1" fontWeight={500}>
                  May 2025
                </Typography>
                <Box>
                  <IconButton size="small" onClick={handlePrevMonth}>
                    <ArrowBackIosNewIcon sx={{ fontSize: 14, color: profilePurple }} />
                  </IconButton>
                  <IconButton size="small" onClick={handleNextMonth}>
                    <ArrowForwardIosIcon sx={{ fontSize: 14, color: profilePurple }} />
                  </IconButton>
                </Box>
              </Box>

              {/* Calendar */}
              <Box sx={{ mb: 3 }}>
                {/* Days of Week Header */}
                <Grid container spacing={0} sx={{ mb: 1 }}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <Grid item xs key={index} sx={{ textAlign: 'center' }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 500,
                          color: (index === 0 || index === 6) ? profilePurple : 'text.secondary'
                        }}
                      >
                        {day}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>

                {/* Calendar Grid */}
                {calendarWeeks.map((week, weekIndex) => (
                  <Grid container spacing={0} key={weekIndex}>
                    {week.map((day, dayIndex) => (
                      <Grid item xs key={dayIndex}>
                        <Box 
                          onClick={() => handleDateSelect(day.date)}
                          sx={{
                            width: 30,
                            height: 30,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            my: 0.8,
                            borderRadius: '50%',
                            cursor: 'pointer',
                            bgcolor: day.isSelected 
                              ? profilePurple 
                              : day.isToday 
                              ? alpha(profilePurple, 0.1)
                              : 'transparent',
                            color: day.isSelected 
                              ? '#fff' 
                              : day.isToday 
                              ? profilePurple 
                              : day.isCurrentMonth 
                              ? 'text.primary' 
                              : 'text.disabled',
                            opacity: day.isCurrentMonth ? 1 : 0.6,
                            fontWeight: (day.isToday || day.isSelected) ? 600 : 400,
                            '&:hover': {
                              bgcolor: day.isSelected 
                                ? profilePurple 
                                : alpha(profilePurple, 0.1)
                            }
                          }}
                        >
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {day.day}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ))}
              </Box>

              {/* Project Deadlines */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EventIcon
                  sx={{
                    color: profilePurple,
                    mr: 1,
                    fontSize: 18
                  }}
                />
                <Typography variant="subtitle2" fontWeight={500}>
                  Project Deadlines
                </Typography>
              </Box>

              <Box 
                sx={{ 
                  p: 2,
                  textAlign: 'center',
                  color: 'text.secondary',
                  border: '1px solid #f0f0f0', 
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2">
                  No upcoming project deadlines
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Active Projects */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              overflow: 'hidden',
              width: '100%',
              p: 2,
              mb: 3,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography color="error">
              Error loading active project
            </Typography>
          </Paper>
        </Grid>
        
        {/* Right Section - Skills */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              height: '100%',
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
                <CodeIcon 
                  sx={{ 
                    color: profilePurple, 
                    mr: 1.5,
                    fontSize: 20
                  }} 
                />
                <Typography variant="h6" fontWeight={500} sx={{ fontSize: '1.125rem' }}>
                  Key Skills ({userRole})
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
              {/* Skills List */}
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
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;