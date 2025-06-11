import React from "react";
import { Box, Paper, Skeleton } from "@mui/material";
import { ACCENTURE_COLORS } from "../styles/styles";
import { useDarkMode } from "../contexts/DarkModeContext";

const TimelineItemSkeleton = ({ isLast = false, darkMode }) => {
  return (
    <Box
      sx={{
        display: "flex",
        position: "relative",
        mb: isLast ? 0 : 5,
      }}
    >
      {/* Left column with timeline element */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: { xs: 50, md: 80 },
          flexShrink: 0,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Skeleton
          variant="circular"
          width={{ xs: 36, md: 44 }}
          height={{ xs: 36, md: 44 }}
          sx={{ 
            bgcolor: darkMode ? 'rgba(255, 255, 255, 0.15)' : `${ACCENTURE_COLORS.corePurple1}15`,
            zIndex: 2 
          }}
        />
        
        {!isLast && (
          <Box
            sx={{
              width: 2,
              height: "calc(100% + 40px)",
              position: "absolute",
              top: { xs: 36, md: 44 },
              bgcolor: darkMode ? 'rgba(255, 255, 255, 0.4)' : `${ACCENTURE_COLORS.corePurple1}40`,
              zIndex: 1,
            }}
          />
        )}
      </Box>

      {/* Right column with content */}
      <Box sx={{ flex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            bgcolor: darkMode ? "#2e2e2e" : "#fff",
            boxShadow: darkMode ? "0 2px 12px rgba(0, 0, 0, 0.3)" : "0 2px 12px rgba(0, 0, 0, 0.03)",
            border: darkMode ? "1px solid rgba(255,255,255,0.12)" : `1px solid ${ACCENTURE_COLORS.corePurple1}10`,
            position: "relative",
          }}
        >
          <Skeleton 
            variant="text" 
            width="60%" 
            height={28} 
            sx={{ 
              mb: 1.5,
              bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : `${ACCENTURE_COLORS.corePurple1}10`,
            }} 
          />

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            <Skeleton 
              variant="text" 
              width={100} 
              height={24} 
              sx={{ 
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : `${ACCENTURE_COLORS.corePurple1}08`,
              }} 
            />

            <Skeleton 
              variant="text" 
              width={120} 
              height={24} 
              sx={{ 
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : `${ACCENTURE_COLORS.corePurple1}08`,
              }} 
            />
          </Box>

          <Skeleton 
            variant="text" 
            width="90%" 
            height={20} 
            sx={{ 
              mt: 1.5,
              bgcolor: darkMode ? 'rgba(255, 255, 255, 0.06)' : `${ACCENTURE_COLORS.corePurple1}06`,
            }} 
          />
          
          <Skeleton 
            variant="text" 
            width="75%" 
            height={20} 
            sx={{ 
              bgcolor: darkMode ? 'rgba(255, 255, 255, 0.06)' : `${ACCENTURE_COLORS.corePurple1}06`,
            }} 
          />
        </Paper>
      </Box>
    </Box>
  );
};

const CareerTimelineSkeleton = () => {
  const { darkMode } = useDarkMode();
  // Create 3 timeline items
  return (
    <Box
      sx={{
        position: "relative",
        pb: 2,
        pl: { xs: 0, sm: 2 },
        pr: { xs: 0, sm: 2 },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: { xs: 38, md: 53 },
          width: 6,
          top: 22,
          bottom: 22,
          bgcolor: darkMode ? 'rgba(255, 255, 255, 0.2)' : `${ACCENTURE_COLORS.corePurple1}20`,
          borderRadius: 4,
          zIndex: 1,
        }}
      />
      
      <TimelineItemSkeleton darkMode={darkMode} />
      <TimelineItemSkeleton darkMode={darkMode} />
      <TimelineItemSkeleton darkMode={darkMode} isLast={true} />
    </Box>
  );
};

export default CareerTimelineSkeleton;