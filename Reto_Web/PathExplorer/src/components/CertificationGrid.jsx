// src/components/CertificationGrid.jsx
import { Paper, Typography, Grid, Box, useTheme, CircularProgress } from "@mui/material";
import React, { useState, useEffect } from 'react';
import { CertificationCard } from "./CertificationCard";
import { supabase } from "../supabase/supabaseClient";


export const CertificationGrid = ({ userId }) => {
  const theme = useTheme();
  const [certifications, setCertifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        setIsLoading(true);
        
        const { data, error: certError } = await supabase
        .from('UserCertifications')
        .select(`
            certification_ID,
            score,
            completion_Status,
            valid_Until,
            Certifications (
              title,
              type,
              url,
              skill_acquired,
              certification_Image
            )
          `)
        .eq('user_ID', userId)
        .in('completion_Status', ['TRUE', 'FALSE'])
        .order('valid_Until', { ascending: false })
        .limit(4);

        if (certError) throw certError;

        if (certError) throw certError;

    //Juntar todos los skill ods de todas las certificaciones
    const allSkillIDs = [...new Set(
      data.flatMap(cert => cert.Certifications?.skill_acquired || [])
    )];

    // Llamar nombres reales desde la tabla Skill
    const { data: skillData, error: skillError } = await supabase
      .from('Skill')
      .select('skill_ID, name')
      .in('skill_ID', allSkillIDs);

    if (skillError) throw skillError;

    //Crear un diccionario skill_ID => name
    const skillMap = Object.fromEntries(skillData.map(s => [s.skill_ID, s.name]));

    setCertifications(
      data.map(cert => ({
        id: cert.certification_ID,
        title: cert.Certifications?.title || "Untitled",
        url: cert.Certifications?.url || "#",
        skills: (cert.Certifications?.skill_acquired || []).map(id => skillMap[id] || "Unknown"),
        backgroundImage: cert.Certifications?.certification_Image || getDefaultImage()
      }))
    );
  } catch (error) {
    console.error("Error fetching certifications:", error);
    setError(error.message);
    setCertifications(getFallbackCertifications());
  } finally {
    setIsLoading(false);
  }
};

    if (userId) {
      fetchCertifications();
    }
  }, [userId]);

  const getDefaultImage = () => {
    return 'https://img-c.udemycdn.com/course/750x422/1650610_2673_6.jpg';
  };

  const getFallbackCertifications = () => {
    return [
      {
        id: "1",
        title: "AWS Certified Solutions Architect",
        url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
        skills: ["AWS", "Cloud Architecture", "Networking"],
        backgroundImage: "https://d1.awsstatic.com/training-and-certification/certification-badges/AWS-Certified-Solutions-Architect-Associate_badge.3419559c4ef4d0693bff300b6e5fb80f4f8e7c48.png"
      },
      {
        id: "2",
        title: "React Professional Developer",
        url: "https://reactjs.org/",
        skills: ["React", "JavaScript", "Frontend"],
        backgroundImage: "https://miro.medium.com/max/1200/1*y6C4nSvy2Woe0m7bWEn4BA.png"
      },
      {
        id: "3",
        title: "Node.js Advanced Concepts",
        url: "https://nodejs.org/",
        skills: ["Node.js", "JavaScript", "Backend"],
        backgroundImage: "https://www.cloudbees.com/sites/default/files/styles/free_style/public/2018-11/node-js-1.png"
      },
      {
        id: "4",
        title: "Python for Data Science",
        url: "https://www.python.org/",
        skills: ["Python", "Data Science", "Machine Learning"],
        backgroundImage: "https://miro.medium.com/max/1400/1*YVlQ9GXqVlO-SIocAU5xXA.png"
      }
    ];
  };

  if (isLoading) {
    return (
      <Paper sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 200 
      }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="error">Error loading certifications</Typography>
      </Paper>
    );
  }

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
        My Certifications
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
          {certifications.map((cert) => (
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