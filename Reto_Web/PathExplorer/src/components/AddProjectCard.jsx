import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  useTheme,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  Card,
  CardContent,
  Divider
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

export const AddProjectCard = ({ roles, onEditRole, onDeleteRole }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Datos del proyecto
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    status: "Not Started",
    priority: "High",
    start_date: new Date().toISOString().split('T')[0], // Formato: YYYY-MM-DD
    end_date: "", 
    client_id: null, // Se asignará si se selecciona un cliente
    progress: 0 // Proyecto recién creado: 0% de progreso
  });

  // Estados para manejo de UI
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Cargar clientes de la base de datos
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoadingClients(true);
        const { data, error } = await supabase
          .from("Client")
          .select("client_id, name");

        if (error) throw error;
        setClients(data || []);
      } catch (err) {
        console.error("Error fetching clients:", err);
        setSnackbar({
          open: true,
          message: "Error al cargar los clientes",
          severity: "error",
        });
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  // Handler para cambios en los campos del proyecto
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectData({
      ...projectData,
      [name]: value,
    });
  };

// Función para crear el proyecto temporalmente
// Función para crear el proyecto temporalmente
// Función actualizada para "crear" temporalmente el proyecto
const handleCreateTemporaryProject = () => {
  // Validar que haya un título
  if (!projectData.title.trim()) {
    setSnackbar({
      open: true,
      message: "Por favor, ingresa un título para el proyecto",
      severity: "warning",
    });
    return;
  }

  // Validar que haya al menos un rol
  if (roles.length === 0) {
    setSnackbar({
      open: true,
      message: "Por favor, agrega al menos un rol al proyecto",
      severity: "warning",
    });
    return;
  }

  try {
    setLoading(true);

    // En lugar de crear el proyecto en la base de datos,
    // simplemente guardar todos los datos en localStorage
    const tempProjectData = {
      // Datos del proyecto
      projectData: {
        title: projectData.title,
        description: projectData.description,
        status: projectData.status,
        priority: projectData.priority,
        start_date: projectData.start_date,
        end_date: projectData.end_date || null,
        client_id: projectData.client_id,
        progress: projectData.progress
      },
      // Array de roles
      roles: roles,
      // Timestamp para identificación única (simular ID)
      tempId: Date.now()
    };

    // Guardar en localStorage
    localStorage.setItem("tempProject", JSON.stringify(tempProjectData));

    // Mensaje de éxito
    setSnackbar({
      open: true,
      message: "Proyecto preparado. Continúa para asignar roles.",
      severity: "success",
    });

    // Navegar a la pantalla de asignación
    setTimeout(() => {
      navigate("/role-assign");
    }, 1000);
  } catch (error) {
    console.error("Error preparing project:", error);
    setSnackbar({
      open: true,
      message: `Error al preparar el proyecto: ${error.message}`,
      severity: "error",
    });
  } finally {
    setLoading(false);
  }
};

  const handleCancel = () => {
    // Puedes navegar de vuelta a la página de proyectos o mostrar un diálogo de confirmación
    navigate("/projects");
  };

  return (
    <Paper 
      sx={{ 
        height: "100%", 
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
        borderRadius: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Encabezado */}
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          py: 2,
          px: 3,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
        }}
      >
        <Typography variant="h6" fontWeight={600} color="white">
          Add a project
        </Typography>
      </Box>

      {/* Contenido principal - con flex-grow para que ocupe el espacio disponible */}
      <Box sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Contenido scrollable */}
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          <Box mb={3}>
            <Typography fontWeight={600} mb={1} color="text.primary">
              Project title
            </Typography>
            <TextField
              fullWidth
              placeholder="Add project title here..."
              size="small"
              name="title"
              value={projectData.title}
              onChange={handleInputChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                },
              }}
            />
          </Box>

          <Box mb={3}>
            <Typography fontWeight={600} mb={1} color="text.primary">
              Description
            </Typography>
            <TextField
              fullWidth
              placeholder="Add a description here..."
              multiline
              rows={4}
              name="description"
              value={projectData.description}
              onChange={handleInputChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                },
              }}
            />
          </Box>

          <Box display="flex" gap={3} mb={3}>
            <Box flex={1}>
              <Typography fontWeight={600} mb={1} color="text.primary">
                Status
              </Typography>
              <TextField
                select
                fullWidth
                value={projectData.status}
                name="status"
                onChange={handleInputChange}
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                  },
                }}
              >
                <MenuItem value="Not Started">Not Started</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>
            </Box>
            <Box flex={1}>
              <Typography fontWeight={600} mb={1} color="text.primary">
                Priority
              </Typography>
              <TextField
                select
                fullWidth
                value={projectData.priority}
                name="priority"
                onChange={handleInputChange}
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                  },
                }}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </TextField>
            </Box>
          </Box>

          <Box display="flex" gap={3} mb={3}>
            <Box flex={1}>
              <Typography fontWeight={600} mb={1} color="text.primary">
                Start Date
              </Typography>
              <TextField
                fullWidth
                type="date"
                name="start_date"
                value={projectData.start_date}
                onChange={handleInputChange}
                size="small"
                InputProps={{
                  sx: {
                    borderRadius: 1,
                  },
                }}
              />
            </Box>
            <Box flex={1}>
              <Typography fontWeight={600} mb={1} color="text.primary">
                End Date
              </Typography>
              <TextField
                fullWidth
                type="date"
                name="end_date"
                value={projectData.end_date}
                onChange={handleInputChange}
                size="small"
                InputProps={{
                  sx: {
                    borderRadius: 1,
                  },
                }}
              />
            </Box>
          </Box>

          {/* Selección de cliente */}
          <Box mb={3}>
            <Typography fontWeight={600} mb={1} color="text.primary">
              Client
            </Typography>
            <TextField
              select
              fullWidth
              value={projectData.client_id || ""}
              name="client_id"
              onChange={handleInputChange}
              size="small"
              disabled={loadingClients}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                },
              }}
            >
              <MenuItem value="">-- Select Client --</MenuItem>
              {clients.map((client) => (
                <MenuItem key={client.client_id} value={client.client_id}>
                  {client.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Sección de roles */}
          <Box mb={3}>
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              mb={1.5}
            >
              <Typography fontWeight={600} color="text.primary">
                Project Roles
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {roles.length} {roles.length === 1 ? 'role' : 'roles'} added
              </Typography>
            </Box>
            
            {/* Lista de roles */}
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                p: 0,
                maxHeight: 300,
                overflowY: "auto",
              }}
            >
              {roles.length > 0 ? (
                roles.map((role, index) => (
                  <Card
                    key={role.id}
                    variant="outlined"
                    sx={{ 
                      mb: index < roles.length - 1 ? 1 : 0,
                      mx: 1, 
                      mt: index === 0 ? 1 : 0,
                      borderRadius: 1,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                    }}
                  >
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {role.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {role.area} • {role.yearsOfExperience || 0} years experience
                          </Typography>
                          
                          {/* Mostrar skills como chips */}
                          {role.skills && role.skills.length > 0 && (
                            <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {role.skills.map((skill, idx) => (
                                <Chip
                                  key={idx}
                                  label={`${skill.name} (${skill.years}y)`}
                                  size="small"
                                  sx={{ 
                                    height: 24,
                                    fontSize: "0.7rem", 
                                    bgcolor: theme.palette.primary.light,
                                    color: "white"
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                        
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton 
                            size="small"
                            onClick={() => onEditRole(role)}
                            sx={{ 
                              color: theme.palette.primary.main,
                              bgcolor: theme.palette.primary.light + '20',
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => onDeleteRole(role.id)}
                            sx={{ 
                              color: "white",
                              backgroundColor: theme.palette.error.main,
                              width: 28,
                              height: 28,
                              '&:hover': {
                                backgroundColor: theme.palette.error.dark,
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      {/* Mostrar descripción si existe */}
                      {role.description && (
                        <Box sx={{ mt: 1 }}>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                            {role.description.length > 120 
                              ? `${role.description.slice(0, 120)}...` 
                              : role.description}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    No roles added yet. Use the form on the right to create your first role.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Contenedor para los botones - Posición fija en la parte inferior */}
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "center",
            pt: 3,
            mt: "auto", // Empuja hacia abajo
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateTemporaryProject}
            disabled={loading}
            sx={{ 
              minWidth: 110, 
              mx: 1, 
              py: 1,
              px: 3, 
              borderRadius: 1,
              textTransform: "uppercase",
              fontWeight: 600,
              backgroundColor: theme.palette.primary.main,
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "ASSIGN"
            )}
          </Button>
          <Button
            variant="contained"
            onClick={handleCancel}
            disabled={loading}
            sx={{ 
              minWidth: 110, 
              mx: 1, 
              py: 1,
              px: 3, 
              borderRadius: 1,
              backgroundColor: theme.palette.grey[700],
              "&:hover": {
                backgroundColor: theme.palette.grey[800],
              },
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            CANCEL
          </Button>
        </Box>
      </Box>

      {/* Snackbar para mostrar mensajes */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};