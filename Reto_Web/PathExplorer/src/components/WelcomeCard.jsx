import React from "react";
import { Box, Paper, Card, CardContent, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export const WelcomeCard = ({ name = "User", darkMode = false }) => {
  const theme = useTheme();

  const currentDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <Paper sx={{ 
      flex: "0 0 25%", 
      minHeight: 100,
      backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
      border: darkMode ? '1px solid rgba(255,255,255,0.12)' : 'none'
    }}>
      <Card
        sx={{
          backgroundColor: darkMode ? theme.palette.primary.dark : theme.palette.primary.main,
          color: theme.palette.text.white,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          border: darkMode ? '1px solid rgba(255,255,255,0.12)' : 'none',
        }}
      >
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h5"
            sx={{ color: theme.palette.text.white, mb: 1 }}
          >
            <b>Welcome back, {name}!</b>
          </Typography>

          <Box sx={{ flex: 1 }} />

          <Typography variant="body2" sx={{ color: theme.palette.text.white }}>
            Today is {currentDate}
          </Typography>
        </CardContent>
      </Card>
    </Paper>
  );
};
