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

const CertificationCardSkeleton = ({ darkMode }) => {
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
          bgcolor: ACCENTURE_COLORS.corePurple2,
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
            bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : `${ACCENTURE_COLORS.corePurple2}10`,
          }} 
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Skeleton 
            variant="circular" 
            width={20} 
            height={20} 
            sx={{ 
              bgcolor: darkMode ? 'rgba(255, 255, 255, 0.15)' : `${ACCENTURE_COLORS.corePurple2}15`,
            }} 
          />
          <Skeleton 
            variant="text" 
            width={150} 
            height={24} 
            sx={{ 
              bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : `${ACCENTURE_COLORS.corePurple2}08`,
            }} 
          />
        </Box>

        <Box
          sx={{
            bgcolor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
            px: 2,
            py: 1.5,
            borderRadius: 1,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "3px",
              bgcolor: darkMode ? 'rgba(255, 255, 255, 0.4)' : `${ACCENTURE_COLORS.corePurple2}40`,
            }
          }}
        >
          <Skeleton 
            variant="text" 
            width="80%" 
            height={20} 
            sx={{ 
              bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : `${ACCENTURE_COLORS.corePurple2}10`,
            }} 
          />
        </Box>
      </Box>

      <Divider sx={{ mt: "auto", opacity: darkMode ? 0.15 : 0.5 }} />

      {/* Footer */}
      <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Skeleton 
            variant="circular" 
            width={20} 
            height={20} 
            sx={{ 
              bgcolor: darkMode ? 'rgba(255, 255, 255, 0.15)' : `${ACCENTURE_COLORS.corePurple2}15`,
            }} 
          />
          <Box>
            <Skeleton 
              variant="text" 
              width={100} 
              height={24} 
              sx={{ 
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : `${ACCENTURE_COLORS.corePurple2}08`,
              }} 
            />
            <Skeleton 
              variant="text" 
              width={120} 
              height={20} 
              sx={{ 
                mt: 0.25,
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.06)' : `${ACCENTURE_COLORS.corePurple2}06`,
              }} 
            />
          </Box>
        </Box>
        
        <Skeleton 
          variant="circular" 
          width={24} 
          height={24} 
          sx={{ 
            bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : `${ACCENTURE_COLORS.corePurple2}10`,
          }} 
        />
      </Box>
    </Paper>
  );
};

const CertificationsGridSkeleton = () => {
  const { darkMode } = useDarkMode();
  return (
    <Grid container spacing={2}>
      {[1, 2, 3, 4].map((i) => (
        <Grid item xs={12} sm={6} key={i}>
          <CertificationCardSkeleton darkMode={darkMode} />
        </Grid>
      ))}
    </Grid>
  );
};

export default CertificationsGridSkeleton;