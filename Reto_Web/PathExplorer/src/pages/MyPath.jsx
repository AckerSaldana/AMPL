import React, { useState, lazy, Suspense } from "react";
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

// Direct import for ProfileSummary to avoid loading delay
import ProfileSummary from "../components/ProfileSummary";

// Component imports with lazy loading
const ProjectCard = lazy(() => import("../components/ProjectPathCard"));
const CertificationCard = lazy(() => import("../components/CertificationPathCard"));
const CareerTimeline = lazy(() => import("../components/CareerTimeline"));
const VirtualAssistant = lazy(() => import("../components/VirtualAssistant"));

// Skeleton imports
import ProfileSummarySkeleton from "../components/ProfileSummarySkeleton";
import CareerTimelineSkeleton from "../components/CareerTimelineSkeleton";
import ProjectsGridSkeleton from "../components/ProjectsGridSkeleton";
import CertificationsGridSkeleton from "../components/CertificationsGridSkeleton";
import VirtualAssistantSkeleton from "../components/VirtualAssistantSkeleton";

// Custom hooks
import useAuth from "../hooks/useAuth";
import useUserProfile from "../hooks/useUserProfile";
import useUserProjects from "../hooks/useUserProjects";
import useUserCertifications from "../hooks/useUserCertifications";
import useUserTimeline from "../hooks/useUserTimeline";

// Import styles
import { ACCENTURE_COLORS } from "../styles/styles";

// Main component
const MyPath = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { loading: authLoading } = useAuth();
  const { userProfile, loading: profileLoading } = useUserProfile();
  const { projects, loading: projectsLoading, useMockData: usingMockProjects } = useUserProjects();
  const { certifications, loading: certificationsLoading, useMockData: usingMockCerts } = useUserCertifications();
  const { timelineItems, loading: timelineLoading, useMockData: usingMockTimeline } = useUserTimeline();
  
  // Provide default profile data structure to avoid empty renders
  const defaultProfile = {
    name: "Loading...",
    avatar: "",
    currentRole: "Professional",
    projectsCount: 0,
    certificationsCount: 0,
    primarySkills: [],
    about: "Loading profile..."
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Function to show alert for sample data if needed
  const renderMockDataAlert = (isUsingMockData) => {
    if (isUsingMockData) {
      return (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 2, 
            "& .MuiAlert-icon": { color: ACCENTURE_COLORS.corePurple1 } 
          }}
        >
          Showing sample data. Your actual data will appear here when available.
        </Alert>
      );
    }
    return null;
  };

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
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
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
              {/* Contenedor para el VirtualAssistant con altura controlada */}
              <Box sx={{ 
                width: "100%",
                maxHeight: { xs: "700px", md: "800px" }, // Altura máxima controlada
                height: "auto", // Altura automática según el contenido
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
                {authLoading ? (
                  <ProfileSummarySkeleton />
                ) : (
                  <ProfileSummary userInfo={userProfile || defaultProfile} />
                )}
              </Box>

              {/* Tabs Navigation */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 4,
                  mb: 2,
                  overflow: "visible",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  position: "relative",
                  zIndex: 1
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
                      color: ACCENTURE_COLORS.darkGray,
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
                    sx={{
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
                    }}
                  />
                  <Tab 
                    icon={<Code />} 
                    iconPosition="start" 
                    label="Projects" 
                    sx={{
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
                    }}
                  />
                  <Tab
                    icon={<WorkspacePremium />}
                    iconPosition="start"
                    label="Certifications"
                    sx={{
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
                    }}
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
                {/* Timeline Panel */}
                {activeTab === 0 && (
                  <Box>
                    {!timelineLoading && renderMockDataAlert(usingMockTimeline)}
                    
                    <Suspense fallback={<CareerTimelineSkeleton />}>
                      {timelineLoading ? (
                        <CareerTimelineSkeleton />
                      ) : (
                        <CareerTimeline timelineItems={timelineItems} />
                      )}
                    </Suspense>
                  </Box>
                )}

                {/* Projects Panel */}
                {activeTab === 1 && (
                  <>
                    {!projectsLoading && renderMockDataAlert(usingMockProjects)}
                    
                    <Suspense fallback={<ProjectsGridSkeleton />}>
                      {projectsLoading ? (
                        <ProjectsGridSkeleton />
                      ) : (
                        <Grid container spacing={2}>
                          {projects.length > 0 ? (
                            projects.map((project) => (
                              <Grid item xs={12} sm={6} key={project.id}>
                                <ProjectCard project={project} />
                              </Grid>
                            ))
                          ) : (
                            <Grid item xs={12}>
                              <Paper elevation={0} sx={{ 
                                p: 3, 
                                borderRadius: 2, 
                                textAlign: 'center',
                                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.03)",
                                border: `1px dashed ${ACCENTURE_COLORS.corePurple1}30`
                              }}>
                                <Typography variant="body1" sx={{ color: ACCENTURE_COLORS.darkGray }}>
                                  No projects found. New projects will appear here.
                                </Typography>
                              </Paper>
                            </Grid>
                          )}
                        </Grid>
                      )}
                    </Suspense>
                  </>
                )}

                {/* Certifications Panel */}
                {activeTab === 2 && (
                  <>
                    {!certificationsLoading && renderMockDataAlert(usingMockCerts)}
                    
                    <Suspense fallback={<CertificationsGridSkeleton />}>
                      {certificationsLoading ? (
                        <CertificationsGridSkeleton />
                      ) : (
                        <Grid container spacing={2}>
                          {certifications.length > 0 ? (
                            certifications.map((cert) => (
                              <Grid item xs={12} sm={6} key={cert.id}>
                                <CertificationCard certification={cert} />
                              </Grid>
                            ))
                          ) : (
                            <Grid item xs={12}>
                              <Paper elevation={0} sx={{ 
                                p: 3, 
                                borderRadius: 2, 
                                textAlign: 'center',
                                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.03)",
                                border: `1px dashed ${ACCENTURE_COLORS.corePurple1}30`
                              }}>
                                <Typography variant="body1" sx={{ color: ACCENTURE_COLORS.darkGray }}>
                                  No certifications found. Your certifications will appear here once obtained.
                                </Typography>
                              </Paper>
                            </Grid>
                          )}
                        </Grid>
                      )}
                    </Suspense>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default MyPath;