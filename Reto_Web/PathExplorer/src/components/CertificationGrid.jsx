import { Paper, Typography, Grid, Box, useTheme } from "@mui/material";
import React from "react";
import { CertificationCard } from "./CertificationCard";

// Mock certs (eventually passed via props or from DB)
const mockCerts = [
  {
    id: 1,
    title: "React Mastery",
    issuer: "Udemy",
    url: "https://udemy.com/react-mastery",
    type: "Technical",
  },
  {
    id: 2,
    title: "Vue Mastery",
    issuer: "Coursera",
    url: "https://udemy.com/react-mastery",
    type: "Technical",
  },
  {
    id: 2,
    title: "Vue Mastery",
    issuer: "Coursera",
    url: "https://udemy.com/react-mastery",
    type: "Technical",
  },
  {
    id: 2,
    title: "Vue Mastery",
    issuer: "Coursera",
    url: "https://udemy.com/react-mastery",
    type: "Technical",
  },
  {
    id: 2,
    title: "Vue Mastery",
    issuer: "Coursera",
    url: "https://udemy.com/react-mastery",
    type: "Technical",
  },
];

export const CertificationGrid = () => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        p: 2,
        overflow: "hidden", // hide any extra overflow horizontally
      }}
    >
      <Typography
        variant="h6"
        sx={{ color: theme.palette.text.primary, mb: 2 }}
      >
        Certifications
      </Typography>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          pr: 1,
          minHeight: 0,
        }}
      >
        <Grid container spacing={2}>
          {mockCerts.map((cert, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <CertificationCard {...cert} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};
