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

/**
 * --- Funciones AI/Contextuales ---
 */

// Función para llamar a un endpoint backend que obtenga el embedding usando OpenAI
async function getEmbedding(text) {
  const response = await fetch("/api/getEmbedding", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ input: text })
  });
  const data = await response.json();
  return data.embedding;
}

// Función para calcular la similitud coseno entre dos vectores
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const normB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (normA * normB);
}

// Función para calcular el score contextual dado el texto de un rol y el "bio" del candidato
// Se escala a 0-100
async function calculateContextualScore(roleDescription, candidateBio) {
  try {
    // Obtén los embeddings mediante el endpoint (puedes cachear estos valores para evitar múltiples llamadas)
    const roleEmbedding = await getEmbedding(roleDescription);
    const candidateEmbedding = await getEmbedding(candidateBio || "");
    const similarity = cosineSimilarity(roleEmbedding, candidateEmbedding);
    // Supongamos que la similitud varía de 0 a 1, se escala a porcentaje
    return Math.floor(similarity * 100);
  } catch (error) {
    console.error("Error al calcular contextual score:", error);
    return 0;
  }
}

/**
 * --- Funciones de Matching Técnico (ya existentes) ---
 */
const calculateSkillMatch = (userSkills, roleSkills, skillMap) => {
  console.log("Calculating match with:", {
    userSkills: userSkills || [],
    roleSkills: roleSkills || [],
    skillMapSample: Object.keys(skillMap || {}).slice(0, 3)
  });

  if (!roleSkills || roleSkills.length === 0) {
    return 75;
  }
  
  let totalScore = 0;
  let maxPossibleScore = roleSkills.length * 100;
  
  roleSkills.forEach(roleSkill => {
    // Comparar los IDs de las skills del usuario y la del rol
    const matchingSkill = userSkills?.find(
      userSkill => String(userSkill.skill_ID) === String(roleSkill.id)
    );
    
    if (matchingSkill) {
      console.log(`Match found for skill ${roleSkill.id} (${skillMap[roleSkill.id] || 'unknown'})`, 
                  { userExperience: matchingSkill.year_Exp, proficiency: matchingSkill.proficiency });
      
      let skillScore = 50;
      const expYears = matchingSkill.year_Exp || 0;
      const requiredYears = roleSkill.years || 0;
      
      if (expYears >= requiredYears) {
        skillScore += 30;
      } else if (expYears > 0 && requiredYears > 0) {
        skillScore += Math.floor((expYears / requiredYears) * 30);
      }
      
      if (matchingSkill.proficiency === "High") {
        skillScore += 20;
      } else if (matchingSkill.proficiency === "Medium") {
        skillScore += 10;
      } else if (matchingSkill.proficiency === "Low") {
        skillScore += 5;
      }
      
      totalScore += skillScore;
    } else {
      console.log(`No match found for skill ${roleSkill.id} (${skillMap[roleSkill.id] || 'unknown'})`);
    }
  });
  
  const finalScore = Math.min(Math.floor((totalScore / maxPossibleScore) * 100), 100);
  console.log(`Final score: ${finalScore}% (total: ${totalScore}/${maxPossibleScore})`);
  return finalScore;
};

/**
 * --- Función para obtener best matches combinando Matching Técnico y Contextual ---
 * Convertida en función asíncrona para poder usar los embeddings.
 */
