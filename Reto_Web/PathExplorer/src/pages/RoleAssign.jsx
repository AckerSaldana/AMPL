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
  DialogActions,
  Tooltip
} from "@mui/material";
import AssistantIcon from "@mui/icons-material/Assistant";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import { alpha } from "@mui/material/styles";
import RoleCard from "../components/RoleCard";
import MatchedEmployeeCard from "../components/MatchedEmployeeCard";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";

// Función para generar descripción de rol basada en sus habilidades
function generateRoleDescription(roleName, skills = [], skillMap = {}) {
  if (!skills || skills.length === 0) {
    return `El rol de ${roleName} requiere un profesional versátil con experiencia en tecnología y desarrollo.`;
  }

  // Obtener nombres de habilidades
  const skillNames = skills.map(skill => {
    const skillId = skill.id || skill.skill_ID;
    return skillMap[skillId]?.name || `Skill #${skillId}`;
  });

  // Determinar años de experiencia promedio requeridos
  const yearsRequired = skills.map(s => s.years || 0).filter(y => y > 0);
  const avgYears = yearsRequired.length > 0 
    ? Math.round(yearsRequired.reduce((sum, y) => sum + y, 0) / yearsRequired.length) 
    : 1;

  let experienceText = "";
  if (avgYears <= 1) {
    experienceText = "conocimientos básicos";
  } else if (avgYears <= 3) {
    experienceText = "experiencia intermedia";
  } else {
    experienceText = `al menos ${avgYears} años de experiencia`;
  }

  // Construir descripción basada en habilidades
  return `El rol de ${roleName} requiere un profesional con ${experienceText} en tecnología y desarrollo, específicamente en ${skillNames.join(", ")}. Se requiere capacidad para trabajar en equipo y enfoque en resultados.`;
}

