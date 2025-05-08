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
} from "@mui/material";
import { Pie, Bar, Radar } from "react-chartjs-2";
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
import InsightsIcon from "@mui/icons-material/Insights";
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

  // Chart data for top skills
  const topSkillsChartData = {
    labels: topSkills.map((skill) => skill.name),
    datasets: [
      {
        label: "Proficiency",
        data: topSkills.map((skill) => skill.proficiency),
        backgroundColor: topSkills.map((skill) =>
          skill.type === "Hard"
            ? theme.palette.chart.blue
            : theme.palette.chart.red
        ),
        borderWidth: 1,
      },
    ],
  };

  // Chart data for improvement areas
  const improvementSkillsChartData = {
    labels: improvementSkills.map((skill) => skill.name),
    datasets: [
      {
        label: "Proficiency",
        data: improvementSkills.map((skill) => skill.proficiency),
        backgroundColor: improvementSkills.map((skill) =>
          skill.type === "Hard"
            ? theme.palette.chart.red
            : theme.palette.chart.orange
        ),
        borderWidth: 1,
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

  // Prepare employee assignment data for the pie chart
  const employeeAssignmentData = {
    labels: ["Assigned to projects", "On bench (unassigned)"],
    datasets: [
      {
        data: [assigned, unassigned],
        backgroundColor: [theme.palette.chart.purple, theme.palette.chart.red],
        borderWidth: 1,
      },
    ],
  };

  // Prepare project status data for the bar chart
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
          theme.palette.chart.purple,
          theme.palette.chart.green,
          theme.palette.chart.red,
          theme.palette.chart.blue,
        ],
      },
    ],
  };

  const softSkillsData = {
    labels: [
      "Communication",
      "Teamwork",
      "Problem Solving",
      "Leadership",
      "Time Management",
      "Adaptability",
    ],
    datasets: [
      {
        label: "Team Average",
        data: [70, 75, 65, 55, 60, 80],
        backgroundColor: "rgba(156, 66, 189, 0.2)",
        borderColor: theme.palette.chart.purple,
        pointBackgroundColor: theme.palette.chart.purple,
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: theme.palette.chart.purple,
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
              boxWidth: isMobile ? 10 : 20,
              font: {
                size: isMobile ? 10 : 12,
              },
            },
          },
          tooltip: {
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
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: !isMobile,
              text: "Number of Projects",
            },
            ticks: {
              font: {
                size: isMobile ? 10 : 12,
              },
            },
          },
          x: {
            ticks: {
              font: {
                size: isMobile ? 10 : 12,
              },
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
            },
            ticks: {
              font: {
                size: isMobile ? 10 : 12,
              },
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
              },
            },
          },
        },
      };
    }

    return commonOptions;
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography
        variant="h4"
        gutterBottom
        fontWeight="bold"
        sx={{
          color: theme.palette.text.primary,
          mb: 3,
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
        }}
      >
        Analytics Dashboard
      </Typography>

      {/* Executive Summary Cards */}
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: 3 }}>
        {/* Each card takes full width on mobile, half on small screens, and quarter on medium+ */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 2,
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              transition: "transform 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center", p: { xs: 2, md: 3 } }}>
              <AssignmentTurnedInIcon
                sx={{
                  fontSize: { xs: 35, md: 45 },
                  color: theme.palette.chart.purple,
                  mb: 1,
                }}
              />
              <Typography variant="subtitle1" color="text.secondary">
                Project Completion Rate
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: theme.palette.chart.purple,
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                }}
              >
                {projectStatusLoading ? (
                  <CircularProgress size={30} color="inherit" />
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
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              transition: "transform 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center", p: { xs: 2, md: 3 } }}>
              <SchoolIcon
                sx={{
                  fontSize: { xs: 35, md: 45 },
                  color: theme.palette.chart.green,
                  mb: 1,
                }}
              />
              <Typography variant="subtitle1" color="text.secondary">
                Certifications per Employee
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: theme.palette.chart.green,
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                }}
              >
                {certsLoading ? (
                  <CircularProgress size={30} color="inherit" />
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
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              transition: "transform 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center", p: { xs: 2, md: 3 } }}>
              <HourglassBottomIcon
                sx={{
                  fontSize: { xs: 35, md: 45 },
                  color: theme.palette.chart.red,
                  mb: 1,
                }}
              />
              <Typography variant="subtitle1" color="text.secondary">
                Average Bench Days
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: theme.palette.chart.red,
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                }}
              >
                {idleDaysLoading ? (
                  <CircularProgress size={30} color="inherit" />
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
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              transition: "transform 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center", p: { xs: 2, md: 3 } }}>
              <PercentIcon
                sx={{
                  fontSize: { xs: 35, md: 45 },
                  color: theme.palette.chart.blue,
                  mb: 1,
                }}
              />
              <Typography variant="subtitle1" color="text.secondary">
                Avg Employee Assignment
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  color: theme.palette.chart.blue,
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                }}
              >
                {percentageLoading ? (
                  <CircularProgress size={30} color="inherit" />
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

      {/* Main Charts Section */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Employee Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: "medium",
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                Employee Distribution
              </Typography>
              <Box
                sx={{
                  height: { xs: 250, md: 300 },
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  position: "relative",
                }}
              >
                {assignmentsLoading ? (
                  <CircularProgress />
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
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: "medium",
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                Project Status
              </Typography>
              <Box
                sx={{
                  height: { xs: 250, md: 300 },
                  width: "100%",
                  position: "relative",
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
                    <CircularProgress />
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

        {/* Skills Analysis */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  mb: 2,
                  gap: { xs: 1, sm: 0 },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "medium",
                    fontSize: { xs: "1rem", sm: "1.25rem" },
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
                      size={isMobile ? "small" : "medium"}
                      onClick={() => setSkillFilter(filter)}
                      sx={{
                        minWidth: { xs: "50px", sm: "60px" },
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        backgroundColor:
                          skillFilter === filter
                            ? theme.palette.primary.main
                            : "transparent",
                        "&:hover": {
                          backgroundColor:
                            skillFilter === filter
                              ? theme.palette.primary.dark
                              : "rgba(0,0,0,0.04)",
                        },
                      }}
                    >
                      {filter}
                    </Button>
                  ))}
                </Box>
              </Box>

              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  mb: 2,
                  "& .MuiTab-root": {
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    minWidth: { xs: "100px", sm: "120px" },
                  },
                }}
              >
                <Tab label="Top Skills" />
                <Tab label="Improvement Areas" />
              </Tabs>

              {loading ? (
                <Box
                  sx={{
                    height: { xs: 200, sm: 250 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Box
                  sx={{
                    height: { xs: 200, sm: 250 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography color="error">{error}</Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: { xs: 200, sm: 250 },
                    mt: 1,
                    width: "100%",
                    position: "relative",
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

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="contained"
                  size={isMobile ? "small" : "medium"}
                  onClick={handleViewAllSkills}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
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
