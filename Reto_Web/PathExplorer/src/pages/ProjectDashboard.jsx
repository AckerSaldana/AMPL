import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import ProjectCard from "../components/ProjectCard.jsx";
import ProjectFilter from "../components/ProjectFilter.jsx";
import AddProjectButton from "../components/AddProjectButton.jsx";
import useAuth from "../hooks/useAuth";
import { supabase } from "../supabase/supabaseClient.js";
import { useNavigate } from "react-router-dom";

const ProjectDashboard = () => {
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
  const navigate = useNavigate();

  const fetchProjects = async () => {
    const { data: projectsData, error: projectsError } = await supabase
      .from("Project")
      .select(
        "projectID, title, description, status, logo, progress, start_date, end_date"
      );

    if (projectsError) {
      console.error("Error fetching projects:", projectsError.message);
      setSnackbar({
        open: true,
        message: `Error al cargar los proyectos: ${projectsError.message}`,
        severity: "error",
      });
      return;
    }

    const { data: userRolesData, error: rolesError } = await supabase
      .from("UserRole")
      .select("project_id, user_id, User:User(user_id, name, profile_pic)");

    if (rolesError) {
      console.error("Error fetching user roles:", rolesError.message);
      setSnackbar({
        open: true,
        message: `Error al cargar los equipos: ${rolesError.message}`,
        severity: "error",
      });
      return;
    }

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
    }));

    setProjects(combinedData);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = () => {
    navigate("/add-projects");
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setDialogAction("edit");
    setOpenDialog(true);
  };

  const handleDeleteProject = async (project) => {
    setSelectedProject(project);
    setDialogAction("delete");
    setOpenDialog(true);
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setDialogAction("view");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmAction = async () => {
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
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "completed") return project.status === "Completed";
    if (activeFilter === "ongoing") return project.status === "In Progress";
    if (activeFilter === "not-started") return project.status === "Not Started";
    if (activeFilter === "on-hold") return project.status === "On Hold";
    return true;
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: "100%" }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Projects
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3} lg={2.5}>
          {(role === "manager" || role === "TFS" || true) && (
            <Card variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
              <CardContent sx={{ py: 3 }}>
                <AddProjectButton onClick={handleAddProject} />
              </CardContent>
            </Card>
          )}

          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ py: 1 }}>
              <ProjectFilter
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={9} lg={9.5}>
          <Grid container spacing={3}>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <Grid item xs={12} sm={6} lg={4} key={project.id}>
                  <ProjectCard
                    project={project}
                    onEdit={
                      role === "manager" || role === "TFS"
                        ? handleEditProject
                        : undefined
                    }
                    onDelete={
                      role === "manager" || role === "TFS"
                        ? handleDeleteProject
                        : undefined
                    }
                    onViewDetails={handleViewDetails}
                  />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 5,
                    textAlign: "center",
                    bgcolor: "background.paper",
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    No hay proyectos que coincidan con el filtro seleccionado
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogAction === "delete"
            ? "Confirmar eliminación"
            : dialogAction === "edit"
            ? "Editar proyecto"
            : "Detalles del proyecto"}
        </DialogTitle>
        <DialogContent>
          {dialogAction === "delete" && (
            <Typography>
              ¿Estás seguro de que deseas eliminar el proyecto "
              {selectedProject?.title}"? Esta acción no se puede deshacer.
            </Typography>
          )}
          {dialogAction === "edit" && (
            <Typography>
              Formulario de edición (implementación futura)
            </Typography>
          )}
          {dialogAction === "view" && (
            <Box>
              <Typography variant="h6">{selectedProject?.title}</Typography>
              <Typography variant="body1">
                Estado: {selectedProject?.status}
              </Typography>
              <Typography variant="body1">
                Progreso: {selectedProject?.progress}%
              </Typography>
              <Typography variant="body2">
                Fecha asignada: {selectedProject?.assignedDate}
              </Typography>
              <Typography variant="body2">
                Fecha límite: {selectedProject?.dueDate}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {dialogAction === "view" ? "Cerrar" : "Cancelar"}
          </Button>
          {dialogAction === "delete" && (
            <Button
              onClick={handleConfirmAction}
              color="error"
              variant="contained"
            >
              Eliminar
            </Button>
          )}
          {dialogAction === "edit" && (
            <Button
              onClick={handleCloseDialog}
              color="primary"
              variant="contained"
            >
              Guardar cambios
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
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

export default ProjectDashboard;