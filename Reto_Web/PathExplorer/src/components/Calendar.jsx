import React, { useState } from "react";
import { Typography, useTheme, Paper, Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { Reminder } from "./Reminder";

export const Calendar = () => {
  const theme = useTheme();

  // Mock temporal data
  const [events] = useState([
    {
      date: "12 Feb 2025",
      title: "React Certification",
      url: "https://udemy.com/react-mastery",
    },
    {
      date: "15 Feb 2025",
      title: "HTML Certification",
      url: "https://udemy.com/react-mastery",
    },
    {
      date: "20 Feb 2025",
      title: "Vite course",
      url: "https://udemy.com/react-mastery",
    },
    {
      date: "28 Feb 2025",
      title: "From Zero to Hero: Python Masterclass",
      url: "https://udemy.com/react-mastery",
    },
  ]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 2,
          height: "100%",
          maxHeight: "100%",
          width: "100%",
        }}
      >
        <Typography
          variant="h5"
          sx={{ color: theme.palette.primary.main, mb: 2 }}
        >
          <b>What's on the Note?</b>
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Box
            sx={{
              position: "relative",
              overflow: "visible", // Allow dropdowns to render outside
            }}
          >
            <DateCalendar
              sx={{
                width: "100%",
                maxWidth: 340,
                minWidth: 280,
              }}
              slotProps={{
                calendarHeader: {
                  // This makes the popper overflow visible
                  sx: {
                    overflow: "visible",
                  },
                },
              }}
            />
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{ color: theme.palette.primary.main, mb: 2 }}
        >
          Reminders:
        </Typography>

        <Box sx={{ flex: 1, overflowY: "auto", maxHeight: 100 }}>
          <Reminder events={events} />
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};
