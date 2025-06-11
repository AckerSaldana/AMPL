import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  useMediaQuery,
  useTheme,
  Skeleton,
} from "@mui/material";
import {
  ArrowForwardIos as ArrowForwardIosIcon,
  Work as WorkIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import UserProfileModal from "./UserProfileModal";

// Motion components
const MotionPaper = motion(Paper);
const MotionBox = motion(Box);
const MotionChip = motion(Chip);

/**
 * Animated Employee Card Component
 */
const EmployeeCardAnimated = ({ employee, onViewDetails, useModal = false, isLoading = false, onHover, darkMode = false }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery('(max-width:599px)');
  const isVerySmallScreen = useMediaQuery('(max-width:450px)');
  const isExtraSmallScreen = useMediaQuery('(max-width:320px)');
  
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Handler for viewing details
  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails();
    } else if (useModal) {
      setModalOpen(true);
    } else {
      navigate(`/user/${employee.user_id}`);
    }
  };
  
  // Process skills to display
  const skillsToDisplay = employee?.skills || [];
  
  // Get color based on assignment status
  const getAssignmentColor = (isAssigned) => {
    return isAssigned ? "#f44336" : "#4caf50";
  };
  
  // Get label based on assignment
  const getAssignmentStatus = (isAssigned) => {
    return isAssigned ? "Assigned" : "Available";
  };
  
  // Determine how many skills to show based on screen size
  const getMaxSkillsToShow = () => {
    if (isSmallScreen) return 2;
    return 3;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Paper sx={{ 
        p: isSmallScreen ? 2 : 3, 
        borderRadius: 3, 
        height: 380,
        display: "flex",
        flexDirection: "column",
        backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
      }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Skeleton variant="circular" width={56} height={56} />
          <Box sx={{ ml: 2, flex: 1 }}>
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" />
          </Box>
          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
        </Box>
        <Box sx={{ display: "flex", gap: 1, mb: 2, minHeight: 52, alignContent: "flex-start" }}>
          <Skeleton variant="rectangular" width={60} height={22} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={80} height={22} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={50} height={22} sx={{ borderRadius: 1 }} />
        </Box>
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="text" width="90%" sx={{ mb: 2, minHeight: 20 }} />
        <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 2, flexShrink: 0 }} />
      </Paper>
    );
  }

  return (
    <>
      <MotionPaper 
        elevation={0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleViewDetails}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          y: -2,
          transition: { duration: 0.2, ease: "easeOut" }
        }}
        sx={{ 
          borderRadius: 3,
          height: 275, // Fixed height for all cards
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          transition: "all 0.25s ease",
          boxShadow: isHovered ? 
            (darkMode ? "0 8px 24px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.08)") : 
            (darkMode ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(0,0,0,0.04)"),
          overflow: "hidden",
          border: "1px solid",
          borderColor: isHovered ? "#9c27b0" : (darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.04)"),
          backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
          "&:hover": {
            borderColor: "#9c27b0",
          },
          p: isSmallScreen ? 2 : 3,
          minWidth: isSmallScreen ? "100%" : 240,
          position: "relative"
        }}
      >
        {/* Header with animated elements */}
        <Box sx={{ 
          display: "flex", 
          flexDirection: "column",
          width: "100%",
          mb: 2,
          flexShrink: 0, // Prevent shrinking
        }}>
          <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
            width: "100%"
          }}>
            <Box sx={{
              display: "flex", 
              alignItems: "center",
              flex: 1,
              minWidth: 0,
            }}>
              {/* Animated Avatar */}
              <MotionBox 
                sx={{ position: "relative", flexShrink: 0 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              >
                <Avatar
                  src={employee.profile_pic}
                  onLoad={() => setImageLoaded(true)}
                  sx={{ 
                    width: isSmallScreen ? 48 : 56, 
                    height: isSmallScreen ? 48 : 56,
                    mr: 2,
                    border: darkMode ? "4px solid #1e1e1e" : "4px solid #fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    opacity: imageLoaded ? 1 : 0,
                    transition: "opacity 0.3s ease"
                  }}
                >
                  {employee.name ? employee.name[0].toUpperCase() : "?"}
                </Avatar>
                
                {/* Animated status indicator */}
                <MotionBox 
                  sx={{ 
                    position: "absolute", 
                    bottom: 3, 
                    right: 3, 
                    width: 10, 
                    height: 10, 
                    borderRadius: "50%",
                    bgcolor: getAssignmentColor(employee.isAssigned),
                    border: darkMode ? "2px solid #1e1e1e" : "2px solid white",
                    boxShadow: "0 0 4px rgba(0,0,0,0.1)"
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                />
              </MotionBox>
              
              {/* Animated name and role */}
              <MotionBox 
                sx={{ flexGrow: 1, minWidth: 0 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Typography 
                  variant="subtitle1" 
                  fontWeight={600}
                  sx={{ 
                    lineHeight: 1.2,
                    fontSize: isSmallScreen ? "0.875rem" : "0.95rem",
                    color: darkMode ? '#ffffff' : "#212121",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {employee.name} {employee.last_name}
                </Typography>
                
                <MotionBox 
                  sx={{ display: "flex", alignItems: "center", mt: 0.3 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Box 
                    sx={{ 
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: darkMode ? "rgba(156, 39, 176, 0.2)" : "rgba(156, 39, 176, 0.08)",
                      color: darkMode ? "#ce93d8" : "#9c27b0",
                      px: 1,
                      py: 0.3,
                      borderRadius: 4,
                      fontSize: "0.65rem",
                      fontWeight: 500,
                      maxWidth: "100%",
                      overflow: "hidden"
                    }}
                  >
                    <WorkIcon sx={{ fontSize: 10, mr: 0.5, opacity: 0.8, flexShrink: 0 }} />
                    <Typography
                      component="span"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: "0.65rem"
                      }}
                    >
                      {employee.role}
                    </Typography>
                  </Box>
                </MotionBox>
              </MotionBox>
            </Box>
            
            {/* Animated status badge */}
            <MotionBox 
              sx={{ display: "flex", alignItems: "flex-start", ml: 1, flexShrink: 0 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            >
              <Chip
                label={getAssignmentStatus(employee.isAssigned)}
                size="small"
                sx={{
                  borderRadius: "12px",
                  fontSize: "0.7rem",
                  height: "24px",
                  fontWeight: 500,
                  bgcolor: employee.isAssigned 
                    ? (darkMode ? "rgba(244, 67, 54, 0.2)" : "rgba(244, 67, 54, 0.08)") 
                    : (darkMode ? "rgba(76, 175, 80, 0.2)" : "rgba(76, 175, 80, 0.08)"),
                  color: employee.isAssigned 
                    ? (darkMode ? "#ff6659" : "#f44336") 
                    : (darkMode ? "#66bb6a" : "#4caf50"),
                  border: employee.isAssigned 
                    ? (darkMode ? "1px solid rgba(244, 67, 54, 0.4)" : "1px solid rgba(244, 67, 54, 0.2)") 
                    : (darkMode ? "1px solid rgba(76, 175, 80, 0.4)" : "1px solid rgba(76, 175, 80, 0.2)"),
                  '&:hover': {
                    bgcolor: employee.isAssigned 
                      ? (darkMode ? "rgba(244, 67, 54, 0.3)" : "rgba(244, 67, 54, 0.12)") 
                      : (darkMode ? "rgba(76, 175, 80, 0.3)" : "rgba(76, 175, 80, 0.12)"),
                  },
                  transition: "all 0.2s ease",
                  "& .MuiChip-label": {
                    padding: "0 8px",
                    overflow: "visible"
                  },
                  whiteSpace: "nowrap",
                  minWidth: "fit-content",
                  alignSelf: "flex-start"
                }}
              />
            </MotionBox>
          </Box>
        </Box>

        {/* Animated skills section */}
        <MotionBox 
          sx={{ 
            display: "flex",
            flexWrap: "wrap",
            gap: 0.7,
            mb: 2,
            justifyContent: "flex-start",
            minHeight: 52, // Ensure consistent space for skills
            alignContent: "flex-start"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {skillsToDisplay.slice(0, getMaxSkillsToShow()).map((skill, idx) => (
            <MotionChip
              key={idx}
              label={skill.name}
              size="small"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + idx * 0.1, type: "spring", stiffness: 200 }}
              sx={{
                height: 22,
                fontSize: "0.7rem",
                borderRadius: "12px",
                backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
                  transform: "scale(1.05)"
                },
                maxWidth: "100%",
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                  padding: "0 6px"
                },
                transition: "all 0.2s ease"
              }}
            />
          ))}
          {skillsToDisplay.length > getMaxSkillsToShow() && (
            <MotionChip
              label={`+${skillsToDisplay.length - getMaxSkillsToShow()}`}
              size="small"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
              sx={{
                height: 22,
                fontSize: "0.7rem",
                borderRadius: "12px",
                backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                color: darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                border: darkMode ? "1px dashed rgba(255,255,255,0.2)" : "1px dashed rgba(0,0,0,0.1)",
                '&:hover': {
                  backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                },
                "& .MuiChip-label": {
                  padding: "0 6px"
                }
              }}
            />
          )}
        </MotionBox>
        
        {/* Spacer to push content to bottom */}
        <Box sx={{ flex: 1 }} />
        
        {/* Animated availability text */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          sx={{ flexShrink: 0 }}
        >
          <Typography 
            sx={{ 
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : "text.secondary",
              fontStyle: "italic",
              fontSize: "0.75rem",
              mb: 2,
              whiteSpace: "normal",
              minHeight: 20, // Ensure consistent space
            }}
          >
            {employee.isAssigned 
              ? "Currently working on a project" 
              : "Available for project assignment"}
          </Typography>
        </MotionBox>
        
        {/* Animated button */}
        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          sx={{ flexShrink: 0 }}
        >
          <Button
            variant="outlined"
            endIcon={<ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
            fullWidth
            onClick={handleViewDetails}
            onMouseEnter={() => onHover && onHover()}
            sx={{
              borderRadius: 8,
              textTransform: "none",
              fontWeight: 600,
              py: 0.75,
              borderColor: darkMode ? "#ce93d8" : "#9c27b0",
              color: darkMode ? "#ce93d8" : "#9c27b0",
              fontSize: "0.8rem",
              transition: "all 0.2s ease",
              '&:hover': {
                borderColor: darkMode ? "#ba68c8" : "#7b1fa2",
                backgroundColor: darkMode ? "rgba(156, 39, 176, 0.15)" : "rgba(156, 39, 176, 0.04)",
                boxShadow: darkMode ? "0 2px 8px rgba(156, 39, 176, 0.3)" : "0 2px 8px rgba(156, 39, 176, 0.15)"
              }
            }}
          >
            View Details
          </Button>
        </MotionBox>
      </MotionPaper>
      
      {/* Profile Modal */}
      {useModal && (
        <UserProfileModal 
          open={modalOpen} 
          onClose={() => setModalOpen(false)} 
          userId={employee.user_id} 
          darkMode={darkMode}
        />
      )}
    </>
  );
};

export default EmployeeCardAnimated;