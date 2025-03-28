// src/components/CertificationGrid.jsx
import { Paper, Typography, Grid, Box, useTheme } from "@mui/material";
import React from "react";
import { CertificationCard } from "./CertificationCard";

// Mock certs (eventually passed via props or from DB)
const mockCerts = [
  {
    id: 1,
    title: "Cloud Security Alliance",
    url: "/cert/cloud-security",
    skills: ["Cloud", "Cybersecurity"],
    backgroundImage: "https://documents.trendmicro.com/images/TEx/articles/Cloud-Security-101-cover.png"
  },
  {
    id: 2,
    title: "ETL Pipelines in Python",
    url: "/cert/etl-pipelines",
    skills: ["Python", "SQL"],
    backgroundImage: "https://rivery.io/wp-content/uploads/2024/08/ELT-Pipelines.jpg"
  },
  {
    id: 3,
    title: "ISC2 Certification",
    url: "/cert/isc2",
    skills: ["ISC2"],
    backgroundImage: "https://img-c.udemycdn.com/course/240x135/5404030_36ef.jpg"
  },
  {
    id: 4,
    title: "Certified Information Security Manager",
    url: "/cert/cism",
    skills: ["Kali"],
    backgroundImage: "https://i0.wp.com/isaca.org.ar/wp-content/uploads/2016/12/cism-grande-e1500468761377.jpg?fit=701%2C280&ssl=1"
  },
  {
    id: 5,
    title: "Networking Certificate",
    url: "/cert/networking",
    skills: ["Networks"],
    backgroundImage: "https://img-c.udemycdn.com/course/750x422/4946226_8be2_2.jpg"
  },
  {
    id: 6,
    title: "CISCO Networking Academy",
    url: "/cert/cisco",
    skills: ["Networks"],
    backgroundImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSr9n1NqOblu3X5LKYT6flDYuAIGI9ibxrOWg&s"
  }
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
        bgcolor: '#fff',
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}
    >
      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: 500 }}
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
          {mockCerts.map((cert) => (
            <Grid item xs={12} sm={6} key={cert.id}>
              <CertificationCard 
                title={cert.title}
                url={cert.url}
                skills={cert.skills}
                backgroundImage={cert.backgroundImage}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};