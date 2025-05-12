import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  WorkspacePremium,
  Code,
  Timeline,
} from "@mui/icons-material";

// Component imports
import ProjectCard from "../components/ProjectPathCard";
import CertificationCard from "../components/CertificationPathCard";
import ProfileSummary from "../components/ProfileSummary";
import CareerTimeline from "../components/CareerTimeline";
import VirtualAssistant from "../components/VirtualAssistant";

// Custom hooks
import useUserProfile from "../hooks/useUserProfile";
import useUserProjects from "../hooks/useUserProjects";
import useUserCertifications from "../hooks/useUserCertifications";
import useUserTimeline from "../hooks/useUserTimeline";

// Import styles
import { 
  ACCENTURE_COLORS
} from "../styles/styles";

// Main component
const MyPath = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { userProfile, loading: profileLoading } = useUserProfile();
  const { projects, loading: projectsLoading, useMockData: usingMockProjects } = useUserProjects();
  const { certifications, loading: certificationsLoading, useMockData: usingMockCerts } = useUserCertifications();
  const { timelineItems, loading: timelineLoading, useMockData: usingMockTimeline } = useUserTimeline();

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
      height: "100vh", 
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      margin: 0,
      padding: 0,
    }}>
      <Box sx={{ 
        p: { xs: 2, md: 3 }, 
        maxWidth: "100%", 
        height: "100%",
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
          height: "calc(100% - 70px)", // Subtract header height
          overflow: "hidden"
        }}>
          <Grid container spacing={3} sx={{ 
            width: "100%", 
            height: "100%", 
            margin: 0,
          }}>
            {/* Left column: Career profile content */}
            <Grid item xs={12} md={6} sx={{ 
              height: "100%",
              display: "flex", 
              flexDirection: "column",
              pr: { xs: 0, md: 1 },
              overflow: "hidden" // Prevent outside overflow
            }}>
              {/* Profile Summary */}
              <Box sx={{ mb: 2 }}>
                {profileLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress sx={{ color: ACCENTURE_COLORS.corePurple1 }} />
                  </Box>
                ) : (
                  <ProfileSummary userInfo={userProfile} />
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

              {/* Panel Content with scrolling */}
              <Box sx={{ 
                flexGrow: 1, 
                overflowY: "auto", 
                pr: 1,
                pb: 3,
                mt: 1,
                height: "100%", // Take available height
                "& .MuiGrid-container": {
                  width: "100%", 
                  m: 0
                }
              }}>
                {/* Timeline Panel */}
                {activeTab === 0 && (
                  <Box sx={{ minHeight: "600px" }}>
                    {renderMockDataAlert(usingMockTimeline)}
                    
                    {timelineLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                        <CircularProgress sx={{ color: ACCENTURE_COLORS.corePurple1 }} />
                      </Box>
                    ) : (
                      <CareerTimeline timelineItems={timelineItems} />
                    )}
                  </Box>
                )}

                {/* Projects Panel */}
                {activeTab === 1 && (
                  <>
                    {renderMockDataAlert(usingMockProjects)}
                    
                    {projectsLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                        <CircularProgress sx={{ color: ACCENTURE_COLORS.corePurple1 }} />
                      </Box>
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
                  </>
                )}

                {/* Certifications Panel */}
                {activeTab === 2 && (
                  <>
                    {renderMockDataAlert(usingMockCerts)}
                    
                    {certificationsLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                        <CircularProgress sx={{ color: ACCENTURE_COLORS.corePurple1 }} />
                      </Box>
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
                  </>
                )}
              </Box>
            </Grid>
            
            {/* Right column: Chat interface */}
            <Grid item xs={12} md={6} sx={{ 
              height: "100%", 
              display: "flex",
              pl: { xs: 0, md: 1 }
            }}>
              <VirtualAssistant />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default MyPath;