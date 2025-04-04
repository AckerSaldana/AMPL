// src/components/ProjectDashboard.jsx
import React, { useState, useEffect } from 'react';  // Asegúrate de incluir useEffect aquí
import { Box, Typography, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert } from '@mui/material';
import ProjectCard from '../components/ProjectCard.jsx';
import ProjectFilter from '../components/ProjectFilter.jsx';
import AddProjectButton from '../components/AddProjectButton.jsx';
import useAuth from '../hooks/useAuth';
import { supabase } from '../supabase/supabaseClient.js';

// Componente principal del dashboard
const ProjectDashboard = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState('');
  const { role } = useAuth(); 
  const [selectedProject, setSelectedProject] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [projects, setProjects] = useState([]);

  // Función para obtener proyectos de Supabase
  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('Project') // Nombre de la tabla
      .select('projectID, title, description, status, logo, progress, start_date, end_date'); // Los campos que necesitas

    if (error) {
      console.error('Error fetching projects:', error.message); // Imprimir el mensaje de error
      setSnackbar({
        open: true,
        message: `Error al cargar los proyectos: ${error.message}`,
        severity: 'error'
      });
    } else {
      const projectsWithFormattedData = data.map(project => ({
        id: project.projectID,
        title: project.title,
        description: project.description,
        status: project.status,
        logo: project.logo,
        team: [
          { name: 'Person 1', avatar: '' },
          { name: 'Person 2', avatar: '' },
          { name: 'Person 3', avatar: '' },
          { name: 'Person 4', avatar: '' }
        ],
        progress: project.progress,
        assignedDate: project.start_date,
        dueDate: project.end_date
      }));
      setProjects(projectsWithFormattedData);
    }
  };

  // Cargar proyectos al montar el componente
  useEffect(() => {
    fetchProjects();
  }, []);


  // Manejadores de eventos
  const handleAddProject = () => {
    // Aquí se abriría un formulario para crear un nuevo proyecto
    // Por ahora solo mostramos un mensaje
    setSnackbar({
      open: true,
      message: '¡Función de agregar proyecto implementada próximamente!',
      severity: 'info'
    });
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setDialogAction('edit');
    setOpenDialog(true);
  };

  const handleDeleteProject = (project) => {
    setSelectedProject(project);
    setDialogAction('delete');
    setOpenDialog(true);
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setDialogAction('view');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmAction = () => {
    if (dialogAction === 'delete' && selectedProject) {
      // Eliminar el proyecto del estado
      setProjects(projects.filter(p => p.id !== selectedProject.id));
      setSnackbar({
        open: true,
        message: `Proyecto "${selectedProject.title}" eliminado con éxito`,
        severity: 'success'
      });
    }
    setOpenDialog(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filtrar proyectos según el filtro activo
  const filteredProjects = projects.filter(project => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'Completed') return project.status === 'Completed';
    if (activeFilter === 'In Progress') return project.status === 'In Progress';
    if (activeFilter === 'On Hold') return project.status === 'On Hold';
    return true;
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '100%' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Projects
      </Typography>
      
      <Grid container spacing={3}>
        {/* Panel izquierdo - filtros y botón de agregar */}
        <Grid item xs={12} md={3} lg={2.5}>
          {/* Solo muestra el botón si el usuario es "manager" o "TFS" */}
          {(role === "manager" || role === "TFS") && (
            <Card variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
              <CardContent sx={{ py: 3 }}>
                <AddProjectButton onClick={handleAddProject} />
              </CardContent>
            </Card>
          )}

          
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ py: 1 }}>
              <ProjectFilter activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            </CardContent>
          </Card>
        </Grid>
        
        {/* Panel derecho - Tarjetas de proyectos */}
        <Grid item xs={12} md={9} lg={9.5}>
          <Grid container spacing={3}>
            {filteredProjects.length > 0 ? (
              filteredProjects.map(project => (
                <Grid item xs={12} sm={6} lg={4} key={project.id}>
                  <ProjectCard 
                    project={project}
                    onEdit={(role === 'manager' || role === 'TFS') ? handleEditProject : undefined}
                    onDelete={(role === 'manager' || role === 'TFS') ? handleDeleteProject : undefined}
                    onViewDetails={handleViewDetails}
                  />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    p: 5, 
                    textAlign: 'center', 
                    bgcolor: 'background.paper',
                    border: '1px dashed',
                    borderColor: 'divider',
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
          {dialogAction === 'delete' 
            ? 'Confirmar eliminación' 
            : dialogAction === 'edit' 
              ? 'Editar proyecto' 
              : 'Detalles del proyecto'}
        </DialogTitle>
        <DialogContent>
          {dialogAction === 'delete' && (
            <Typography>
              ¿Estás seguro de que deseas eliminar el proyecto "{selectedProject?.title}"? Esta acción no se puede deshacer.
            </Typography>
          )}
          {dialogAction === 'edit' && (
            <Typography>
              Formulario de edición (implementación futura)
            </Typography>
          )}
          {dialogAction === 'view' && (
            <Box>
              <Typography variant="h6">{selectedProject?.title}</Typography>
              <Typography variant="body1">Estado: {selectedProject?.status}</Typography>
              <Typography variant="body1">Progreso: {selectedProject?.progress}%</Typography>
              <Typography variant="body2">Fecha asignada: {selectedProject?.assignedDate}</Typography>
              <Typography variant="body2">Fecha límite: {selectedProject?.dueDate}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {dialogAction === 'view' ? 'Cerrar' : 'Cancelar'}
          </Button>
          {dialogAction === 'delete' && (
            <Button onClick={handleConfirmAction} color="error" variant="contained">
              Eliminar
            </Button>
          )}
          {dialogAction === 'edit' && (
            <Button onClick={handleCloseDialog} color="primary" variant="contained">
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectDashboard;