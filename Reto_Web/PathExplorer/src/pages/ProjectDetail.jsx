import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  Avatar,
  Slider,
  Divider,
  Stack,
  useTheme,
  useMediaQuery,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  CalendarToday,
  EventAvailable,
  PriorityHigh,
  AssignmentTurnedIn,
  InfoOutlined,
  ArrowBackIosNew as ArrowBackIosNewIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
} from "@mui/icons-material";
import MovingIcon from "@mui/icons-material/Moving";
import PeopleIcon from "@mui/icons-material/People";
import { useNavigate, useParams } from "react-router-dom";
import ArrowPhase from "../components/ArrowPhase";
import { supabase } from "../supabase/supabaseClient.js";

const phases = [
  { label: "Planning", value: 0 },
  { label: "Design", value: 20 },
  { label: "Development", value: 50 },
  { label: "Testing", value: 70 },
  { label: "Deployment", value: 90 },
  { label: "Completed", value: 100 },
];

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const projectId = id;

  // State to hold the project details and team
  const [project, setProject] = useState(null);
  const [teammates, setTeammates] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  // Phase index based on project.progress
  const [phaseIndex, setPhaseIndex] = useState(0);
  const currentPhase = phases[phaseIndex];

  // For responsive progress display
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.down("md"));
  const isMd = useMediaQuery(theme.breakpoints.down("lg"));
  const phasesToShow = isXs ? 2 : isSm ? 3 : isMd ? 4 : 6;
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    // Recalculate startIndex (for scrolling the phases) when phaseIndex or phasesToShow changes
    const idealStartIndex = Math.max(
      0,
      phaseIndex - Math.floor(phasesToShow / 2)
    );
    const maxStartIndex = Math.max(0, phases.length - phasesToShow);
    setStartIndex(Math.min(idealStartIndex, maxStartIndex));
  }, [phaseIndex, phasesToShow]);

  const handleNext = () => {
    setStartIndex(Math.min(startIndex + 1, phases.length - phasesToShow));
  };

  const handlePrev = () => {
    setStartIndex(Math.max(0, startIndex - 1));
  };

  // Native JS date formatting function (without using date-fns)
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Fetch project details from Supabase using the project ID
  const fetchProjectDetails = async () => {
    // Fetch project data
    const { data: projectData, error: projectError } = await supabase
      .from("Project")
      .select(
        "projectID, title, description, status, logo, progress, start_date, end_date, priority"
      )
      .eq("projectID", projectId)
      .single();

    if (projectError) {
      console.error("Error fetching project:", projectError.message);
      setSnackbar({
        open: true,
        message: `Error loading project: ${projectError.message}`,
        severity: "error",
      });
      return;
    }

    // Update the project state
    setProject(projectData);

    // Determine phase index based on the project.progress
    const pIndex = phases.findIndex(
      (phase) => phase.value === projectData.progress
    );
    setPhaseIndex(pIndex !== -1 ? pIndex : 0);

    // Fetch team info for this project (from UserRole table)
    const { data: userRolesData, error: rolesError } = await supabase
      .from("UserRole")
      .select(
        "project_id, role_name, user_id, User:User(user_id, name, last_name, profile_pic)"
      )
      .eq("project_id", projectId);

    if (rolesError) {
      console.error("Error fetching user roles:", rolesError.message);
      setSnackbar({
        open: true,
        message: `Error loading team: ${rolesError.message}`,
        severity: "error",
      });
      return;
    }

    const teamByProject = [];
    userRolesData.forEach(({ User, role_name }) => {
      if (User) {
        teamByProject.push({
          name: User.name || "User",
          last_name: User.last_name || "",
          avatar: User.profile_pic || "",
          role: role_name || "Member",
        });
      }
    });

    setTeammates(teamByProject);
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading project details...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: "100%" }}>
      <Grid container spacing={3}>
        {/* Left Column: Overview */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <InfoOutlined
                  sx={{ fontSize: 24, mr: 1, color: "primary.main" }}
                />
                <Typography variant="h5" fontWeight={600}>
                  Overview
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`/project-edit/${projectId}`)}
              >
                Edit
              </Button>
            </Box>

            {/* Client Logo */}
            <Box
              sx={{
                width: "100%",
                aspectRatio: "1",
                mb: 2,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <img
                src={project.logo || "/default-certification.jpg"}
                alt="Client Logo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>

            {/* Project Info */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                {project.title}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {project.description}
            </Typography>
            <Divider sx={{ my: 2 }} />

            {/* Dates */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <CalendarToday
                sx={{ fontSize: 18, mr: 1, color: "primary.main" }}
              />
              <Typography variant="body2">
                <strong>Start Date:</strong> {formatDate(project.start_date)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <EventAvailable
                sx={{ fontSize: 18, mr: 1, color: "primary.main" }}
              />
              <Typography variant="body2">
                <strong>Due Date:</strong> {formatDate(project.end_date)}
              </Typography>
            </Box>

            {/* Priority */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <PriorityHigh
                sx={{ fontSize: 18, mr: 1, color: "primary.main" }}
              />
              <Typography variant="body2">
                <strong>Priority:</strong>{" "}
                <span style={{ color: "#d32f2f" }}>{project.priority}</span>
              </Typography>
            </Box>

            {/* Status */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <AssignmentTurnedIn
                sx={{ fontSize: 18, mr: 1, color: "primary.main" }}
              />
              <Typography variant="body2">
                <strong>Status:</strong> {project.status}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Progress and Teammates */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3} direction="column">
            {/* Progress Paper */}
            <Grid item xs={12}>
              <Paper
                elevation={3}
                sx={{ p: 3, borderRadius: 2, width: "100%" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    direction: "row",
                    alignItems: "center",
                  }}
                >
                  <MovingIcon
                    sx={{ fontSize: 24, mr: 1, color: "primary.main" }}
                  />
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Progress
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    mt: 2,
                  }}
                >
                  {phases.length > phasesToShow && (
                    <IconButton
                      onClick={handlePrev}
                      disabled={startIndex === 0}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                  )}

                  <Box sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={0.5} sx={{ width: "100%" }}>
                      {phases
                        .slice(startIndex, startIndex + phasesToShow)
                        .map((phase, index) => {
                          const actualIndex = index + startIndex;
                          const isCurrent = actualIndex === phaseIndex;
                          const isCompleted = actualIndex < phaseIndex;
                          return (
                            <Box
                              key={phase.label}
                              sx={{
                                flex: `1 1 ${100 / phasesToShow}%`,
                                height: { xs: 50, sm: 60 },
                              }}
                            >
                              <ArrowPhase
                                label={phase.label}
                                percent={phase.value}
                                active={isCurrent}
                                completed={isCompleted}
                              />
                            </Box>
                          );
                        })}
                    </Stack>
                  </Box>

                  {phases.length > phasesToShow && (
                    <IconButton
                      onClick={handleNext}
                      disabled={startIndex >= phases.length - phasesToShow}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                {phases.length > phasesToShow && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                  >
                    {phases.map((_, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor:
                            idx >= startIndex && idx < startIndex + phasesToShow
                              ? theme.palette.primary.main
                              : "#ccc",
                          mx: 0.5,
                        }}
                      />
                    ))}
                  </Box>
                )}

                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="right"
                  mt={2}
                >
                  Current Phase: <strong>{phases[phaseIndex].label}</strong>
                </Typography>
              </Paper>
            </Grid>

            {/* Teammates Paper */}
            <Grid item>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  maxHeight: 300,
                  overflowY: "auto",
                  "&::-webkit-scrollbar": { width: "6px" },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#ccc",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "#f1f1f1",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    direction: "row",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <PeopleIcon
                    sx={{ fontSize: 24, mr: 1, color: "primary.main" }}
                  />
                  <Typography variant="h6" fontWeight={600}>
                    Teammates
                  </Typography>
                </Box>

                {teammates.map((teammate, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 1,
                      backgroundColor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      "&:hover": {
                        borderColor: "primary.light",
                        transition: "0.3s",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      {/* Left: Avatar + Name */}
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar src={teammate.avatar} sx={{ mr: 2 }} />
                        <Typography variant="body1" fontWeight={600}>
                          {teammate.name} {teammate.last_name}
                        </Typography>
                      </Box>

                      {/* Right: Role */}
                      <Typography variant="body2" color="text.secondary">
                        Role: <strong>{teammate.role}</strong>
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Snackbar for alerts */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectDetail;
