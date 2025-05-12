import React from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
} from "@mui/material";
import {
  CalendarMonth,
  Person,
  Business,
} from "@mui/icons-material";
import { ACCENTURE_COLORS } from "../styles/styles";

const ProjectCard = ({ project }) => {
  return (
    <Paper 
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        height: "100%",
        boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        },
        bgcolor: "#fff",
        position: "relative",
      }}
    >
      {/* Color accent line - Full width */}
      <Box 
        sx={{ 
          width: "100%", 
          height: "4px", 
          bgcolor: ACCENTURE_COLORS.corePurple1,
          position: "absolute",
          top: 0,
          left: 0,
        }} 
      />

      {/* Header */}
      <Box sx={{ p: 3, pt: 4 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 500,
            fontSize: "1.1rem",
            color: ACCENTURE_COLORS.black,
            mb: 1.5,
          }}
        >
          {project.name}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: ACCENTURE_COLORS.darkGray,
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

      <Divider sx={{ mt: "auto", opacity: 0.5 }} />

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
              sx={{ color: ACCENTURE_COLORS.corePurple1, opacity: 0.8 }}
            />
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: ACCENTURE_COLORS.black }}
            >
              {project.role}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Business
              fontSize="small"
              sx={{ color: ACCENTURE_COLORS.corePurple1, opacity: 0.6 }}
            />
            <Typography
              variant="body2"
              sx={{ color: ACCENTURE_COLORS.darkGray }}
            >
              {project.company}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CalendarMonth
              fontSize="small"
              sx={{ color: ACCENTURE_COLORS.corePurple1, opacity: 0.6 }}
            />
            <Typography
              variant="body2"
              sx={{ color: ACCENTURE_COLORS.darkGray }}
            >
              {project.date}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProjectCard;