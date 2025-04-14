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
  Snackbar,
  Alert,
  Chip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient"; // Make sure this path is correct

export const AddRoleCard = ({ onRoleCreated, onCancel, initialRole = null }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Estado para el rol
  const [roleData, setRoleData] = useState({
    id: Date.now(), // ID temporal
    name: "",
    area: "FRONTEND",
    yearsOfExperience: "",
    description: "",
    skills: []
  });

  // Estado para las skills disponibles de la base de datos
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);

  // Cargar datos del rol si estamos editando
  useEffect(() => {
    if (initialRole) {
      setRoleData({
        id: initialRole.id,
        name: initialRole.name || "",
        area: initialRole.area || "FRONTEND",
        yearsOfExperience: initialRole.yearsOfExperience || "",
        description: initialRole.description || "",
        skills: initialRole.skills?.map(skill => ({
          id: skill.id || skill.skill_ID, // Asegurar que tenemos un ID
          name: skill.name,
          years: skill.years
        })) || []
      });
    }
  }, [initialRole]);
  
  // Cargar skills desde la base de datos
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoadingSkills(true);
        const { data, error } = await supabase
          .from("Skill")
          .select("skill_ID, name, description, category, type");
        
        if (error) throw error;
        
        // Transformar datos para el formato que necesitamos
        const formattedSkills = data.map(skill => ({
          id: skill.skill_ID,
          name: skill.name,
          description: skill.description || skill.category || "Skill",
          type: skill.type || "Technical" // Por defecto es técnica si no hay valor
        }));
        
        setAvailableSkills(formattedSkills);
      } catch (error) {
        console.error("Error fetching skills:", error);
        setSnackbar({
          open: true,
          message: "Error cargando las habilidades",
          severity: "error",
        });
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchSkills();
  }, []);

  // Estados UI
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Handlers para el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoleData({
      ...roleData,
      [name]: value,
    });
  };

  // Manejar skills
  const handleDeleteSkill = (index) => {
    const newSkills = [...roleData.skills];
    newSkills.splice(index, 1);
    setRoleData({ ...roleData, skills: newSkills });
  };

  const handleAddSkill = (skillId) => {
    // Encontrar la skill por ID
    const skillToAdd = availableSkills.find(skill => skill.id === skillId);
    
    if (!skillToAdd) {
      console.error(`Skill with ID ${skillId} not found`);
      return;
    }
    
    // Verificar si la habilidad ya existe
    if (!roleData.skills.some(skill => skill.id === skillId)) {
      setRoleData({
        ...roleData,
        skills: [...roleData.skills, { 
          id: skillId, 
          skill_ID: skillId, // Añadir para compatibilidad
          name: skillToAdd.name,
          years: 1,
          importance: 1 // Añadir para compatibilidad con el API de matching
        }]
      });
    } else {
      // Mostrar mensaje de que la habilidad ya existe
      setSnackbar({
        open: true,
        message: "This skill is already in your list",
        severity: "info",
      });
    }
  };

  const handleChangeYears = (index, value) => {
    const newSkills = [...roleData.skills];
    newSkills[index].years = parseInt(value) || 0;
    setRoleData({ ...roleData, skills: newSkills });
  };

  // Enviar el formulario
  const handleSubmit = () => {
    // Validar datos
    if (!roleData.name.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a role name",
        severity: "warning",
      });
      return;
    }

    if (!roleData.yearsOfExperience) {
      setSnackbar({
        open: true,
        message: "Please enter years of experience",
        severity: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Preparar el rol con el formato esperado para RoleAssign
      const formattedRole = {
        id: roleData.id,
        name: roleData.name,
        area: roleData.area,
        yearsOfExperience: roleData.yearsOfExperience,
        description: roleData.description,
        skills: roleData.skills.map(skill => ({
          id: skill.id,
          skill_ID: skill.id, // Asegurar que tenemos skill_ID para compatibilidad
          name: skill.name,
          years: skill.years,
          importance: skill.importance || 1 // Asegurar que tenemos importancia para el matching
        }))
      };
      
      // Llamar al callback con los datos del rol
      if (typeof onRoleCreated === 'function') {
        onRoleCreated(formattedRole);
        
        // Si todo va bien, mostrar mensaje de éxito
        setSnackbar({
          open: true,
          message: initialRole 
            ? "Role updated successfully" 
            : "Role added successfully",
          severity: "success",
        });
        
        // Limpiar formulario si no estamos editando
        if (!initialRole) {
          setRoleData({
            id: Date.now(),
            name: "",
            area: "FRONTEND",
            yearsOfExperience: "",
            description: "",
            skills: []
          });
        }
      } else {
        console.error("onRoleCreated is not a function", onRoleCreated);
        throw new Error("Error al guardar el rol: onRoleCreated no es una función");
      }
    } catch (error) {
      console.error("Error saving role:", error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
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
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          <Grid container spacing={3}>
            {/* Columna izquierda: Detalles del rol */}
            <Grid item xs={12} md={6}>
              <Box mb={3}>
                <Typography fontWeight={600} mb={1} color="text.primary">
                  Role name *
                </Typography>
                <TextField
                  fullWidth
                  name="name"
                  value={roleData.name}
                  onChange={handleInputChange}
                  placeholder="Frontend Developer"
                  size="small"
                  required
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
                  <MenuItem value="DEVOPS">DEVOPS</MenuItem>
                  <MenuItem value="UX/UI">UX/UI</MenuItem>
                  <MenuItem value="QA">QA</MenuItem>
                  <MenuItem value="MOBILE">MOBILE</MenuItem>
                </TextField>
              </Box>
              
              <Box mb={3}>
                <Typography fontWeight={600} mb={1} color="text.primary">
                  Years of experience in the area *
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  name="yearsOfExperience"
                  value={roleData.yearsOfExperience}
                  onChange={handleInputChange}
                  placeholder="3"
                  size="small"
                  required
                  inputProps={{ min: 0 }}
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
                  multiline
                  rows={4}
                  name="description"
                  value={roleData.description}
                  onChange={handleInputChange}
                  placeholder="Add a description here..."
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
                  Available skills
                </Typography>
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
                  {loadingSkills ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : availableSkills.length > 0 ? (
                    availableSkills.map((skill) => (
                      <Box
                        key={skill.id}
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
                            {skill.name[0]}
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {skill.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {skill.description}
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleAddSkill(skill.id)}
                          disabled={roleData.skills.some(s => s.id === skill.id)}
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
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', p: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No skills available in the database
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          {/* Skills Selected - Con scroll independiente */}
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography fontWeight={600} color="text.primary">
                Skills selected
              </Typography>
              <Chip 
                label={`${roleData.skills.length} skills`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
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
                {roleData.skills.length > 0 ? (
                  roleData.skills.map((skill, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1.5,
                        borderBottom: index < roleData.skills.length - 1 ? "1px solid" : "none",
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
                          inputProps={{ min: 0 }}
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
            onClick={handleSubmit}
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
              initialRole ? "UPDATE" : "CREATE"
            )}
          </Button>
          <Button
            variant="contained"
            onClick={onCancel}
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

      {/* Snackbar para mensajes */}
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
