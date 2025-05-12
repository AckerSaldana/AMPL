import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  Paper,
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

// Import styles
import { 
  ACCENTURE_COLORS
} from "../styles/styles";

// Mock data - replace with your actual data fetching logic
const mockProjects = [
  {
    id: 1,
    name: "E-commerce Platform Redesign",
    role: "Frontend Developer",
    company: "TechSolutions Inc.",
    date: "Jan 2023 - Mar 2023",
    skills: ["React", "Material UI", "GraphQL"],
    description:
      "Led the UI/UX redesign of the customer-facing e-commerce platform",
  },
  {
    id: 2,
    name: "Inventory Management System",
    role: "Full Stack Developer",
    company: "LogisticsPlus",
    date: "Apr 2023 - Aug 2023",
    skills: ["Node.js", "React", "MongoDB"],
    description:
      "Developed a real-time inventory tracking system with dashboard analytics",
  },
  {
    id: 3,
    name: "Mobile Banking App",
    role: "React Native Developer",
    company: "FinTech Solutions",
    date: "Sep 2023 - Dec 2023",
    skills: ["React Native", "Redux", "Jest"],
    description:
      "Built secure transaction flows and account management features",
  },
];

const mockCertifications = [
  {
    id: 1,
    name: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services",
    date: "Feb 2023",
    expiryDate: "Feb 2026",
    credentialId: "AWS-123456",
    score: "900/1000",
  },
  {
    id: 2,
    name: "Professional Scrum Master I",
    issuer: "Scrum.org",
    date: "May 2023",
    credentialId: "PSM-789012",
    score: "95%",
  },
  {
    id: 3,
    name: "Google Professional Cloud Developer",
    issuer: "Google Cloud",
    date: "Oct 2023",
    expiryDate: "Oct 2025",
    credentialId: "GCP-345678",
    score: "850/1000",
  },
];

// Sample user info - This would come from your user profile data
const userInfo = {
  name: "Alex Johnson",
  avatar: "/path/to/avatar.jpg", // Add a placeholder or actual avatar path
  currentRole: "Senior Frontend Developer",
  yearsExperience: 4,
  projectsCount: 3,
  certificationsCount: 3,
  primarySkills: [
    "React",
    "JavaScript",
    "TypeScript",
    "Material UI",
    "Node.js",
    "GraphQL",
  ],
};

// Create timeline data
const getTimelineItems = () => {
  const projects = mockProjects.map((proj) => ({
    ...proj,
    type: "project",
    displayDate: proj.date,
  }));

  const certifications = mockCertifications.map((cert) => ({
    ...cert,
    type: "certification",
    displayDate: cert.date,
  }));

  return [...projects, ...certifications].sort((a, b) => {
    // Sort by date - newest first
    return (
      new Date(b.displayDate.split(" - ")[0]) -
      new Date(a.displayDate.split(" - ")[0])
    );
  });
};

// Main component
const MyPath = () => {
  const [activeTab, setActiveTab] = useState(0);
  const timelineItems = getTimelineItems();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Main render
  return (
    <Box sx={{ 
      width: "100%", 
      height: "100vh", 
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      // El color de fondo se eliminó para coincidir con ProjectDashboard
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
                <ProfileSummary userInfo={userInfo} />
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
                {/* Timeline Panel with more height */}
                {activeTab === 0 && (
                  <Box sx={{ minHeight: "600px" }}>
                    <CareerTimeline timelineItems={timelineItems} />
                  </Box>
                )}

                {/* Projects Panel */}
                {activeTab === 1 && (
                  <Grid container spacing={2}>
                    {mockProjects.map((project) => (
                      <Grid item xs={12} sm={6} key={project.id}>
                        <ProjectCard project={project} />
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Certifications Panel */}
                {activeTab === 2 && (
                  <Grid container spacing={2}>
                    {mockCertifications.map((cert) => (
                      <Grid item xs={12} sm={6} key={cert.id}>
                        <CertificationCard certification={cert} />
                      </Grid>
                    ))}
                  </Grid>
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