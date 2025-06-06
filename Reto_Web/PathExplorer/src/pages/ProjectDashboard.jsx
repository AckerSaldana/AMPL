import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  Paper,
  IconButton,
  Divider,
  LinearProgress,
  Fade,
  Chip,
  Avatar,
} from "@mui/material";
import ProjectCard from "../components/ProjectCard.jsx";
import SkeletonProjectCard from "../components/SkeletonProjectCard.jsx";
import ProjectFilter from "../components/ProjectFilter.jsx";
import AddProjectButton from "../components/AddProjectButton.jsx";
import useAuth from "../hooks/useAuth";
import { supabase } from "../supabase/supabaseClient.js";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import { ACCENTURE_COLORS, primaryButtonStyles, outlineButtonStyles } from "../styles/styles";
import { useDarkMode } from "../contexts/DarkModeContext";

// Icons
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LaunchIcon from "@mui/icons-material/Launch";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AddIcon from "@mui/icons-material/Add";
import WarningIcon from "@mui/icons-material/Warning";

const ProjectDashboard = () => {
  const { darkMode } = useDarkMode();
  const [activeFilter, setActiveFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState("");
  const { role } = useAuth();
  const [selectedProject, setSelectedProject] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Fetch both queries in parallel for better performance
      const [projectsResult, userRolesResult] = await Promise.allSettled([
        supabase
          .from("Project")
          .select(
            "projectID, title, description, status, logo, progress, start_date, end_date, priority"
          ),
        supabase
          .from("UserRole")
          .select("project_id, user_id, User:User(user_id, name, profile_pic)")
      ]);

      // Handle projects data
      if (projectsResult.status === 'rejected' || projectsResult.value.error) {
        const error = projectsResult.status === 'rejected' ? projectsResult.reason : projectsResult.value.error;
        console.error("Error fetching projects:", error.message);
        setSnackbar({
          open: true,
          message: `Error al cargar los proyectos: ${error.message}`,
          severity: "error",
        });
        return;
      }

      const projectsData = projectsResult.value.data;

      // Handle user roles data
      if (userRolesResult.status === 'rejected' || userRolesResult.value.error) {
        const error = userRolesResult.status === 'rejected' ? userRolesResult.reason : userRolesResult.value.error;
        console.error("Error fetching user roles:", error.message);
        // Continue without team data rather than failing completely
      }

      const userRolesData = userRolesResult.status === 'fulfilled' && !userRolesResult.value.error 
        ? userRolesResult.value.data 
        : [];

      const teamByProject = {};
      userRolesData.forEach(({ project_id, User }) => {
        if (!teamByProject[project_id]) teamByProject[project_id] = [];
        if (User) {
          teamByProject[project_id].push({
            name: User.name || "Usuario",
            avatar: User.profile_pic || "",
          });
        }
      });

      const combinedData = projectsData.map((project) => ({
        id: project.projectID,
        title: project.title,
        description: project.description,
        status: project.status,
        logo: project.logo,
        team: teamByProject[project.projectID] || [],
        progress: project.progress,
        assignedDate: project.start_date,
        dueDate: project.end_date,
        priority: project.priority,
      }));

      // Sort projects by priority
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };

      combinedData.sort((a, b) => {
        const orderA = priorityOrder[a.priority] || 99;
        const orderB = priorityOrder[b.priority] || 99;
        return orderA - orderB;
      });

      setProjects(combinedData);
    } catch (error) {
      console.error("Error in fetchProjects:", error);
      setSnackbar({
        open: true,
        message: `Error inesperado: ${error.message}`,
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleAddProject = useCallback(() => {
    navigate("/add-projects");
  }, [navigate]);

  const handleEditProject = useCallback((project) => {
    setSelectedProject(project);
    setDialogAction("edit");
    setOpenDialog(true);
  }, []);

  const handleDeleteProject = useCallback(async (project) => {
    setSelectedProject(project);
    setDialogAction("delete");
    setOpenDialog(true);
  }, []);

  const handleViewDetails = useCallback((project) => {
    setSelectedProject(project);
    setDialogAction("view");
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (dialogAction === "delete" && selectedProject) {
      try {
        const { error } = await supabase
          .from("Project")
          .delete()
          .eq("projectID", selectedProject.id);

        if (error) throw error;

        setProjects(projects.filter((p) => p.id !== selectedProject.id));
        setSnackbar({
          open: true,
          message: `Proyecto "${selectedProject.title}" eliminado con éxito`,
          severity: "success",
        });
      } catch (error) {
        console.error("Error deleting project:", error.message);
        setSnackbar({
          open: true,
          message: `Error al eliminar el proyecto: ${error.message}`,
          severity: "error",
        });
      }
    }
    setOpenDialog(false);
  }, [dialogAction, selectedProject, projects]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (activeFilter.toLowerCase() === "all") return true;
      return project.status?.toLowerCase() === activeFilter.toLowerCase();
    });
  }, [projects, activeFilter]);

  // Create an array of skeleton cards for loading state - memoized
  const skeletonCards = useMemo(() => 
    Array(6).fill(0).map((_, index) => (
      <Grid item xs={12} sm={6} lg={4} key={`skeleton-${index}`}>
        <SkeletonProjectCard />
      </Grid>
    )), []);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: "100%" }}>
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 700, 
          mb: 3, 
          position: 'relative',
          color: darkMode ? '#ffffff' : ACCENTURE_COLORS.black
        }}
      >
        Projects
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3} lg={2.5} sx={{ position: "relative" }}>
          {/* Add Project Card */}
          {role === "manager" && (
            <Paper 
              elevation={0}
              sx={{ 
                borderRadius: 2,
                mb: 2,
                p: 3,
                border: darkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.12)",
                bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <AddProjectButton onClick={handleAddProject} />
            </Paper>
          )}

          {/* Filter Card - Will stay in its original position */}
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              border: darkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.12)",
              bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
              position: 'static',  // Stays in normal document flow
            }}
          >
            <Box sx={{ py: 2 }}>
              <ProjectFilter
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                disabled={isLoading}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9} lg={9.5}>
          <Grid container spacing={3}>
            {isLoading ? (
              // Show skeleton cards while loading
              skeletonCards
            ) : filteredProjects.length > 0 ? (
              // Show actual project cards with fade-in animation
              filteredProjects.map((project, index) => (
                <Fade 
                  in={true} 
                  key={project.id}
                  timeout={300} 
                  style={{ transitionDelay: `${Math.min(index * 30, 150)}ms` }}
                >
                  <Grid item xs={12} sm={6} lg={4}>
                    <ProjectCard
                      project={project}
                      darkMode={darkMode}
                      onEdit={
                        role === "manager"
                          ? handleEditProject
                          : undefined
                      }
                      onDelete={
                        role === "manager"
                          ? handleDeleteProject
                          : undefined
                      }
                      onViewDetails={handleViewDetails}
                    />
                  </Grid>
                </Fade>
              ))
            ) : (
              // Show "no projects" message
              <Grid item xs={12}>
                <Fade in={true} timeout={500}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 5,
                      textAlign: "center",
                      borderRadius: 3,
                      border: "1px dashed",
                      borderColor: darkMode ? alpha(ACCENTURE_COLORS.corePurple1, 0.3) : alpha(ACCENTURE_COLORS.corePurple1, 0.2),
                      bgcolor: darkMode ? alpha(ACCENTURE_COLORS.corePurple1, 0.05) : alpha(ACCENTURE_COLORS.lightGray, 0.6),
                      boxShadow: darkMode ? '0 6px 20px rgba(0,0,0,0.3)' : '0 6px 20px rgba(0,0,0,0.02)',
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: darkMode ? alpha(ACCENTURE_COLORS.corePurple1, 0.15) : alpha(ACCENTURE_COLORS.corePurple1, 0.08),
                        mx: 'auto',
                        mb: 3,
                      }}
                    >
                      <InfoOutlinedIcon sx={{ 
                        fontSize: 40, 
                        color: ACCENTURE_COLORS.corePurple1,
                        opacity: 0.7
                      }} />
                    </Box>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: darkMode ? '#ffffff' : ACCENTURE_COLORS.black,
                        fontWeight: 600,
                        mb: 1,
                      }}
                    >
                      No projects found
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ 
                        maxWidth: 450,
                        mx: 'auto',
                        mb: 4,
                        color: darkMode ? 'rgba(255,255,255,0.7)' : ACCENTURE_COLORS.darkGray
                      }}
                    >
                      No projects match the selected filter. Try changing the filter or add a new project.
                    </Typography>
                    {role === "manager" && (
                      <Button
                        variant="contained"
                        onClick={handleAddProject}
                        startIcon={<AddIcon />}
                        sx={{
                          ...primaryButtonStyles,
                          bgcolor: ACCENTURE_COLORS.corePurple1,
                          px: 3
                        }}
                      >
                        Add New Project
                      </Button>
                    )}
                  </Paper>
                </Fade>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* Dialog with elegant styling */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: darkMode ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            maxWidth: dialogAction === 'view' ? 500 : 400,
            bgcolor: darkMode ? '#1e1e1e' : ACCENTURE_COLORS.white,
            color: darkMode ? '#ffffff' : ACCENTURE_COLORS.black,
          }
        }}
      >
        {/* Dialog Header */}
        <DialogTitle 
          sx={{ 
            p: 0,
            position: 'relative',
          }}
        >
          <Box 
            sx={{ 
              p: 2.5,
              pb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: darkMode ? `1px solid rgba(255,255,255,0.12)` : `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`,
            }}
          >
            <Typography 
              variant="h6" 
              component="div"
              sx={{ 
                fontWeight: 600,
                fontSize: '1.1rem',
                color: dialogAction === 'delete' 
                  ? ACCENTURE_COLORS.red
                  : darkMode ? '#ffffff' : ACCENTURE_COLORS.black,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {dialogAction === "delete" && <WarningIcon color="error" />}
              {dialogAction === "delete"
                ? "Confirm Project Deletion"
                : dialogAction === "edit"
                ? "Edit Project"
                : "Project Details"}
            </Typography>
            <IconButton 
              onClick={handleCloseDialog}
              size="small"
              sx={{ 
                color: darkMode ? 'rgba(255,255,255,0.7)' : ACCENTURE_COLORS.darkGray,
                '&:hover': {
                  backgroundColor: darkMode ? alpha(ACCENTURE_COLORS.corePurple1, 0.15) : alpha(ACCENTURE_COLORS.corePurple1, 0.05),
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* Dialog Content */}
        <DialogContent sx={{ p: 3, pt: 2 }}>
          {dialogAction === "delete" && (
            <Typography sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : ACCENTURE_COLORS.darkGray }}>
              ¿Estás seguro de que deseas eliminar el proyecto "
              <Box component="span" sx={{ fontWeight: 600, color: darkMode ? '#ffffff' : ACCENTURE_COLORS.black }}>
                {selectedProject?.title}
              </Box>
              "? Esta acción no se puede deshacer.
            </Typography>
          )}
          
          {dialogAction === "edit" && (
            <Typography sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : ACCENTURE_COLORS.darkGray }}>
              Formulario de edición (implementación futura)
            </Typography>
          )}
          
          {dialogAction === "view" && selectedProject && (
            <Box>
              {/* Project Title */}
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  color: ACCENTURE_COLORS.corePurple1
                }}
              >
                {selectedProject.title}
              </Typography>
              
              {/* Project Description */}
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 3,
                  color: darkMode ? 'rgba(255,255,255,0.7)' : ACCENTURE_COLORS.darkGray,
                  lineHeight: 1.5
                }}
              >
                {selectedProject.description}
              </Typography>
              
              <Divider sx={{ mb: 2, borderColor: darkMode ? 'rgba(255,255,255,0.12)' : undefined }} />
              
              {/* Project Status and Progress */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: darkMode ? 'rgba(255,255,255,0.7)' : ACCENTURE_COLORS.darkGray,
                      fontWeight: 500,
                      display: 'block',
                      mb: 0.5
                    }}
                  >
                    Status
                  </Typography>
                  <Box>
                    <Chip
                      label={selectedProject.status}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: '0.75rem',
                        bgcolor: selectedProject.status === "In Progress"
                          ? alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.2 : 0.1)
                          : selectedProject.status === "Completed"
                          ? alpha(ACCENTURE_COLORS.green, darkMode ? 0.2 : 0.1)
                          : alpha(ACCENTURE_COLORS.orange, darkMode ? 0.2 : 0.1),
                        color: selectedProject.status === "In Progress"
                          ? ACCENTURE_COLORS.corePurple1
                          : selectedProject.status === "Completed"
                          ? ACCENTURE_COLORS.green
                          : ACCENTURE_COLORS.orange,
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: darkMode ? 'rgba(255,255,255,0.7)' : ACCENTURE_COLORS.darkGray,
                      fontWeight: 500,
                      display: 'block',
                      mb: 0.5
                    }}
                  >
                    Progress
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={selectedProject.progress}
                      sx={{
                        width: '70%',
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.2 : 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: selectedProject.progress >= 70
                            ? ACCENTURE_COLORS.green
                            : ACCENTURE_COLORS.corePurple1,
                        },
                      }}
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: darkMode ? '#ffffff' : ACCENTURE_COLORS.black
                      }}
                    >
                      {selectedProject.progress}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {/* Project Dates */}
              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={6}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: darkMode ? 'rgba(255,255,255,0.7)' : ACCENTURE_COLORS.darkGray,
                      fontWeight: 500,
                      display: 'block',
                      mb: 0.5
                    }}
                  >
                    Start Date
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      color: ACCENTURE_COLORS.black
                    }}
                  >
                    {new Date(selectedProject.assignedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: darkMode ? 'rgba(255,255,255,0.7)' : ACCENTURE_COLORS.darkGray,
                      fontWeight: 500,
                      display: 'block',
                      mb: 0.5
                    }}
                  >
                    Due Date
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      color: ACCENTURE_COLORS.black
                    }}
                  >
                    {new Date(selectedProject.dueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Typography>
                </Grid>
              </Grid>
              
              {/* Team Members */}
              <Box sx={{ mt: 2 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: ACCENTURE_COLORS.darkGray,
                    fontWeight: 500,
                    display: 'block',
                    mb: 1
                  }}
                >
                  Team Members ({selectedProject.team.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedProject.team.map((member, index) => (
                    <Chip
                      key={index}
                      avatar={
                        <Avatar 
                          alt={member.name} 
                          src={member.avatar || undefined}
                          sx={{
                            bgcolor: !member.avatar ? [
                              ACCENTURE_COLORS.corePurple1, 
                              ACCENTURE_COLORS.accentPurple3, 
                              ACCENTURE_COLORS.blue, 
                              ACCENTURE_COLORS.accentPurple2
                            ][index % 4] : undefined
                          }}
                        >
                          {!member.avatar && member.name.charAt(0).toUpperCase()}
                        </Avatar>
                      }
                      label={member.name}
                      size="small"
                      sx={{
                        bgcolor: alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.1 : 0.05),
                        border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.2 : 0.1)}`,
                        height: 30
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions sx={{ p: 2.5, pt: 2, borderTop: darkMode ? `1px solid rgba(255,255,255,0.12)` : `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}` }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              ...outlineButtonStyles,
              color: dialogAction === 'delete' 
                ? (darkMode ? 'rgba(255,255,255,0.7)' : ACCENTURE_COLORS.darkGray) 
                : ACCENTURE_COLORS.corePurple1,
              borderColor: dialogAction === 'delete' 
                ? (darkMode ? 'rgba(255,255,255,0.7)' : ACCENTURE_COLORS.darkGray) 
                : ACCENTURE_COLORS.corePurple1,
            }}
          >
            {dialogAction === "view" ? "Close" : "Cancel"}
          </Button>
          
          {dialogAction === "delete" && (
            <Button
              onClick={handleConfirmAction}
              variant="contained"
              color="error"
              sx={{
                bgcolor: ACCENTURE_COLORS.red,
                color: 'white',
                fontWeight: 500,
                textTransform: 'none',
                px: 3,
                '&:hover': {
                  bgcolor: alpha(ACCENTURE_COLORS.red, 0.9),
                }
              }}
            >
              Delete
            </Button>
          )}
          
          {dialogAction === "edit" && (
            <Button
              onClick={handleCloseDialog}
              variant="contained"
              sx={{
                ...primaryButtonStyles,
                bgcolor: ACCENTURE_COLORS.corePurple1,
              }}
            >
              Save Changes
            </Button>
          )}
          
          {dialogAction === "view" && (
            <Button
              variant="contained"
              sx={{
                ...primaryButtonStyles,
                bgcolor: ACCENTURE_COLORS.corePurple1,
              }}
              endIcon={<LaunchIcon />}
              onClick={() => navigate(`/project-detail/${selectedProject.id}`)}
            >
              View Details
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Elegant Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: "100%",
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 2,
            '& .MuiAlert-icon': {
              fontSize: '1.2rem',
            },
            bgcolor: snackbar.severity === 'success' 
              ? ACCENTURE_COLORS.green 
              : snackbar.severity === 'error'
              ? ACCENTURE_COLORS.red
              : ACCENTURE_COLORS.blue
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectDashboard;