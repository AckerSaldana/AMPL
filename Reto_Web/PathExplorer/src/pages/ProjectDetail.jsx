import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  Avatar,
  LinearProgress,
  useTheme,
  Snackbar,
  Alert,
  Chip,
  Card,
  Tooltip,
  alpha,
  Divider,
  useMediaQuery,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@mui/material";
import {
  CalendarToday,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Flag as FlagIcon,
  Insights as InsightsIcon
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient.js";
import { 
  ACCENTURE_COLORS, 
  cardStyles, 
  primaryButtonStyles, 
  outlineButtonStyles,
  textButtonStyles,
  contentPaperStyles,
  statusChipStyles,
  sectionHeaderStyles
} from "../styles/styles.js";

// Project phases with their values and colors
const phases = [
  { label: "Planning", value: 0, color: ACCENTURE_COLORS.corePurple3 },
  { label: "Design", value: 20, color: ACCENTURE_COLORS.corePurple2 },
  { label: "Development", value: 50, color: ACCENTURE_COLORS.corePurple1 },
  { label: "Testing", value: 70, color: ACCENTURE_COLORS.accentPurple3 },
  { label: "Deployment", value: 90, color: ACCENTURE_COLORS.accentPurple1 },
  { label: "Completed", value: 100, color: "#4CAF50" }
];

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const projectId = id;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // States for project data
  const [project, setProject] = useState(null);
  const [teammates, setTeammates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState(null);
  
  // State for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  
  // State for delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch (error) {
      return dateString;
    }
  };

  // Function to determine the active phase based on progress value
  const determineActivePhase = (progressValue) => {
    for (let i = phases.length - 1; i >= 0; i--) {
      if (progressValue >= phases[i].value) {
        return phases[i];
      }
    }
    return phases[0];
  };

  // Function to fetch project details
  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      // Fetch project data
      const { data: projectData, error: projectError } = await supabase
        .from("Project")
        .select(
          "projectID, title, description, status, logo, progress, start_date, end_date, priority"
        )
        .eq("projectID", projectId)
        .single();

      if (projectError) {
        throw new Error(`Error loading project: ${projectError.message}`);
      }

      setProject(projectData);

      // Determine the active phase based on progress
      const activePhase = determineActivePhase(projectData.progress || 0);
      setActivePhase(activePhase);

      // Fetch team information
      const { data: userRolesData, error: rolesError } = await supabase
        .from("UserRole")
        .select(
          "project_id, role_name, user_id, User:User(user_id, name, last_name, profile_pic)"
        )
        .eq("project_id", projectId);

      if (rolesError) {
        throw new Error(`Error loading team: ${rolesError.message}`);
      }

      // Process team data
      const teamByProject = [];
      userRolesData.forEach(({ User, role_name }) => {
        if (User) {
          teamByProject.push({
            id: User.user_id,
            name: User.name || "User",
            last_name: User.last_name || "",
            avatar: User.profile_pic || "",
            role: role_name || "Member"
          });
        }
      });

      setTeammates(teamByProject);
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Delete handlers
  const handleDeleteClick = () => setDeleteConfirmOpen(true);
  const handleCancelDelete = () => setDeleteConfirmOpen(false);

  const handleConfirmDelete = async () => {
    setDeleteConfirmOpen(false);
    setLoading(true);
    try {
      const { error } = await supabase
        .from("Project")
        .delete()
        .eq("projectID", projectId);
      if (error) throw error;

      setSnackbar({
        open: true,
        message: "Project deleted successfully",
        severity: "success",
      });
      // Después de un segundo vuelves atrás o a la lista de proyectos
      setTimeout(() => navigate("/projects"), 1000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error deleting project: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Effect to load data when component mounts
  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Conditional rendering while loading data
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: "center", minHeight: "50vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <LinearProgress 
          color="primary" 
          sx={{ 
            mb: 3, 
            height: 6, 
            borderRadius: 3,
            backgroundColor: alpha(ACCENTURE_COLORS.corePurple1, 0.1)
          }} 
        />
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
          Loading project details...
        </Typography>
      </Box>
    );
  }

  // If project not found
  if (!project) {
    return (
      <Box sx={{ p: 4, textAlign: "center", minHeight: "50vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Typography variant="h5" color="error" sx={{ mb: 2, fontWeight: 500 }}>
          Project not found
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ ...primaryButtonStyles, mx: "auto" }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  const progressValue = project.progress || 0;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, width: "100%", boxSizing: "border-box" }}>
      {/* Header section */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            color: theme.palette.primary.main,
            textTransform: "none",
            mb: 1,
            pl: 0
          }}
        >
          BACK
        </Button>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" }
            }}
          >
            Project Details
          </Typography>

          {/* Action buttons group */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Edit button - desktop */}
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/project-edit/${projectId}`)}
              sx={{
                ...primaryButtonStyles,
                display: { xs: "none", sm: "inline-flex" }
              }}
            >
              Edit
            </Button>

            {/* Delete button - desktop */}
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
              sx={{
                ...outlineButtonStyles,
                borderColor: theme.palette.error.main,
                color: theme.palette.error.main,
                '&:hover': {
                  borderColor: theme.palette.error.dark,
                  bgcolor: alpha(theme.palette.error.main, 0.08),
                  boxShadow: `0 2px 6px ${alpha(theme.palette.error.main, 0.15)}`,
                  transform: 'translateY(-2px)',
                },
                display: { xs: "none", sm: "inline-flex" }
              }}
            >
              Delete
            </Button>

            {/* Edit button - mobile */}
            <IconButton
              onClick={() => navigate(`/project-edit/${projectId}`)}
              sx={{
                color: "white",
                bgcolor: ACCENTURE_COLORS.corePurple1,
                display: { xs: "flex", sm: "none" },
                "&:hover": { 
                  bgcolor: ACCENTURE_COLORS.corePurple2,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 8px ${alpha(ACCENTURE_COLORS.corePurple1, 0.3)}`,
                },
                transition: 'all 0.2s'
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>

            {/* Delete button - mobile */}
            <IconButton
              onClick={handleDeleteClick}
              sx={{
                color: theme.palette.error.main,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                display: { xs: "flex", sm: "none" },
                "&:hover": { 
                  bgcolor: alpha(theme.palette.error.main, 0.2),
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s'
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Project overview section */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          mb: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: alpha("#000", 0.05),
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
        }}
      >
        {/* Project header info */}
        <Box sx={{ 
          p: { xs: 2, sm: 3 }, 
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "center", sm: "flex-start" },
          gap: { xs: 2, sm: 3 },
          bgcolor: ACCENTURE_COLORS.corePurple1,
          color: "white"
        }}>
          {/* Project logo */}
          <Box sx={{ 
            width: { xs: 100, sm: 120, md: 140 }, 
            height: { xs: 100, sm: 120, md: 140 },
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            zIndex: 1
          }}>
            <img
              src={project.logo || "/default-certification.jpg"}
              alt={project.title}
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "cover"
              }}
            />
          </Box>
          
          {/* Project details */}
          <Box sx={{ 
            flex: 1,
            textAlign: { xs: "center", sm: "left" },
            zIndex: 1
          }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ 
                fontWeight: 700,
                mb: 1,
                mt: 1,
                lineHeight: 1.2,
                wordBreak: "break-word"              
              }}
            >
              {project.title}
            </Typography>
            
            <Box sx={{ 
              display: "flex", 
              flexWrap: "wrap",
              gap: 1,
              justifyContent: { xs: "center", sm: "flex-start" },
              mt: 2,
              mb: 2.5
            }}>
              <Chip 
                label={project.status} 
                size="small"
                sx={{ 
                  bgcolor: alpha("#fff", 0.2),
                  color: "#fff",
                  height: 26,
                  fontWeight: 500,
                  backdropFilter: "blur(8px)",
                  borderRadius: 1
                }}
              />
              <Chip 
                icon={<FlagIcon sx={{ fontSize: "0.8rem" }} />}
                label={project.priority}
                size="small" 
                sx={{ 
                  bgcolor: alpha("#fff", 0.2),
                  color: "#fff",
                  height: 26,
                  fontWeight: 500,
                  backdropFilter: "blur(8px)",
                  borderRadius: 1
                }}
              />
            </Box>
            
            {/* Project dates */}
            <Box sx={{ 
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 1, md: 3 },
              opacity: 0.9,
              alignItems: { xs: "center", sm: "flex-start" },
            }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CalendarToday sx={{ fontSize: 16, mr: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Start: {formatDate(project.start_date)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CalendarToday sx={{ fontSize: 16, mr: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  End: {formatDate(project.end_date)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* Description */}
        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7, color: alpha(theme.palette.text.primary, 0.87) }}>
            {project.description || "No description available for this project."}
          </Typography>
          
          <Chip 
            label={`${progressValue}% Complete`}
            size="small" 
            color="primary"
            sx={{ 
              height: 26, 
              fontWeight: 500, 
              borderRadius: 1, 
              bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.1),
              color: ACCENTURE_COLORS.corePurple1,
              border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.2)}`
            }}
          />
        </Box>
      </Paper>

      {/* Project Progress */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, sm: 4 }, 
          borderRadius: 3,
          mb: 3,
          border: "1px solid",
          borderColor: alpha("#000", 0.05),
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
        }}
      >
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          mb: 3,
          flexWrap: "wrap",
          gap: 1
        }}>
          <InsightsIcon sx={{ color: ACCENTURE_COLORS.corePurple1, mr: 1.5 }} />
          <Typography variant="h6" fontWeight={600} color={ACCENTURE_COLORS.corePurple3}>
            Progress Tracker
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Chip 
            label={`Phase: ${activePhase?.label || 'N/A'}`}
            size="small" 
            sx={{ 
              height: 26, 
              fontWeight: 500, 
              borderRadius: 1,
              bgcolor: alpha(activePhase?.color || ACCENTURE_COLORS.corePurple1, 0.1),
              color: activePhase?.color || ACCENTURE_COLORS.corePurple1,
              border: `1px solid ${alpha(activePhase?.color || ACCENTURE_COLORS.corePurple1, 0.2)}`
            }}
          />
        </Box>
        
        <Divider sx={{ mb: 3, opacity: 0.6 }} />
        
        {/* ENHANCED PROGRESS BAR - Mantener la misma funcionalidad pero con estilos mejorados */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ 
            height: 28, 
            display: 'flex', 
            borderRadius: 2, 
            overflow: 'hidden', 
            position: 'relative',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.03)'
          }}>
            {/* Planning phase */}
            <Box 
              sx={{ 
                width: '20%', 
                bgcolor: progressValue >= 0 ? ACCENTURE_COLORS.corePurple3 : alpha(ACCENTURE_COLORS.corePurple3, 0.15),
                backgroundImage: progressValue >= 0 ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent)' : 'none',
                backgroundSize: '20px 20px',
                position: 'relative',
                borderRight: '2px solid rgba(255,255,255,0.3)',
                zIndex: 1,
                animation: progressValue >= 0 ? 'progress-bar-stripes 1.5s linear infinite' : 'none',
                "@keyframes progress-bar-stripes": {
                  "0%": { backgroundPosition: "0 0" },
                  "100%": { backgroundPosition: "20px 0" }
                },
                transition: 'background-color 0.3s ease'
              }} 
            />
            {/* Design phase */}
            <Box 
              sx={{ 
                width: '10%', 
                bgcolor: progressValue >= 20 ? ACCENTURE_COLORS.corePurple2 : alpha(ACCENTURE_COLORS.corePurple2, 0.15),
                backgroundImage: progressValue >= 20 ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent)' : 'none',
                backgroundSize: '20px 20px',
                position: 'relative',
                borderRight: '2px solid rgba(255,255,255,0.3)',
                zIndex: 2,
                animation: progressValue >= 20 ? 'progress-bar-stripes 1.5s linear infinite' : 'none',
                transition: 'background-color 0.3s ease'
              }} 
            />
            {/* Development phase */}
            <Box 
              sx={{ 
                width: '30%', 
                bgcolor: progressValue >= 50 ? ACCENTURE_COLORS.corePurple1 : alpha(ACCENTURE_COLORS.corePurple1, 0.15),
                backgroundImage: progressValue >= 50 ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent)' : 'none',
                backgroundSize: '20px 20px',
                position: 'relative',
                borderRight: '2px solid rgba(255,255,255,0.3)',
                zIndex: 3,
                animation: progressValue >= 50 ? 'progress-bar-stripes 1.5s linear infinite' : 'none',
                transition: 'background-color 0.3s ease'
              }} 
            />
            {/* Testing phase */}
            <Box 
              sx={{ 
                width: '20%', 
                bgcolor: progressValue >= 70 ? ACCENTURE_COLORS.accentPurple3 : alpha(ACCENTURE_COLORS.accentPurple3, 0.15),
                backgroundImage: progressValue >= 70 ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent)' : 'none',
                backgroundSize: '20px 20px',
                position: 'relative',
                borderRight: '2px solid rgba(255,255,255,0.3)',
                zIndex: 4,
                animation: progressValue >= 70 ? 'progress-bar-stripes 1.5s linear infinite' : 'none',
                transition: 'background-color 0.3s ease'
              }} 
            />
            {/* Deployment phase */}
            <Box 
              sx={{ 
                width: '10%', 
                bgcolor: progressValue >= 90 ? ACCENTURE_COLORS.accentPurple1 : alpha(ACCENTURE_COLORS.accentPurple1, 0.15),
                backgroundImage: progressValue >= 90 ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent)' : 'none',
                backgroundSize: '20px 20px',
                position: 'relative',
                borderRight: '2px solid rgba(255,255,255,0.3)',
                zIndex: 5,
                animation: progressValue >= 90 ? 'progress-bar-stripes 1.5s linear infinite' : 'none',
                transition: 'background-color 0.3s ease'
              }} 
            />
            {/* Completed phase */}
            <Box 
              sx={{ 
                width: '10%', 
                bgcolor: progressValue === 100 ? '#4CAF50' : alpha('#4CAF50', 0.15),
                backgroundImage: progressValue === 100 ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent)' : 'none',
                backgroundSize: '20px 20px',
                position: 'relative',
                zIndex: 6,
                animation: progressValue === 100 ? 'progress-bar-stripes 1.5s linear infinite' : 'none',
                transition: 'background-color 0.3s ease'
              }} 
            />
            
            {/* Current progress indicator */}
            {progressValue > 0 && progressValue < 100 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: `${progressValue}%`,
                  height: '100%',
                  width: 3,
                  bgcolor: 'white',
                  boxShadow: '0 0 10px rgba(0,0,0,0.5), 0 0 5px rgba(161, 0, 255, 0.8)',
                  zIndex: 10,
                  transform: 'translateX(-50%)'
                }}
              />
            )}
          </Box>
          
          {/* Phase percentages */}
          <Box 
            sx={{ 
              display: "flex",
              justifyContent: "space-between",
              mt: 1.5,
              px: 0.5
            }}
          >
            {phases.map((phase, idx) => (
              <Typography 
                key={idx}
                variant="caption"
                sx={{
                  color: progressValue >= phase.value 
                    ? theme.palette.text.primary 
                    : theme.palette.text.secondary,
                  fontWeight: activePhase?.value === phase.value ? 600 : 400,
                  fontSize: '0.7rem'
                }}
              >
                {phase.value}%
              </Typography>
            ))}
          </Box>
          
          {/* Phase labels - More responsive and visually appealing */}
          <Box 
            sx={{ 
              display: "flex",
              justifyContent: "space-between",
              px: 0.5
            }}
          >
            {phases.map((phase, idx) => (
              <Box
                key={idx}
                sx={{
                  textAlign: 'center',
                  width: idx === 0 ? '20%' : idx === 1 ? '10%' : idx === 2 ? '30%' : idx === 3 ? '20%' : '10%',
                  pl: idx === 0 ? 0 : 0.5, 
                  ml: idx === 0 ? 0 : -1.2, 
                  display: { xs: 'none', md: 'block' }
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: progressValue >= phase.value 
                      ? phase.color
                      : alpha(phase.color, 0.6),
                    fontWeight: activePhase?.value === phase.value ? 600 : 400,
                    fontSize: '0.7rem',
                    display: 'block',
                    transition: 'color 0.3s ease'
                  }}
                >
                  {phase.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Current phase info box */}
        <Box
          sx={{
            mt: 3,
            p: 2.5,
            borderRadius: 2,
            bgcolor: alpha(activePhase?.color || ACCENTURE_COLORS.corePurple1, 0.05),
            border: `1px solid ${alpha(activePhase?.color || ACCENTURE_COLORS.corePurple1, 0.15)}`,
            boxShadow: `0 4px 15px ${alpha(activePhase?.color || ACCENTURE_COLORS.corePurple1, 0.05)}`,
            display: "flex",
            alignItems: "center",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: `0 6px 20px ${alpha(activePhase?.color || ACCENTURE_COLORS.corePurple1, 0.08)}`,
              transform: "translateY(-2px)"
            }
          }}
        >
          <Box
            sx={{
              bgcolor: activePhase?.color || ACCENTURE_COLORS.corePurple1,
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2.5,
              boxShadow: `0 4px 10px ${alpha(activePhase?.color || ACCENTURE_COLORS.corePurple1, 0.3)}`
            }}
          >
            <AssignmentIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              fontWeight={600} 
              sx={{ 
                color: activePhase?.color || ACCENTURE_COLORS.corePurple1,
                mb: 0.5
              }}
            >
              Current Phase: {activePhase?.label || "Not set"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {progressValue}% complete. 
              {progressValue < 100 
                ? " Follow the established plan to complete the project on time."
                : " The project has been successfully completed."}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Team section - Enhanced with card hover effects and better spacing */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, sm: 4 }, 
          borderRadius: 3,
          border: "1px solid",
          borderColor: alpha("#000", 0.05),
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
        }}
      >
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          mb: 3,
          justifyContent: "space-between" 
        }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PeopleIcon sx={{ color: ACCENTURE_COLORS.corePurple1, mr: 1.5 }} />
            <Typography variant="h6" fontWeight={600} color={ACCENTURE_COLORS.corePurple3}>
              Team Members
            </Typography>
          </Box>
          
          <Chip
            label={`${teammates.length} members`}
            size="small"
            sx={{ 
              height: 26, 
              fontWeight: 500, 
              borderRadius: 1,
              bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.1),
              color: ACCENTURE_COLORS.corePurple1,
              border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.2)}`
            }}
          />
        </Box>
        
        <Divider sx={{ mb: 3, opacity: 0.6 }} />

        {/* Team grid - Enhanced card design */}
        <Grid container spacing={2.5}>
          {teammates.length > 0 ? (
            teammates.map((teammate, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card 
                  elevation={0}
                  sx={{ 
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.divider, 0.1),
                    bgcolor: "white",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.03)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: `0 8px 15px rgba(0, 0, 0, 0.06)`,
                      borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.3),
                    },
                  }}
                >
                  <Avatar 
                    src={teammate.avatar} 
                    alt={teammate.name}
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      mr: 2,
                      boxShadow: `0 2px 6px ${alpha(ACCENTURE_COLORS.corePurple1, 0.15)}`,
                      border: `2px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.2)}`
                    }}
                  />
                  <Box sx={{ overflow: "hidden" }}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={600}
                      sx={{ 
                        whiteSpace: "nowrap", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis",
                        color: ACCENTURE_COLORS.corePurple3
                      }}
                    >
                      {teammate.name} {teammate.last_name}
                    </Typography>
                    <Chip
                      label={teammate.role}
                      size="small"
                      sx={{ 
                        height: 22, 
                        fontSize: "0.7rem",
                        mt: 0.5,
                        fontWeight: 500,
                        bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.1),
                        color: ACCENTURE_COLORS.corePurple1,
                      }}
                    />
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.grey[500], 0.03),
                  border: "1px dashed",
                  borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.2),
                  boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.02)"
                }}
              >
                <PeopleIcon sx={{ fontSize: 40, color: alpha(ACCENTURE_COLORS.corePurple1, 0.4), mb: 1 }} />
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  No members assigned to this project yet
                </Typography>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={() => navigate("/role-assign")}
                  sx={{ ...outlineButtonStyles }}
                >
                  Assign Members
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Delete Confirmation Dialog - Enhanced with better styling */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            maxWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          fontWeight: 600
        }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: alpha(theme.palette.text.primary, 0.8) }}>
            Are you sure you want to permanently delete this project? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCancelDelete} 
            sx={{ ...textButtonStyles }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained"
            color="error"
            sx={{
              bgcolor: theme.palette.error.main,
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: 1.5,
              boxShadow: 'none',
              padding: '8px 16px',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: theme.palette.error.dark,
                boxShadow: `0 4px 8px ${alpha(theme.palette.error.main, 0.3)}`,
                transform: 'translateY(-2px)',
              },
              textTransform: 'none'
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar - Enhanced styling */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ 
          '& .MuiPaper-root': { 
            borderRadius: 2,
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ 
            width: "100%",
            borderRadius: 2,
            alignItems: "center",
            '& .MuiAlert-icon': { 
              fontSize: 20,
              opacity: 0.9
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectDetail;