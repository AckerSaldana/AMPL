import React, { useState, lazy, Suspense, useMemo, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  Paper,
  Alert,
} from "@mui/material";
import {
  WorkspacePremium,
  Code,
  Timeline,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useDarkMode } from "../contexts/DarkModeContext";

// Direct import for ProfileSummary to avoid loading delay
import ProfileSummary from "../components/ProfileSummary";

// Component imports with lazy loading and preload
const ProjectCard = lazy(() => import("../components/ProjectPathCard"));
const CertificationCard = lazy(() => import("../components/CertificationPathCard"));
const CareerTimeline = lazy(() => import("../components/CareerTimeline"));
const VirtualAssistant = lazy(() => import("../components/VirtualAssistant"));

// Preload components on hover/focus
const preloadComponent = (component) => {
  if (component.preload) {
    component.preload();
  }
};

// Add preload methods to lazy components
ProjectCard.preload = () => import("../components/ProjectPathCard");
CertificationCard.preload = () => import("../components/CertificationPathCard");
CareerTimeline.preload = () => import("../components/CareerTimeline");

// Skeleton imports
import ProfileSummarySkeleton from "../components/ProfileSummarySkeleton";
import CareerTimelineSkeleton from "../components/CareerTimelineSkeleton";
import ProjectsGridSkeleton from "../components/ProjectsGridSkeleton";
import CertificationsGridSkeleton from "../components/CertificationsGridSkeleton";
import VirtualAssistantSkeleton from "../components/VirtualAssistantSkeleton";

// Custom hooks - using optimized version
import useAuth from "../hooks/useAuth";
import useUserDataOptimized from "../hooks/useUserDataOptimized";

// Import styles
import { ACCENTURE_COLORS } from "../styles/styles";

// Main component
const MyPath = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { loading: authLoading } = useAuth();
  const theme = useTheme();
  const { darkMode } = useDarkMode();
  
  // Use optimized hook for all data fetching
  const {
    userProfile,
    projects,
    certifications,
    timelineItems,
    profileLoading,
    projectsLoading,
    certificationsLoading,
    timelineLoading,
    useMockData,
    invalidateCache,
  } = useUserDataOptimized();
  
  // Provide default profile data structure to avoid empty renders
  const defaultProfile = useMemo(() => ({
    name: "Loading...",
    avatar: "",
    currentRole: "Professional",
    projectsCount: 0,
    certificationsCount: 0,
    primarySkills: [],
    about: "Loading profile..."
  }), []);

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
    
    // Preload components based on tab selection
    if (newValue === 0) {
      CareerTimeline.preload();
    } else if (newValue === 1) {
      ProjectCard.preload();
    } else if (newValue === 2) {
      CertificationCard.preload();
    }
  }, []);

  // Make invalidateCache available globally for VirtualAssistant
  useEffect(() => {
    window.invalidateUserCache = invalidateCache;
    return () => {
      delete window.invalidateUserCache;
    };
  }, [invalidateCache]);

  // Function to show alert for sample data if needed
  const renderMockDataAlert = useCallback((isUsingMockData) => {
    if (isUsingMockData) {
      return (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 2, 
            "& .MuiAlert-icon": { color: ACCENTURE_COLORS.corePurple1 },
            backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.1)' : 'rgba(161, 0, 255, 0.05)',
            color: darkMode ? '#ffffff' : 'inherit',
            border: darkMode ? '1px solid rgba(161, 0, 255, 0.3)' : 'none'
          }}
        >
          Showing sample data. Your actual data will appear here when available.
        </Alert>
      );
    }
    return null;
  }, [darkMode]);

  // Memoize empty state component
  const EmptyState = useCallback(({ message }) => (
    <Grid item xs={12}>
      <Paper elevation={0} sx={{ 
        p: 3, 
        borderRadius: 2, 
        textAlign: 'center',
        boxShadow: darkMode ? "0 2px 12px rgba(255, 255, 255, 0.03)" : "0 2px 12px rgba(0, 0, 0, 0.03)",
        border: darkMode ? `1px dashed ${ACCENTURE_COLORS.corePurple1}60` : `1px dashed ${ACCENTURE_COLORS.corePurple1}30`,
        backgroundColor: darkMode ? theme.palette.background.paper : '#ffffff'
      }}>
        <Typography variant="body1" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : ACCENTURE_COLORS.darkGray }}>
          {message}
        </Typography>
      </Paper>
    </Grid>
  ), [darkMode, theme.palette.background.paper]);

  // Memoize tab content to prevent unnecessary re-renders
  const tabContent = useMemo(() => {
    const contents = [];
    
    // Timeline Panel
    contents[0] = (
      <Box key="timeline">
        {!timelineLoading && renderMockDataAlert(useMockData)}
        
        <Suspense fallback={<CareerTimelineSkeleton />}>
          {timelineLoading ? (
            <CareerTimelineSkeleton />
          ) : (
            <CareerTimeline timelineItems={timelineItems} darkMode={darkMode} />
          )}
        </Suspense>
      </Box>
    );

    // Projects Panel
    contents[1] = (
      <Box key="projects">
        {!projectsLoading && renderMockDataAlert(false)}
        
        <Suspense fallback={<ProjectsGridSkeleton />}>
          {projectsLoading ? (
            <ProjectsGridSkeleton />
          ) : (
            <Grid container spacing={2}>
              {projects.length > 0 ? (
                projects.map((project, index) => (
                  <Grid item xs={12} sm={6} key={project.id}>
                    <ProjectCard project={project} index={index} darkMode={darkMode} />
                  </Grid>
                ))
              ) : (
                <EmptyState message="No projects found. New projects will appear here." />
              )}
            </Grid>
          )}
        </Suspense>
      </Box>
    );

    // Certifications Panel
    contents[2] = (
      <Box key="certifications">
        {!certificationsLoading && renderMockDataAlert(useMockData)}
        
        <Suspense fallback={<CertificationsGridSkeleton />}>
          {certificationsLoading ? (
            <CertificationsGridSkeleton />
          ) : (
            <Grid container spacing={2}>
              {certifications.length > 0 ? (
                certifications.map((cert, index) => (
                  <Grid item xs={12} sm={6} key={cert.id}>
                    <CertificationCard certification={cert} index={index} darkMode={darkMode} />
                  </Grid>
                ))
              ) : (
                <EmptyState message="No certifications found. Your certifications will appear here once obtained." />
              )}
            </Grid>
          )}
        </Suspense>
      </Box>
    );

    return contents;
  }, [
    timelineLoading, 
    projectsLoading, 
    certificationsLoading,
    useMockData,
    timelineItems,
    projects,
    certifications,
    renderMockDataAlert,
    darkMode,
    EmptyState
  ]);

  // Memoize tab styles
  const tabStyles = useMemo(() => ({
    "&.Mui-selected::after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      height: "3px",
      backgroundColor: ACCENTURE_COLORS.corePurple1,
      borderRadius: "3px 3px 0 0",
      display: "block"
    }
  }), []);

  // Main render
  return (
    <Box sx={{ 
      width: "100%", 
      minHeight: "100vh", 
      display: "flex",
      flexDirection: "column",
      overflow: "auto", 
      margin: 0,
      padding: 0,
    }}>
      <Box sx={{ 
        p: { xs: 2, md: 3 }, 
        maxWidth: "100%", 
        flexGrow: 1, 
        display: "flex",
        flexDirection: "column"
      }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, color: darkMode ? '#ffffff' : ACCENTURE_COLORS.black }}>
          Professional Journey
        </Typography>

        {/* Main content */}
        <Box sx={{ 
          flexGrow: 1, 
          display: "flex", 
          width: "100%",
          marginBottom: 3,
          overflow: "visible",
        }}>
          <Grid container spacing={3} sx={{ 
            width: "100%", 
            margin: 0,
          }}>
            {/* Left column: Virtual Assistant */}
            <Grid item xs={12} md={6} sx={{ 
              display: "flex",
              pr: { xs: 0, md: 1 },
              mt: { xs: 3, md: 0 },
              order: { xs: 2, md: 1 } // On mobile, show after content
            }}>
              {/* Container for VirtualAssistant with controlled height */}
              <Box sx={{ 
                width: "100%",
                maxHeight: { xs: "800px", md: "900px" },
                height: { xs: "900px", md: "1000px" },
                display: "flex"
              }}>
                <Suspense fallback={<VirtualAssistantSkeleton />}>
                  <VirtualAssistant />
                </Suspense>
              </Box>
            </Grid>
            
            {/* Right column: Career profile content */}
            <Grid item xs={12} md={6} sx={{ 
              display: "flex", 
              flexDirection: "column",
              pl: { xs: 0, md: 1 },
              order: { xs: 1, md: 2 } // On mobile, show first
            }}>
              {/* Profile Summary */}
              <Box sx={{ mb: 2 }}>
                {authLoading || profileLoading ? (
                  <ProfileSummarySkeleton />
                ) : (
                  <ProfileSummary userInfo={userProfile || defaultProfile} darkMode={darkMode} />
                )}
              </Box>

              {/* Tabs Navigation */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 4,
                  mb: 2,
                  overflow: "visible",
                  boxShadow: darkMode ? "0 2px 8px rgba(255,255,255,0.04)" : "0 2px 8px rgba(0,0,0,0.04)",
                  position: "relative",
                  zIndex: 1,
                  backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
                  border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  aria-label="career sections"
                  variant="fullWidth"
                  sx={{
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontSize: "1rem",
                      fontWeight: 400,
                      color: darkMode ? 'rgba(255, 255, 255, 0.7)' : ACCENTURE_COLORS.darkGray,
                      py: 2.5,
                      minHeight: 64,
                    },
                    "& .MuiTab-root.Mui-selected": {
                      color: ACCENTURE_COLORS.corePurple1,
                      fontWeight: 500,
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: ACCENTURE_COLORS.corePurple1,
                      height: 3,
                    },
                  }}
                >
                  <Tab
                    icon={<Timeline />}
                    iconPosition="start"
                    label="Timeline"
                    onMouseEnter={() => preloadComponent(CareerTimeline)}
                    sx={tabStyles}
                  />
                  <Tab 
                    icon={<Code />} 
                    iconPosition="start" 
                    label="Projects"
                    onMouseEnter={() => preloadComponent(ProjectCard)} 
                    sx={tabStyles}
                  />
                  <Tab
                    icon={<WorkspacePremium />}
                    iconPosition="start"
                    label="Certifications"
                    onMouseEnter={() => preloadComponent(CertificationCard)}
                    sx={tabStyles}
                  />
                </Tabs>
              </Paper>

              {/* Panel Content */}
              <Box sx={{ 
                flexGrow: 1,
                pr: 1,
                pb: 3,
                mt: 1,
                "& .MuiGrid-container": {
                  width: "100%", 
                  m: 0
                }
              }}>
                {tabContent[activeTab]}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default MyPath;