// src/components/ProjectDashboard.jsx
import React, { useState } from "react";
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
import { useNavigate } from "react-router-dom";

// Componente principal del dashboard
const ProjectDashboard = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Navigation component
  const navigate = useNavigate();

  // Datos de muestra - En una aplicación real vendría de una API
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "Discord function optimization",
      description: "Brief description of the project",
      status: "In Progress",
      logo: "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png",
      logoBackground: "#5865F2",
      team: [
        { name: "Person 1", avatar: "" },
        { name: "Person 2", avatar: "" },
        { name: "Person 3", avatar: "" },
        { name: "Person 4", avatar: "" },
      ],
      progress: 50,
      assignedDate: "21 Feb 2025",
      dueDate: "21 Oct 2025",
    },
    {
      id: 2,
      title: "Uber Eats function",
      description: "Brief description of the project",
      status: "In Progress",
      logo: "https://d3i4yxtzktqr9n.cloudfront.net/web-eats-v2/ee037401cb5d31b23cf780808ee4ec1f.svg",
      logoBackground: "#06C167",
      team: [
        { name: "Person 1", avatar: "" },
        { name: "Person 2", avatar: "" },
        { name: "Person 3", avatar: "" },
        { name: "Person 4", avatar: "" },
      ],
      progress: 75,
      assignedDate: "21 Feb 2025",
      dueDate: "21 Oct 2025",
    },
    {
      id: 3,
      title: "RFP MockUp",
      description: "Brief description of the project",
      status: "Completed",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg",
      logoBackground: "#006AD6",
      team: [
        { name: "Person 1", avatar: "" },
        { name: "Person 2", avatar: "" },
        { name: "Person 3", avatar: "" },
        { name: "Person 4", avatar: "" },
      ],
      progress: 100,
      assignedDate: "21 Feb 2025",
      dueDate: "21 Oct 2025",
    },
    {
      id: 4,
      title: "SuperCell New Game",
      description: "Brief description of the project",
      status: "Not Started",
      logo: "https://play-lh.googleusercontent.com/LByrur1mTmPeNr0ljI-uAUcct1rzmTve5Esau1SwoAzjHtZ3nliGwpYjcgklc9Au5g",
      logoBackground: "#000000",
      team: [
        { name: "Person 1", avatar: "" },
        { name: "Person 2", avatar: "" },
        { name: "Person 3", avatar: "" },
        { name: "Person 4", avatar: "" },
      ],
      progress: 0,
      assignedDate: "21 Feb 2025",
      dueDate: "21 Oct 2025",
    },
    {
      id: 5,
      title: "OpenAI implementation",
      description: "Brief description of the project",
      status: "In Progress",
      logo: "https://seeklogo.com/images/O/open-ai-logo-8B9BFEDC26-seeklogo.com.png",
      logoBackground: "#ffffff",
      team: [
        { name: "Person 1", avatar: "" },
        { name: "Person 2", avatar: "" },
        { name: "Person 3", avatar: "" },
        { name: "Person 4", avatar: "" },
      ],
      progress: 50,
      assignedDate: "21 Feb 2025",
      dueDate: "21 Oct 2025",
    },
    {
      id: 6,
      title: "Microsoft Copilot Assistant",
      description: "Brief description of the project",
      status: "In Progress",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
      logoBackground: "#ffffff",
      team: [
        { name: "Person 1", avatar: "" },
        { name: "Person 2", avatar: "" },
        { name: "Person 3", avatar: "" },
        { name: "Person 4", avatar: "" },
      ],
      progress: 25,
      assignedDate: "21 Feb 2025",
      dueDate: "21 Oct 2025",
    },
  ]);

  // Manejadores de eventos
  const handleAddProject = () => {
    navigate("/add-projects");
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setDialogAction("edit");
    setOpenDialog(true);
  };

  const handleDeleteProject = (project) => {
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

  const handleConfirmAction = () => {
    if (dialogAction === "delete" && selectedProject) {
      // Eliminar el proyecto del estado
      setProjects(projects.filter((p) => p.id !== selectedProject.id));
      setSnackbar({
        open: true,
        message: `Proyecto "${selectedProject.title}" eliminado con éxito`,
        severity: "success",
      });
    }
    setOpenDialog(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filtrar proyectos según el filtro activo
  const filteredProjects = projects.filter((project) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "completed") return project.status === "Completed";
    if (activeFilter === "ongoing") return project.status === "In Progress";
    if (activeFilter === "not-started") return project.status === "Not Started";
    return true;
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: "100%" }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Projects
      </Typography>

      <Grid container spacing={3}>
        {/* Panel izquierdo - filtros y botón de agregar */}
        <Grid item xs={12} md={3} lg={2.5}>
          <Card variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
            <CardContent sx={{ py: 3 }}>
              <AddProjectButton onClick={handleAddProject} />
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ py: 1 }}>
              <ProjectFilter
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Panel derecho - Tarjetas de proyectos */}
        <Grid item xs={12} md={9} lg={9.5}>
          <Grid container spacing={3}>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <Grid item xs={12} sm={6} lg={4} key={project.id}>
                  <ProjectCard
                    project={project}
                    onEdit={handleEditProject}
                    onDelete={handleDeleteProject}
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

      {/* Diálogo de confirmación */}
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

      {/* Snackbar para notificaciones */}
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
