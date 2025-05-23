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
  Tooltip,
  Fade,
  Grow
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
import TodayIcon from "@mui/icons-material/Today";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

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
        return <PriorityHighIcon sx={{ fontSize: 20, color: '#f44336' }} />;
      case 'medium':
        return <FlagIcon sx={{ fontSize: 20, color: '#ff9800' }} />;
      case 'low':
        return <LowPriorityIcon sx={{ fontSize: 20, color: '#4caf50' }} />;
      default:
        return <FlagIcon sx={{ fontSize: 20, color: '#9e9e9e' }} />;
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
      {/* Enhanced Calendar Container */}
      <Paper elevation={0} sx={{ 
        mb: 0,
        borderRadius: 2,
        bgcolor: '#ffffff',
        border: 'none',
        boxShadow: 'none',
        overflow: 'visible',
      }}>
        {/* Header */}
        <Box sx={{ 
          px: 2.5,
          py: 2.5,
          bgcolor: alpha(profilePurple, 0.04),
          borderBottom: `1px solid ${alpha(profilePurple, 0.1)}`,
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
              <CalendarTodayIcon sx={{ color: profilePurple, fontSize: 28 }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  fontSize: '1.125rem',
                }}
              >
                {currentMonth.format('MMMM YYYY')}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex' }}>
              <IconButton 
                onClick={() => handleMonthChange('prev')}
                sx={{ 
                  p: 1,
                  color: profilePurple,
                  '&:hover': {
                    bgcolor: alpha(profilePurple, 0.08),
                  }
                }}
              >
                <ArrowBackIosNewIcon sx={{ fontSize: 20 }} />
              </IconButton>
              
              <IconButton 
                onClick={() => handleMonthChange('next')}
                sx={{ 
                  p: 1,
                  color: profilePurple,
                  '&:hover': {
                    bgcolor: alpha(profilePurple, 0.08),
                  }
                }}
              >
                <ArrowForwardIosIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
        
        {/* Calendar Grid */}
        <Box sx={{ px: 2.5, py: 2.5 }}>
          {/* Weekday Headers */}
          <Box sx={{ 
            display: 'flex',
            gap: 0.75,
            justifyContent: 'center',
            mb: 1.5 
          }}>
            {weekDays.map((day, index) => (
              <Box key={index} sx={{ 
                width: 58,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: (index === 0 || index === 6) 
                      ? profilePurple 
                      : 'text.secondary',
                  }}
                >
                  {day}
                </Typography>
              </Box>
            ))}
          </Box>
          
          {/* Calendar Days */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75
          }}>
            {Array(6).fill(null).map((_, weekIndex) => (
              <Box key={weekIndex} sx={{ 
                display: 'flex',
                gap: 0.75,
                justifyContent: 'center'
              }}>
                {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
                  <Box 
                    key={dayIndex}
                    onClick={() => handleDateSelect(day)}
                    sx={{
                      width: 58,
                      height: 58,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      borderRadius: 1.5,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      bgcolor: day.isSelected 
                        ? profilePurple 
                        : day.isToday 
                        ? alpha(profilePurple, 0.1)
                        : day.hasDeadline && day.isCurrentMonth
                        ? alpha(profilePurple, 0.05)
                        : 'transparent',
                      color: day.isSelected 
                        ? '#fff' 
                        : day.isToday 
                        ? profilePurple 
                        : day.isCurrentMonth 
                        ? 'text.primary' 
                        : 'text.disabled',
                      fontWeight: day.isToday || day.isSelected ? 600 : 400,
                      fontSize: '0.95rem',
                      '&::after': day.hasDeadline ? {
                        content: '""',
                        position: 'absolute',
                        bottom: '4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        bgcolor: day.isSelected ? '#fff' : '#f44336',
                      } : {},
                      '&:hover': {
                        bgcolor: day.isSelected 
                          ? profilePurple 
                          : alpha(profilePurple, 0.12),
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    {day.date}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Deadlines Section */}
        <Box sx={{ 
          px: 2.5, 
          py: 2.5,
          borderTop: `1px solid ${alpha(profilePurple, 0.08)}`,
        }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600,
              fontSize: '1rem',
              mb: 1.75,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 1.25
            }}
          >
            <AccessTimeIcon sx={{ fontSize: 20, color: profilePurple }} />
            Upcoming Deadlines ({projectReminders.length})
          </Typography>
          
          {projectReminders.length > 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1.25
            }}>
              {projectReminders.map((project, index) => (
                <Paper
                  key={project.id}
                  elevation={0}
                  sx={{
                    position: 'relative',
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    border: `1px solid ${alpha(profilePurple, 0.1)}`,
                    background: '#ffffff',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: alpha(profilePurple, 0.2),
                      bgcolor: alpha(profilePurple, 0.02),
                    }
                  }}
                >
                  {/* Priority Indicator */}
                  <Box sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    bgcolor: project.priority === 'High' 
                      ? '#f44336'
                      : project.priority === 'Medium' 
                      ? '#ff9800'
                      : '#4caf50'
                  }} />
                    
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '0.9375rem',
                            color: 'text.primary',
                            lineHeight: 1.3,
                            mb: 0.75
                          }}
                        >
                          {project.title}
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.75,
                          flexWrap: 'wrap'
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                            {project.formattedDate}
                          </Typography>
                          
                          <Chip
                            label={project.status}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.75rem',
                              fontWeight: 600,
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
                              '& .MuiChip-label': {
                                px: 1
                              }
                            }}
                          />
                          
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontSize: '0.8125rem', 
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
                      
                      <Tooltip title={`${project.priority} Priority`}>
                        <Box>
                          {getPriorityIcon(project.priority)}
                        </Box>
                      </Tooltip>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 3,
              border: `1px dashed ${alpha(profilePurple, 0.2)}`, 
              borderRadius: 1.5,
              bgcolor: alpha(profilePurple, 0.02)
            }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '0.875rem'
                }}
              >
                No upcoming deadlines
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};