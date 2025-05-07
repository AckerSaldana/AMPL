// src/components/CalendarWithReminders.jsx
import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  IconButton,
  useTheme,
  Divider,
  Chip,
  Avatar,
  Button,
  alpha
} from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import { supabase } from "../supabase/supabaseClient";

// Iconos
import EventNoteIcon from "@mui/icons-material/EventNote";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export const CalendarWithReminders = ({ userId }) => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [events, setEvents] = useState([]);

  // Accenture colors
  const accenturePurple = '#a100ff'; // Core Purple 1
  const accenturePurpleDark = '#7500c0'; // Core Purple 2
  const accenturePurpleLight = '#be82ff'; // Accent Purple 3

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        // Get the user's projects
        const { data: userRoles, error: roleError } = await supabase
          .from('UserRole')
          .select('project_id')
          .eq('user_id', userId); 

        if (roleError) throw roleError;

        const projectIds = userRoles.map(r => r.project_id);
        console.log("Project IDs for user:", projectIds);

        if (projectIds.length === 0) {
          return;
        }

        // Get project details
        const { data: projects, error: projectError } = await supabase
          .from('Project')
          .select('projectID, title, status, priority')
          .in('projectID', projectIds);

        if (projectError) throw projectError;

        // Map to component format
        const reminders = projects.map(proj => ({
          id: proj.projectID,
          title: proj.title,
          date: `${proj.status} • ${proj.priority}`
        }));

        setEvents(reminders);
      } catch (err) {
        console.error('Error loading reminders:', err.message);
        // Fallback data
        setEvents([
          {
            id: 1,
            title: "Accenture Website Redesign",
            date: "Active • High"
          },
          {
            id: 2,
            title: "Cloud Migration Project",
            date: "Planning • Medium"
          },
          {
            id: 3,
            title: "AI Implementation",
            date: "Active • High"
          }
        ]);
      }
    };

    if (userId) fetchReminders();
  }, [userId]);

  // Handle month change
  const handleMonthChange = (direction) => {
    if (direction === 'prev') {
      const newMonth = currentMonth.subtract(1, 'month');
      setCurrentMonth(newMonth);
      setSelectedDate(newMonth);
    } else {
      const newMonth = currentMonth.add(1, 'month');
      setCurrentMonth(newMonth);
      setSelectedDate(newMonth);
    }
  };
  
  // Individual reminder component
  const ReminderItem = ({ date, title }) => {
    return (
      <Box sx={{ 
        mb: 2.5, 
        display: 'flex',
        alignItems: 'flex-start',
        borderRadius: 1,
        p: 1.5,
        transition: 'all 0.2s',
        border: `1px solid ${alpha(accenturePurple, 0.1)}`,
        '&:hover': {
          borderColor: alpha(accenturePurple, 0.3),
          bgcolor: alpha(accenturePurple, 0.03)
        }
      }}>
        <Avatar 
          sx={{ 
            bgcolor: alpha(accenturePurple, 0.1), 
            color: accenturePurple,
            width: 34,
            height: 34,
            mr: 2,
            fontSize: '0.8rem',
            fontWeight: 'bold'
          }}
        >
          {title.substring(0, 2).toUpperCase()}
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="body1"
            sx={{
              fontWeight: 500,
              fontSize: '0.9rem',
              mb: 1
            }}
          >
            {title}
          </Typography>
          
          <Chip 
            label={date} 
            size="small"
            sx={{ 
              height: 20, 
              fontSize: '0.7rem',
              bgcolor: alpha(accenturePurple, 0.1),
              color: accenturePurple
            }}
          />
        </Box>
      </Box>
    );
  };
  
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Calendar */}
      <Box sx={{ 
        p: 2,
        backgroundColor: '#fff' 
      }}>
        {/* Month navigation */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 2
        }}>
          <Typography variant="subtitle1" fontWeight={500}>
            {currentMonth.format('MMMM YYYY')}
          </Typography>
          
          <Box>
            <IconButton 
              size="small" 
              onClick={() => handleMonthChange('prev')}
              sx={{ color: accenturePurple }}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: '0.9rem' }} />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={() => handleMonthChange('next')}
              sx={{ color: accenturePurple }}
            >
              <ArrowForwardIosIcon sx={{ fontSize: '0.9rem' }} />
            </IconButton>
          </Box>
        </Box>
        
        {/* Calendar days */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={selectedDate}
            onChange={(newDate) => setSelectedDate(newDate)}
            showDaysOutsideCurrentMonth
            disableHighlightToday={false}
            onMonthChange={(date) => setCurrentMonth(date)}
            sx={{ 
              '& .MuiPickersCalendarHeader-root': { display: 'none' },
              '& .MuiDayCalendar-header': { 
                '& .MuiTypography-root': {
                  color: accenturePurple,
                  fontWeight: 500
                }
              },
              '& .MuiPickersDay-root': { 
                margin: '3px',
                height: '32px',
                width: '32px',
                fontSize: '0.8rem'
              },
              '& .MuiPickersDay-root.Mui-selected': {
                bgcolor: accenturePurple,
                color: '#fff',
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: accenturePurpleDark
                }
              },
              '& .MuiPickersDay-root:not(.Mui-selected):hover': {
                bgcolor: alpha(accenturePurple, 0.1)
              },
              px: 0,
              py: 0,
              mx: 0,
              my: 0
            }}
          />
        </LocalizationProvider>
      </Box>
      
      <Divider sx={{ borderColor: alpha(accenturePurple, 0.1) }} />
      
      {/* Reminders section */}
      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EventNoteIcon sx={{ color: accenturePurple, mr: 1 }} />
          <Typography variant="subtitle1" fontWeight={500}>
            Active Projects
          </Typography>
        </Box>
        
        {/* List of reminders */}
        <Box sx={{ 
          overflowY: 'auto', 
          flex: 1
        }}>
          {events.length > 0 ? (
            events.map(event => (
              <ReminderItem 
                key={event.id}
                date={event.date}
                title={event.title}
              />
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No active projects found
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                sx={{ 
                  mt: 2, 
                  borderColor: accenturePurple, 
                  color: accenturePurple,
                  '&:hover': {
                    borderColor: accenturePurpleDark,
                    bgcolor: alpha(accenturePurple, 0.05)
                  }
                }}
                endIcon={<OpenInNewIcon fontSize="small" />}
              >
                Browse Projects
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};