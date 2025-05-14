import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  Snackbar,
  Alert,
  useTheme,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Stack,
  Avatar,
  LinearProgress,
  Chip,
  Tooltip,
  alpha,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  IconButton
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient.js";

// Icons
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import MovingIcon from "@mui/icons-material/Moving";
import FlagIcon from "@mui/icons-material/Flag";
import PeopleIcon from "@mui/icons-material/People";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

const ProjectEdit = () => {
  const { id } = useParams();
  const projectId = id;
  const navigate = useNavigate();
  const theme = useTheme();

  // Core Accenture Colors
  const accenturePurple1 = "#a100ff"; // Core Purple 1
  const accenturePurple2 = "#7500c0"; // Core Purple 2
  const accenturePurple3 = "#460073"; // Core Purple 3
  
  // Project state
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackNotes, setFeedbackNotes] = useState({});


  const handleOpenFeedback = () => setFeedbackOpen(true);
  const handleCloseFeedback = () => setFeedbackOpen(false);
  

  // Form data state
  const [previewUrl, setPreviewUrl] = useState(null);
  const [overviewData, setOverviewData] = useState({
    logo: "",
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    status: "Not Started",
  });
  const [progressValue, setProgressValue] = useState(0);
  const [teammates, setTeammates] = useState([]);

  // Progress phases
  const phases = [
    { label: "Planning", value: 0, color: accenturePurple3 },
    { label: "Design", value: 20, color: accenturePurple2 },
    { label: "Development", value: 50, color: accenturePurple1 },
    { label: "Testing", value: 70, color: "#be82ff" }, // Accent Purple 3
    { label: "Deployment", value: 90, color: "#dcafff" }, // Accent Purple 4
    { label: "Completed", value: 100, color: "#4caf50" }, // Green for completion
  ];

  // Get the current phase based on progress value
  const getCurrentPhase = (value) => {
    return phases.reduce((prev, current) => {
      return value >= current.value && current.value >= prev.value
        ? current
        : prev;
    }, phases[0]);
  };

  // Get color based on progress value
  const getColorForProgress = (value) => {
    const phase = getCurrentPhase(value);
    return phase.color;
  };

  const currentPhase = getCurrentPhase(progressValue);

  // Fetch project data
  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const { data: projectData, error } = await supabase
        .from("Project")
        .select(
          "projectID, title, description, status, logo, progress, start_date, end_date, priority"
        )
        .eq("projectID", projectId)
        .single();
      
      if (error) throw error;
      
      setProject(projectData);
      setOverviewData({
        logo: projectData.logo || "",
        title: projectData.title || "",
        description: projectData.description || "",
        dueDate: projectData.end_date || "",
        priority: projectData.priority || "Medium",
        status: projectData.status || "Not Started",
      });
      
      if (projectData.logo && typeof projectData.logo === "string") {
        setPreviewUrl(projectData.logo);
      }
      
      setProgressValue(projectData.progress || 0);
      
      // Fetch teammates after project data
      await fetchTeammates();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error loading project: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch teammates data
  const fetchTeammates = async () => {
    try {
      const { data: userRolesData, error: rolesError } = await supabase
        .from("UserRole")
        .select(
          "project_id, role_name, user_id, User:User(user_id, name, last_name, profile_pic)"
        )
        .eq("project_id", projectId);

      if (rolesError) throw rolesError;

      const teamByProject = userRolesData
        .filter((entry) => entry.User)
        .map(({ User, role_name }) => ({
          user_id: User.user_id,
          name: User.name,
          last_name: User.last_name,
          avatar: User.profile_pic,
          role: role_name,
        }));

      setTeammates(teamByProject);
      // inicializa una clave vacía para cada miembro
      const initial = {};
      teamByProject.forEach((m) => {
        initial[m.user_id] = "";
      });
      setFeedbackNotes(initial);


      const initialNotes = {};
      teamByProject.forEach((member) => {
        initialNotes[member.user_id] = "";
      });
      setFeedbackNotes(initialNotes);

    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error loading teammates: ${error.message}`,
        severity: "error",
      });
    }
  };


  const handleSubmitFeedback = async () => {
    setSaving(true);
    try {
      // por cada par [user_id, notes]
      await Promise.all(
        Object.entries(feedbackNotes).map(([user_id, notes]) =>
          supabase
            .from("UserRole")
            .update({ feedback_notes: notes })
            .match({ project_id: projectId, user_id })
        )
      );

      setSnackbar({ open: true, message: "Feedback saved!", severity: "success" });
      setFeedbackOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setSaving(false);
    }
  };
  

  // Load data on component mount
  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Handle form changes
  const handleOverviewChange = (field, value) => {
    setOverviewData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
      handleOverviewChange("logo", file);
    }
  };

  // Handle save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      let logoUrl = overviewData.logo;

      // Upload logo if it's a File object
      if (overviewData.logo instanceof File) {
        const fileExt = overviewData.logo.name.split('.').pop();
        const fileName = `${projectId}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("projectlogo")
          .upload(filePath, overviewData.logo, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("projectlogo").getPublicUrl(filePath);

        logoUrl = publicUrl;
      }

      const updates = {
        title: overviewData.title,
        description: overviewData.description,
        logo: logoUrl,
        end_date: overviewData.dueDate,
        priority: overviewData.priority,
        status: overviewData.status,
        progress: progressValue,
      };

      const { error } = await supabase
        .from("Project")
        .update(updates)
        .eq("projectID", projectId);

      if (error) throw error;

      setSnackbar({
        open: true,
        message: "Project updated successfully!",
        severity: "success",
      });
      
      // Navigate back after short delay
      setTimeout(() => navigate(`/project-detail/${projectId}`), 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to save changes: ${error.message}`,
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };
  const handleCompleteProject = async () => {
    setSaving(true);
    try {
      // Marca estado Completed y progreso = 100
      const { error } = await supabase
        .from("Project")
        .update({ status: "Completed", progress: 100 })
        .eq("projectID", projectId);

      if (error) throw error;

      setSnackbar({
        open: true,
        message: "Project marked as completed!",
        severity: "success",
      });
      setTimeout(() => navigate(`/project-detail/${projectId}`), 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error completing project: ${error.message}`,
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "70vh",
        flexDirection: "column", 
        gap: 2 
      }}>
        <CircularProgress size={40} sx={{ color: accenturePurple1 }} />
        <Typography variant="body1" color="text.secondary">
          Loading project details...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height: "100%", p: 0, bgcolor: "#f8f9fa" }}>
      {/* Header with title and actions */}
      <Box
        sx={{
          maxWidth: "calc(100% - 42px)",
          width: "calc(100% - 42px)",
          mx: "auto",
          p: 3,
          mb: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: alpha(accenturePurple1, 0.05),
          borderRadius: 1
        }}
      >
        <Box>
          <Button
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIcon />}
            variant="text"
            size="small"
            sx={{
              color: "text.secondary",
              mb: 1,
              px: 1,
              py: 0.5,
              fontWeight: 500,
              textTransform: "none",
            }}
          >
            Back to Project
          </Button>
          
          <Typography variant="h5" fontWeight={600} color="text.primary">
            Edit Project
          </Typography>
          {project && (
            <Chip 
              label={project.status || "Draft"} 
              size="small"
              sx={{ 
                mt: 1,
                bgcolor: project.status === "Completed" 
                  ? alpha("#4caf50", 0.1) 
                  : project.status === "In Progress" 
                    ? alpha(accenturePurple1, 0.1)
                    : alpha("#ff9800", 0.1),
                color: project.status === "Completed"
                  ? "#4caf50"
                  : project.status === "In Progress"
                    ? accenturePurple1
                    : "#ff9800",
                fontWeight: 500,
                border: '1px solid',
                borderColor: project.status === "Completed"
                  ? alpha("#4caf50", 0.3)
                  : project.status === "In Progress"
                    ? alpha(accenturePurple1, 0.3)
                    : alpha("#ff9800", 0.3),
              }}
            />
          )}
          
        </Box>
        
        {progressValue < 100 && (
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                fontWeight: 500,
                px: 3,
                py: 1,
                bgcolor: accenturePurple1,
                "&:hover": {
                  bgcolor: accenturePurple2,
                },
                boxShadow: `0 4px 8px ${alpha(accenturePurple1, 0.25)}`,
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          )}

          {progressValue === 100 && (
            <Button
              variant="contained"
              onClick={handleOpenFeedback}
              disabled={saving}
              sx={{
                fontWeight: 500,
                px: 3,
                py: 1,
                bgcolor: accenturePurple1,
                "&:hover": {
                  bgcolor: accenturePurple2,
                },
                boxShadow: `0 4px 8px ${alpha(accenturePurple1, 0.25)}`,
              }}
            >
              Complete Project
            </Button>
          )}
      </Box>

      <Box sx={{ 
        maxWidth: "calc(100% - 42px)",
        width: "calc(100% - 42px)",
        mx: "auto"
      }}>
        <Grid container spacing={0} sx={{ width: "100%", m: 0 }}>
          {/* Left column - Overview */}
          <Grid item xs={12} lg={6} sx={{ p: 0, pr: 2 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 1, 
                height: "100%",
                bgcolor: "#ffffff",
                border: `1px solid ${alpha('#000', 0.07)}`,
              }}
            >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 3,
              }}
            >
              <InfoOutlinedIcon sx={{ color: accenturePurple1, mr: 1.5 }} />
              <Typography variant="h6" fontWeight={600} color="primary.main">
                Project Overview
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              {/* Logo upload */}
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={500}
                  sx={{ mb: 1.5, color: "text.secondary" }}
                >
                  Project Logo
                </Typography>

                <Box
                  sx={{
                    border: "1px dashed",
                    borderColor: alpha(accenturePurple1, 0.3),
                    borderRadius: 1,
                    p: 3,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: alpha(accenturePurple1, 0.02),
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: accenturePurple1,
                      backgroundColor: alpha(accenturePurple1, 0.04),
                    },
                  }}
                >
                  {!previewUrl ? (
                    <>
                      <Box
                        component="label"
                        htmlFor="logo-upload"
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          cursor: "pointer",
                          width: "100%",
                        }}
                      >
                        <CloudUploadIcon
                          sx={{ fontSize: 48, color: accenturePurple1, mb: 2 }}
                        />
                        <Typography variant="body2" sx={{ mb: 1, textAlign: "center" }}>
                          Drag & drop your logo or click to browse
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                          Supports JPG, PNG, SVG
                        </Typography>
                        <Button
                          variant="outlined"
                          component="span"
                          sx={{ 
                            borderColor: accenturePurple1,
                            color: accenturePurple1,
                            "&:hover": {
                              borderColor: accenturePurple2,
                              backgroundColor: alpha(accenturePurple1, 0.05),
                            }
                          }}
                          startIcon={<AddPhotoAlternateIcon />}
                        >
                          Select File
                        </Button>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          style={{ display: "none" }}
                        />
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ width: "100%", textAlign: "center" }}>
                      <Box
                        component="img"
                        src={previewUrl}
                        alt="Logo Preview"
                        sx={{
                          maxWidth: "100%",
                          maxHeight: 180,
                          borderRadius: 1,
                          mb: 2,
                        }}
                      />
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => {
                            setPreviewUrl(null);
                            handleOverviewChange("logo", "");
                          }}
                          sx={{
                            borderColor: alpha("#f44336", 0.6),
                            "&:hover": {
                              borderColor: "#f44336",
                              backgroundColor: alpha("#f44336", 0.05),
                            }
                          }}
                        >
                          Remove
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          component="label"
                          htmlFor="logo-upload"
                          sx={{
                            borderColor: alpha(accenturePurple1, 0.6),
                            color: accenturePurple1,
                            "&:hover": {
                              borderColor: accenturePurple1,
                              backgroundColor: alpha(accenturePurple1, 0.05),
                            }
                          }}
                        >
                          Change
                          <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                          />
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Title */}
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={500}
                  sx={{ mb: 1, color: "text.secondary" }}
                >
                  Project Title
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  value={overviewData.title}
                  onChange={(e) => handleOverviewChange("title", e.target.value)}
                  fullWidth
                  placeholder="Enter project title"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: alpha(accenturePurple1, 0.5),
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: accenturePurple1,
                      },
                    },
                  }}
                />
              </Box>

              {/* Description */}
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={500}
                  sx={{ mb: 1, color: "text.secondary" }}
                >
                  Description
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  multiline
                  rows={4}
                  value={overviewData.description}
                  onChange={(e) => handleOverviewChange("description", e.target.value)}
                  fullWidth
                  placeholder="Describe the project objectives and scope"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: alpha(accenturePurple1, 0.5),
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: accenturePurple1,
                      },
                    },
                  }}
                />
              </Box>

              {/* Due Date */}
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={500}
                  sx={{ mb: 1, color: "text.secondary" }}
                >
                  Due Date
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  type="date"
                  value={overviewData.dueDate ? overviewData.dueDate.split("T")[0] : ""}
                  onChange={(e) => handleOverviewChange("dueDate", e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: alpha(accenturePurple1, 0.5),
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: accenturePurple1,
                      },
                    },
                  }}
                />
              </Box>

              {/* Priority Select */}
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={500}
                  sx={{ mb: 1, color: "text.secondary" }}
                >
                  Priority
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={overviewData.priority}
                    onChange={(e) => handleOverviewChange("priority", e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0, 0, 0, 0.23)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: alpha(accenturePurple1, 0.5),
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: accenturePurple1,
                      },
                    }}
                  >
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Status Select */}
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={500}
                  sx={{ mb: 1, color: "text.secondary" }}
                >
                  Status
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={overviewData.status}
                    onChange={(e) => handleOverviewChange("status", e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0, 0, 0, 0.23)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: alpha(accenturePurple1, 0.5),
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: accenturePurple1,
                      },
                    }}
                  >
                    <MenuItem value="Not Started">Not Started</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="On Hold">On Hold</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Right column - stacked components */}
        <Grid item xs={12} lg={6} sx={{ p: 0, pl: 2 }}>
          <Stack spacing={3} sx={{ height: "100%" }}>
            {/* Progress Edit Component */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 1,
                position: "relative",
                overflow: "hidden",
                bgcolor: "#ffffff",
                border: `1px solid ${alpha('#000', 0.07)}`,
                boxShadow: "none",
              }}
            >
              {/* Progress indicator line - REMOVED */}
              {/* <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "4px",
                  width: `${progressValue}%`,
                  backgroundColor: getColorForProgress(progressValue),
                  transition: "width 0.5s ease-in-out",
                }}
              /> */}

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 3,
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <MovingIcon sx={{ color: accenturePurple1, mr: 1.5 }} />
                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    Project Progress
                  </Typography>
                </Box>

                <Tooltip title={`Project is currently in ${currentPhase.label} phase`}>
                  <Chip
                    icon={<FlagIcon sx={{ color: "white !important" }} />}
                    label={currentPhase.label}
                    size="small"
                    sx={{
                      backgroundColor: getColorForProgress(progressValue),
                      color: "white",
                      fontWeight: 500,
                      "& .MuiChip-icon": {
                        color: "white",
                      },
                    }}
                  />
                </Tooltip>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Mini progress visualizer */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Current Progress: {progressValue}%
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={progressValue}
                  sx={{
                    height: 8,
                    borderRadius: 5,
                    backgroundColor: alpha('#000', 0.05),
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: getColorForProgress(progressValue),
                      transition: "transform 0.8s ease-in-out",
                    },
                  }}
                />
              </Box>

              {/* Milestone indicators */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                {phases.map((phase) => (
                  <Tooltip key={phase.label} title={`${phase.label}: ${phase.value}%`}>
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        backgroundColor:
                          progressValue >= phase.value
                            ? phase.color
                            : alpha('#000', 0.1),
                        border:
                          progressValue === phase.value ? `2px solid ${alpha('#000', 0.3)}` : "none",
                        transform:
                          progressValue === phase.value ? "scale(1.2)" : "scale(1)",
                        transition: "all 0.3s ease",
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={500}
                  sx={{ mb: 1, color: "text.secondary" }}
                >
                  Progress Phase
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={progressValue}
                    onChange={(e) => setProgressValue(Number(e.target.value))}
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: alpha(getColorForProgress(progressValue), 0.7),
                        borderWidth: "1px",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: getColorForProgress(progressValue),
                        borderWidth: "1px",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: getColorForProgress(progressValue),
                        borderWidth: "1px",
                      },
                    }}
                  >
                    {phases.map((phase) => (
                      <MenuItem key={phase.label} value={phase.value}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", width: "100%" }}
                        >
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              backgroundColor: phase.color,
                              mr: 1.5,
                            }}
                          />
                          <Typography sx={{ fontWeight: 500 }}>{phase.label}</Typography>
                          <Typography sx={{ ml: "auto", color: "text.secondary" }}>
                            {phase.value}%
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Paper>

            {/* Teammates Display Component */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 1,
                bgcolor: "#ffffff",
                border: `1px solid ${alpha('#000', 0.07)}`,
                boxShadow: "none",
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PeopleIcon sx={{ color: accenturePurple1, mr: 1.5 }} />
                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    Team Members
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  pr: 1,
                  "&::-webkit-scrollbar": { width: "6px" },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: alpha('#000', 0.2),
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: alpha('#000', 0.05),
                    borderRadius: "4px",
                  },
                }}
              >
                {teammates.length > 0 ? (
                  teammates.map((teammate, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 1,
                        backgroundColor: "background.paper",
                        border: "1px solid",
                        borderColor: alpha('#000', 0.08),
                        boxShadow: "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      {/* Left: Avatar + Name */}
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar 
                          src={teammate.avatar} 
                          sx={{ 
                            mr: 2,
                            bgcolor: accenturePurple3,
                            width: 40,
                            height: 40
                          }}
                        />
                        <Typography variant="body1" fontWeight={600}>
                          {teammate.name} {teammate.last_name}
                        </Typography>
                      </Box>

                      {/* Right: Role - Now placed directly as the second child of the box */}
                      <Chip
                        label={teammate.role}
                        size="small"
                        sx={{
                          bgcolor: alpha(accenturePurple1, 0.1),
                          color: accenturePurple1,
                          fontWeight: 500,
                          height: 24
                        }}
                      />
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                    <Typography variant="body2">
                      No team members assigned to this project yet.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
      </Box>
      <Dialog
        open={feedbackOpen}
        onClose={handleCloseFeedback}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center", pt: 2 }}>
          <Typography component="div" variant="h5" fontWeight={600}>
            PROJECT FEEDBACK
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {teammates.map((m) => (
            <Box key={m.user_id} sx={{ mb: 2 }}>
              <Typography fontWeight={500}>
                {m.name} {m.last_name} <i>({m.role})</i>
              </Typography>
              <TextField
                multiline
                rows={3}
                fullWidth
                placeholder="Escribe tu feedback aquí…"
                value={feedbackNotes[m.user_id] || ""}
                onChange={(e) =>
                  setFeedbackNotes(prev => ({
                    ...prev,
                    [m.user_id]: e.target.value
                  }))
                }
              />
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 1 }}>
          <Button
            variant="contained"
            onClick={handleSubmitFeedback}          // <-- aquí
            disabled={saving}
          >
            Submit Feedback & Save changes
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectEdit;