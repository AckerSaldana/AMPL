import React, { useState, useEffect } from "react";
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  useTheme, 
  Button, 
  Divider,
  IconButton,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@mui/material";
import AssistantIcon from "@mui/icons-material/Assistant";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import { alpha } from "@mui/material/styles";
import RoleCard from "../components/RoleCard";
import MatchedEmployeeCard from "../components/MatchedEmployeeCard";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";

const RoleAssign = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Estados para la UI
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  
  // Estados para los datos
  const [roles, setRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tempProject, setTempProject] = useState(null);
  const [tempProjectData, setTempProjectData] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // 1. Obtener datos del proyecto temporal desde localStorage
        const storedProject = localStorage.getItem("tempProject");
        if (!storedProject) {
          throw new Error("No se encontró información del proyecto temporal");
        }
        
        const projectData = JSON.parse(storedProject);
        setTempProjectData(projectData);
        setTempProject({
          title: projectData.projectData.title,
          tempId: projectData.tempId
        });
        
        // 2. Obtener todos los usuarios y sus skills
        const { data: userData, error: userError } = await supabase
          .from("User")
          .select("user_id, name, last_name, profile_pic");
          
        if (userError) throw userError;
        
        // 3. Para cada usuario, obtener sus skills desde UserSkill
        const employeesWithSkills = await Promise.all(
          userData.map(async (user) => {
            // Obtener skills del usuario
            const { data: userSkills } = await supabase
              .from("UserSkill")
              .select("skill_ID, proficiency, year_Exp")
              .eq("user_ID", user.user_id);
            
            return {
              id: user.user_id,
              name: `${user.name || ""} ${user.last_name || ""}`.trim() || "Usuario sin nombre",
              avatar: user.profile_pic || null,
              skills: userSkills || []
            };
          })
        );
        
        setEmployees(employeesWithSkills);
        
        // 4. Obtener toda la lista de skills disponibles para tener nombres completos
        const { data: allSkills } = await supabase
          .from("Skill")
          .select("skill_ID, name");
        
        const skillMap = {};
        if (allSkills) {
          allSkills.forEach(skill => {
            skillMap[skill.skill_ID] = skill.name;
          });
        }
        
        // 5. Preparar los roles con sugerencias de IA (empleo matchmaking)
        const rolesWithSuggestions = projectData.roles.map((role, index) => {
          // Para cada rol, calcular la compatibilidad con cada empleado
          const matchedEmployees = employeesWithSkills.map(employee => {
            const skillMatchScore = calculateSkillMatch(
              employee.skills, 
              role.skills || [], 
              skillMap
            );
            
            return {
              ...employee,
              score: skillMatchScore
            };
          })
          .sort((a, b) => b.score - a.score); // Ordenar por puntuación de mayor a menor
          
          // El mejor candidato es el primero
          const bestCandidate = matchedEmployees.length > 0 ? matchedEmployees[0] : null;
          
          return {
            id: role.id || `role-${index}`,
            role: role.name,
            area: role.area,
            yearsOfExperience: role.yearsOfExperience,
            skills: role.skills || [],
            assigned: bestCandidate,
            allCandidates: matchedEmployees,
            matches: matchedEmployees.slice(1) // Todos menos el primero (ya asignado)
          };
        });
        
        setRoles(rolesWithSuggestions);
      } catch (error) {
        console.error("Error loading data:", error);
        setSnackbar({
          open: true,
          message: `Error cargando datos: ${error.message}`,
          severity: "error"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Función para calcular el match de skills entre un empleado y un rol
  const calculateSkillMatch = (userSkills, roleSkills, skillMap) => {
    if (!roleSkills || roleSkills.length === 0) {
      // Si el rol no tiene skills específicas, asignar un puntaje base
      return 75; // Puntaje base del 75%
    }
    
    let totalScore = 0;
    let maxPossibleScore = roleSkills.length * 100; // Máximo puntaje posible
    
    roleSkills.forEach(roleSkill => {
      // Buscar si el usuario tiene esta skill
      const matchingSkill = userSkills.find(
        userSkill => userSkill.skill_ID === roleSkill.id
      );
      
      if (matchingSkill) {
        // Puntos base por tener la skill
        let skillScore = 50;
        
        // Puntos adicionales por años de experiencia (hasta 30 puntos)
        const expYears = matchingSkill.year_Exp || 0;
        const requiredYears = roleSkill.years || 0;
        
        if (expYears >= requiredYears) {
          skillScore += 30;
        } else if (expYears > 0) {
          // Puntos proporcionales a los años que tiene vs. los requeridos
          skillScore += Math.floor((expYears / requiredYears) * 30);
        }
        
        // Puntos adicionales por nivel de competencia (hasta 20 puntos)
        if (matchingSkill.proficiency === "High") {
          skillScore += 20;
        } else if (matchingSkill.proficiency === "Medium") {
          skillScore += 10;
        }
        
        totalScore += skillScore;
      }
    });
    
    // Calcular porcentaje final (máximo 100%)
    const finalScore = Math.min(
      Math.floor((totalScore / maxPossibleScore) * 100), 
      100
    );
    
    return finalScore;
  };

  // Función para manejar el cambio de empleado asignado
  const handleEmployeeChange = (roleIndex, newEmployeeId) => {
    setRoles(prevRoles => {
      const updatedRoles = [...prevRoles];
      const currentRole = {...updatedRoles[roleIndex]};
      
      // Encontrar el nuevo empleado a asignar
      const newEmployee = currentRole.allCandidates.find(
        candidate => candidate.id === newEmployeeId
      );
      
      // Si no encontramos al empleado, no hacemos cambios
      if (!newEmployee) return prevRoles;
      
      // Asignar el nuevo empleado
      currentRole.assigned = newEmployee;
      
      // Recalcular la lista de matches (todos los candidatos excepto el asignado)
      currentRole.matches = currentRole.allCandidates.filter(
        candidate => candidate.id !== newEmployee.id
      );
      
      // Actualizar el rol actual
      updatedRoles[roleIndex] = currentRole;
      
      return updatedRoles;
    });
  };
  
  // Función modificada para crear el proyecto y asignar roles
  const handleFinalConfirmation = async () => {
    setDialogOpen(false);
    setConfirming(true);
  
    try {
      // 1. Preparar datos del proyecto
      const projectData = {
        title: tempProjectData.projectData.title,
        description: tempProjectData.projectData.description,
        start_date: tempProjectData.projectData.start_date,
        end_date: tempProjectData.projectData.end_date,
        status: tempProjectData.projectData.status || "New",
        client_id: tempProjectData.projectData.client_id || null,
        logo: tempProjectData.projectData.logo || null,
        progress: tempProjectData.projectData.progress || 0,
        priority: tempProjectData.projectData.priority || "Medium"
      };
  
      // 2. Preparar datos de roles
      const rolesData = roles.map(role => ({
        name: role.role,
        area: role.area || "General",
        description: `Role for ${role.role} in project ${projectData.title}`
      }));
  
      // 3. Preparar datos de asignaciones
      const assignmentsData = roles.map(roleObj => {
        if (!roleObj.assigned) return null;
        
        return {
          user_id: roleObj.assigned.id,
          role_name: roleObj.role,
          feedback_notes: `Assigned with ${roleObj.assigned.score}% match score`
        };
      }).filter(Boolean); // Eliminar valores nulos (roles sin asignar)
  
      // 4. Ejecutar la función RPC
      const { data, error } = await supabase.rpc(
        "create_project_with_roles_and_assignments",
        {
          _project: projectData,
          _roles: rolesData,
          _assignments: assignmentsData
        }
      );
  
      if (error) throw error;
      if (!data) throw new Error("No se obtuvo el ID del proyecto.");
  
      // 5. Mostrar mensaje de éxito y redireccionar
      setSnackbar({
        open: true,
        message: `¡Proyecto "${projectData.title}" creado con éxito! ID: ${data}`,
        severity: "success"
      });
  
      localStorage.removeItem("tempProject");
      setTimeout(() => {
        navigate("/projects");
      }, 1500);
    } catch (error) {
      console.error("Error en la transacción:", error);
      setSnackbar({
        open: true,
        message: `Error al confirmar el proyecto: ${error.message}`,
        severity: "error"
      });
    } finally {
      setConfirming(false);
    }
  };
  
  // Función para confirmar las asignaciones
  const handleConfirmAssignments = () => {
    // Verificar que todos los roles tienen alguien asignado
    const hasUnassignedRoles = roles.some(role => !role.assigned);
    
    if (hasUnassignedRoles) {
      setSnackbar({
        open: true,
        message: "Hay roles sin asignar. Por favor, asigna un empleado a cada rol.",
        severity: "warning"
      });
      return;
    }
    
    // Abrir diálogo de confirmación
    setDialogOpen(true);
  };
  
  // Función modificada para cancelar - ahora es más simple
  const handleCancel = () => {
    if (window.confirm("¿Estás seguro de que deseas cancelar? Se perderá la información del proyecto.")) {
      localStorage.removeItem("tempProject");
      navigate("/projects");
    }
  };
  
  // Obtener los candidatos disponibles para el rol seleccionado
  const availableCandidates = roles[selectedRoleIndex]?.matches || [];

  // Mostrar pantalla de carga mientras se obtienen los datos
  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh" }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          Analizando perfiles y calculando compatibilidad...
        </Typography>
      </Box>
    );
  }

  return (
    <Paper 
      elevation={3}
      sx={{
        borderRadius: 2,
        overflow: "hidden"
      }}
    >
      {/* Heading */}
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: "#fff",
          px: 3,
          py: 2,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          height: "4rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        <AssistantIcon sx={{ mr: 1.5 }} />
        <Typography variant="h6" fontWeight={600}>
          {tempProject 
            ? `Assign Roles for: ${tempProject.title}` 
            : "Assign Roles"}
        </Typography>
        <Chip 
          label={`${roles.length} Roles`}
          size="small"
          sx={{ 
            ml: 2, 
            backgroundColor: alpha("#fff", 0.2),
            color: "#fff",
            fontWeight: 500
          }}
        />
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Left Side - Roles con asignaciones sugeridas */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box 
                sx={{ 
                  backgroundColor: theme.palette.primary.light, 
                  color: "#fff",
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  mr: 1.5,
                  fontWeight: "bold"
                }}
              >
                1
              </Box>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                AI Suggested Role Assignments
              </Typography>
            </Box>

            {roles.length > 0 ? (
              <Box
                sx={{
                  maxHeight: 480,
                  overflowY: "auto",
                  pr: 1,
                  pb: 1,
                  "&::-webkit-scrollbar": { width: "8px" },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.3),
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-track": { 
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: "4px"
                  },
                }}
              >
                {roles.map((r, i) => (
                  <RoleCard
                    key={`${r.id}-${i}`}
                    role={r.role}
                    name={r.assigned?.name || "Sin asignar"}
                    avatar={r.assigned?.avatar}
                    percentage={r.assigned?.score || 0}
                    onClick={() => setSelectedRoleIndex(i)}
                    selected={selectedRoleIndex === i}
                  />
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                <Typography>No hay roles definidos para este proyecto</Typography>
              </Box>
            )}
          </Grid>

          {/* Right Side - Lista de candidatos para el rol seleccionado */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box 
                sx={{ 
                  backgroundColor: theme.palette.primary.light, 
                  color: "#fff",
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  mr: 1.5,
                  fontWeight: "bold"
                }}
              >
                2
              </Box>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                {roles.length > 0 ? (
                  <>
                    Candidate Matches for{" "}
                    <Typography 
                      component="span" 
                      color="primary"
                      sx={{ fontWeight: 700 }}
                    >
                      {roles[selectedRoleIndex]?.role || ""}
                    </Typography>
                  </>
                ) : (
                  "Candidate Matches"
                )}
              </Typography>
            </Box>

            <Box
              sx={{
                maxHeight: 480,
                overflowY: "auto",
                backgroundColor: alpha(theme.palette.primary.main, 0.03),
                borderRadius: 2,
                p: 2,
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.1),
                "&::-webkit-scrollbar": { width: "8px" },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.3),
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-track": { 
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: "4px"
                },
              }}
            >
              {roles.length > 0 ? (
                availableCandidates.length > 0 ? (
                  availableCandidates.map((match) => (
                    <MatchedEmployeeCard
                      key={match.id}
                      name={match.name}
                      avatar={match.avatar}
                      score={match.score}
                      onSelect={() => handleEmployeeChange(selectedRoleIndex, match.id)}
                    />
                  ))
                ) : (
                  <Box sx={{ 
                    textAlign: "center", 
                    py: 4,
                    color: "text.secondary"
                  }}>
                    <Typography>No hay más candidatos disponibles para este rol</Typography>
                  </Box>
                )
              ) : (
                <Box sx={{ 
                  textAlign: "center", 
                  py: 4,
                  color: "text.secondary"
                }}>
                  <Typography>Seleccione un rol primero</Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Bottom Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button 
            variant="outlined" 
            color="inherit" 
            onClick={handleCancel}
            disabled={confirming}
            sx={{ 
              mr: 2,
              color: theme.palette.text.secondary,
              borderColor: theme.palette.divider,
              "&:hover": {
                borderColor: theme.palette.text.secondary,
                backgroundColor: alpha(theme.palette.text.secondary, 0.04),
              }
            }}
            startIcon={<CloseIcon />}
          >
            CANCEL
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleConfirmAssignments}
            disabled={confirming || roles.length === 0}
            startIcon={confirming ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
            sx={{ 
              fontWeight: 600,
              boxShadow: 2,
              px: 3,
              "&:hover": {
                boxShadow: 4,
              }
            }}
          >
            {confirming ? "PROCESSING..." : "CONFIRM ASSIGNMENTS"}
          </Button>
        </Box>
      </Box>

      {/* Diálogo de confirmación final */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogTitle>Confirmar Proyecto y Asignaciones</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Estás a punto de <strong>crear el proyecto y finalizar</strong> el proceso de asignación de roles. 
            Se asignarán los siguientes roles:
            <Box component="ul" sx={{ mt: 2 }}>
              {roles.map((role, index) => (
                <Box component="li" key={index} sx={{ mb: 1 }}>
                  <strong>{role.role}</strong>: {role.assigned?.name || "Sin asignar"} 
                  {role.assigned?.score ? ` (${role.assigned.score}% de compatibilidad)` : ""}
                </Box>
              ))}
            </Box>
            ¿Deseas continuar con la creación del proyecto y las asignaciones?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleFinalConfirmation} color="primary" variant="contained" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

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

export default RoleAssign;