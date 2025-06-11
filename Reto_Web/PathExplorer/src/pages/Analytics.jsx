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
  Paper,
  IconButton,
  Fade,
  Grow,
  Skeleton,
  LinearProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Pie, Bar, Doughnut, Line } from "react-chartjs-2";
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
  Filler,
} from "chart.js";
import SchoolIcon from "@mui/icons-material/School";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PercentIcon from "@mui/icons-material/Percent";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import GroupsIcon from "@mui/icons-material/Groups";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TimelineIcon from "@mui/icons-material/Timeline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

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
import { useDarkMode } from "../contexts/DarkModeContext";
import { getDarkModeStyles } from "../styles/darkModeStyles";

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
  LineElement,
  Filler
);

// Custom Chart.js defaults will be set dynamically based on dark mode

const Analytics = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const darkModeStyles = getDarkModeStyles(darkMode);

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Set Chart.js defaults based on dark mode
  useEffect(() => {
    ChartJS.defaults.font.family = '"Roboto", "Helvetica", "Arial", sans-serif';
    ChartJS.defaults.plugins.tooltip.backgroundColor = darkMode ? "rgba(30, 30, 30, 0.95)" : "rgba(255, 255, 255, 0.95)";
    ChartJS.defaults.plugins.tooltip.titleColor = darkMode ? "#fff" : "#000";
    ChartJS.defaults.plugins.tooltip.bodyColor = darkMode ? "#fff" : "#000";
    ChartJS.defaults.plugins.tooltip.borderColor = darkMode ? "rgba(255, 255, 255, 0.2)" : "#e0e0e0";
    ChartJS.defaults.plugins.tooltip.borderWidth = 1;
    ChartJS.defaults.plugins.tooltip.cornerRadius = 8;
    ChartJS.defaults.plugins.tooltip.padding = 12;
  }, [darkMode]);

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
        backgroundColor: improvementSkills.map(
          () => ACCENTURE_COLORS.accentPurple2
        ),
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
        backgroundColor: [
          ACCENTURE_COLORS.corePurple1,
          ACCENTURE_COLORS.accentPurple3,
        ],
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
            backgroundColor: darkMode ? "rgba(30, 30, 30, 0.95)" : "rgba(255, 255, 255, 0.95)",
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
            backgroundColor: darkMode ? "rgba(30, 30, 30, 0.95)" : "rgba(255, 255, 255, 0.95)",
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
              color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.04)",
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
            backgroundColor: darkMode ? "rgba(30, 30, 30, 0.95)" : "rgba(255, 255, 255, 0.95)",
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
              color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.04)",
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
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        minHeight: "100vh",
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
          }}
        >
          Analytics
        </Typography>
      </Box>

      <Fade in={true} timeout={800}>
        <Box>
          {/* Executive Summary Cards - Enhanced with animations and modern design */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in={true} timeout={1000}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${alpha(
                      ACCENTURE_COLORS.corePurple1,
                      darkMode ? 0.2 : 0.08
                    )}`,
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: ACCENTURE_COLORS.corePurple1,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: "center" }}>
                    <Box
                      className="metric-icon"
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        background: darkMode ? 'rgba(255, 255, 255, 0.08)' : alpha(ACCENTURE_COLORS.corePurple1, 0.08),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      <AssignmentTurnedInIcon
                        sx={{
                          fontSize: 32,
                          color: ACCENTURE_COLORS.corePurple1,
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1, fontWeight: 500 }}
                    >
                      Project Completion Rate
                    </Typography>
                    <Box className="metric-value">
                      {projectStatusLoading ? (
                        <Skeleton
                          variant="text"
                          width={80}
                          height={40}
                          sx={{ mx: "auto" }}
                        />
                      ) : projectStatusError ? (
                        <Typography variant="body2" color="error">
                          Error
                        </Typography>
                      ) : (
                        <>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 700,
                              color: ACCENTURE_COLORS.corePurple1,
                              mb: 0.5,
                            }}
                          >
                            {completionPercentage}%
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 0.5,
                            }}
                          >
                            <TrendingUpIcon
                              sx={{ fontSize: 16, color: "#4caf50" }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ color: "#4caf50", fontWeight: 600 }}
                            >
                              +5% from last month
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Paper>
              </Grow>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in={true} timeout={1200}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${alpha(
                      ACCENTURE_COLORS.corePurple2,
                      darkMode ? 0.2 : 0.08
                    )}`,
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: ACCENTURE_COLORS.corePurple2,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: "center" }}>
                    <Box
                      className="metric-icon"
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        background: darkMode ? 'rgba(255, 255, 255, 0.08)' : alpha(ACCENTURE_COLORS.corePurple2, 0.08),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      <SchoolIcon
                        sx={{
                          fontSize: 32,
                          color: ACCENTURE_COLORS.corePurple2,
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1, fontWeight: 500 }}
                    >
                      Avg. Certifications per Employee
                    </Typography>
                    <Box className="metric-value">
                      {certsLoading ? (
                        <Skeleton
                          variant="text"
                          width={80}
                          height={40}
                          sx={{ mx: "auto" }}
                        />
                      ) : certsError ? (
                        <Typography variant="body2" color="error">
                          Error
                        </Typography>
                      ) : (
                        <>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 700,
                              color: ACCENTURE_COLORS.corePurple2,
                              mb: 0.5,
                            }}
                          >
                            {avgCerts}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 0.5,
                            }}
                          >
                            <TrendingUpIcon
                              sx={{ fontSize: 16, color: "#4caf50" }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ color: "#4caf50", fontWeight: 600 }}
                            >
                              +0.3 this quarter
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Paper>
              </Grow>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in={true} timeout={1400}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${alpha(
                      ACCENTURE_COLORS.corePurple3,
                      darkMode ? 0.2 : 0.08
                    )}`,
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: ACCENTURE_COLORS.corePurple3,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: "center" }}>
                    <Box
                      className="metric-icon"
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        background: darkMode ? 'rgba(255, 255, 255, 0.08)' : alpha(ACCENTURE_COLORS.corePurple3, 0.08),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      <HourglassBottomIcon
                        sx={{
                          fontSize: 32,
                          color: ACCENTURE_COLORS.corePurple3,
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1, fontWeight: 500 }}
                    >
                      Average Bench Days
                    </Typography>
                    <Box className="metric-value">
                      {idleDaysLoading ? (
                        <Skeleton
                          variant="text"
                          width={80}
                          height={40}
                          sx={{ mx: "auto" }}
                        />
                      ) : (
                        <>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 700,
                              color: ACCENTURE_COLORS.corePurple3,
                              mb: 0.5,
                            }}
                          >
                            {avgIdleDays ? Math.round(avgIdleDays) : "N/A"}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 0.5,
                            }}
                          >
                            <TrendingDownIcon
                              sx={{ fontSize: 16, color: "#4caf50" }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ color: "#4caf50", fontWeight: 600 }}
                            >
                              -2 days improved
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Paper>
              </Grow>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in={true} timeout={1600}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${alpha(
                      ACCENTURE_COLORS.accentPurple1,
                      darkMode ? 0.2 : 0.08
                    )}`,
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: ACCENTURE_COLORS.accentPurple1,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: "center" }}>
                    <Box
                      className="metric-icon"
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        background: darkMode ? 'rgba(255, 255, 255, 0.08)' : alpha(ACCENTURE_COLORS.accentPurple1, 0.08),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      <PercentIcon
                        sx={{
                          fontSize: 32,
                          color: ACCENTURE_COLORS.accentPurple1,
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1, fontWeight: 500 }}
                    >
                      Avg Employee Assignment
                    </Typography>
                    <Box className="metric-value">
                      {percentageLoading ? (
                        <Skeleton
                          variant="text"
                          width={80}
                          height={40}
                          sx={{ mx: "auto" }}
                        />
                      ) : percentageError ? (
                        <Typography variant="body2" color="error">
                          Error
                        </Typography>
                      ) : (
                        <>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 700,
                              color: ACCENTURE_COLORS.accentPurple1,
                              mb: 0.5,
                            }}
                          >
                            {avgPercentage}%
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 0.5,
                            }}
                          >
                            <TrendingUpIcon
                              sx={{ fontSize: 16, color: "#4caf50" }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ color: "#4caf50", fontWeight: 600 }}
                            >
                              +5% utilization
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Paper>
              </Grow>
            </Grid>
          </Grid>

          {/* Main Charts Section - Redesigned for clarity and visual consistency */}
          <Grid container spacing={3}>
            {/* Employee Distribution Chart */}
            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={1600}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${alpha(
                      ACCENTURE_COLORS.corePurple1,
                      darkMode ? 0.2 : 0.08
                    )}`,
                    height: "100%",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: `0 8px 24px ${alpha(
                        ACCENTURE_COLORS.corePurple1,
                        darkMode ? 0.3 : 0.08
                      )}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box
                      sx={{
                        p: { xs: 2.5, md: 3 },
                        borderBottom: `1px solid ${alpha(
                          ACCENTURE_COLORS.corePurple1,
                          darkMode ? 0.1 : 0.05
                        )}`,
                        background: darkMode 
                          ? `linear-gradient(135deg, ${alpha(
                              ACCENTURE_COLORS.corePurple1,
                              0.05
                            )}, transparent)`
                          : `linear-gradient(135deg, ${alpha(
                              ACCENTURE_COLORS.corePurple1,
                              0.02
                            )}, transparent)`,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: "1rem", sm: "1.1rem" },
                            color: theme.palette.text.primary,
                          }}
                        >
                          Employee Distribution
                        </Typography>
                        <GroupsIcon
                          sx={{
                            color: alpha(ACCENTURE_COLORS.corePurple1, 0.6),
                            fontSize: 24,
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Chart and Values Container */}
                    <Box sx={{ p: { xs: 2, md: 3 } }}>
                      {assignmentsLoading ? (
                        <Box
                          sx={{
                            height: { xs: 250, md: 280 },
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <CircularProgress
                            sx={{ color: ACCENTURE_COLORS.corePurple1 }}
                          />
                        </Box>
                      ) : assignmentsError ? (
                        <Box
                          sx={{
                            height: { xs: 250, md: 280 },
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Typography color="error">
                            Error loading employee data
                          </Typography>
                        </Box>
                      ) : assigned === 0 && unassigned === 0 ? (
                        <Box
                          sx={{
                            height: { xs: 250, md: 280 },
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Typography>No employee data available</Typography>
                        </Box>
                      ) : (
                        <Box>
                          {/* Chart Container */}
                          <Box
                            sx={{
                              height: { xs: 180, sm: 200, md: 220 },
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              width: "100%",
                              position: "relative",
                              mb: { xs: 1.5, sm: 2 },
                            }}
                          >
                            <Pie
                              id={chartIds.employeeDistribution}
                              data={employeeAssignmentData}
                              options={getChartOptions("pie")}
                            />
                          </Box>

                          {/* Values Display - Compact Legend */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              gap: { xs: 2, sm: 3 },
                              flexWrap: "wrap",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                px: { xs: 1, sm: 1.5 },
                                py: 0.5,
                                borderRadius: 2,
                                backgroundColor: alpha(
                                  employeeAssignmentData.datasets[0]
                                    ?.backgroundColor?.[0] ||
                                    ACCENTURE_COLORS.corePurple1,
                                  darkMode ? 0.2 : 0.08
                                ),
                              }}
                            >
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  backgroundColor:
                                    employeeAssignmentData.datasets[0]
                                      ?.backgroundColor?.[0] ||
                                    ACCENTURE_COLORS.corePurple1,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                                  fontWeight: 500,
                                  color: theme.palette.text.primary,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Assigned: {assigned?.toLocaleString() || 0}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                px: { xs: 1, sm: 1.5 },
                                py: 0.5,
                                borderRadius: 2,
                                backgroundColor: alpha(
                                  employeeAssignmentData.datasets[0]
                                    ?.backgroundColor?.[1] ||
                                    ACCENTURE_COLORS.accentPurple3,
                                  darkMode ? 0.25 : 0.15
                                ),
                              }}
                            >
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  backgroundColor:
                                    employeeAssignmentData.datasets[0]
                                      ?.backgroundColor?.[1] ||
                                    alpha(ACCENTURE_COLORS.corePurple1, 0.3),
                                  flexShrink: 0,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                                  fontWeight: 500,
                                  color: theme.palette.text.primary,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Unassigned: {unassigned?.toLocaleString() || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Paper>
              </Fade>
            </Grid>

            {/* Project Status Chart */}
            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={1800}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${alpha(
                      ACCENTURE_COLORS.corePurple2,
                      darkMode ? 0.2 : 0.08
                    )}`,
                    height: "100%",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: `0 8px 24px ${alpha(
                        ACCENTURE_COLORS.corePurple2,
                        darkMode ? 0.3 : 0.08
                      )}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box
                      sx={{
                        p: { xs: 2.5, md: 3 },
                        borderBottom: `1px solid ${alpha(
                          ACCENTURE_COLORS.corePurple2,
                          darkMode ? 0.1 : 0.05
                        )}`,
                        background: darkMode 
                          ? `linear-gradient(135deg, ${alpha(
                              ACCENTURE_COLORS.corePurple2,
                              0.05
                            )}, transparent)`
                          : `linear-gradient(135deg, ${alpha(
                              ACCENTURE_COLORS.corePurple2,
                              0.02
                            )}, transparent)`,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: "1rem", sm: "1.1rem" },
                            color: theme.palette.text.primary,
                          }}
                        >
                          Project Status
                        </Typography>
                        <AssessmentIcon
                          sx={{
                            color: alpha(ACCENTURE_COLORS.corePurple2, 0.6),
                            fontSize: 24,
                          }}
                        />
                      </Box>
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
                          <CircularProgress
                            sx={{ color: ACCENTURE_COLORS.corePurple1 }}
                          />
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
                </Paper>
              </Fade>
            </Grid>

            {/* Skills Analysis - Enhanced with Accenture colors */}
            <Grid item xs={12} lg={6}>
              <Fade in={true} timeout={2000}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${alpha(
                      ACCENTURE_COLORS.corePurple3,
                      darkMode ? 0.2 : 0.08
                    )}`,
                    height: "100%",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: `0 8px 24px ${alpha(
                        ACCENTURE_COLORS.corePurple3,
                        darkMode ? 0.3 : 0.08
                      )}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box
                      sx={{
                        p: { xs: 2.5, md: 3 },
                        borderBottom: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.03)",
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
                              color:
                                skillFilter === filter
                                  ? "#fff"
                                  : darkMode ? "#fff" : ACCENTURE_COLORS.corePurple1,
                              borderColor: darkMode 
                                ? alpha(ACCENTURE_COLORS.corePurple1, 0.5)
                                : ACCENTURE_COLORS.corePurple1,
                              "&:hover": {
                                backgroundColor:
                                  skillFilter === filter
                                    ? ACCENTURE_COLORS.corePurple2
                                    : alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.2 : 0.08),
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
                        <CircularProgress
                          sx={{ color: ACCENTURE_COLORS.corePurple1 }}
                        />
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

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        p: { xs: 2, md: 2.5 },
                        borderTop: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.03)",
                      }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleViewAllSkills}
                        sx={{
                          color: darkMode ? "#fff" : ACCENTURE_COLORS.corePurple1,
                          borderColor: darkMode 
                            ? alpha(ACCENTURE_COLORS.corePurple1, 0.5)
                            : ACCENTURE_COLORS.corePurple1,
                          fontSize: "0.8rem",
                          fontWeight: 500,
                          "&:hover": {
                            backgroundColor: alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.2 : 0.08),
                            borderColor: ACCENTURE_COLORS.corePurple1,
                          },
                        }}
                      >
                        View All Skills
                      </Button>
                    </Box>
                  </CardContent>
                </Paper>
              </Fade>
            </Grid>

            {/* User Viewer */}
            <UserViewer />
          </Grid>

          <ReportsSection />
        </Box>
      </Fade>
    </Box>
  );
};

export default Analytics;
