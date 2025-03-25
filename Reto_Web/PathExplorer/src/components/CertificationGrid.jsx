import { Paper, Typography, useTheme, Grid } from "@mui/material";
import React from "react";

export const CertificationGrid = () => {
  const theme = useTheme();

  return (
    <Paper sx={{ flex: "1 1 auto" }}>
      <Typography
        variant="body1"
        sx={{ color: theme.palette.text.primary, mb: 2 }}
      >
        <b>Certifications</b>
      </Typography>

      <Grid container spacing={6} sx={{ height: "100%" }}></Grid>
    </Paper>
  );
};
