import React from "react";
import {
  Box,
  Paper,
  Grid,
  Skeleton,
  Divider
} from "@mui/material";
import { ACCENTURE_COLORS } from "../styles/styles";
import { useDarkMode } from "../contexts/DarkModeContext";

const ProfileSummarySkeleton = () => {
  const { darkMode } = useDarkMode();
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: darkMode ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.03)",
        mb: 5,
        background: darkMode ? "#1e1e1e" : "#fff",
        border: darkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
      }}
    >
      <Grid container>
        {/* Left Column - Avatar & Personal Info */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: { xs: 3, md: 5 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              position: "relative",
              background: darkMode 
                ? "linear-gradient(135deg, rgba(161, 0, 255, 0.1) 0%, rgba(30, 30, 30, 0.8) 100%)"
                : "linear-gradient(135deg, rgba(161, 0, 255, 0.04) 0%, rgba(255, 255, 255, 0.8) 100%)",
              borderRight: { xs: "none", md: darkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.04)" },
              borderBottom: { xs: darkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.04)", md: "none" },
            }}
          >
            {/* Avatar skeleton */}
            <Skeleton 
              variant="circular" 
              width={110} 
              height={110} 
              sx={{ 
                mb: 3,
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.15)' : `${ACCENTURE_COLORS.corePurple1}15`,
              }} 
            />
            
            {/* Name skeleton */}
            <Skeleton 
              variant="text" 
              width={120} 
              height={36} 
              sx={{ 
                mb: 1,
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : `${ACCENTURE_COLORS.corePurple1}10`,
              }} 
            />
            
            {/* Role skeleton */}
            <Skeleton 
              variant="text" 
              width={150} 
              height={28} 
              sx={{ 
                mb: 2,
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : `${ACCENTURE_COLORS.corePurple1}10`,
              }} 
            />
          </Box>
        </Grid>

        {/* Right Column - Stats & Skills */}
        <Grid item xs={12} md={8}>
          <Box sx={{ p: { xs: 3, md: 5 }, height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Stats Row */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                mb: 3,
                py: 1,
              }}
            >
              <Box sx={{ textAlign: "center", px: 2 }}>
                <Skeleton 
                  variant="text" 
                  width={50} 
                  height={60} 
                  sx={{ 
                    mb: 0.5,
                    bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : `${ACCENTURE_COLORS.corePurple1}10`,
                  }} 
                />
                <Skeleton 
                  variant="text" 
                  width={70} 
                  height={20} 
                  sx={{ 
                    bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : `${ACCENTURE_COLORS.corePurple1}08`,
                  }} 
                />
              </Box>
              
              <Divider orientation="vertical" flexItem sx={{ mx: 2, opacity: darkMode ? 0.15 : 0.05 }} />
              
              <Box sx={{ textAlign: "center", px: 2 }}>
                <Skeleton 
                  variant="text" 
                  width={50} 
                  height={60} 
                  sx={{ 
                    mb: 0.5,
                    bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : `${ACCENTURE_COLORS.corePurple1}10`,
                  }} 
                />
                <Skeleton 
                  variant="text" 
                  width={70} 
                  height={20} 
                  sx={{ 
                    bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : `${ACCENTURE_COLORS.corePurple1}08`,
                  }} 
                />
              </Box>
            </Box>

            <Divider sx={{ opacity: darkMode ? 0.15 : 0.05, my: 2 }} />

            {/* Skills Section */}
            <Box sx={{ flexGrow: 1, mt: 2 }}>
              <Skeleton 
                variant="text" 
                width={100} 
                height={20} 
                sx={{ 
                  mb: 2,
                  bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : `${ACCENTURE_COLORS.corePurple1}08`,
                }} 
              />
              
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton 
                    key={i}
                    variant="rounded" 
                    width={80} 
                    height={28} 
                    sx={{ 
                      bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : `${ACCENTURE_COLORS.corePurple1}10`,
                      borderRadius: "4px",
                    }} 
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProfileSummarySkeleton;