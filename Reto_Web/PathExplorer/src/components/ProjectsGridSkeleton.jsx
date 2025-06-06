import React from "react";
import {
  Box,
  Paper,
  Skeleton,
  Divider,
  Grid
} from "@mui/material";
import { ACCENTURE_COLORS } from "../styles/styles";
import { useDarkMode } from "../contexts/DarkModeContext";

const ProjectCardSkeleton = ({ darkMode }) => {
  return (
    <Paper 
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        height: "100%",
        boxShadow: darkMode ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        bgcolor: darkMode ? "#1e1e1e" : "#fff",
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
        <Skeleton 
          variant="text" 
          width="70%" 
          height={28} 
          sx={{ 
            mb: 1.5,
            bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : `${ACCENTURE_COLORS.corePurple1}10`,
          }} 
        />

        <Skeleton 
          variant="text" 
          width="90%" 
          height={20} 
          sx={{ 
            mb: 0.5,
            bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : `${ACCENTURE_COLORS.corePurple1}08`,
          }} 
        />
        
        <Skeleton 
          variant="text" 
          width="85%" 
          height={20} 
          sx={{ 
            mb: 2,
            bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : `${ACCENTURE_COLORS.corePurple1}08`,
          }} 
        />
      </Box>

      <Divider sx={{ mt: "auto", opacity: darkMode ? 0.15 : 0.5 }} />

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
            <Skeleton 
              variant="circular" 
              width={20} 
              height={20} 
              sx={{ 
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.15)' : `${ACCENTURE_COLORS.corePurple1}15`,
              }} 
            />
            <Skeleton 
              variant="text" 
              width={120} 
              height={24} 
              sx={{ 
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : `${ACCENTURE_COLORS.corePurple1}10`,
              }} 
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Skeleton 
              variant="circular" 
              width={20} 
              height={20} 
              sx={{ 
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.15)' : `${ACCENTURE_COLORS.corePurple1}15`,
              }} 
            />
            <Skeleton 
              variant="text" 
              width={140} 
              height={24} 
              sx={{ 
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : `${ACCENTURE_COLORS.corePurple1}08`,
              }} 
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Skeleton 
              variant="circular" 
              width={20} 
              height={20} 
              sx={{ 
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.15)' : `${ACCENTURE_COLORS.corePurple1}15`,
              }} 
            />
            <Skeleton 
              variant="text" 
              width={100} 
              height={24} 
              sx={{ 
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : `${ACCENTURE_COLORS.corePurple1}08`,
              }} 
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

const ProjectsGridSkeleton = () => {
  const { darkMode } = useDarkMode();
  return (
    <Grid container spacing={2}>
      {[1, 2, 3, 4].map((i) => (
        <Grid item xs={12} sm={6} key={i}>
          <ProjectCardSkeleton darkMode={darkMode} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProjectsGridSkeleton;