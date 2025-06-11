import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Fade,
  Grow,
} from "@mui/material";
import {
  CalendarMonth,
  Person,
  Business,
} from "@mui/icons-material";
import { ACCENTURE_COLORS } from "../styles/styles";

const ProjectCard = ({ project, index = 0, darkMode = false }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Grow in={isVisible} timeout={600} style={{ transformOrigin: '50% 50%' }}>
      <Paper 
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          height: "100%",
          boxShadow: darkMode ? "0 2px 10px rgba(0,0,0,0.2)" : "0 2px 10px rgba(0,0,0,0.03)",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: "translateY(0)",
          "&:hover": {
            transform: "translateY(-8px) scale(1.02)",
            boxShadow: darkMode 
              ? `0 12px 24px ${ACCENTURE_COLORS.corePurple1}30`
              : `0 12px 24px ${ACCENTURE_COLORS.corePurple1}15`,
            '& .accent-line': {
              width: '100%',
            },
            '& .project-icon': {
              transform: 'scale(1.2)',
            },
            '& .project-title': {
              color: ACCENTURE_COLORS.corePurple1,
            },
          },
          bgcolor: darkMode ? "#1e1e1e" : "#fff",
          position: "relative",
        }}
      >
      {/* Color accent line - Animated */}
      <Box 
        className="accent-line"
        sx={{ 
          width: isVisible ? "100%" : "0%", 
          height: "4px", 
          bgcolor: ACCENTURE_COLORS.corePurple1,
          position: "absolute",
          top: 0,
          left: 0,
          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDelay: `${index * 100 + 300}ms`,
        }} 
      />

      {/* Header */}
      <Box sx={{ p: 3, pt: 4 }}>
        <Typography
          variant="h6"
          className="project-title"
          sx={{
            fontWeight: 500,
            fontSize: "1.1rem",
            color: darkMode ? "#ffffff" : ACCENTURE_COLORS.black,
            mb: 1.5,
            transition: 'color 0.3s ease',
          }}
        >
          {project.name}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: darkMode ? "rgba(255,255,255,0.7)" : ACCENTURE_COLORS.darkGray,
            mb: 2,
            minHeight: "40px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {project.description}
        </Typography>
      </Box>

      <Divider sx={{ 
        mt: "auto", 
        opacity: darkMode ? 0.2 : 0.5,
        borderColor: darkMode ? "rgba(255,255,255,0.1)" : undefined 
      }} />

      {/* Details */}
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Person
              fontSize="small"
              className="project-icon"
              sx={{ 
                color: ACCENTURE_COLORS.corePurple1, 
                opacity: 0.8,
                transition: 'transform 0.3s ease',
              }}
            />
            <Typography
              variant="body2"
              sx={{ 
                fontWeight: 500, 
                color: darkMode ? "#ffffff" : ACCENTURE_COLORS.black 
              }}
            >
              {project.role}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Business
              fontSize="small"
              className="project-icon"
              sx={{ 
                color: ACCENTURE_COLORS.corePurple1, 
                opacity: 0.6,
                transition: 'transform 0.3s ease',
              }}
            />
            <Typography
              variant="body2"
              sx={{ 
                color: darkMode ? "rgba(255,255,255,0.7)" : ACCENTURE_COLORS.darkGray 
              }}
            >
              {project.company}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CalendarMonth
              fontSize="small"
              className="project-icon"
              sx={{ 
                color: ACCENTURE_COLORS.corePurple1, 
                opacity: 0.6,
                transition: 'transform 0.3s ease',
              }}
            />
            <Typography
              variant="body2"
              sx={{ 
                color: darkMode ? "rgba(255,255,255,0.7)" : ACCENTURE_COLORS.darkGray 
              }}
            >
              {project.date}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
    </Grow>
  );
};

export default ProjectCard;