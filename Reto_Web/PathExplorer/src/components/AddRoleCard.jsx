import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  useTheme,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { supabase } from "../supabase/supabaseClient";

export const AddRoleCard = ({ onRoleCreated, onCancel, initialRole }) => {
  const theme = useTheme();
  
  // Estado para el formulario del rol, inicializado con los datos existentes si los hay
  const [roleData, setRoleData] = useState({
    name: "",
    area: "FRONTEND",
    yearsOfExperience: "",
    description: ""
  });
  
  // Estados para skills
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Inicializar las skills seleccionadas con las del rol existente
  const [selectedSkills, setSelectedSkills] = useState([]);

  // Efecto para cargar los datos del rol cuando cambia initialRole
  useEffect(() => {
    if (initialRole) {
      // Si estamos editando un rol, cargamos sus datos
      setRoleData({
        name: initialRole.name || "",
        area: initialRole.area || "FRONTEND",
        yearsOfExperience: initialRole.yearsOfExperience || "",
        description: initialRole.description || ""
      });
      setSelectedSkills(initialRole.skills || []);
    } else {
      // Si estamos creando un nuevo rol, limpiamos el formulario
      resetForm();
    }
  }, [initialRole]);

  // Función para resetear el formulario
  const resetForm = () => {
    setRoleData({
      name: "",
      area: "FRONTEND",
      yearsOfExperience: "",
      description: ""
    });
    setSelectedSkills([]);
  };

  // Cargar las skills desde la base de datos al montar el componente
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('Skill')
          .select('skill_ID, name, description');
        
        if (error) {
          console.error('Error fetching skills:', error);
          setError('Error al cargar las habilidades. Por favor, intenta de nuevo.');
          return;
        }
        
        // Transformar los datos para tener el formato esperado
        if (data) {
          const formattedSkills = data.map(skill => ({
            id: skill.skill_ID,
            name: skill.name,
            description: skill.description || (
              parseInt(skill.skill_ID) % 2 === 0 ? "Component-based library" : "Framework"
            ) // Fallback a la descripción que tenía antes
          }));
          
          setAvailableSkills(formattedSkills);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Error inesperado. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteSkill = (index) => {
    setSelectedSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSkill = (skillName) => {
    // Verificar si la habilidad ya existe
    if (!selectedSkills.some(skill => skill.name === skillName)) {
      setSelectedSkills([...selectedSkills, { name: skillName, years: 1 }]);
      
      // Mostrar snackbar de confirmación
      setSnackbar({
        open: true,
        message: `Habilidad "${skillName}" agregada correctamente.`,
        severity: "success",
      });
    } else {
      // Mostrar mensaje si ya está en la lista
      setSnackbar({
        open: true,
        message: `La habilidad "${skillName}" ya está en la lista.`,
        severity: "warning",
      });
    }
  };

  const handleChangeYears = (index, value) => {
    const newSkills = [...selectedSkills];
    newSkills[index].years = value;
    setSelectedSkills(newSkills);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Función para crear o actualizar el rol
  const handleCreateRole = async () => {
    // Validación básica
    if (!roleData.name.trim()) {
      setSnackbar({
        open: true,
        message: "Por favor, ingresa un nombre para el rol",
        severity: "error",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      // En un caso real, aquí podrías guardar el rol en la base de datos
      // Por ahora, simplemente simulamos una demora y devolvemos el rol creado/actualizado
      
      // Simular una demora para mostrar el estado de carga
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Crear o actualizar el objeto de rol con todos los datos
      const roleObject = {
        name: roleData.name,
        area: roleData.area,
        yearsOfExperience: roleData.yearsOfExperience || 0,
        description: roleData.description,
        skills: selectedSkills,
        // Mantener el ID si estamos editando, o generar uno nuevo si estamos creando
        id: initialRole?.id || `role-${Date.now()}`
      };
      
      // Llamar a la función de callback con el rol
      if (onRoleCreated) {
        onRoleCreated(roleObject);
      }
      
      // Mostrar mensaje de éxito
      setSnackbar({
        open: true,
        message: `Rol "${roleData.name}" ${initialRole ? 'actualizado' : 'creado'} correctamente`,
        severity: "success",
      });

      // Si estamos creando un nuevo rol (no editando), limpiamos el formulario
      if (!initialRole) {
        resetForm();
      }
      
    } catch (error) {
      console.error("Error creating/updating role:", error);
      setSnackbar({
        open: true,
        message: `Error al ${initialRole ? 'actualizar' : 'crear'} el rol: ${error.message}`,
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
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
          {initialRole ? "Edit Role" : "Create Role"}
        </Typography>
      </Box>

      {/* Contenido Principal - con flex-grow para que ocupe el espacio disponible */}
      <Box sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Área scrollable principal */}
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Grid container spacing={3}>
            {/* Columna izquierda: Detalles del rol */}
            <Grid item xs={12} md={6}>
              <Box mb={3}>
                <Typography fontWeight={600} mb={1} color="text.primary">
                  Role name
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Frontend Developer"
                  size="small"
                  name="name"
                  value={roleData.name}
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
                  Area
                </Typography>
                <TextField
                  select
                  fullWidth
                  name="area"
                  value={roleData.area}
                  onChange={handleInputChange}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                    },
                  }}
                >
                  <MenuItem value="FRONTEND">FRONTEND</MenuItem>
                  <MenuItem value="BACKEND">BACKEND</MenuItem>
                  <MenuItem value="FULLSTACK">FULLSTACK</MenuItem>
                </TextField>
              </Box>
              
              <Box mb={3}>
                <Typography fontWeight={600} mb={1} color="text.primary">
                  Years of experience on the area
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="3"
                  name="yearsOfExperience"
                  value={roleData.yearsOfExperience}
                  onChange={handleInputChange}
                  size="small"
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
                  value={roleData.description}
                  onChange={handleInputChange}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                    },
                  }}
                />
              </Box>
            </Grid>
            
            {/* Columna derecha: Habilidades */}
            <Grid item xs={12} md={6}>
              <Box mb={3}>
                <Typography fontWeight={600} mb={1} color="text.primary">
                  Skill list
                </Typography>
                
                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={40} />
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                ) : (
                  <Box sx={{ 
                    maxHeight: "415px", 
                    overflowY: "auto",
                    "&::-webkit-scrollbar": {
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "rgba(0,0,0,0.05)",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: theme.palette.primary.light,
                      borderRadius: "4px",
                    },
                  }}>
                    {availableSkills.map((skill, index) => (
                      <Box
                        key={skill.id || index}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 1.5,
                          mb: 1,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                          },
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Box 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              borderRadius: "4px",
                              backgroundColor: theme.palette.primary.light,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: "bold",
                            }}
                          >
                            {skill.name ? skill.name[0] : 'S'}
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {skill.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {skill.description || (index % 2 === 0 ? "Component-based library" : "Framework")}
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleAddSkill(skill.name)}
                          sx={{
                            minWidth: "32px",
                            width: "32px",
                            height: "32px",
                            p: 0,
                            color: theme.palette.primary.main,
                            borderColor: theme.palette.primary.main,
                            borderRadius: 1,
                          }}
                        >
                          +
                        </Button>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
          
          {/* Skills Selected - Con scroll independiente */}
          <Box mb={3}>
            <Typography fontWeight={600} mb={1.5} color="text.primary">
              Skills selected
            </Typography>
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                maxHeight: "180px", // altura máxima fija
                overflow: "hidden", // oculta el contenido que excede el tamaño
              }}
            >
              <Box
                sx={{
                  maxHeight: "180px",
                  overflowY: "auto",
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "rgba(0,0,0,0.05)",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: theme.palette.primary.light,
                    borderRadius: "4px",
                  },
                }}
              >
                {selectedSkills.length > 0 ? (
                  selectedSkills.map((skill, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1.5,
                        borderBottom: index < selectedSkills.length - 1 ? "1px solid" : "none",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body2" fontWeight={500}>{skill.name}</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="caption" color="text.secondary">
                          Years of Experience
                        </Typography>
                        <TextField
                          size="small"
                          type="number"
                          value={skill.years}
                          onChange={(e) => handleChangeYears(index, e.target.value)}
                          InputProps={{
                            sx: { 
                              borderRadius: 1,
                              height: 32,
                              width: 60,
                            }
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteSkill(index)}
                          sx={{ 
                            color: "white",
                            backgroundColor: theme.palette.error.main,
                            width: 24,
                            height: 24,
                            '&:hover': {
                              backgroundColor: theme.palette.error.dark,
                            },
                            ml: 1
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      No skills selected yet
                    </Typography>
                  </Box>
                )}
              </Box>
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
            onClick={handleCreateRole}
            disabled={submitting}
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
            {submitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : initialRole ? (
              "UPDATE"
            ) : (
              "CREATE"
            )}
          </Button>
          <Button
            variant="contained"
            onClick={initialRole ? onCancel : resetForm}
            disabled={submitting}
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
            {initialRole ? "CANCEL" : "CLEAR"}
          </Button>
        </Box>
      </Box>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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
    </Paper>
  );
};