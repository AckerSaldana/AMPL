import { Paper, Typography, Box } from "@mui/material";
import React from "react";

export const About = ({ about }) => {
  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        maxWidth: "100%",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Typography variant="body1">
        <b>About</b>
      </Typography>
      <Box
        sx={{
          maxHeight: "300px",
          overflowY: "auto",
        }}
      >
        <Typography variant="body2">{about}</Typography>
      </Box>
    </Paper>
  );
};
