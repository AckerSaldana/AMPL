// src/components/CalendarCompact.jsx
import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  IconButton,
  Grid,
  alpha,
  CircularProgress
} from "@mui/material";
import dayjs from 'dayjs';
import { supabase } from "../supabase/supabaseClient";

// Icons
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import EventIcon from "@mui/icons-material/Event";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

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

  // Fetch project deadlines from the database
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
          .neq('status', 'Completed'); // Cambio: filtra todos excepto "Completed"

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
    <Box sx={{ pt: 2, pb: 3 }}>
      {/* Month Navigation */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
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
      
      {/* Weekday Headers */}
      <Grid container spacing={0} sx={{ mb: 2 }}>
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
      
      {/* Calendar Days - Organizados en semanas para mejor estructura */}
      <Box sx={{ mb: 4 }}>
        {/* Dividir calendarDays en semanas */}
        {Array(6).fill(null).map((_, weekIndex) => (
          <Grid container spacing={0} key={weekIndex} sx={{ mb: 1.5 }}>
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
                    my: 1,
                    position: 'relative',
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
                    fontWeight: day.isToday || day.isSelected ? 600 : 400,
                    fontSize: '0.9rem',
                    opacity: day.isCurrentMonth ? 1 : 0.5,
                    // Indicador visual para días con vencimientos
                    '&::after': day.hasDeadline ? {
                      content: '""',
                      position: 'absolute',
                      bottom: '3px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      bgcolor: day.isSelected ? '#fff' : profilePurple
                    } : {},
                    '&:hover': {
                      bgcolor: day.isSelected 
                        ? profilePurple 
                        : alpha(profilePurple, 0.1)
                    }
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1 }}>
                    {day.date}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        ))}
      </Box>
      
      {/* Project Deadline Reminders */}
      <Box sx={{ mt: 4 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 500, 
            color: 'text.primary',
            mb: 2.5,
            display: 'flex',
            alignItems: 'center',
            fontSize: '1rem'
          }}
        >
          <EventIcon sx={{ fontSize: 18, mr: 1, color: profilePurple }} /> 
          Project Deadlines
        </Typography>
        
        {projectReminders.length > 0 ? (
          projectReminders.map((project) => (
            <Box 
              key={project.id}
              sx={{ 
                p: 2,
                borderRadius: 1,
                border: '1px solid',
                borderColor: alpha(profilePurple, 0.2),
                mb: 2.5,
                '&:last-child': {
                  mb: 0
                }
              }}
            >
              <Typography variant="body1" fontWeight={500}>
                {project.title}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                  Due: {project.formattedDate}
                </Typography>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 5,
                    fontSize: '0.75rem',
                    fontWeight: 'medium',
                    bgcolor: alpha(profilePurple, 0.1),
                    color: profilePurple
                  }}
                >
                  {project.priority}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.8rem' }}>
                  Role: {project.role}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    color: project.status === 'In Progress' ? 'info.main' : 
                           project.status === 'Planning' ? 'warning.main' : 'success.main',
                    fontSize: '0.8rem', 
                    fontWeight: 500
                  }}
                >
                  Status: {project.status}
                </Typography>
              </Box>
              {/* Añadir barra de progreso si está disponible */}
              {project.progress !== undefined && (
                <Box sx={{ mt: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                      Progress
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                      {project.progress}%
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      height: 6,
                      bgcolor: alpha(profilePurple, 0.1),
                      borderRadius: 3,
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        width: `${project.progress}%`,
                        height: '100%',
                        bgcolor: profilePurple,
                        borderRadius: 3
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          ))
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4,
            px: 2,
            color: 'text.secondary', 
            border: '1px solid', 
            borderColor: '#f0f0f0', 
            borderRadius: 1 
          }}>
            <Typography variant="body2">No upcoming project deadlines</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};