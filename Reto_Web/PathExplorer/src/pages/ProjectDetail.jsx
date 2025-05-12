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
  Flag as FlagIcon
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient.js";

// Project phases with their values and colors
const phases = [
  { label: "Planning", value: 0, color: "#460073" },
  { label: "Design", value: 20, color: "#7500c0" },
  { label: "Development", value: 50, color: "#a100ff" },
  { label: "Testing", value: 70, color: "#be82ff" },
  { label: "Deployment", value: 90, color: "#973EBC" },
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
  
  // Para mostrar/ocultar el diálogo de confirmación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };
  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
  };

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
      <Box sx={{ p: 2, textAlign: "center" }}>
        <LinearProgress color="primary" sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Loading project details...
        </Typography>
      </Box>
    );
  }

  // If project not found
  if (!project) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Project not found
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Back
        </Button>
      </Box>
    );
  }

  const progressValue = project.progress || 0;

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2 }, maxWidth: "100%" }}>
      {/* Header styled like other pages */}
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
            alignItems: "center"
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

          {/* Agrupamos ambos botones en un solo contenedor */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {/* Edit desktop */}
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/project-edit/${projectId}`)}
              sx={{
                bgcolor: theme.palette.primary.main,
                textTransform: "none",
                display: { xs: "none", sm: "inline-flex" }
              }}
            >
              Edit
            </Button>

            {/* Delete desktop */}
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}             // ← aquí
              sx={{
                textTransform: "none",
                display: { xs: "none", sm: "inline-flex" }
              }}
            >
              Delete
            </Button>

            {/* Edit mobile */}
            <IconButton
              onClick={() => navigate(`/project-edit/${projectId}`)}
              sx={{
                color: "white",
                bgcolor: theme.palette.primary.main,
                display: { xs: "flex", sm: "none" },
                "&:hover": { bgcolor: theme.palette.primary.dark }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>

            {/* Delete mobile */}
            <IconButton
              onClick={handleDeleteClick}
              sx={{
                color: theme.palette.error.main,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                display: { xs: "flex", sm: "none" },
                "&:hover": { bgcolor: alpha(theme.palette.error.dark, 0.2) }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>


      {/* Project overview */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 1,
          mb: 2,
          border: "1px solid",
          borderColor: alpha("#000", 0.07),
          overflow: "hidden"
        }}
      >
        {/* Project header info */}
        <Box sx={{ 
          p: { xs: 2, sm: 3 }, 
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "center", sm: "flex-start" },
          gap: { xs: 2, sm: 3 },
          bgcolor: theme.palette.primary.main,
          color: "white"
        }}>
          {/* Project logo */}
          <Box sx={{ 
            width: { xs: 90, sm: 100, md: 120 }, 
            height: { xs: 90, sm: 100, md: 120 },
            borderRadius: 1,
            overflow: "hidden",
            bgcolor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
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
          }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ 
                fontWeight: 500,
                mb: 1,
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
              mt: 1,
              mb: 2
            }}>
              <Chip 
                label={project.status} 
                size="small"
                sx={{ 
                  bgcolor: alpha("#fff", 0.15),
                  color: "#fff",
                  height: 24,
                }}
              />
              <Chip 
                icon={<FlagIcon sx={{ fontSize: "0.8rem" }} />}
                label={project.priority}
                size="small" 
                sx={{ 
                  bgcolor: alpha("#fff", 0.15),
                  color: "#fff",
                  height: 24,
                }}
              />
            </Box>
            
            {/* Project dates */}
            <Box sx={{ 
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 0.5, md: 2 },
              opacity: 0.9,
              alignItems: { xs: "center", sm: "flex-start" },
            }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CalendarToday sx={{ fontSize: 14, mr: 1 }} />
                <Typography variant="body2">
                  Start: {formatDate(project.start_date)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CalendarToday sx={{ fontSize: 14, mr: 1 }} />
                <Typography variant="body2">
                  End: {formatDate(project.end_date)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* Description */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {project.description || "No description available for this project."}
          </Typography>
          
          <Chip 
            label={`${progressValue}% Complete`}
            size="small" 
            color="primary"
            sx={{ height: 24, display: "inline-flex" }}
          />
        </Box>
      </Paper>

      {/* Project Progress */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          borderRadius: 1,
          mb: 2,
          border: "1px solid",
          borderColor: alpha("#000", 0.07),
        }}
      >
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          mb: 2,
          flexWrap: "wrap",
          gap: 1
        }}>
          <AssignmentIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="h6" fontWeight={500}>
            Progress
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Chip 
            label={`Phase: ${activePhase?.label || 'N/A'}`}
            size="small" 
            color="primary"
            sx={{ height: 24 }}
          />
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {/* COMBINED PROGRESS BAR - Enhanced with all features */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ height: 25, display: 'flex', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
            {/* Planning phase */}
            <Box 
              sx={{ 
                width: '20%', 
                bgcolor: progressValue >= 0 ? '#460073' : alpha('#460073', 0.15),
                backgroundImage: progressValue >= 0 ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent)' : 'none',
                backgroundSize: '20px 20px',
                position: 'relative',
                borderRight: '2px solid rgba(255,255,255,0.3)',
                zIndex: 1,
                animation: progressValue >= 0 ? 'progress-bar-stripes 1.5s linear infinite' : 'none',
                "@keyframes progress-bar-stripes": {
                  "0%": { backgroundPosition: "0 0" },
                  "100%": { backgroundPosition: "20px 0" }
                }
              }} 
            />
            {/* Design phase */}
            <Box 
              sx={{ 
                width: '10%', 
                bgcolor: progressValue >= 20 ? '#7500c0' : alpha('#7500c0', 0.15),
                backgroundImage: progressValue >= 20 ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent)' : 'none',
                backgroundSize: '20px 20px',
                position: 'relative',
                borderRight: '2px solid rgba(255,255,255,0.3)',
                zIndex: 2,
                animation: progressValue >= 20 ? 'progress-bar-stripes 1.5s linear infinite' : 'none'
              }} 
            />
            {/* Development phase */}
            <Box 
              sx={{ 
                width: '30%', 
                bgcolor: progressValue >= 50 ? '#a100ff' : alpha('#a100ff', 0.15),
                backgroundImage: progressValue >= 50 ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent)' : 'none',
                backgroundSize: '20px 20px',
                position: 'relative',
                borderRight: '2px solid rgba(255,255,255,0.3)',
                zIndex: 3,
                animation: progressValue >= 50 ? 'progress-bar-stripes 1.5s linear infinite' : 'none'
              }} 
            />
            {/* Testing phase */}
            <Box 
              sx={{ 
                width: '20%', 
                bgcolor: progressValue >= 70 ? '#be82ff' : alpha('#be82ff', 0.15),
                backgroundImage: progressValue >= 70 ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent)' : 'none',
                backgroundSize: '20px 20px',
                position: 'relative',
                borderRight: '2px solid rgba(255,255,255,0.3)',
                zIndex: 4,
                animation: progressValue >= 70 ? 'progress-bar-stripes 1.5s linear infinite' : 'none'
              }} 
            />
            {/* Deployment phase */}
            <Box 
              sx={{ 
                width: '10%', 
                bgcolor: progressValue >= 90 ? '#973EBC' : alpha('#973EBC', 0.15),
                backgroundImage: progressValue >= 90 ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent)' : 'none',
                backgroundSize: '20px 20px',
                position: 'relative',
                borderRight: '2px solid rgba(255,255,255,0.3)',
                zIndex: 5,
                animation: progressValue >= 90 ? 'progress-bar-stripes 1.5s linear infinite' : 'none'
              }} 
            />
            {/* Completed phase - MODIFICADO: Ahora solo se colorea cuando progressValue = 100 */}
            <Box 
              sx={{ 
                width: '10%', 
                bgcolor: progressValue === 100 ? '#4CAF50' : alpha('#4CAF50', 0.15),
                backgroundImage: progressValue === 100 ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent)' : 'none',
                backgroundSize: '20px 20px',
                position: 'relative',
                zIndex: 6,
                animation: progressValue === 100 ? 'progress-bar-stripes 1.5s linear infinite' : 'none'
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
                  boxShadow: '0 0 5px rgba(0,0,0,0.5)',
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
              mt: 1,
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
          
          {/* Phase labels */}
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
                      ? theme.palette.primary.main 
                      : alpha(theme.palette.primary.main, 0.5),
                    fontWeight: activePhase?.value === phase.value ? 600 : 400,
                    fontSize: '0.7rem',
                    display: 'block'
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
            p: 2,
            borderRadius: 1,
            bgcolor: alpha(activePhase?.color || theme.palette.primary.main, 0.08),
            border: `1px solid ${alpha(activePhase?.color || theme.palette.primary.main, 0.2)}`,
            display: "flex",
            alignItems: "center"
          }}
        >
          <Box
            sx={{
              bgcolor: activePhase?.color || theme.palette.primary.main,
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2
            }}
          >
            <AssignmentIcon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography 
              variant="body1" 
              fontWeight={600} 
              sx={{ color: activePhase?.color || theme.palette.primary.main }}
            >
              Current Phase: {activePhase?.label || "Not set"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {progressValue}% complete. 
              {progressValue < 100 
                ? " Follow the established plan to complete the project on time."
                : " The project has been successfully completed."}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Team section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          borderRadius: 1,
          border: "1px solid",
          borderColor: alpha("#000", 0.07),
        }}
      >
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          mb: 2,
          justifyContent: "space-between" 
        }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PeopleIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
            <Typography variant="h6" fontWeight={500}>
              Team
            </Typography>
          </Box>
          
          <Chip
            label={`${teammates.length} members`}
            size="small"
            color="primary"
            sx={{ height: 24 }}
          />
        </Box>
        
        <Divider sx={{ mb: 2 }} />

        {/* Team grid */}
        <Grid container spacing={2}>
          {teammates.length > 0 ? (
            teammates.map((teammate, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card 
                  elevation={0}
                  sx={{ 
                    display: "flex",
                    alignItems: "center",
                    p: 1.5,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.divider, 0.15),
                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                    },
                  }}
                >
                  <Avatar 
                    src={teammate.avatar} 
                    alt={teammate.name}
                    sx={{ width: 40, height: 40, mr: 1.5 }}
                  />
                  <Box sx={{ overflow: "hidden" }}>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight={500}
                      sx={{ 
                        whiteSpace: "nowrap", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis" 
                      }}
                    >
                      {teammate.name} {teammate.last_name}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="primary"
                      sx={{ display: "block" }}
                    >
                      {teammate.role}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box
                sx={{
                  textAlign: "center",
                  py: 3,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.grey[500], 0.05),
                  border: "1px dashed",
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No members assigned to this project
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate("/role-assign")}
                  sx={{ mt: 2, textTransform: "none" }}
                >
                  Assign Members
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this project? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
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

export default ProjectDetail;