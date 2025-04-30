import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  Avatar,
  Button,
  Tab,
  Tabs,
  useTheme,
  Stack,
} from "@mui/material";
import {
  WorkspacePremium,
  Code,
  CalendarMonth,
  Person,
  Business,
  FilterList,
  KeyboardArrowRight,
  Badge,
  Timeline,
} from "@mui/icons-material";

// Component imports
import ProjectPathCard from "../components/ProjectPathCard";
import CertificationPathCard from "../components/CertificationPathCard";
import UserPathCard from "../components/UserPathCard";
import AmountsCard from "../components/AmountsCard";
import TimelineItem from "../components/TimelineItem";

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
  currentRole: "Senior Frontend Developer",
  yearsExperience: 4,
  primarySkills: [
    "React",
    "JavaScript",
    "TypeScript",
    "Material UI",
    "Node.js",
    "GraphQL",
  ],
  topAchievements: 3,
};

// Combine and sort both projects and certifications for timeline
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
    // Simple sort by date - in a real app, parse dates properly
    return (
      new Date(b.displayDate.split(" - ")[0]) -
      new Date(a.displayDate.split(" - ")[0])
    );
  });
};

const MyPath = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const timelineItems = getTimelineItems();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: "100%" }}>
      {/* Header with Summary Stats */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Professional Path
        </Typography>

        {/* Stats Section */}
        <Grid container spacing={3}>
          {/* User Profile Summary */}
          <Grid item xs={12} md={6}>
            <UserPathCard userInfo={userInfo} />
          </Grid>

          {/* Stats Cards */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={2} height="100%">
              <Grid item xs={12} sm={6}>
                <AmountsCard
                  count={mockProjects.length}
                  title="Projects"
                  subtitle="Completed projects"
                  icon={<Code />}
                  color={theme.palette.primary.main}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AmountsCard
                  count={mockCertifications.length}
                  title="Certifications"
                  subtitle="Active certifications"
                  icon={<WorkspacePremium />}
                  color={theme.palette.secondary.main}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Career Timeline*/}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box
            mb={3}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Timeline color="primary" />
              <Typography variant="h6" fontWeight="medium">
                Career Timeline
              </Typography>
            </Box>
          </Box>

          <Box sx={{ maxHeight: 500, overflowY: "auto", px: { xs: 0, sm: 2 } }}>
            {/* Responsive timeline - desktop view for medium screens and up */}
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              {timelineItems.map((item, index) => (
                <TimelineItem
                  key={`desktop-${item.type}-${item.id}`}
                  item={item}
                  index={index}
                  isLast={index === timelineItems.length - 1}
                  viewType="desktop"
                />
              ))}
            </Box>

            {/* Mobile view for small screens */}
            <Box sx={{ display: { xs: "block", md: "none" } }}>
              {timelineItems.map((item, index) => (
                <TimelineItem
                  key={`mobile-${item.type}-${item.id}`}
                  item={item}
                  index={index}
                  isLast={index === timelineItems.length - 1}
                  viewType="mobile"
                />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Detailed Lists */}
      <Box>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            mb: 2,
            "& .MuiTab-root.Mui-selected": {
              color: theme.palette.primary.main,
              borderBottom: "none",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: theme.palette.primary.main,
            },
            "& .MuiTab-root:focus": {
              outline: "none",
            },
          }}
        >
          <Tab icon={<Code />} iconPosition="start" label="Projects" />
          <Tab
            icon={<WorkspacePremium />}
            iconPosition="start"
            label="Certifications"
          />
        </Tabs>

        {/* Projects Panel */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {mockProjects.map((project) => (
              <Grid item xs={12} sm={6} lg={4} key={project.id}>
                <ProjectPathCard project={project} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Certifications Panel */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            {mockCertifications.map((cert) => (
              <Grid item xs={12} sm={6} lg={4} key={cert.id}>
                <CertificationPathCard certification={cert} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default MyPath;
