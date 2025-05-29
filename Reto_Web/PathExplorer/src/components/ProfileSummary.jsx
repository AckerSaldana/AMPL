import React from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Grid,
  Divider
} from "@mui/material";
import { Person } from "@mui/icons-material";
import { ACCENTURE_COLORS } from "../styles/styles";

// Default user info just for type safety (won't be displayed)
const defaultUserInfo = {
  name: "User",
  avatar: "",
  currentRole: "Professional",
  projectsCount: 0,
  certificationsCount: 0,
  primarySkills: []
};

const ProfileSummary = ({ userInfo }) => {
  // Always render the component with either provided data or defaults
  const safeUserInfo = { ...defaultUserInfo, ...userInfo };
  
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
        mb: 5,
        background: "#fff",
        border: "1px solid transparent",
        transition: "all 0.25s ease",
        "&:hover": {
          border: `1px solid ${ACCENTURE_COLORS.corePurple1}20`,
          boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
        },
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
              background: "linear-gradient(135deg, rgba(161, 0, 255, 0.04) 0%, rgba(255, 255, 255, 0.8) 100%)",
              borderRight: { xs: "none", md: "1px solid rgba(0,0,0,0.04)" },
              borderBottom: { xs: "1px solid rgba(0,0,0,0.04)", md: "none" },
            }}
          >
            {/* Avatar with subtle glow effect */}
            <Box
              sx={{
                position: "relative",
                mb: 3,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: "5%",
                  left: "5%",
                  width: "90%",
                  height: "90%",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${ACCENTURE_COLORS.corePurple1}10 0%, transparent 70%)`,
                  filter: "blur(15px)",
                  zIndex: 0,
                }
              }}
            >
              <Avatar
                src={safeUserInfo.avatar}
                sx={{
                  width: 110,
                  height: 110,
                  bgcolor: "#fff",
                  color: ACCENTURE_COLORS.corePurple1,
                  border: `3px solid #fff`,
                  boxShadow: "0 8px 20px rgba(161, 0, 255, 0.15)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {safeUserInfo.avatar ? null : <Person sx={{ fontSize: 55 }} />}
              </Avatar>
            </Box>
            
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: ACCENTURE_COLORS.black,
                mb: 1,
                textAlign: "center",
                letterSpacing: "0.2px",
              }}
            >
              {safeUserInfo.name}
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                color: ACCENTURE_COLORS.corePurple1,
                fontWeight: 500,
                mb: 2,
                textAlign: "center",
                letterSpacing: "0.5px",
                fontSize: "1rem",
              }}
            >
              {safeUserInfo.currentRole}
            </Typography>
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
              <StatBox 
                value={safeUserInfo.projectsCount} 
                label="Projects" 
              />
              
              <Divider orientation="vertical" flexItem sx={{ mx: 2, opacity: 0.05 }} />
              
              <StatBox 
                value={safeUserInfo.certificationsCount} 
                label="Certifications" 
              />
            </Box>

            <Divider sx={{ opacity: 0.05, my: 2 }} />

            {/* Skills Section */}
            <Box sx={{ flexGrow: 1, mt: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  color: ACCENTURE_COLORS.darkGray,
                  mb: 2,
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                  fontSize: "0.68rem",
                  fontWeight: 500,
                  opacity: 0.6,
                }}
              >
                Primary Skills
              </Typography>
              
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {Array.isArray(safeUserInfo.primarySkills) && safeUserInfo.primarySkills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    sx={{
                      bgcolor: `${ACCENTURE_COLORS.corePurple1}08`,
                      border: `1px solid ${ACCENTURE_COLORS.corePurple1}20`,
                      color: ACCENTURE_COLORS.corePurple1,
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      height: 28,
                      px: 1,
                      fontWeight: 500,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        border: `1px solid ${ACCENTURE_COLORS.corePurple1}60`,
                        bgcolor: `${ACCENTURE_COLORS.corePurple1}10`,
                      }
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

// Componente auxiliar para estadísticas
const StatBox = ({ value = 0, label = "" }) => (
  <Box sx={{ textAlign: "center", px: 2 }}>
    <Typography
      variant="h2"
      sx={{
        fontWeight: 300,
        color: ACCENTURE_COLORS.corePurple1,
        mb: 0.5,
        fontSize: { xs: "2.2rem", md: "2.8rem" }
      }}
    >
      {value}
    </Typography>
    <Typography
      variant="body2"
      sx={{ 
        color: ACCENTURE_COLORS.darkGray,
        textTransform: "uppercase",
        letterSpacing: "1.2px",
        fontSize: "0.65rem",
        fontWeight: 500,
        opacity: 0.6,
      }}
    >
      {label}
    </Typography>
  </Box>
);

export default ProfileSummary;