// Función para llamar al endpoint backend que procesa el matching para un rol.
async function getMatchesForRole(role, employees, skillMap) {
  try {
    // Debug de habilidades requeridas para el rol y sus tipos
    if (role.skills && role.skills.length > 0) {
      console.log("Habilidades requeridas para el rol:", role.skills.map(skill => {
        const skillId = skill.id || skill.skill_ID;
        return {
          id: skillId,
          nombre: skillMap[skillId]?.name || "Desconocida",
          tipo: skillMap[skillId]?.type || "Desconocido",
          años: skill.years || 0,
          importancia: skill.importance || 1
        };
      }));
    }

    console.log("skillMap enviado:", {
      totalSkills: Object.keys(skillMap).length,
      muestra: Object.entries(skillMap).slice(0, 3),
      ejemplo: skillMap[Object.keys(skillMap)[0]],
      types: countSkillTypes(skillMap)
    });

    console.log("Enviando datos al API:", { 
      role: {...role, skills: role.skills?.slice(0, 2) || []}, 
      employeesCount: employees?.length || 0,
      skillMapCount: Object.keys(skillMap).length
    });
    
    const response = await fetch("https://dev-ampl.web.app/api/getMatches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ role, employees, skillMap })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
      throw new Error(errorData.error || `Error de servidor: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Ahora podemos mostrar los pesos utilizados si están disponibles
    if (data.weights) {
      console.log(`Pesos utilizados - Técnico: ${data.weights.technical}%, Contextual: ${data.weights.contextual}%`);
    }
    
    return data.matches || []; // Asegurar que siempre devuelva un array
  } catch (error) {
    console.error("Error en getMatchesForRole:", error);
    return []; // Devolver un array vacío en caso de error
  }
}

function countSkillTypes(skillMap) {
  const counts = { technical: 0, soft: 0, unknown: 0 };
  
  Object.values(skillMap).forEach(skill => {
    if (!skill.type) {
      counts.unknown++;
    } else if (skill.type.toLowerCase() === 'technical' || skill.type.toLowerCase() === 'hard') {
      counts.technical++;
    } else if (skill.type.toLowerCase() === 'soft' || skill.type.toLowerCase() === 'personal') {
      counts.soft++;
    } else {
      counts.unknown++;
    }
  });
  
  return counts;
}

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
  const [skillMap, setSkillMap] = useState({});

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // 1. Obtener proyecto temporal desde localStorage
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
        
        console.log("Project data loaded:", {
          title: projectData.projectData.title,
          rolesCount: projectData.roles?.length || 0
        });

        // 2. Obtener lista completa de skills de Supabase con sus tipos
        const { data: allSkills, error: skillsError } = await supabase
          .from("Skill")
          .select("skill_ID, name, type, category");
          
        if (skillsError) throw skillsError;
        
        // Crear mapa de skills con su tipo (technical o soft)
        const newSkillMap = {};
        allSkills.forEach(skill => {
          // Asegurar que el ID sea string para usarlo como clave
          const skillId = String(skill.skill_ID);
          
          // Determinar el tipo de la skill basado en la categoría o el campo type
          let skillType = "technical"; // Por defecto es técnica
          
          if (skill.type) {
            // Si existe el campo type, usarlo directamente
            skillType = skill.type.toLowerCase();
          } else if (skill.category) {
            // Si existe categoría, determinar el tipo en base a ella
            const softCategories = ["soft skill", "personal", "interpersonal", "communication", "leadership", "management", "emotional"];
            const technicalCategories = ["programming", "development", "frontend", "backend", "database", "cloud", "technical"];
            
            if (softCategories.some(cat => skill.category.toLowerCase().includes(cat))) {
              skillType = "soft";
            } else if (technicalCategories.some(cat => skill.category.toLowerCase().includes(cat))) {
              skillType = "technical";
            }
          }
          
          newSkillMap[skillId] = {
            name: skill.name,
            type: skillType, // "technical" o "soft"
            category: skill.category || "" // Guardar la categoría para referencia
          };
        });
        
        setSkillMap(newSkillMap);
        
        // Detectar los primeros 5 IDs para verificación
        const firstFiveSkillIds = allSkills.slice(0, 5).map(skill => skill.skill_ID);
        
        console.log("Skills loaded:", {
          count: allSkills?.length || 0,
          sampleKeys: firstFiveSkillIds,
          sampleData: firstFiveSkillIds.map(id => newSkillMap[id]),
          typeCounts: {
            technical: Object.values(newSkillMap).filter(skill => skill.type === "technical").length,
            soft: Object.values(newSkillMap).filter(skill => skill.type === "soft").length,
            unknown: Object.values(newSkillMap).filter(skill => !skill.type).length
          }
        });

        // 3. Obtener todos los usuarios básicos
        const { data: userData, error: userError } = await supabase
          .from("User")
          .select("user_id, name, last_name, profile_pic, about");
          
        if (userError) throw userError;
        console.log("Users loaded:", { count: userData?.length || 0 });

        // 4. Obtener todas las skills de los usuarios
        const { data: allUserSkills, error: userSkillError } = await supabase
          .from("UserSkill")
          .select("user_ID, skill_ID, proficiency, year_Exp");
          
        if (userSkillError) throw userSkillError;
        
        console.log("User skills loaded:", {
          count: allUserSkills?.length || 0,
          sample: allUserSkills.slice(0, 3)
        });

        // Agrupar las skills por usuario
        const userSkillsMap = {};
        allUserSkills.forEach(skill => {
          const userId = skill.user_ID;
          if (!userSkillsMap[userId]) {
            userSkillsMap[userId] = [];
          }
          userSkillsMap[userId].push({
            skill_ID: skill.skill_ID,
            proficiency: skill.proficiency || "Low",
            year_Exp: skill.year_Exp || 0
          });
        });
        
        console.log("User skills grouped:", {
          userCount: Object.keys(userSkillsMap).length
        });

        // 5. Preparar empleados vinculando sus skills y usando el campo "about" como bio
        const employeesWithSkills = userData.map(user => {
          const userId = user.user_id;
          const userSkills = userSkillsMap[userId] || [];
          const userName = `${user.name || ""} ${user.last_name || ""}`.trim() || "Usuario sin nombre";
          
          return {
            id: userId,
            name: userName,
            avatar: user.profile_pic || null,
            skills: userSkills,
            bio: user.about || `Profesional del área de tecnología: ${userName}` // Usar el campo about como bio
          };
        });
        
        setEmployees(employeesWithSkills);
        
        console.log("Employees prepared:", {
          count: employeesWithSkills.length,
          sampleEmployee: employeesWithSkills[0]?.name || "N/A",
          sampleSkills: employeesWithSkills[0]?.skills?.slice(0, 3) || [],
          sampleBio: employeesWithSkills[0]?.bio || "N/A"
        });

        // 6. Para cada rol, llamar al endpoint de matching
        if (!projectData.roles || !Array.isArray(projectData.roles) || projectData.roles.length === 0) {
          throw new Error("No hay roles definidos en el proyecto");
        }
        
        console.log("Raw role skills:", projectData.roles[0]?.skills || []);
        
        const rolesWithSuggestions = await Promise.all(
          projectData.roles.map(async (role, index) => {
            // Asegurarse de que role.skills siempre sea un array
            const roleSkills = role.skills || [];
            console.log(`Procesando rol ${index+1}/${projectData.roles.length}: ${role.name || "Sin nombre"}`);
            
            const normalizedRoleSkills = roleSkills.map(skill => ({
              id: String(skill.skill_ID || skill.id), // Asegurar que sea string
              years: skill.years || 0,
              importance: skill.importance || 1
            }));
            
            // Generar descripción del rol si no tiene
            let roleDescription = role.description;
            if (!roleDescription || roleDescription.trim() === "") {
              roleDescription = generateRoleDescription(role.name, normalizedRoleSkills, newSkillMap);
            }
            
            const normalizedRole = { 
              ...role, 
              skills: normalizedRoleSkills,
              description: roleDescription
            };

            // Llamar al endpoint para obtener candidatos, incluyendo el skillMap
            try {
              const bestMatches = await getMatchesForRole(normalizedRole, employeesWithSkills, newSkillMap);
              const bestCandidate = bestMatches.length > 0 ? bestMatches[0] : null;

              return {
                id: role.id || `role-${index}`,
                role: role.name,
                area: role.area,
                yearsOfExperience: role.yearsOfExperience,
                skills: normalizedRoleSkills,
                description: normalizedRole.description,
                assigned: bestCandidate,
                allCandidates: bestMatches,
                matches: bestMatches.slice(1)
              };
            } catch (matchError) {
              console.error(`Error obteniendo matches para rol ${role.name}:`, matchError);
              return {
                id: role.id || `role-${index}`,
                role: role.name,
                area: role.area,
                yearsOfExperience: role.yearsOfExperience,
                skills: normalizedRoleSkills,
                description: normalizedRole.description,
                assigned: null,
                allCandidates: [],
                matches: []
              };
            }
          })
        );
        
        console.log("Roles prepared:", {
          count: rolesWithSuggestions.length,
          sampleRole: rolesWithSuggestions[0]?.role || "N/A",
          sampleMatches: rolesWithSuggestions[0]?.matches?.length || 0
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

  const handleEmployeeChange = (roleIndex, newEmployeeId) => {
    setRoles(prevRoles => {
      const updatedRoles = [...prevRoles];
      const currentRole = { ...updatedRoles[roleIndex] };
      const newEmployee = currentRole.allCandidates.find(
        candidate => candidate.id === newEmployeeId
      );
      if (!newEmployee) return prevRoles;
      currentRole.assigned = newEmployee;
      currentRole.matches = currentRole.allCandidates.filter(
        candidate => candidate.id !== newEmployee.id
      );
      updatedRoles[roleIndex] = currentRole;
      return updatedRoles;
    });
  };

  const handleFinalConfirmation = async () => {
    setDialogOpen(false);
    setConfirming(true);
    try {
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
      const rolesData = roles.map(role => ({
        name: role.role,
        area: role.area || "General",
        description: role.description || `Role for ${role.role} in project ${projectData.title}`
      }));
      const assignmentsData = roles.map(roleObj => {
        if (!roleObj.assigned) return null;
        return {
          user_id: roleObj.assigned.id,
          role_name: roleObj.role,
          feedback_notes: `Assigned with ${roleObj.assigned.score}% match score (Technical: ${roleObj.assigned.technicalScore}%, Contextual: ${roleObj.assigned.contextualScore}%)`
        };
      }).filter(Boolean);
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

  const handleConfirmAssignments = () => {
    const hasUnassignedRoles = roles.some(role => !role.assigned);
    if (hasUnassignedRoles) {
      setSnackbar({
        open: true,
        message: "Hay roles sin asignar. Por favor, asigna un empleado a cada rol.",
        severity: "warning"
      });
      return;
    }
    setDialogOpen(true);
  };

  const handleCancel = () => {
    if (window.confirm("¿Estás seguro de que deseas cancelar? Se perderá la información del proyecto.")) {
      localStorage.removeItem("tempProject");
      navigate("/projects");
    }
  };

  const availableCandidates = roles[selectedRoleIndex]?.matches || [];

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh" }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          Analizando perfiles y calculando compatibilidad...
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Analizando perfiles profesionales y habilidades técnicas
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
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
          alignItems: "center"
        }}
      >
        <AssistantIcon sx={{ mr: 1.5 }} />
        <Typography variant="h6" fontWeight={600}>
          {tempProject ? `Assign Roles for: ${tempProject.title}` : "Assign Roles"}
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

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
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
                    borderRadius: "4px"
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: "4px"
                  }
                }}
              >
                {roles.map((r, i) => (
                  <React.Fragment key={`${r.id}-${i}`}>
                    <RoleCard
                      role={r.role}
                      name={r.assigned?.name || "Sin asignar"}
                      avatar={r.assigned?.avatar}
                      percentage={r.assigned?.score || 0}
                      onClick={() => setSelectedRoleIndex(i)}
                      selected={selectedRoleIndex === i}
                    />
                    {i === selectedRoleIndex && (
                      <Box sx={{ mt: 1, mb: 2, px: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          <InfoIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                          Descripción: {r.description?.substring(0, 100)}...
                        </Typography>
                        {r.assigned && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Pesos: Técnico {r.assigned.weights?.technical || "60"}%, Contextual {r.assigned.weights?.contextual || "40"}%
                          </Typography>
                        )}
                      </Box>
                    )}
                  </React.Fragment>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                <Typography>No hay roles definidos para este proyecto</Typography>
              </Box>
            )}
          </Grid>

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
                    <Typography component="span" color="primary" sx={{ fontWeight: 700 }}>
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
                  borderRadius: "4px"
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: "4px"
                }
              }}
            >
              {roles.length > 0 ? (
                availableCandidates.length > 0 ? (
                  availableCandidates.map(match => (
                    <MatchedEmployeeCard
                      key={match.id}
                      name={match.name}
                      avatar={match.avatar}
                      score={match.score}
                      technicalScore={match.technicalScore}
                      contextualScore={match.contextualScore}
                      weights={match.weights}
                      onSelect={() => handleEmployeeChange(selectedRoleIndex, match.id)}
                    />
                  ))
                ) : (
                  <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                    <Typography>No hay más candidatos disponibles para este rol</Typography>
                  </Box>
                )
              ) : (
                <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                  <Typography>Seleccione un rol primero</Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

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
                backgroundColor: alpha(theme.palette.text.secondary, 0.04)
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
            startIcon={
              confirming ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />
            }
            sx={{
              fontWeight: 600,
              boxShadow: 2,
              px: 3,
              "&:hover": {
                boxShadow: 4
              }
            }}
          >
            {confirming ? "PROCESSING..." : "CONFIRM ASSIGNMENTS"}
          </Button>
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default RoleAssign;