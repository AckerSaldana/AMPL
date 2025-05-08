import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import {
  ArrowBack,
  Search,
  Sort,
  FilterList,
  Code,
  People,
  TrendingUp,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { useTheme } from "@mui/material/styles";
import { supabase } from "../supabase/supabaseClient.js";
import AddSkillModal from "../components/AddSkillModal.jsx";

const AllSkills = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [skillFilter, setSkillFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("descending");
  const [searchTerm, setSearchTerm] = useState("");
  const [statsData, setStatsData] = useState({
    totalSkills: 0,
    hardSkills: 0,
    softSkills: 0,
    avgProficiency: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.from("SkillExpertise").select("*");

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

  useEffect(() => {
    fetchSkills();
  }, []);

  // Function to handle when a new skill is added
  const handleSkillAdded = () => {
    fetchSkills(); // Refresh the skills list
  };

  // Filter and sort skills
  const filteredSkills = skills
    .filter((skill) => {
      const matchesFilter = skillFilter === "All" || skill.type === skillFilter;
      const matchesSearch = skill.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === "ascending") {
        return a.proficiency - b.proficiency;
      } else {
        return b.proficiency - a.proficiency;
      }
    });

  // Prepare chart data
  const chartData = {
    labels: filteredSkills.map((skill) => skill.name),
    datasets: [
      {
        data: filteredSkills.map((skill) => skill.proficiency),
        backgroundColor: filteredSkills.map((skill) =>
          skill.type === "Hard"
            ? theme.palette.chart.blue
            : theme.palette.chart.red
        ),
        borderWidth: 1,
      },
    ],
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "ascending" ? "descending" : "ascending");
  };

  return (
    <Box sx={{ p: 3, maxWidth: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton
          onClick={() => navigate("/analytics")}
          sx={{ mr: 2, color: theme.palette.primary.main }}
          aria-label="Back to analytics"
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          All Skills
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item sm={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Box
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mr: 1,
                  }}
                >
                  <FilterList sx={{ color: "white" }} />
                </Box>
                <Typography color="textSecondary">Total Skills</Typography>
              </Box>
              <Typography
                variant="h3"
                component="div"
                color={theme.palette.primary.main}
              >
                {statsData.totalSkills}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item sm={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Box
                  sx={{
                    backgroundColor: theme.palette.chart.red,
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mr: 1,
                  }}
                >
                  <Code sx={{ color: "white" }} />
                </Box>
                <Typography color="textSecondary">Hard Skills</Typography>
              </Box>
              <Typography
                variant="h3"
                component="div"
                color={theme.palette.chart.red}
              >
                {statsData.hardSkills}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item sm={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Box
                  sx={{
                    backgroundColor: theme.palette.chart.blue,
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mr: 1,
                  }}
                >
                  <People sx={{ color: "white" }} />
                </Box>
                <Typography color="textSecondary">Soft Skills</Typography>
              </Box>
              <Typography
                variant="h3"
                component="div"
                color={theme.palette.chart.blue}
              >
                {statsData.softSkills}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Left side: Search bar and Add Skill button */}
            <Grid item xs={12} md={5}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Box sx={{ flexGrow: 1 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    size="small"
                  />
                </Box>
                <AddSkillModal onSkillAdded={handleSkillAdded} />
              </Box>
            </Grid>

            {/* Spacer */}
            <Grid item xs={false} md={1} />

            {/* Right side: Filters and Sort */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  alignItems: "center",
                  flexWrap: { xs: "wrap", md: "nowrap" },
                }}
              >
                {/* Filter buttons */}
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
                        minWidth: "80px",
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

                {/* Sort button */}
                <Button
                  variant="outlined"
                  startIcon={<Sort />}
                  onClick={toggleSortOrder}
                  size="small"
                >
                  Sort {sortOrder === "ascending" ? "↑" : "↓"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Skills Chart */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Skills Proficiency{" "}
            {filteredSkills.length > 0
              ? `(${filteredSkills.length} skills)`
              : ""}
          </Typography>

          {loading ? (
            <Box
              sx={{
                height: 200,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography>Loading skills data...</Typography>
            </Box>
          ) : error ? (
            <Box
              sx={{
                height: 200,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography color="error">{error}</Typography>
            </Box>
          ) : filteredSkills.length > 0 ? (
            <Box sx={{ height: Math.max(400, filteredSkills.length * 35) }}>
              <Bar
                data={chartData}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const skillIndex = context.dataIndex;
                          const skill = filteredSkills[skillIndex];
                          return [
                            `Type: ${skill.type}`,
                            `Proficiency: ${skill.proficiency}%`,
                          ];
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      max: 100,
                      title: {
                        display: true,
                        text: "Proficiency (%)",
                      },
                    },
                    y: {
                      ticks: {
                        autoSkip: false,
                      },
                    },
                  },
                  devicePixelRatio: 2,
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body1" color="textSecondary">
                No skills match your search criteria
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AllSkills;
