import React, { useState, useMemo, useId, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  useMediaQuery,
  Divider,
} from "@mui/material";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  RadialLinearScale,
  RadarController,
  LineElement,
} from "chart.js";
import SchoolIcon from "@mui/icons-material/School";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PercentIcon from "@mui/icons-material/Percent";

import ReportsSection from "../components/ReportsSection.jsx";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { supabase } from "../supabase/supabaseClient.js";
import { useProjectAssignments } from "../hooks/useProjectAssignments.js";
import { useProjectStatus } from "../hooks/useProjectStatus.js";
import { useAvgCertificationsPerEmployee } from "../hooks/useAvgCertificationsPerEmployee.js";
import useAverageIdleDays from "../hooks/useAverageIdleDays.js";
import useAvgAssignmentPercentage from "../hooks/useAvgAssignmentPercentage.js";
import UserViewer from "../components/UserViewer.jsx";
import { ACCENTURE_COLORS } from "../styles/styles.js";

// Register required Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  RadialLinearScale,
  RadarController,
  LineElement
);

const Analytics = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Chart IDs
  const chartIds = {
    employeeDistribution: useId(),
    projectStatus: useId(),
    hardSkills: useId(),
    softSkills: useId(),
    topSkills: useId(),
    improvementSkills: useId(),
  };

  // State hooks
  const [skillFilter, setSkillFilter] = useState("All");
  const [activeTab, setActiveTab] = useState(0);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [statsData, setStatsData] = useState({
    totalSkills: 0,
    hardSkills: 0,
    softSkills: 0,
    avgProficiency: 0,
  });

  // Get average certifications per employee data using the hook
  const {
    avgCerts,
    loading: certsLoading,
    error: certsError,
  } = useAvgCertificationsPerEmployee();

  // Get average bench days data using the hook
  const { avgIdleDays, loading: idleDaysLoading } = useAverageIdleDays();

  // Get average assignment percentage data using the new hook
  const {
    avgPercentage,
    loading: percentageLoading,
    error: percentageError,
  } = useAvgAssignmentPercentage();

  // Fetch skills data from Supabase
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("SkillExpertise")
          .select("*");

        if (error) throw error;

        const formattedData = data.map((skill) => ({
          ...skill,
          type: skill.type === "Technical Skill" ? "Hard" : "Soft",
        }));

        setSkills(formattedData);
        updateStats(formattedData);
      } catch (error) {
        console.error("Error fetching skills:", error.message);
        setError("Failed to load skills data");
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // Update stats based on skills data
  const updateStats = (skills) => {
    const hardSkills = skills.filter((s) => s.type === "Hard");
    const softSkills = skills.filter((s) => s.type === "Soft");
    const totalProficiency = skills.reduce((sum, s) => sum + s.proficiency, 0);

    setStatsData({
      totalSkills: skills.length,
      hardSkills: hardSkills.length,
      softSkills: softSkills.length,
      avgProficiency:
        skills.length > 0 ? (totalProficiency / skills.length).toFixed(1) : 0,
    });
  };

  // Filter skills based on selected filter
  const filteredSkills = useMemo(() => {
    if (skillFilter === "All") return skills;
    return skills.filter((skill) => skill.type === skillFilter);
  }, [skillFilter, skills]);

  // Top 5 skills
  const topSkills = useMemo(() => {
    return [...filteredSkills]
      .sort((a, b) => b.proficiency - a.proficiency)
      .slice(0, 5);
  }, [filteredSkills]);

  // Bottom 5 skills (improvement areas)
  const improvementSkills = useMemo(() => {
    return [...filteredSkills]
      .sort((a, b) => a.proficiency - b.proficiency)
      .slice(0, 5);
  }, [filteredSkills]);

  // Chart data for top skills with Accenture colors
  const topSkillsChartData = {
    labels: topSkills.map((skill) => skill.name),
    datasets: [
      {
        label: "Proficiency",
        data: topSkills.map((skill) => skill.proficiency),
        backgroundColor: topSkills.map(() => ACCENTURE_COLORS.corePurple1),
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  // Chart data for improvement areas with Accenture colors
  const improvementSkillsChartData = {
    labels: improvementSkills.map((skill) => skill.name),
    datasets: [
      {
        label: "Proficiency",
        data: improvementSkills.map((skill) => skill.proficiency),
        backgroundColor: improvementSkills.map(() => ACCENTURE_COLORS.accentPurple2),
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  // Navigate to the All Skills page
  const handleViewAllSkills = () => {
    navigate("/all-skills");
  };

  // Get real employee assignment data using the hook
  const {
    assigned,
    unassigned,
    loading: assignmentsLoading,
    error: assignmentsError,
  } = useProjectAssignments();

  // Get real project status data using the hook
  const {
    counts,
    total,
    completionPercentage,
    loading: projectStatusLoading,
    error: projectStatusError,
  } = useProjectStatus();

  // Prepare employee assignment data for the pie chart with Accenture colors
  const employeeAssignmentData = {
    labels: ["Assigned to projects", "On bench (unassigned)"],
    datasets: [
      {
        data: [assigned, unassigned],
        backgroundColor: [ACCENTURE_COLORS.corePurple1, ACCENTURE_COLORS.accentPurple3],
        borderWidth: 0,
      },
    ],
  };

  // Prepare project status data for the bar chart with Accenture colors
  const projectStatusData = {
    labels: ["In Progress", "On Hold", "Not Started", "Completed"],
    datasets: [
      {
        data: [
          counts["In Progress"] || 0,
          counts["On Hold"] || 0,
          counts["Not Started"] || 0,
          counts["Completed"] || 0,
        ],
        backgroundColor: [
          ACCENTURE_COLORS.corePurple1, // Core Purple 1
          ACCENTURE_COLORS.accentPurple1, // Accent Purple 1
          ACCENTURE_COLORS.accentPurple2, // Accent Purple 2
          ACCENTURE_COLORS.corePurple3, // Core Purple 3
        ],
        borderRadius: 6,
        borderWidth: 0,
      },
    ],
  };

  // Dynamically adjust chart options based on screen size
  const getChartOptions = (chartType) => {
    // Common responsive settings
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: 2,
    };

    if (chartType === "pie") {
      return {
        ...commonOptions,
        plugins: {
          legend: {
            position: isMobile ? "bottom" : "right",
            labels: {
              boxWidth: isMobile ? 10 : 12,
              font: {
                size: isMobile ? 10 : 12,
                family: '"Arial", sans-serif',
              },
              color: theme.palette.text.primary,
              padding: 15,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: theme.palette.text.primary,
            bodyColor: theme.palette.text.primary,
            borderColor: theme.palette.divider,
            borderWidth: 1,
            padding: 10,
            boxPadding: 4,
            usePointStyle: true,
            callbacks: {
              label: function (context) {
                const total = assigned + unassigned;
                const percentage = Math.round((context.raw / total) * 100);
                return `${context.label}: ${context.raw} (${percentage}%)`;
              },
            },
          },
        },
      };
    }

    if (chartType === "bar") {
      return {
        ...commonOptions,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: theme.palette.text.primary,
            bodyColor: theme.palette.text.primary,
            borderColor: theme.palette.divider,
            borderWidth: 1,
            padding: 10,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: !isMobile,
              text: "Number of Projects",
              color: theme.palette.text.secondary,
              font: {
                size: 12,
                family: '"Arial", sans-serif',
              },
            },
            ticks: {
              font: {
                size: isMobile ? 10 : 12,
                family: '"Arial", sans-serif',
              },
              color: theme.palette.text.secondary,
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.04)',
            },
          },
          x: {
            ticks: {
              font: {
                size: isMobile ? 10 : 12,
                family: '"Arial", sans-serif',
              },
              color: theme.palette.text.secondary,
            },
            grid: {
              display: false,
            },
          },
        },
      };
    }

    if (chartType === "skillsBar") {
      return {
        ...commonOptions,
        indexAxis: "y",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: theme.palette.text.primary,
            bodyColor: theme.palette.text.primary,
            borderColor: theme.palette.divider,
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: function (context) {
                return `Proficiency: ${context.raw}%`;
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            title: {
              display: !isMobile,
              text: "Proficiency (%)",
              color: theme.palette.text.secondary,
              font: {
                size: 12,
                family: '"Arial", sans-serif',
              },
            },
            ticks: {
              font: {
                size: isMobile ? 10 : 12,
                family: '"Arial", sans-serif',
              },
              color: theme.palette.text.secondary,
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.04)',
            },
          },
          y: {
            ticks: {
              // Limit label length on small screens
              callback: function (value, index, values) {
                const label = this.getLabelForValue(index);
                if (isMobile && label.length > 15) {
                  return label.substring(0, 15) + "...";
                }
                return label;
              },
              font: {
                size: isMobile ? 10 : 12,
                family: '"Arial", sans-serif',
              },
              color: theme.palette.text.secondary,
            },
            grid: {
              display: false,
            },
          },
        },
      };
    }

    return commonOptions;
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }}}>
      <Typography
      variant="h4"
      sx={{
        fontWeight: 600,
        mb: 3,
        position: "relative"
      }}
    >
        Analytics
      </Typography>

      {/* Executive Summary Cards - Mejorado el hover como en PopularCertifications */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Each card takes full width on mobile, half on small screens, and quarter on medium+ */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
              border: `1px solid rgba(0,0,0,0.03)`,
              "&:hover": {
                borderColor: `${ACCENTURE_COLORS.corePurple1}30`, 
                boxShadow: `0 4px 12px ${ACCENTURE_COLORS.corePurple1}08`, 
                transform: "translateY(-2px)",
              },
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box sx={{ height: 4, backgroundColor: ACCENTURE_COLORS.corePurple1 }} />
            <CardContent sx={{ textAlign: "center", p: { xs: 2.5, md: 3 } }}>
              <AssignmentTurnedInIcon
                sx={{
                  fontSize: { xs: 32, md: 40 },
                  color: ACCENTURE_COLORS.corePurple1,
                  mb: 1.5,
                }}
              />
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
                sx={{ fontSize: "0.875rem", mb: 0.5 }}
              >
                Project Completion Rate
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "1.75rem" },
                }}
              >
                {projectStatusLoading ? (
                  <CircularProgress size={28} sx={{ color: ACCENTURE_COLORS.corePurple1 }} />
                ) : projectStatusError ? (
                  <Typography variant="body2" color="error">
                    Error
                  </Typography>
                ) : (
                  `${completionPercentage}%`
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
              border: `1px solid rgba(0,0,0,0.03)`,
              "&:hover": {
                borderColor: `${ACCENTURE_COLORS.corePurple2}30`,
                boxShadow: `0 4px 12px ${ACCENTURE_COLORS.corePurple2}08`,
                transform: "translateY(-2px)",
              },
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box sx={{ height: 4, backgroundColor: ACCENTURE_COLORS.corePurple2 }} />
            <CardContent sx={{ textAlign: "center", p: { xs: 2.5, md: 3 } }}>
              <SchoolIcon
                sx={{
                  fontSize: { xs: 32, md: 40 },
                  color: ACCENTURE_COLORS.corePurple2,
                  mb: 1.5,
                }}
              />
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
                sx={{ fontSize: "0.875rem", mb: 0.5 }}
              >
                Certifications per Employee
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "1.75rem" },
                }}
              >
                {certsLoading ? (
                  <CircularProgress size={28} sx={{ color: ACCENTURE_COLORS.corePurple2 }} />
                ) : certsError ? (
                  <Typography variant="body2" color="error">
                    Error
                  </Typography>
                ) : (
                  avgCerts
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
              border: `1px solid rgba(0,0,0,0.03)`,
              "&:hover": {
                borderColor: `${ACCENTURE_COLORS.corePurple3}30`,
                boxShadow: `0 4px 12px ${ACCENTURE_COLORS.corePurple3}08`,
                transform: "translateY(-2px)",
              },
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box sx={{ height: 4, backgroundColor: ACCENTURE_COLORS.corePurple3 }} />
            <CardContent sx={{ textAlign: "center", p: { xs: 2.5, md: 3 } }}>
              <HourglassBottomIcon
                sx={{
                  fontSize: { xs: 32, md: 40 },
                  color: ACCENTURE_COLORS.corePurple3,
                  mb: 1.5,
                }}
              />
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
                sx={{ fontSize: "0.875rem", mb: 0.5 }}
              >
                Average Bench Days
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "1.75rem" },
                }}
              >
                {idleDaysLoading ? (
                  <CircularProgress size={28} sx={{ color: ACCENTURE_COLORS.corePurple3 }} />
                ) : avgIdleDays ? (
                  Math.round(avgIdleDays)
                ) : (
                  "N/A"
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
              border: `1px solid rgba(0,0,0,0.03)`,
              "&:hover": {
                borderColor: `${ACCENTURE_COLORS.accentPurple1}30`,
                boxShadow: `0 4px 12px ${ACCENTURE_COLORS.accentPurple1}08`,
                transform: "translateY(-2px)",
              },
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box sx={{ height: 4, backgroundColor: ACCENTURE_COLORS.accentPurple1 }} />
            <CardContent sx={{ textAlign: "center", p: { xs: 2.5, md: 3 } }}>
              <PercentIcon
                sx={{
                  fontSize: { xs: 32, md: 40 },
                  color: ACCENTURE_COLORS.accentPurple1,
                  mb: 1.5,
                }}
              />
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
                sx={{ fontSize: "0.875rem", mb: 0.5 }}
              >
                Avg Employee Assignment
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "1.75rem" },
                }}
              >
                {percentageLoading ? (
                  <CircularProgress size={28} sx={{ color: ACCENTURE_COLORS.accentPurple1 }} />
                ) : percentageError ? (
                  <Typography variant="body2" color="error">
                    Error
                  </Typography>
                ) : (
                  `${avgPercentage}%`
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Charts Section - Redesigned for clarity and visual consistency */}
      <Grid container spacing={3}>
        {/* Employee Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              height: "100%",
              overflow: "hidden",
              border: "none",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box 
                sx={{ 
                  p: { xs: 2.5, md: 3 }, 
                  borderBottom: '1px solid rgba(0,0,0,0.03)' 
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 500,
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    color: theme.palette.text.primary,
                  }}
                >
                  Employee Distribution
                </Typography>
              </Box>
              <Box
                sx={{
                  height: { xs: 250, md: 280 },
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  position: "relative",
                  p: { xs: 2, md: 3 },
                }}
              >
                {assignmentsLoading ? (
                  <CircularProgress sx={{ color: ACCENTURE_COLORS.corePurple1 }} />
                ) : assignmentsError ? (
                  <Typography color="error">
                    Error loading employee data
                  </Typography>
                ) : assigned === 0 && unassigned === 0 ? (
                  <Typography>No employee data available</Typography>
                ) : (
                  <Pie
                    id={chartIds.employeeDistribution}
                    data={employeeAssignmentData}
                    options={getChartOptions("pie")}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Project Status Chart */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              height: "100%",
              overflow: "hidden",
              border: "none",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box 
                sx={{ 
                  p: { xs: 2.5, md: 3 }, 
                  borderBottom: '1px solid rgba(0,0,0,0.03)' 
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 500,
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    color: theme.palette.text.primary,
                  }}
                >
                  Project Status
                </Typography>
              </Box>
              <Box
                sx={{
                  height: { xs: 250, md: 280 },
                  width: "100%",
                  position: "relative",
                  p: { xs: 2, md: 3 },
                }}
              >
                {projectStatusLoading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <CircularProgress sx={{ color: ACCENTURE_COLORS.corePurple1 }} />
                  </Box>
                ) : projectStatusError ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <Typography color="error">
                      Error loading project status data
                    </Typography>
                  </Box>
                ) : (
                  <Bar
                    id={chartIds.projectStatus}
                    data={{
                      labels: projectStatusData.labels,
                      datasets: [
                        {
                          label: "Number of Projects",
                          data: projectStatusData.datasets[0].data,
                          backgroundColor:
                            projectStatusData.datasets[0].backgroundColor,
                          borderRadius: 6,
                        },
                      ],
                    }}
                    options={getChartOptions("bar")}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Skills Analysis - Enhanced with Accenture colors */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              height: "100%",
              overflow: "hidden",
              border: "none",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box 
                sx={{ 
                  p: { xs: 2.5, md: 3 }, 
                  borderBottom: '1px solid rgba(0,0,0,0.03)',
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: { xs: 1.5, sm: 0 },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 500,
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    color: theme.palette.text.primary,
                  }}
                >
                  Team Skills Analysis
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {["All", "Hard", "Soft"].map((filter) => (
                    <Button
                      key={filter}
                      variant={
                        skillFilter === filter ? "contained" : "outlined"
                      }
                      size="small"
                      onClick={() => setSkillFilter(filter)}
                      sx={{
                        minWidth: { xs: "50px", sm: "60px" },
                        fontSize: "0.8rem",
                        backgroundColor:
                          skillFilter === filter
                            ? ACCENTURE_COLORS.corePurple1
                            : "transparent",
                        color: skillFilter === filter
                            ? "#fff"
                            : ACCENTURE_COLORS.corePurple1,
                        borderColor: ACCENTURE_COLORS.corePurple1,
                        "&:hover": {
                          backgroundColor:
                            skillFilter === filter
                              ? ACCENTURE_COLORS.corePurple2
                              : "rgba(161, 0, 255, 0.08)",
                          borderColor: ACCENTURE_COLORS.corePurple1,
                        },
                      }}
                    >
                      {filter}
                    </Button>
                  ))}
                </Box>
              </Box>

              <Box sx={{ px: { xs: 2.5, md: 3 }, pt: 2 }}>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  sx={{
                    mb: 2,
                    "& .MuiTab-root": {
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      minWidth: { xs: "auto", sm: "120px" },
                      fontWeight: 500,
                      color: theme.palette.text.secondary,
                      "&.Mui-selected": {
                        color: ACCENTURE_COLORS.corePurple1,
                      },
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: ACCENTURE_COLORS.corePurple1,
                    },
                  }}
                >
                  <Tab label="Top Skills" />
                  <Tab label="Improvement Areas" />
                </Tabs>
              </Box>

              {loading ? (
                <Box
                  sx={{
                    height: { xs: 200, sm: 230 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: { xs: 2, md: 3 },
                  }}
                >
                  <CircularProgress sx={{ color: ACCENTURE_COLORS.corePurple1 }} />
                </Box>
              ) : error ? (
                <Box
                  sx={{
                    height: { xs: 200, sm: 230 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: { xs: 2, md: 3 },
                  }}
                >
                  <Typography color="error">{error}</Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: { xs: 200, sm: 230 },
                    width: "100%",
                    position: "relative",
                    p: { xs: 2, md: 3 },
                  }}
                >
                  {activeTab === 0 ? (
                    <Bar
                      id={chartIds.topSkills}
                      data={topSkillsChartData}
                      options={getChartOptions("skillsBar")}
                    />
                  ) : (
                    <Bar
                      id={chartIds.improvementSkills}
                      data={improvementSkillsChartData}
                      options={getChartOptions("skillsBar")}
                    />
                  )}
                </Box>
              )}

              <Box sx={{ 
                display: "flex", 
                justifyContent: "flex-end", 
                p: { xs: 2, md: 2.5 },
                borderTop: '1px solid rgba(0,0,0,0.03)'
              }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleViewAllSkills}
                  sx={{
                    color: ACCENTURE_COLORS.corePurple1,
                    borderColor: ACCENTURE_COLORS.corePurple1,
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: "rgba(161, 0, 255, 0.08)",
                      borderColor: ACCENTURE_COLORS.corePurple1,
                    },
                  }}
                >
                  View All Skills
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* User Viewer */}
        <UserViewer />
      </Grid>

      <ReportsSection />
    </Box>
  );
};

export default Analytics;