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

        // Obtener proyectos del usuario actual
        const { data: userRoles, error: rolesError } = await supabase
          .from('UserRole')
          .select('project_id')
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
              priority: "High"
            },
            {
              id: 2,
              title: "Mobile App Development",
              endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
              formattedDate: dayjs().add(30, 'day').format('MMM DD, YYYY'),
              priority: "Medium"
            }
          ]);
          return;
        }

        // Obtener detalles de los proyectos incluyendo fechas de finalización
        const projectIds = userRoles.map(role => role.project_id);
        
        const { data: projects, error: projectsError } = await supabase
          .from('Project')
          .select('projectID, title, end_date, priority, status')
          .in('projectID', projectIds)
          .eq('status', 'Active'); // Solo proyectos activos

        if (projectsError) throw projectsError;

        // Transformar los datos para mostrarlos
        const reminders = projects?.map(project => ({
          id: project.projectID,
          title: project.title,
          endDate: project.end_date,
          formattedDate: project.end_date 
            ? dayjs(project.end_date).format('MMM DD, YYYY') 
            : 'No deadline set',
          priority: project.priority || 'Normal'
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
            priority: "High"
          },
          {
            id: 2,
            title: "Mobile App Development",
            endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
            formattedDate: dayjs().add(30, 'day').format('MMM DD, YYYY'),
            priority: "Medium"
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
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
    <Box>
      {/* Month Navigation */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="subtitle1" fontWeight={500}>
          {currentMonth.format('MMMM YYYY')}
        </Typography>
        <Box>
          <IconButton 
            size="small" 
            onClick={() => handleMonthChange('prev')}
            sx={{ color: profilePurple }}
          >
            <ArrowBackIosNewIcon sx={{ fontSize: '0.8rem' }} />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => handleMonthChange('next')}
            sx={{ color: profilePurple }}
          >
            <ArrowForwardIosIcon sx={{ fontSize: '0.8rem' }} />
          </IconButton>
        </Box>
      </Box>
      
      {/* Weekday Headers */}
      <Grid container spacing={0}>
        {weekDays.map((day, index) => (
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
      
      {/* Calendar Days */}
      <Grid container spacing={0} sx={{ mt: 1 }}>
        {calendarDays.map((day, index) => (
          <Grid item xs key={index}>
            <Box 
              onClick={() => handleDateSelect(day)}
              sx={{
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
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
                fontWeight: day.isToday || day.isSelected ? 500 : 400,
                opacity: day.isCurrentMonth ? 1 : 0.5,
                // Indicador visual para días con vencimientos
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
                    : alpha(profilePurple, 0.1)
                }
              }}
            >
              <Typography variant="caption">
                {day.date}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      
      {/* Project Deadline Reminders */}
      <Box sx={{ mt: 3 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 500, 
            color: 'text.primary',
            mb: 1.5,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <EventIcon sx={{ fontSize: 16, mr: 1, color: profilePurple }} /> 
          Project Deadlines
        </Typography>
        
        {projectReminders.length > 0 ? (
          projectReminders.map((project) => (
            <Box 
              key={project.id}
              sx={{ 
                p: 1.5, 
                borderRadius: 1,
                border: '1px solid',
                borderColor: alpha(profilePurple, 0.2),
                mb: 2,
                '&:last-child': {
                  mb: 0
                }
              }}
            >
              <Typography variant="body2" fontWeight={500}>
                {project.title}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  <CalendarTodayIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                  Due: {project.formattedDate}
                </Typography>
                <Box
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: 5,
                    fontSize: '0.7rem',
                    fontWeight: 'medium',
                    bgcolor: alpha(profilePurple, 0.1),
                    color: profilePurple
                  }}
                >
                  {project.priority}
                </Box>
              </Box>
            </Box>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', p: 2, color: 'text.secondary' }}>
            <Typography variant="body2">No upcoming project deadlines</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};