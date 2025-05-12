// src/components/CalendarCompact.jsx
import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  IconButton,
  Grid,
  alpha,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  Avatar,
  Tooltip
} from "@mui/material";
import dayjs from 'dayjs';
import { supabase } from "../supabase/supabaseClient";

// Icons
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import EventIcon from "@mui/icons-material/Event";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FlagIcon from "@mui/icons-material/Flag";
import LowPriorityIcon from "@mui/icons-material/LowPriority";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

export const CalendarCompact = ({ userId }) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [projectReminders, setProjectReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Theme color - match with profile purple color
  const profilePurple = '#9c27b0';
  
  // Handle month navigation
  const handleMonthChange = (direction) => {
    setCurrentMonth(prev => direction === 'prev' 
      ? prev.subtract(1, 'month') 
      : prev.add(1, 'month')
    );
  };

  // Fetch project deadlines from the database - same as original
  useEffect(() => {
    const fetchProjectDeadlines = async () => {
      try {
        setIsLoading(true);
        
        if (!userId) {
          throw new Error("User ID is required");
        }

        // Obtener roles del usuario actual
        const { data: userRoles, error: rolesError } = await supabase
          .from('UserRole')
          .select('project_id, role_name')
          .eq('user_id', userId);

        if (rolesError) throw rolesError;
        
        if (!userRoles || userRoles.length === 0) {
          // Datos de ejemplo si no hay proyectos
          setProjectReminders([
            {
              id: 1,
              title: "Wellness platform for employees",
              endDate: dayjs().add(14, 'day').format('YYYY-MM-DD'),
              formattedDate: dayjs().add(14, 'day').format('MMM DD, YYYY'),
              priority: "High",
              role: "Behavioral Health Expert",
              status: "In Progress"
            },
            {
              id: 2,
              title: "Mobile App Development",
              endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
              formattedDate: dayjs().add(30, 'day').format('MMM DD, YYYY'),
              priority: "Medium",
              role: "UI Designer",
              status: "Planning"
            }
          ]);
          setIsLoading(false);
          return;
        }

        // Obtener detalles de todos los proyectos del usuario que NO estén completados
        const projectIds = userRoles.map(role => role.project_id);
        
        const { data: projects, error: projectsError } = await supabase
          .from('Project')
          .select('projectID, title, end_date, priority, status, progress')
          .in('projectID', projectIds)
          .neq('status', 'Completed');

        if (projectsError) throw projectsError;

        // Crear un mapa de roles por ID de proyecto para facilitar la búsqueda
        const rolesByProject = {};
        userRoles.forEach(role => {
          rolesByProject[role.project_id] = role.role_name;
        });

        // Transformar los datos para mostrarlos
        const reminders = projects?.map(project => ({
          id: project.projectID,
          title: project.title,
          endDate: project.end_date,
          formattedDate: project.end_date 
            ? dayjs(project.end_date).format('MMM DD, YYYY') 
            : 'No deadline set',
          priority: project.priority || 'Normal',
          role: rolesByProject[project.projectID] || 'Team Member',
          status: project.status,
          progress: project.progress || 0
        })) || [];

        // Ordenar por fecha de finalización (más cercana primero)
        reminders.sort((a, b) => {
          if (!a.endDate) return 1;
          if (!b.endDate) return -1;
          return dayjs(a.endDate).diff(dayjs(b.endDate));
        });

        setProjectReminders(reminders);
      } catch (err) {
        console.error("Error fetching project deadlines:", err.message);
        setError(err.message);
        
        // Datos de ejemplo en caso de error
        setProjectReminders([
          {
            id: 1,
            title: "Wellness platform for employees",
            endDate: dayjs().add(14, 'day').format('YYYY-MM-DD'),
            formattedDate: dayjs().add(14, 'day').format('MMM DD, YYYY'),
            priority: "High",
            role: "Behavioral Health Expert",
            status: "In Progress"
          },
          {
            id: 2,
            title: "Mobile App Development",
            endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
            formattedDate: dayjs().add(30, 'day').format('MMM DD, YYYY'),
            priority: "Medium",
            role: "UI Designer",
            status: "Planning"
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDeadlines();
  }, [userId]);
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDayOfMonth = currentMonth.startOf('month');
    const lastDayOfMonth = currentMonth.endOf('month');
    const daysInMonth = lastDayOfMonth.date();
    
    // Get day of week of first day (0-6, where 0 is Sunday)
    const startDayOfWeek = firstDayOfMonth.day();
    
    // Get days from previous month to display
    const prevMonthDays = [];
    const prevMonth = currentMonth.subtract(1, 'month');
    const daysInPrevMonth = prevMonth.endOf('month').date();
    
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      prevMonthDays.push({
        date: daysInPrevMonth - i,
        isCurrentMonth: false,
        dayjs: prevMonth.date(daysInPrevMonth - i)
      });
    }
    
    // Current month days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        date: i,
        isCurrentMonth: true,
        isToday: currentMonth.date(i).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD'),
        isSelected: currentMonth.date(i).format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD'),
        // Marcar días con vencimientos de proyectos
        hasDeadline: projectReminders.some(
          project => project.endDate === currentMonth.date(i).format('YYYY-MM-DD')
        ),
        dayjs: currentMonth.date(i)
      });
    }
    
    // Next month days to fill the remaining slots
    const nextMonthDays = [];
    const totalDaysDisplayed = 42; // 6 rows of 7 days
    const remainingDays = totalDaysDisplayed - prevMonthDays.length - currentMonthDays.length;
    const nextMonth = currentMonth.add(1, 'month');
    
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push({
        date: i,
        isCurrentMonth: false,
        dayjs: nextMonth.date(i)
      });
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };
  
  // Days of the week
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date.dayjs);
  };
  
  // Get calendar days
  const calendarDays = generateCalendarDays();

  // Get priority icon based on priority level
  const getPriorityIcon = (priority) => {
    switch(priority.toLowerCase()) {
      case 'high':
        return <PriorityHighIcon sx={{ fontSize: 16, color: '#f44336' }} />;
      case 'medium':
        return <FlagIcon sx={{ fontSize: 16, color: '#ff9800' }} />;
      case 'low':
        return <LowPriorityIcon sx={{ fontSize: 16, color: '#4caf50' }} />;
      default:
        return <FlagIcon sx={{ fontSize: 16, color: '#9e9e9e' }} />;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress size={24} sx={{ color: profilePurple }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
        <Typography variant="body2">Error loading calendar</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ pt: 0, pb: 0 }}>
      {/* Calendar Grid - Con espaciado mejorado y bordes más limpios */}
      <Paper elevation={0} sx={{ 
        mb: 0,
        borderRadius: 2,
        bgcolor: '#ffffff',
        border: `1px solid ${alpha('#9c27b0', 0.1)}`,
        boxShadow: 'none',
        overflow: 'visible'
      }}>
        {/* Encabezado del mes con mayor padding */}
        <Box sx={{ 
          px: 4,
          py: 3,
          pb: 2,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <Typography variant="subtitle1" fontWeight={500} sx={{ fontSize: '1.1rem' }}>
            {currentMonth.format('MMMM YYYY')}
          </Typography>
          <Box>
            <IconButton 
              size="small" 
              onClick={() => handleMonthChange('prev')}
              sx={{ color: profilePurple, mx: 0.5 }}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: '0.8rem' }} />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={() => handleMonthChange('next')}
              sx={{ color: profilePurple, mx: 0.5 }}
            >
              <ArrowForwardIosIcon sx={{ fontSize: '0.8rem' }} />
            </IconButton>
          </Box>
        </Box>
        
        <Divider sx={{ opacity: 0.08 }} />
        
        {/* Contenedor del calendario con más padding */}
        <Box sx={{ px: 4, py: 3 }}>
          {/* Weekday Headers con mejor espaciado */}
          <Grid container spacing={0} sx={{ mb: 3 }}>
            {weekDays.map((day, index) => (
              <Grid item xs key={index} sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    color: (index === 0 || index === 6) ? profilePurple : 'text.secondary'
                  }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>
          
          {/* Calendar Days con mejor espaciado */}
          <Box sx={{ mb: 3 }}>
            {/* Dividir calendarDays en semanas */}
            {Array(6).fill(null).map((_, weekIndex) => (
              <Grid container spacing={0} key={weekIndex} sx={{ mb: 2 }}>
                {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
                  <Grid item xs key={dayIndex}>
                    <Box 
                      onClick={() => handleDateSelect(day)}
                      sx={{
                        width: 36,
                        height: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        position: 'relative',
                        borderRadius: day.isToday ? '50%' : day.isSelected ? '30%' : '50%',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        bgcolor: day.isSelected 
                          ? profilePurple 
                          : day.isToday 
                          ? alpha(profilePurple, 0.08)
                          : 'transparent',
                        color: day.isSelected 
                          ? '#fff' 
                          : day.isToday 
                          ? profilePurple 
                          : day.isCurrentMonth 
                          ? day.date === 8 ? profilePurple : 'text.primary' 
                          : 'text.disabled',
                        fontWeight: day.isToday || day.isSelected || day.date === 8 ? 600 : 400,
                        fontSize: '0.85rem',
                        opacity: day.isCurrentMonth ? 1 : 0.4,
                        boxShadow: day.isToday && !day.isSelected ? `0 0 0 1px ${alpha(profilePurple, 0.3)}` : 'none',
                        ...(day.date === 8 && !day.isSelected ? { 
                          bgcolor: profilePurple,
                          color: '#fff' 
                        } : {}),
                        '&::after': day.hasDeadline ? {
                          content: '""',
                          position: 'absolute',
                          bottom: '2px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          bgcolor: day.isSelected ? '#fff' : profilePurple
                        } : {},
                        '&:hover': {
                          bgcolor: day.isSelected 
                            ? profilePurple 
                            : alpha(profilePurple, 0.12),
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      <Typography variant="body2" sx={{ lineHeight: 1, fontSize: '0.85rem' }}>
                        {day.date}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ))}
          </Box>
        </Box>

        <Divider sx={{ opacity: 0.08 }} />

        {/* Sección de deadlines con mejor espaciado */}
        <Box sx={{ px: 4, py: 3 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 500, 
              color: 'text.primary',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              fontSize: '1rem'
            }}
          >
            <EventIcon sx={{ fontSize: 18, mr: 1.5, color: profilePurple }} /> 
            Project Deadlines
          </Typography>
          
          {projectReminders.length > 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2
            }}>
              {projectReminders.map((project) => (
                <Paper
                  key={project.id}
                  elevation={0}
                  sx={{
                    position: 'relative',
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: `1px solid ${alpha(profilePurple, 0.1)}`,
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: alpha(profilePurple, 0.2),
                      boxShadow: `0 4px 10px ${alpha(profilePurple, 0.05)}`
                    }
                  }}
                >
                  {/* Left border color based on priority */}
                  <Box sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    bgcolor: project.priority === 'High' 
                      ? '#f44336' 
                      : project.priority === 'Medium' 
                      ? '#ff9800' 
                      : '#4caf50'
                  }} />
                  
                  <Box sx={{ p: 2.5, pl: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight={600}
                        sx={{ 
                          mb: 0.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {project.title}
                      </Typography>
                      
                      <Tooltip title={`${project.priority} Priority`}>
                        <Box>
                          {getPriorityIcon(project.priority)}
                        </Box>
                      </Tooltip>
                    </Box>
                    
                    <Box sx={{ 
                      mt: 1.5, 
                      display: 'flex', 
                      flexWrap: 'wrap',
                      alignItems: 'center', 
                      gap: 1.5 
                    }}>
                      <Chip
                        label={project.status}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 500,
                          bgcolor: project.status === 'In Progress' 
                            ? alpha('#2196f3', 0.1) 
                            : project.status === 'Planning' 
                            ? alpha('#ff9800', 0.1)
                            : alpha('#4caf50', 0.1),
                          color: project.status === 'In Progress' 
                            ? '#2196f3' 
                            : project.status === 'Planning' 
                            ? '#ff9800'
                            : '#4caf50',
                          borderRadius: 1
                        }}
                      />
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        color: 'text.secondary',
                        fontSize: '0.7rem'
                      }}>
                        <CalendarTodayIcon sx={{ fontSize: 12, mr: 0.5 }} />
                        {project.formattedDate}
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 1.5, borderColor: alpha(profilePurple, 0.05) }} />
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 22, 
                            height: 22, 
                            fontSize: '0.7rem',
                            bgcolor: alpha(profilePurple, 0.1),
                            color: profilePurple,
                            mr: 1
                          }}
                        >
                          {project.role.charAt(0)}
                        </Avatar>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {project.role}
                        </Typography>
                      </Box>
                      
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 600, 
                          color: project.progress >= 70 
                            ? '#4caf50' 
                            : project.progress >= 30 
                            ? '#ff9800' 
                            : profilePurple
                        }}
                      >
                        {project.progress}% complete
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              px: 2,
              color: 'text.secondary', 
              border: `1px dashed ${alpha(profilePurple, 0.1)}`, 
              borderRadius: 2 
            }}>
              <Typography variant="body2">No upcoming project deadlines</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};