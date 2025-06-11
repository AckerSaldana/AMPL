import React, { useState, useEffect } from "react";
import {
  Box,
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
  Divider,
  Stack,
  Fade
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BusinessIcon from "@mui/icons-material/Business";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { 
  ACCENTURE_COLORS, 
  formFieldStyles, 
  primaryButtonStyles, 
  outlineButtonStyles,
  statusChipStyles,
  chipStyles
} from "../styles/styles";
import { useDarkMode } from "../contexts/DarkModeContext";

// Modificado para usar props: roles, onEditRole, onDeleteRole
export const AddProjectCard = ({ roles, onEditRole, onDeleteRole }) => {
  const theme = useTheme();
  const { darkMode } = useDarkMode();
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

      // Preparar los roles con el formato correcto para el matching (sin yearsOfExperience)
      const formattedRoles = roles.map(role => ({
        id: role.id,
        name: role.name,
        area: role.area,
        description: role.description,
        skills: role.skills.map(skill => ({
          id: skill.id,
          skill_ID: skill.id, // Asegurar compatibilidad
          name: skill.name,
          years: skill.years,
          importance: skill.importance || 1
        }))
      }));

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
        roles: formattedRoles,
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
    navigate("/projects");
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Encabezado */}
      <Typography variant="h6" fontWeight={600} sx={{ color: darkMode ? '#ffffff' : ACCENTURE_COLORS.corePurple3 }} gutterBottom>
        Project Details
      </Typography>
      <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary', mb: 3 }}>
        Fill in the basic information about your new project
      </Typography>

      {/* Contenido principal */}
      <Box sx={{ mb: 4, flexGrow: 1, overflow: "auto" }}>
        <Stack spacing={3}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <AssignmentIcon sx={{ color: ACCENTURE_COLORS.corePurple2, mr: 1, fontSize: 18 }} />
              <Typography fontWeight={600} sx={{ color: darkMode ? '#ffffff' : 'text.primary' }}>
                Project title
              </Typography>
            </Box>
            <TextField
              fullWidth
              placeholder="Add project title here..."
              size="small"
              name="title"
              value={projectData.title}
              onChange={handleInputChange}
              sx={{
                ...formFieldStyles,
                '& .MuiOutlinedInput-root': {
                  ...formFieldStyles['& .MuiOutlinedInput-root'],
                  color: darkMode ? '#ffffff' : 'inherit',
                  '& fieldset': {
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0,0,0,0.06)',
                  },
                  '&:hover fieldset': {
                    borderColor: darkMode ? 'rgba(161, 0, 255, 0.6)' : `${ACCENTURE_COLORS.corePurple1}40`,
                  },
                  '&.Mui-focused': {
                    ...formFieldStyles['& .MuiOutlinedInput-root']['&.Mui-focused'],
                    '& fieldset': {
                      borderColor: ACCENTURE_COLORS.corePurple1,
                    },
                  },
                },
                '& .MuiInputBase-input': {
                  ...formFieldStyles['& .MuiInputBase-input'],
                  '&::placeholder': {
                    color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                    opacity: 1
                  }
                }
              }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
            <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "45%" } }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <EventIcon sx={{ color: ACCENTURE_COLORS.corePurple2, mr: 1, fontSize: 18 }} />
                <Typography fontWeight={600} sx={{ color: darkMode ? '#ffffff' : 'text.primary' }}>
                  Start Date
                </Typography>
              </Box>
              <TextField
                fullWidth
                type="date"
                name="start_date"
                value={projectData.start_date}
                onChange={handleInputChange}
                size="small"
                sx={{
                  ...formFieldStyles,
                  '& .MuiOutlinedInput-root': {
                    ...formFieldStyles['& .MuiOutlinedInput-root'],
                    color: darkMode ? '#ffffff' : 'inherit',
                    '& fieldset': {
                      borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0,0,0,0.06)',
                    },
                    '&:hover fieldset': {
                      borderColor: darkMode ? 'rgba(161, 0, 255, 0.6)' : `${ACCENTURE_COLORS.corePurple1}40`,
                    },
                    '&.Mui-focused': {
                      ...formFieldStyles['& .MuiOutlinedInput-root']['&.Mui-focused'],
                      '& fieldset': {
                        borderColor: ACCENTURE_COLORS.corePurple1,
                      },
                    },
                  },
                  '& .MuiInputBase-input': {
                    ...formFieldStyles['& .MuiInputBase-input'],
                    color: darkMode ? '#ffffff' : 'inherit',
                    '&::-webkit-calendar-picker-indicator': {
                      filter: darkMode ? 'invert(1)' : 'none',
                    }
                  }
                }}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "45%" } }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <EventIcon sx={{ color: ACCENTURE_COLORS.corePurple2, mr: 1, fontSize: 18 }} />
                <Typography fontWeight={600} sx={{ color: darkMode ? '#ffffff' : 'text.primary' }}>
                  End Date
                </Typography>
              </Box>
              <TextField
                fullWidth
                type="date"
                name="end_date"
                value={projectData.end_date}
                onChange={handleInputChange}
                size="small"
                sx={{
                  ...formFieldStyles,
                  '& .MuiOutlinedInput-root': {
                    ...formFieldStyles['& .MuiOutlinedInput-root'],
                    color: darkMode ? '#ffffff' : 'inherit',
                    '& fieldset': {
                      borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0,0,0,0.06)',
                    },
                    '&:hover fieldset': {
                      borderColor: darkMode ? 'rgba(161, 0, 255, 0.6)' : `${ACCENTURE_COLORS.corePurple1}40`,
                    },
                    '&.Mui-focused': {
                      ...formFieldStyles['& .MuiOutlinedInput-root']['&.Mui-focused'],
                      '& fieldset': {
                        borderColor: ACCENTURE_COLORS.corePurple1,
                      },
                    },
                  },
                  '& .MuiInputBase-input': {
                    ...formFieldStyles['& .MuiInputBase-input'],
                    color: darkMode ? '#ffffff' : 'inherit',
                    '&::-webkit-calendar-picker-indicator': {
                      filter: darkMode ? 'invert(1)' : 'none',
                    }
                  }
                }}
              />
            </Box>
          </Box>

          {/* Selección de cliente */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <BusinessIcon sx={{ color: ACCENTURE_COLORS.corePurple2, mr: 1, fontSize: 18 }} />
              <Typography fontWeight={600} sx={{ color: darkMode ? '#ffffff' : 'text.primary' }}>
                Client
              </Typography>
            </Box>
            <TextField
              select
              fullWidth
              value={projectData.client_id || ""}
              name="client_id"
              onChange={handleInputChange}
              size="small"
              disabled={loadingClients}
              sx={{
                ...formFieldStyles,
                '& .MuiOutlinedInput-root': {
                  ...formFieldStyles['& .MuiOutlinedInput-root'],
                  color: darkMode ? '#ffffff' : 'inherit',
                  '& fieldset': {
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0,0,0,0.06)',
                  },
                  '&:hover fieldset': {
                    borderColor: darkMode ? 'rgba(161, 0, 255, 0.6)' : `${ACCENTURE_COLORS.corePurple1}40`,
                  },
                  '&.Mui-focused': {
                    ...formFieldStyles['& .MuiOutlinedInput-root']['&.Mui-focused'],
                    '& fieldset': {
                      borderColor: ACCENTURE_COLORS.corePurple1,
                    },
                  },
                }
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

          <Box sx={{ display: "flex", gap: 2, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
            <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "45%" } }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <PriorityHighIcon sx={{ color: ACCENTURE_COLORS.corePurple2, mr: 1, fontSize: 18 }} />
                <Typography fontWeight={600} sx={{ color: darkMode ? '#ffffff' : 'text.primary' }}>
                  Priority
                </Typography>
              </Box>
              <TextField
                select
                fullWidth
                value={projectData.priority}
                name="priority"
                onChange={handleInputChange}
                size="small"
                sx={{
                  ...formFieldStyles,
                  '& .MuiOutlinedInput-root': {
                    ...formFieldStyles['& .MuiOutlinedInput-root'],
                    color: darkMode ? '#ffffff' : 'inherit',
                    '& fieldset': {
                      borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0,0,0,0.06)',
                    },
                    '&:hover fieldset': {
                      borderColor: darkMode ? 'rgba(161, 0, 255, 0.6)' : `${ACCENTURE_COLORS.corePurple1}40`,
                    },
                    '&.Mui-focused': {
                      ...formFieldStyles['& .MuiOutlinedInput-root']['&.Mui-focused'],
                      '& fieldset': {
                        borderColor: ACCENTURE_COLORS.corePurple1,
                      },
                    },
                  }
                }}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "45%" } }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Box 
                  component="span" 
                  sx={{ 
                    width: 18, 
                    height: 18, 
                    borderRadius: "50%", 
                    bgcolor: ACCENTURE_COLORS.corePurple2, 
                    mr: 1 
                  }}
                />
                <Typography fontWeight={600} sx={{ color: darkMode ? '#ffffff' : 'text.primary' }}>
                  Status
                </Typography>
              </Box>
              <TextField
                select
                fullWidth
                value={projectData.status}
                name="status"
                onChange={handleInputChange}
                size="small"
                sx={{
                  ...formFieldStyles,
                  '& .MuiOutlinedInput-root': {
                    ...formFieldStyles['& .MuiOutlinedInput-root'],
                    color: darkMode ? '#ffffff' : 'inherit',
                    '& fieldset': {
                      borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0,0,0,0.06)',
                    },
                    '&:hover fieldset': {
                      borderColor: darkMode ? 'rgba(161, 0, 255, 0.6)' : `${ACCENTURE_COLORS.corePurple1}40`,
                    },
                    '&.Mui-focused': {
                      ...formFieldStyles['& .MuiOutlinedInput-root']['&.Mui-focused'],
                      '& fieldset': {
                        borderColor: ACCENTURE_COLORS.corePurple1,
                      },
                    },
                  }
                }}
              >
                <MenuItem value="Not Started">Not Started</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>
            </Box>
          </Box>

          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <DescriptionIcon sx={{ color: ACCENTURE_COLORS.corePurple2, mr: 1, fontSize: 18 }} />
              <Typography fontWeight={600} sx={{ color: darkMode ? '#ffffff' : 'text.primary' }}>
                Description
              </Typography>
            </Box>
            <TextField
              fullWidth
              placeholder="Add a description here..."
              multiline
              rows={3}
              name="description"
              value={projectData.description}
              onChange={handleInputChange}
              sx={{
                ...formFieldStyles,
                '& .MuiOutlinedInput-root': {
                  ...formFieldStyles['& .MuiOutlinedInput-root'],
                  color: darkMode ? '#ffffff' : 'inherit',
                  '& fieldset': {
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0,0,0,0.06)',
                  },
                  '&:hover fieldset': {
                    borderColor: darkMode ? 'rgba(161, 0, 255, 0.6)' : `${ACCENTURE_COLORS.corePurple1}40`,
                  },
                  '&.Mui-focused': {
                    ...formFieldStyles['& .MuiOutlinedInput-root']['&.Mui-focused'],
                    '& fieldset': {
                      borderColor: ACCENTURE_COLORS.corePurple1,
                    },
                  },
                },
                '& .MuiInputBase-input': {
                  ...formFieldStyles['& .MuiInputBase-input'],
                  '&::placeholder': {
                    color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                    opacity: 1
                  }
                }
              }}
            />
          </Box>
        </Stack>
      </Box>

      {/* Sección de roles */}
      <Box sx={{ mb: 4, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography 
            variant="h6" 
            fontWeight={600} 
            sx={{ color: darkMode ? '#ffffff' : ACCENTURE_COLORS.corePurple3 }}
          >
            Project Roles
          </Typography>
          <Chip 
            label={`${roles.length} ${roles.length === 1 ? 'role' : 'roles'}`}
            size="small"
            sx={{ 
              ...chipStyles(),
              fontWeight: 600,
              backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.15)' : ACCENTURE_COLORS.accentPurple5,
              color: darkMode ? '#a67aff' : ACCENTURE_COLORS.corePurple2,
              border: darkMode ? '1px solid rgba(161, 0, 255, 0.3)' : 'none'
            }}
          />
        </Box>
        
        {/* Lista de roles */}
        <Box
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
            bgcolor: darkMode ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.6)",
            p: 0,
            flexGrow: 1,
            minHeight: 200,
            overflow: "hidden",
            position: "relative",
            boxShadow: darkMode ? "inset 0 1px 3px rgba(255,255,255,0.02)" : "inset 0 1px 3px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              px: 2,
              py: 1,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: darkMode ? "rgba(161, 0, 255, 0.3)" : ACCENTURE_COLORS.accentPurple5,
                borderRadius: "4px",
                "&:hover": {
                  backgroundColor: darkMode ? "rgba(161, 0, 255, 0.5)" : ACCENTURE_COLORS.accentPurple4,
                }
              },
            }}
          >
            {roles.length > 0 ? (
              <Stack spacing={1.5} sx={{ py: 1 }}>
                {roles.map((role, index) => (
                  <Fade key={role.id} in={true} timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
                    <Card
                      variant="outlined"
                      sx={{ 
                        borderRadius: 2,
                        boxShadow: darkMode ? "0 1px 3px rgba(255,255,255,0.03)" : "0 1px 3px rgba(0,0,0,0.03)",
                        borderColor: darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)",
                        bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'transparent',
                        transition: "all 0.2s ease",
                        "&:hover": {
                          boxShadow: darkMode ? "0 3px 8px rgba(255,255,255,0.08)" : "0 3px 8px rgba(0,0,0,0.08)",
                          borderColor: ACCENTURE_COLORS.accentPurple4,
                          transform: "translateY(-2px)"
                        }
                      }}
                    >
                      <CardContent sx={{ p: "12px 16px", "&:last-child": { pb: "12px" } }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600} sx={{ color: darkMode ? '#ffffff' : ACCENTURE_COLORS.corePurple3 }}>
                                {role.name}
                              </Typography>
                              <Chip 
                                label={role.area} 
                                size="small" 
                                sx={{ 
                                  height: 20, 
                                  fontSize: "0.625rem",
                                  fontWeight: 500,
                                  color: darkMode ? '#a67aff' : ACCENTURE_COLORS.corePurple2,
                                  bgcolor: darkMode ? 'rgba(161, 0, 255, 0.15)' : `${ACCENTURE_COLORS.accentPurple5}90`,
                                  border: darkMode ? '1px solid rgba(161, 0, 255, 0.3)' : 'none'
                                }}
                              />
                            </Box>
                            
                            {/* Mostrar skills como chips */}
                            {role.skills && role.skills.length > 0 && (
                              <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {role.skills.map((skill, idx) => (
                                  <Chip
                                    key={idx}
                                    label={`${skill.name} (${skill.years}y)`}
                                    size="small"
                                    sx={{ 
                                      height: 20,
                                      fontSize: "0.625rem", 
                                      fontWeight: 500,
                                      bgcolor: darkMode ? 'rgba(161, 0, 255, 0.08)' : `${ACCENTURE_COLORS.corePurple1}15`,
                                      color: darkMode ? 'rgba(255, 255, 255, 0.7)' : ACCENTURE_COLORS.corePurple2,
                                      border: darkMode ? '1px solid rgba(161, 0, 255, 0.2)' : `1px solid ${ACCENTURE_COLORS.accentPurple4}30`
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
                                color: ACCENTURE_COLORS.corePurple1,
                                bgcolor: darkMode ? 'rgba(161, 0, 255, 0.15)' : `${ACCENTURE_COLORS.accentPurple5}90`,
                                width: 28,
                                height: 28,
                                '&:hover': {
                                  bgcolor: darkMode ? 'rgba(161, 0, 255, 0.25)' : ACCENTURE_COLORS.accentPurple5,
                                }
                              }}
                            >
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => onDeleteRole(role.id)}
                              sx={{ 
                                color: "white",
                                backgroundColor: ACCENTURE_COLORS.red,
                                width: 28,
                                height: 28,
                                opacity: 0.8,
                                '&:hover': {
                                  backgroundColor: ACCENTURE_COLORS.red,
                                  opacity: 1
                                }
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        {/* Mostrar descripción si existe */}
                        {role.description && (
                          <Box sx={{ mt: 1 }}>
                            <Divider sx={{ my: 1, borderColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)" }} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontStyle: "italic",
                                fontSize: "0.75rem",
                                lineHeight: 1.4,
                                color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
                              }}
                            >
                              {role.description.length > 120 
                                ? `${role.description.slice(0, 120)}...` 
                                : role.description}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Fade>
                ))}
              </Stack>
            ) : (
              <Box sx={{ 
                p: 3, 
                textAlign: "center", 
                height: "100%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                minHeight: 150
              }}>
                <Box>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 500,
                      mb: 1,
                      color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
                    }}
                  >
                    No roles added yet
                  </Typography>
                  <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary' }}>
                    Use the form on the right to create your first role
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Contenedor para los botones */}
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "center",
          pt: 2,
          mt: "auto",
        }}
      >
        <Button
          variant="contained"
          onClick={handleCreateTemporaryProject}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{ 
            ...primaryButtonStyles,
            minWidth: 130,
            mx: 1,
            backgroundColor: ACCENTURE_COLORS.corePurple1,
            "&:hover": {
              backgroundColor: ACCENTURE_COLORS.corePurple2,
            }
          }}
        >
          ASSIGN ROLES
        </Button>
        <Button
          variant="outlined"
          onClick={handleCancel}
          disabled={loading}
          sx={{ 
            ...outlineButtonStyles,
            minWidth: 130,
            mx: 1,
            borderColor: ACCENTURE_COLORS.accentPurple1,
            color: ACCENTURE_COLORS.accentPurple1,
            "&:hover": {
              borderColor: ACCENTURE_COLORS.accentPurple1,
              backgroundColor: `${ACCENTURE_COLORS.accentPurple1}10`,
            }
          }}
        >
          CANCEL
        </Button>
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
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};