import React from "react";
import { Typography, useTheme, Paper, Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";

export const Calendar = () => {
  const theme = useTheme();

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
          sx={{ color: theme.palette.text.secondary, mb: 2 }}
        >
          <b>What's on the Note?</b>
        </Typography>

        <Box sx={{ flexGrow: 1 }}>
          <DateCalendar
            sx={{
              width: "100%",
              maxWidth: { xs: "90%", sm: "80%", md: 300 },
              fontSize: { xs: "0.7rem", sm: "0.8rem", md: "1rem" },
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary, mb: 2 }}
        >
          Recent:
        </Typography>

        {/* Aquí los componentes de certificaciones más recientes (Últimas 5 or so?) */}
      </Paper>
    </LocalizationProvider>
  );
};