async function getBestMatches(employees, role, skillMap, maxResults = 5) {
  if (!employees || !employees.length || !role || !role.skills) {
    console.warn("Datos insuficientes para getBestMatches", { 
      employeesCount: employees?.length || 0,
      hasRole: !!role,
      roleSkillsCount: role?.skills?.length || 0
    });
    return [];
  }

  console.log("Getting best matches", {
    roleId: role.id || "unknown",
    roleName: role.name || "unknown",
    skillsCount: role.skills.length,
    employeesCount: employees.length
  });
  
  if (role.skills.length > 0) {
    console.log("First role skill:", role.skills[0]);
  }
  
  if (employees.length > 0 && employees[0].skills) {
    console.log("First employee skills sample:", employees[0].skills.slice(0, 2));
  }
  
  // Normalizar las skills del rol (usar skill_ID o id según corresponda)
  const roleSkills = (role.skills || []).map(skill => ({
    id: skill.skill_ID || skill.id,
    years: skill.years || 0,
    importance: skill.importance || 1,
    name: skillMap[skill.skill_ID || skill.id] || `Skill ${skill.skill_ID || skill.id}`
  }));
  
  // Pesos para la combinación de scores (ajustables)
  const alpha = 0.6; // peso para el score técnico
  const beta = 0.4;  // peso para el score contextual

  // Para cada empleado, calcular de forma asíncrona su score combinado
  const scoredEmployees = await Promise.all(employees.map(async employee => {
    if (!employee.skills || !Array.isArray(employee.skills)) {
      console.warn(`Employee ${employee.id} has no skills or invalid skills data`);
      return { ...employee, score: 0, skillMatches: [] };
    }
    
    // Score técnico mediante tu función existente
    const technicalScore = calculateSkillMatch(employee.skills, roleSkills, skillMap);
    // Para el contextual, se usa la descripción del rol y el "bio" del candidato
    // Si el candidato no tiene bio, se usa cadena vacía
    const contextualScore = await calculateContextualScore(role.description || "", employee.bio || "");
    
    // Combinar ambos scores
    const combinedScore = Math.min(
      Math.floor(alpha * technicalScore + beta * contextualScore),
      100
    );
    
    return {
      ...employee,
      score: combinedScore,
      skillMatches: roleSkills.map(roleSkill => {
        const empSkill = employee.skills.find(s => String(s.skill_ID) === String(roleSkill.id));
        return {
          skillId: roleSkill.id,
          skillName: skillMap[roleSkill.id] || `Skill ${roleSkill.id}`,
          required: true,
          hasSkill: !!empSkill,
          experience: empSkill ? empSkill.year_Exp : 0,
          requiredExperience: roleSkill.years || 0,
          proficiency: empSkill ? empSkill.proficiency : null
        };
      })
    };
  }));

  return scoredEmployees.sort((a, b) => b.score - a.score).slice(0, maxResults);
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

  // Cargar datos iniciales (incluye corrección en mapeo de skills)
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
        
        if (projectData.roles && projectData.roles.length > 0) {
          console.log("Sample role data:", projectData.roles[0]);
        }
        
        // 2. Obtener lista completa de skills
        const { data: allSkills, error: skillsError } = await supabase
          .from("Skill")
          .select("skill_ID, name");
        if (skillsError) throw skillsError;
        
        const skillMap = {};
        allSkills.forEach(skill => {
          skillMap[skill.skill_ID] = skill.name;
        });
        
        console.log("Skills loaded:", {
          count: allSkills?.length || 0,
          sampleKeys: Object.keys(skillMap).slice(0, 5)
        });
        
        // 3. Obtener todos los usuarios básicos
        const { data: userData, error: userError } = await supabase
          .from("User")
          .select("user_id, name, last_name, profile_pic");
        if (userError) throw userError;
        
        console.log("Users loaded:", { count: userData?.length || 0 });
        
        // 4. Obtener todas las skills de los usuarios (usar "user_ID" como columna)
        const { data: allUserSkills, error: userSkillError } = await supabase
          .from("UserSkill")
          .select("user_ID, skill_ID, proficiency, year_Exp");
        if (userSkillError) throw userSkillError;
        
        console.log("User skills loaded:", {
          count: allUserSkills?.length || 0,
          sample: allUserSkills.slice(0, 3)
        });
        
        // Agrupar las skills por usuario (clave: "user_ID")
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
          userCount: Object.keys(userSkillsMap).length,
          sampleUser: Object.keys(userSkillsMap)[0],
          sampleSkills: userSkillsMap[Object.keys(userSkillsMap)[0]]
        });
        
        // 5. Preparar empleados vinculando sus skills
        const employeesWithSkills = userData.map(user => {
          const userId = user.user_id;
          const userSkills = userSkillsMap[userId] || [];
          // Si no existe bio, se asigna cadena vacía (puedes agregar más datos si dispones)
          return {
            id: userId,
            name: `${user.name || ""} ${user.last_name || ""}`.trim() || "Usuario sin nombre",
            avatar: user.profile_pic || null,
            skills: userSkills,
            bio: "" // Agrega información adicional aquí si la tienes
          };
        });
        setEmployees(employeesWithSkills);
        
        console.log("Employees prepared:", {
          count: employeesWithSkills.length,
          sampleEmployee: employeesWithSkills[0],
          sampleSkills: employeesWithSkills[0]?.skills?.slice(0, 3) || []
        });
        
        // 6. Preparar roles con sugerencias (matchmaking)
        // Dado que vamos a usar funciones asíncronas en el matching (con embeddings),
        // usamos Promise.all para esperar cada cálculo
        const rolesWithSuggestions = await Promise.all(
          projectData.roles.map(async (role, index) => {
            console.log("Raw role skills:", role.skills);
            const normalizedRoleSkills = (role.skills || []).map(skill => ({
              id: skill.skill_ID || skill.id,
              years: skill.years || 0,
              importance: skill.importance || 1
            }));
            console.log("Normalized role skills:", normalizedRoleSkills);
            const normalizedRole = { ...role, skills: normalizedRoleSkills };
            // Es importante que el rol tenga una descripción para el matching contextual
            // Si no la tiene, se puede asignar una cadena vacía
            normalizedRole.description = role.description || "";
            
            // Obtener los best matches combinando el matching técnico y contextual
            const bestMatches = await getBestMatches(employeesWithSkills, normalizedRole, skillMap, 10);
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
          })
        );
        console.log("Roles prepared:", {
          count: rolesWithSuggestions.length,
          sampleRole: rolesWithSuggestions[0],
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
        description: `Role for ${role.role} in project ${projectData.title}`
      }));
  
      const assignmentsData = roles.map(roleObj => {
        if (!roleObj.assigned) return null;
        return {
          user_id: roleObj.assigned.id,
          role_name: roleObj.role,
          feedback_notes: `Assigned with ${roleObj.assigned.score}% match score`
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
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default RoleAssign;