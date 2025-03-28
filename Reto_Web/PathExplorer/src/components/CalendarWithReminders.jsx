// src/components/dashboard/CalendarWithReminders.jsx
import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme,
  IconButton
} from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';

// Iconos
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export const CalendarWithReminders = ({ events }) => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  
  // Función para manejar el cambio de mes
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
  
  // Componente para un recordatorio individual
  const ReminderItem = ({ date, title }) => {
    const color = '#9c27b0'; // Morado para la barra lateral
    
    return (
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        alignItems: 'flex-start' 
      }}>
        {/* Barra lateral morada */}
        <Box sx={{ 
          width: 4, 
          bgcolor: color, 
          borderRadius: '4px 0 0 4px',
          alignSelf: 'stretch',
          mr: 2
        }} />
        
        <Box sx={{ flex: 1 }}>
          {/* Fecha */}
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: color,
              fontWeight: 600,
              mb: 0.5
            }}
          >
            {date}
          </Typography>
          
          {/* Título */}
          <Typography 
            variant="body1"
            sx={{
              fontWeight: 500,
              fontSize: '0.9rem',
              mb: 1.5
            }}
          >
            {title}
          </Typography>
          
          {/* Botón View */}
          <Box
            sx={{
              display: 'inline-block',
              bgcolor: '#e0e0e0',
              color: '#666',
              px: 2.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: '#d5d5d5'
              }
            }}
          >
            View
          </Box>
        </Box>
      </Box>
    );
  };
  
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 1,
        height: '100%',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CalendarMonthIcon sx={{ color: '#9c27b0', mr: 1.5 }} />
        <Typography variant="h6" fontWeight={500}>
          Calendar
        </Typography>
      </Box>
      
      {/* Calendario */}
      <Box sx={{ 
        borderRadius: 1, 
        mb: 1, 
        overflow: 'hidden',
        backgroundColor: '#fff' 
      }}>
        {/* Control del mes */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 1.5,
          borderBottom: '1px solid #f5f5f5'
        }}>
          <Typography variant="subtitle1" fontWeight={500}>
            {currentMonth.format('MMMM YYYY')}
          </Typography>
          
          <Box>
            <IconButton size="small" onClick={() => handleMonthChange('prev')}>
              <ArrowBackIosNewIcon sx={{ fontSize: '0.9rem' }} />
            </IconButton>
            <IconButton size="small" onClick={() => handleMonthChange('next')}>
              <ArrowForwardIosIcon sx={{ fontSize: '0.9rem' }} />
            </IconButton>
          </Box>
        </Box>
        
        {/* Días de la semana y calendario */}
        <Box sx={{ pb: -1 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)',
            textAlign: 'center',
            py: 1
          }}>
            <Typography variant="caption" color="text.secondary">S</Typography>
            <Typography variant="caption" color="text.secondary">M</Typography>
            <Typography variant="caption" color="#9c27b0">T</Typography>
            <Typography variant="caption" color="text.secondary">W</Typography>
            <Typography variant="caption" color="text.secondary">T</Typography>
            <Typography variant="caption" color="#ff5252">F</Typography>
            <Typography variant="caption" color="text.secondary">S</Typography>
          </Box>
          
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={selectedDate}
              onChange={(newDate) => setSelectedDate(newDate)}
              showDaysOutsideCurrentMonth
              disableHighlightToday={false}
              onMonthChange={(date) => setCurrentMonth(date)}
              sx={{ 
                '& .MuiPickersCalendarHeader-root': { display: 'none' },
                '& .MuiDayCalendar-header': { display: 'none' },
                '& .MuiPickersDay-root': { 
                  margin: '6px',
                  height: '32px',
                  width: '32px',
                  fontSize: '0.8rem'
                },
                '& .MuiPickersDay-root.Mui-selected': {
                  bgcolor: '#9c27b0',
                  color: '#fff',
                  fontWeight: 'bold'
                }
              }}
            />
          </LocalizationProvider>
        </Box>
      </Box>
      
      {/* Recordatorios sección */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <EventNoteIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
        <Typography variant="subtitle1" fontWeight={500}>
          Reminders
        </Typography>
      </Box>
      
      {/* Lista de recordatorios */}
      <Box sx={{ 
        overflowY: 'auto', 
        pr: 1,
        flex: 1
      }}>
        {events.map(event => (
          <ReminderItem 
            key={event.id}
            date={event.date}
            title={event.title}
          />
        ))}
      </Box>
    </Paper>
  );
};