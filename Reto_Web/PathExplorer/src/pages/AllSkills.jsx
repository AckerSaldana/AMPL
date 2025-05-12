import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  alpha,
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
import { 
  ACCENTURE_COLORS, 
  inputStyles, 
  primaryButtonStyles, 
  outlineButtonStyles
} from "../styles/styles.js";

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
            ? ACCENTURE_COLORS.corePurple1
            : ACCENTURE_COLORS.accentPurple2
        ),
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "ascending" ? "descending" : "ascending");
  };

  // Get color for the stat cards based on type
  const getStatCardColor = (type) => {
    switch (type) {
      case "total":
        return ACCENTURE_COLORS.corePurple1;
      case "hard":
        return ACCENTURE_COLORS.red;
      case "soft":
        return ACCENTURE_COLORS.blue;
      default:
        return ACCENTURE_COLORS.corePurple1;
    }
  };

  // Custom styled components
  const StatsCard = ({ icon, title, value, type }) => {
    const color = getStatCardColor(type);

    return (
      <Card sx={{
        borderRadius: 2,
        boxShadow: "0 4px 6px rgba(0,0,0,0.04)",
        height: '100%',
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: '1px solid',
        borderColor: 'rgba(0,0,0,0.06)',
        position: 'relative',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: alpha(color, 0.3),
                },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          backgroundColor: color,
          borderTopLeftRadius: '8px',
          borderBottomLeftRadius: '8px',
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
            <Box
              sx={{
                backgroundColor: `${color}15`,
                borderRadius: "8px",
                width: 42,
                height: 42,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mr: 1.5,
              }}
            >
              {icon}
            </Box>
            <Typography 
              color="textSecondary" 
              sx={{ 
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {title}
            </Typography>
          </Box>
          <Typography
            variant="h3"
            component="div"
            sx={{ 
              color: color, 
              fontWeight: 600,
              fontSize: { xs: '1.8rem', sm: '2.2rem' },
            }}
          >
            {value}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  const FilterButton = ({ label, active, onClick }) => (
    <Button
      variant={active ? "contained" : "outlined"}
      size="small"
      onClick={onClick}
      sx={{
        minWidth: "80px",
        ...(active ? primaryButtonStyles : outlineButtonStyles),
        height: '36px',
        transform: 'none',
        '&:hover': {
          transform: 'none',
          boxShadow: 'none',
        }
      }}
    >
      {label}
    </Button>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: "100%" }}>
      {/* Header mejorado con mejor alineación */}
      <Box 
        sx={{ 
          display: "flex", 
          alignItems: "center", 
          mb: { xs: 3, sm: 4 }, 
          px: { xs: 0, sm: 1 },
          height: 48 // Altura fija para el header
        }}
      >
        <IconButton
          onClick={() => navigate("/analytics")}
          sx={{ 
            mr: 2, 
            color: ACCENTURE_COLORS.corePurple1,
            backgroundColor: `${ACCENTURE_COLORS.corePurple1}10`,
            '&:hover': {
              backgroundColor: `${ACCENTURE_COLORS.corePurple1}15`,
            }
          }}
          aria-label="Back to analytics"
        >
          <ArrowBack />
        </IconButton>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontWeight: 600,
            lineHeight: 1,
            pt: 0.5 // Pequeño ajuste para centrar visualmente
          }}
        >
          All Skills
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={12} md={4}>
          <StatsCard
            icon={<FilterList sx={{ color: ACCENTURE_COLORS.corePurple1 }} />}
            title="Total Skills"
            value={statsData.totalSkills}
            type="total"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            icon={<Code sx={{ color: ACCENTURE_COLORS.red }} />}
            title="Hard Skills"
            value={statsData.hardSkills}
            type="hard"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            icon={<People sx={{ color: ACCENTURE_COLORS.blue }} />}
            title="Soft Skills"
            value={statsData.softSkills}
            type="soft"
          />
        </Grid>
      </Grid>

      {/* Controls Section */}
      <Card 
        sx={{
          borderRadius: 2,
          boxShadow: "0 4px 6px rgba(0,0,0,0.04)",
          mb: 4,
          border: `1px solid ${ACCENTURE_COLORS.lightGray}`,
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
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
                          <Search sx={{ color: ACCENTURE_COLORS.darkGray }} />
                        </InputAdornment>
                      ),
                    }}
                    size="small"
                    sx={inputStyles}
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
                  justifyContent: { xs: "flex-start", md: "flex-end" },
                  alignItems: "center",
                  flexWrap: { xs: "wrap", md: "nowrap" },
                }}
              >
                {/* Filter buttons */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  {["All", "Hard", "Soft"].map((filter) => (
                    <FilterButton
                      key={filter}
                      label={filter}
                      active={skillFilter === filter}
                      onClick={() => setSkillFilter(filter)}
                    />
                  ))}
                </Box>

                {/* Sort button */}
                <Button
                  variant="outlined"
                  startIcon={<Sort />}
                  onClick={toggleSortOrder}
                  size="small"
                  sx={{
                    height: '36px',
                    borderColor: ACCENTURE_COLORS.darkGray,
                    color: ACCENTURE_COLORS.darkGray,
                    borderRadius: 1.5,
                    padding: '7px 16px',
                    textTransform: 'none',
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: ACCENTURE_COLORS.darkGray,
                      backgroundColor: 'transparent',
                    }
                  }}
                >
                  Sort {sortOrder === "ascending" ? "↑" : "↓"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Skills Chart */}
      <Card 
        sx={{
          borderRadius: 2,
          boxShadow: "0 4px 6px rgba(0,0,0,0.04)",
          mb: 4,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3,
              fontWeight: 600,
              fontSize: '1.1rem',
            }}
          >
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
              <CircularProgress size={40} sx={{ color: ACCENTURE_COLORS.corePurple1 }} />
            </Box>
          ) : error ? (
            <Box
              sx={{
                height: 200,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: 'column',
                gap: 2
              }}
            >
              <Typography 
                color="error" 
                sx={{ 
                  color: ACCENTURE_COLORS.red,
                  fontWeight: 500
                }}
              >
                {error}
              </Typography>
              <Button 
                variant="outlined" 
                onClick={fetchSkills}
                sx={{
                  borderColor: ACCENTURE_COLORS.corePurple1,
                  color: ACCENTURE_COLORS.corePurple1,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  fontWeight: 500,
                  borderRadius: 1.5,
                  padding: '7px 16px',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: ACCENTURE_COLORS.corePurple1,
                    backgroundColor: 'transparent',
                  }
                }}
              >
                Try Again
              </Button>
            </Box>
          ) : filteredSkills.length > 0 ? (
            <Box 
              sx={{ 
                height: Math.max(400, filteredSkills.length * 35),
                px: { xs: 0, sm: 1 }
              }}
            >
              <Bar
                data={chartData}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: ACCENTURE_COLORS.black,
                      titleFont: {
                        size: 14,
                        weight: 'bold'
                      },
                      bodyFont: {
                        size: 13
                      },
                      padding: 12,
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
                      grid: {
                        color: 'rgba(0,0,0,0.03)',
                      },
                      title: {
                        display: true,
                        text: "Proficiency (%)",
                        font: {
                          size: 12,
                          weight: 500
                        },
                        padding: { top: 10 }
                      },
                      ticks: {
                        color: ACCENTURE_COLORS.darkGray
                      }
                    },
                    y: {
                      ticks: {
                        autoSkip: false,
                        color: ACCENTURE_COLORS.black,
                        font: {
                          weight: 500
                        }
                      },
                      grid: {
                        display: false
                      }
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
                flexDirection: 'column',
                gap: 2
              }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  color: ACCENTURE_COLORS.darkGray,
                  fontWeight: 500,
                  fontSize: '1rem'
                }}
              >
                No skills match your search criteria
              </Typography>
              {searchTerm && (
                <Button 
                  variant="text"
                  onClick={() => setSearchTerm('')}
                  sx={{
                    color: ACCENTURE_COLORS.corePurple1,
                    textTransform: 'none',
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'transparent',
                    }
                  }}
                >
                  Clear Search
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AllSkills;