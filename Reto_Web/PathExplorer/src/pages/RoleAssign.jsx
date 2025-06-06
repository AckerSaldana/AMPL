import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
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
  Tooltip,
  Container,
} from "@mui/material";
import AssistantIcon from "@mui/icons-material/Assistant";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import { ACCENTURE_COLORS, contentPaperStyles } from "../styles/styles";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import RoleCard from "../components/RoleCard";
import MatchedEmployeeCard from "../components/MatchedEmployeeCard";
import { useDarkMode } from "../contexts/DarkModeContext";

import SupervisorCard from "../components/SupervisorCard";

// Función para generar descripción de rol basada en sus habilidades
function generateRoleDescription(roleName, skills = [], skillMap = {}) {
  if (!skills || skills.length === 0) {
    return `El rol de ${roleName} requiere un profesional versátil con experiencia en tecnología y desarrollo.`;
  }

  // Obtener nombres de habilidades
  const skillNames = skills.map((skill) => {
    const skillId = skill.id || skill.skill_ID;
    return skillMap[skillId]?.name || `Skill #${skillId}`;
  });

  // Determinar años de experiencia promedio requeridos
  const yearsRequired = skills.map((s) => s.years || 0).filter((y) => y > 0);
  const avgYears =
    yearsRequired.length > 0
      ? Math.round(
          yearsRequired.reduce((sum, y) => sum + y, 0) / yearsRequired.length
        )
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
  return `El rol de ${roleName} requiere un profesional con ${experienceText} en tecnología y desarrollo, específicamente en ${skillNames.join(
    ", "
  )}. Se requiere capacidad para trabajar en equipo y enfoque en resultados.`;
}

// Función para llamar al endpoint backend que procesa el matching para un rol.
async function getMatchesForRole(role, employees, skillMap) {
  try {
    // Debug de habilidades requeridas para el rol y sus tipos
    if (role.skills && role.skills.length > 0) {
      console.log(
        "Habilidades requeridas para el rol:",
        role.skills.map((skill) => {
          const skillId = skill.id || skill.skill_ID;
          return {
            id: skillId,
            nombre: skillMap[skillId]?.name || "Desconocida",
            tipo: skillMap[skillId]?.type || "Desconocido",
            años: skill.years || 0,
            importancia: skill.importance || 1,
          };
        })
      );
    }

    console.log("skillMap enviado:", {
      totalSkills: Object.keys(skillMap).length,
      muestra: Object.entries(skillMap).slice(0, 3),
      ejemplo: skillMap[Object.keys(skillMap)[0]],
      types: countSkillTypes(skillMap),
    });

    console.log("Enviando datos al API:", {
      role: { ...role, skills: role.skills?.slice(0, 2) || [] },
      employeesCount: employees?.length || 0,
      skillMapCount: Object.keys(skillMap).length,
    });

    // Determinar si estamos en desarrollo local o en producción
    const isLocalDev =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    // URL del API - adaptada según entorno
    const apiUrl = isLocalDev
      ? "http://localhost:3001/getMatches" // URL directa al localhost
      : "/api/getMatches"; // URL con prefijo /api para Firebase

    console.log(
      `Usando endpoint: ${apiUrl} (${
        isLocalDev ? "desarrollo local" : "producción"
      })`
    );

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role, employees, skillMap }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Error desconocido" }));
      throw new Error(
        errorData.error || `Error de servidor: ${response.status}`
      );
    }

    const data = await response.json();

    // Mapear los resultados para incluir 'score' a partir de 'combinedScore'
    const mappedMatches = data.matches.map((match) => {
      // Buscar el empleado original para obtener su avatar
      const originalEmployee = employees.find((emp) => emp.id === match.id);

      return {
        ...match,
        avatar: originalEmployee?.avatar || null, // Usar el avatar del empleado original
        score: match.combinedScore || 0, // Asignar combinedScore a score
        weights: {
          technical: data.weights?.technical || 60,
          contextual: data.weights?.contextual || 40,
        },
      };
    });

    // Ordenar los candidatos por score de mayor a menor
    mappedMatches.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Ahora podemos mostrar los pesos utilizados si están disponibles
    if (data.weights) {
      console.log(
        `Pesos utilizados - Técnico: ${data.weights.technical}%, Contextual: ${data.weights.contextual}%`
      );
    }

    // Verificar la estructura de los datos mapeados
    console.log("Datos mapeados:", mappedMatches[0]);

    return mappedMatches; // Devolver los matches con la estructura corregida y ordenados
  } catch (error) {
    console.error("Error en getMatchesForRole:", error);
    return []; // Devolver un array vacío en caso de error
  }
}

function countSkillTypes(skillMap) {
  const counts = { technical: 0, soft: 0, unknown: 0 };

  Object.values(skillMap).forEach((skill) => {
    if (!skill.type) {
      counts.unknown++;
    } else if (
      skill.type.toLowerCase() === "technical" ||
      skill.type.toLowerCase() === "hard"
    ) {
      counts.technical++;
    } else if (
      skill.type.toLowerCase() === "soft" ||
      skill.type.toLowerCase() === "personal"
    ) {
      counts.soft++;
    } else {
      counts.unknown++;
    }
  });

  return counts;
}

const RoleAssign = () => {
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();

  // Estados para la UI
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [exitDestination, setExitDestination] = useState(null);
  const [dataChanged, setDataChanged] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [supervisorId, setSupervisorId] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Estados para los datos
  const [roles, setRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tempProject, setTempProject] = useState(null);
  const [tempProjectData, setTempProjectData] = useState(null);
  const [skillMap, setSkillMap] = useState({});

  // Estado para rastrear empleados asignados
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState(new Set());

  // Función para confirmar antes de salir
  const confirmExit = useCallback(
    (destination = null) => {
      if (!dataChanged || confirming) {
        // Si no hay cambios o estamos en proceso de guardar, permitir la navegación
        if (destination) {
          navigate(destination);
        }
        return true;
      }

      // Si hay un destino específico, guardarlo para usarlo después de la confirmación
      if (destination) {
        setExitDestination(destination);
      }

      setExitDialogOpen(true);
      return false;
    },
    [dataChanged, confirming, navigate]
  );

  // Configurar el manejador beforeunload para navegador
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (dataChanged && !confirming) {
        const message =
          "¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.";
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [dataChanged, confirming]);

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
          tempId: projectData.tempId,
        });

        console.log("Project data loaded:", {
          title: projectData.projectData.title,
          rolesCount: projectData.roles?.length || 0,
        });

        // 1.b) Obtener lista de supervisores (permisión TFS o Manager)
        const { data: supervisorUsers, error: supError } = await supabase
          .from("User")
          .select("user_id, name, last_name, profile_pic, permission")
          .in("permission", ["TFS", "Manager"]);
        if (supError) throw supError;
        setSupervisors(supervisorUsers);

        const {
          data: { user: current_user },
          error: currentUserError,
        } = await supabase.auth.getUser();

        if (currentUserError || !current_user) {
          console.error("Auth error:", currentUserError?.message);
          return;
        }

        const creatorId = current_user?.id || projectData.user_id;
        setSupervisorId(creatorId);

        // 2. Obtener lista completa de skills de Supabase con sus tipos
        const { data: allSkills, error: skillsError } = await supabase
          .from("Skill")
          .select("skill_ID, name, type, category");

        if (skillsError) throw skillsError;

        // Crear mapa de skills con su tipo (technical o soft)
        const newSkillMap = {};
        allSkills.forEach((skill) => {
          // Asegurar que el ID sea string para usarlo como clave
          const skillId = String(skill.skill_ID);

          // Determinar el tipo de la skill basado en la categoría o el campo type
          let skillType = "technical"; // Por defecto es técnica

          if (skill.type) {
            // Si existe el campo type, usarlo directamente
            skillType = skill.type.toLowerCase();
          } else if (skill.category) {
            // Si existe categoría, determinar el tipo en base a ella
            const softCategories = [
              "soft skill",
              "personal",
              "interpersonal",
              "communication",
              "leadership",
              "management",
              "emotional",
            ];
            const technicalCategories = [
              "programming",
              "development",
              "frontend",
              "backend",
              "database",
              "cloud",
              "technical",
            ];

            if (
              softCategories.some((cat) =>
                skill.category.toLowerCase().includes(cat)
              )
            ) {
              skillType = "soft";
            } else if (
              technicalCategories.some((cat) =>
                skill.category.toLowerCase().includes(cat)
              )
            ) {
              skillType = "technical";
            }
          }

          newSkillMap[skillId] = {
            name: skill.name,
            type: skillType, // "technical" o "soft"
            category: skill.category || "", // Guardar la categoría para referencia
          };
        });

        setSkillMap(newSkillMap);

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
          sample: allUserSkills.slice(0, 3),
        });

        // Agrupar las skills por usuario
        const userSkillsMap = {};
        allUserSkills.forEach((skill) => {
          const userId = skill.user_ID;
          if (!userSkillsMap[userId]) {
            userSkillsMap[userId] = [];
          }
          userSkillsMap[userId].push({
            skill_ID: skill.skill_ID,
            proficiency: skill.proficiency || "Low",
            year_Exp: skill.year_Exp || 0,
          });
        });

        console.log("User skills grouped:", {
          userCount: Object.keys(userSkillsMap).length,
        });

        // 5. Preparar empleados vinculando sus skills y usando el campo "about" como bio
        const employeesWithSkills = userData.map((user) => {
          const userId = user.user_id;
          const userSkills = userSkillsMap[userId] || [];
          const userName =
            `${user.name || ""} ${user.last_name || ""}`.trim() ||
            "Usuario sin nombre";

          // Usar directamente el enlace almacenado en profile_pic
          const avatarUrl = user.profile_pic || null;

          return {
            id: userId,
            name: userName,
            avatar: avatarUrl,
            skills: userSkills,
            bio:
              user.about || `Profesional del área de tecnología: ${userName}`,
          };
        });

        setEmployees(employeesWithSkills);

        console.log("Employees prepared:", {
          count: employeesWithSkills.length,
          sampleEmployee: employeesWithSkills[0]?.name || "N/A",
          sampleSkills: employeesWithSkills[0]?.skills?.slice(0, 3) || [],
          sampleBio: employeesWithSkills[0]?.bio || "N/A",
        });

        // 6. Para cada rol, llamar al endpoint de matching
        if (
          !projectData.roles ||
          !Array.isArray(projectData.roles) ||
          projectData.roles.length === 0
        ) {
          throw new Error("No hay roles definidos en el proyecto");
        }

        console.log("Raw role skills:", projectData.roles[0]?.skills || []);

        const rolesWithSuggestions = await Promise.all(
          projectData.roles.map(async (role, index) => {
            // Asegurarse de que role.skills siempre sea un array
            const roleSkills = role.skills || [];
            console.log(
              `Procesando rol ${index + 1}/${projectData.roles.length}: ${
                role.name || "Sin nombre"
              }`
            );

            const normalizedRoleSkills = roleSkills.map((skill) => ({
              id: String(skill.skill_ID || skill.id), // Asegurar que sea string
              years: skill.years || 0,
              importance: skill.importance || 1,
            }));

            // Generar descripción del rol si no tiene
            let roleDescription = role.description;
            if (!roleDescription || roleDescription.trim() === "") {
              roleDescription = generateRoleDescription(
                role.name,
                normalizedRoleSkills,
                newSkillMap
              );
            }

            const normalizedRole = {
              ...role,
              skills: normalizedRoleSkills,
              description: roleDescription,
            };

            // Llamar al endpoint para obtener candidatos, incluyendo el skillMap
            // Dentro del useEffect donde procesas cada rol
            try {
              const apiResults = await getMatchesForRole(
                normalizedRole,
                employeesWithSkills,
                newSkillMap
              );

              // Asegurarnos de que cada candidato tenga todos los campos necesarios
              const bestMatches = apiResults.map((match) => ({
                id: match.id,
                name: match.name,
                avatar: match.avatar || null,
                score: match.combinedScore || match.score || 0,
                technicalScore: match.technicalScore || 0,
                contextualScore: match.contextualScore || 0,
                weights: match.weights || {
                  technical: 60,
                  contextual: 40,
                },
              }));

              // Ya no necesitamos ordenar aquí porque lo hacemos en getMatchesForRole
              const bestCandidate =
                bestMatches.length > 0 ? bestMatches[0] : null;

              return {
                id: role.id || `role-${index}`,
                role: role.name,
                area: role.area,
                yearsOfExperience: role.yearsOfExperience,
                skills: normalizedRoleSkills,
                description: normalizedRole.description,
                assigned: bestCandidate,
                allCandidates: bestMatches,
                matches: bestMatches.slice(1),
              };
            } catch (matchError) {
              console.error(
                `Error obteniendo matches para rol ${role.name}:`,
                matchError
              );
              return {
                id: role.id || `role-${index}`,
                role: role.name,
                area: role.area,
                yearsOfExperience: role.yearsOfExperience,
                skills: normalizedRoleSkills,
                description: normalizedRole.description,
                assigned: null,
                allCandidates: [],
                matches: [],
              };
            }
          })
        );

        console.log("Roles prepared:", {
          count: rolesWithSuggestions.length,
          sampleRole: rolesWithSuggestions[0]?.role || "N/A",
          sampleMatches: rolesWithSuggestions[0]?.matches?.length || 0,
        });

        setRoles(rolesWithSuggestions);

        // Inicializar el conjunto de IDs de empleados asignados
        const initiallyAssignedIds = new Set();
        rolesWithSuggestions.forEach((role) => {
          if (role.assigned) {
            initiallyAssignedIds.add(role.assigned.id);
          }
        });
        setAssignedEmployeeIds(initiallyAssignedIds);

        // Los datos iniciales no se consideran como cambios
        setDataChanged(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setSnackbar({
          open: true,
          message: `Error cargando datos: ${error.message}`,
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // handleEmployeeChange para actualizar el conjunto de IDs asignados
  const handleEmployeeChange = (roleIndex, newEmployeeId) => {
    setRoles((prevRoles) => {
      const updatedRoles = [...prevRoles];
      const currentRole = { ...updatedRoles[roleIndex] };

      // Si ya había un empleado asignado, removerlo del set de asignados
      if (currentRole.assigned) {
        setAssignedEmployeeIds((prev) => {
          const updated = new Set(prev);
          updated.delete(currentRole.assigned.id);
          return updated;
        });
      }

      const newEmployee = currentRole.allCandidates.find(
        (candidate) => candidate.id === newEmployeeId
      );
      if (!newEmployee) return prevRoles;

      // Agregar el nuevo empleado al set de asignados
      setAssignedEmployeeIds((prev) => {
        const updated = new Set(prev);
        updated.add(newEmployeeId);
        return updated;
      });

      currentRole.assigned = newEmployee;
      currentRole.matches = currentRole.allCandidates.filter(
        (candidate) => candidate.id !== newEmployee.id
      );
      updatedRoles[roleIndex] = currentRole;

      // Marcar que los datos han cambiado
      setDataChanged(true);

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
        priority: tempProjectData.projectData.priority || "Medium",
        supervisor_id: supervisorId,
      };

      const rolesData = roles.map((role) => ({
        name: role.role,
        area: role.area || "General",
        description:
          role.description ||
          `Role for ${role.role} in project ${projectData.title}`,
      }));
      const assignmentsData = roles
        .map((roleObj) => {
          if (!roleObj.assigned) return null;
          return {
            user_id: roleObj.assigned.id,
            role_name: roleObj.role,
            feedback_notes: `Assigned with ${
              roleObj.assigned.score || 0
            }% match score (Technical: ${
              roleObj.assigned.technicalScore || 0
            }%, Contextual: ${roleObj.assigned.contextualScore || 0}%)`,
          };
        })
        .filter(Boolean);
      const { data, error } = await supabase.rpc(
        "create_project_with_roles_and_assignments",
        {
          _project: projectData,
          _roles: rolesData,
          _assignments: assignmentsData,
        }
      );
      if (error) throw error;
      if (!data) throw new Error("No se obtuvo el ID del proyecto.");

      // Resetear el estado de cambios ya que hemos guardado
      setDataChanged(false);

      setSnackbar({
        open: true,
        message: `¡Proyecto "${projectData.title}" creado con éxito! ID: ${data}`,
        severity: "success",
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
        severity: "error",
      });
    } finally {
      setConfirming(false);
    }
  };

  const handleConfirmAssignments = () => {
    const hasUnassignedRoles = roles.some((role) => !role.assigned);
    if (hasUnassignedRoles) {
      setSnackbar({
        open: true,
        message:
          "Hay roles sin asignar. Por favor, asigna un empleado a cada rol.",
        severity: "warning",
      });
      return;
    }
    setDialogOpen(true);
  };

  const handleCancel = () => {
    confirmExit("/projects");
  };

  // Manejo de confirmación de salida
  const handleConfirmExit = () => {
    // Limpiar el estado de cambios y cerrar el diálogo
    setDataChanged(false);
    setExitDialogOpen(false);

    // Si teníamos un destino guardado, navegar hacia él
    if (exitDestination) {
      navigate(exitDestination);
      setExitDestination(null);
    }

    // Si no hay destino específico, simplemente permitir la salida
    localStorage.removeItem("tempProject");
  };

  const handleCancelExit = () => {
    setExitDialogOpen(false);
    setExitDestination(null);
  };

  // Cambiar supervisor
  const handleSupervisorChange = (newSupervisorId) => {
    setSupervisorId(newSupervisorId);
    setDataChanged(true);
  };

  // Usar useMemo para filtrar candidatos disponibles excluyendo los ya asignados
  const availableCandidates = useMemo(() => {
    const roleCandidates = roles[selectedRoleIndex]?.matches || [];

    // Filtrar candidatos que ya están asignados a otros roles
    return roleCandidates.filter(
      (candidate) =>
        !assignedEmployeeIds.has(candidate.id) ||
        // Excepción: incluir al empleado si está asignado al rol actual
        roles[selectedRoleIndex]?.assigned?.id === candidate.id
    );
  }, [selectedRoleIndex, roles, assignedEmployeeIds]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 60px)",
          backgroundColor: "#f9f9fc",
        }}
      >
        <CircularProgress
          size={60}
          sx={{ mb: 3, color: ACCENTURE_COLORS.corePurple1 }}
        />
        <Typography
          variant="h5"
          color={ACCENTURE_COLORS.corePurple3}
          fontWeight={600}
          mb={1}
        >
          Analizando perfiles
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Calculando compatibilidad entre candidatos y roles del proyecto
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 60px)",
        width: "100%",
        p: 4,
      }}
    >
      {/* Encabezado */}
      <Box mb={4} sx={{ px: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Assign Roles
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          ...contentPaperStyles,
          p: 0,
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "4px",
            background: ACCENTURE_COLORS.corePurple1,
          },
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            minHeight: "calc(100vh - 140px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ flexGrow: 1 }}>
            <Grid item xs={12} lg={6}>
              {/* Tarjeta de Supervisor */}
              <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                <SupervisorCard
                  supervisor={supervisors.find(
                    (u) => u.user_id === supervisorId
                  )}
                  available={supervisors}
                  onSelectSupervisor={handleSupervisorChange}
                />
              </Box>

              {/* Section 1 - Roles to Assign*/}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  minHeight: {
                    xs: "400px",
                    sm: "500px",
                    lg: "calc(100vh - 300px)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: ACCENTURE_COLORS.corePurple1,
                      color: "#fff",
                      width: { xs: 24, sm: 28 },
                      height: { xs: 24, sm: 28 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      mr: 1.5,
                      fontWeight: "bold",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    1
                  </Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color={ACCENTURE_COLORS.corePurple3}
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.125rem" },
                    }}
                  >
                    AI Suggested Role Assignments
                  </Typography>
                </Box>

                <Paper
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "none",
                    minHeight: 0, // Important for flex child to shrink
                  }}
                >
                  {roles.length > 0 ? (
                    <Box
                      sx={{
                        flexGrow: 1,
                        overflowY: "auto",
                        p: { xs: 1.5, sm: 2 },
                        minHeight: 0, // Important for proper scrolling
                        "&::-webkit-scrollbar": { width: "8px" },
                        "&::-webkit-scrollbar-track": {
                          backgroundColor: "rgba(0,0,0,0.02)",
                          borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: ACCENTURE_COLORS.accentPurple5,
                          borderRadius: "4px",
                          "&:hover": {
                            backgroundColor: ACCENTURE_COLORS.accentPurple4,
                          },
                        },
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
                            <Box sx={{ mt: 1, mb: 2, px: { xs: 0.5, sm: 1 } }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                  lineHeight: 1.4,
                                }}
                              >
                                <InfoIcon
                                  fontSize="inherit"
                                  sx={{
                                    mr: 0.5,
                                    mt: 0.1,
                                    color: ACCENTURE_COLORS.accentPurple3,
                                    flexShrink: 0,
                                  }}
                                />
                                <Box component="span">
                                  Descripción:{" "}
                                  {r.description?.substring(0, 100)}
                                  ...
                                </Box>
                              </Typography>
                              {r.assigned && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: "block",
                                    mt: 0.5,
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                    lineHeight: 1.4,
                                  }}
                                >
                                  Pesos: Técnico{" "}
                                  {r.assigned.weights?.technical || "60"}%,
                                  Contextual{" "}
                                  {r.assigned.weights?.contextual || "40"}%
                                </Typography>
                              )}
                            </Box>
                          )}
                        </React.Fragment>
                      ))}
                      {/* Add padding at the bottom to ensure last item is fully visible */}
                      <Box sx={{ height: "16px" }} />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexGrow: 1,
                        p: { xs: 2, sm: 4 },
                        minHeight: "200px",
                      }}
                    >
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          textAlign: "center",
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                      >
                        No hay roles definidos para este proyecto
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  minHeight: {
                    xs: "400px",
                    sm: "500px",
                    lg: "100%",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: ACCENTURE_COLORS.corePurple1,
                      color: "#fff",
                      width: { xs: 24, sm: 28 },
                      height: { xs: 24, sm: 28 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      mr: 1.5,
                      fontWeight: "bold",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    2
                  </Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color={ACCENTURE_COLORS.corePurple3}
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.125rem" },
                      lineHeight: 1.3,
                    }}
                  >
                    {roles.length > 0 ? (
                      <>
                        Candidate Matches for{" "}
                        <Typography
                          component="span"
                          color={ACCENTURE_COLORS.corePurple2}
                          sx={{
                            fontWeight: 700,
                            display: { xs: "block", sm: "inline" },
                            fontSize: { xs: "0.875rem", sm: "inherit" },
                          }}
                        >
                          {roles[selectedRoleIndex]?.role || ""}
                        </Typography>
                      </>
                    ) : (
                      "Candidate Matches"
                    )}
                  </Typography>
                </Box>

                <Paper
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "none",
                    backgroundColor: "rgba(255,255,255,0.8)",
                    minHeight: 0, // Important for flex child to shrink
                  }}
                >
                  <Box
                    sx={{
                      flexGrow: 1,
                      overflowY: "auto",
                      p: { xs: 1.5, sm: 2 },
                      minHeight: 0, // Important for proper scrolling
                      "&::-webkit-scrollbar": { width: "8px" },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: "rgba(0,0,0,0.02)",
                        borderRadius: "4px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: ACCENTURE_COLORS.accentPurple5,
                        borderRadius: "4px",
                        "&:hover": {
                          backgroundColor: ACCENTURE_COLORS.accentPurple4,
                        },
                      },
                    }}
                  >
                    {roles.length > 0 ? (
                      availableCandidates.length > 0 ? (
                        <>
                          {availableCandidates.map((match) => (
                            <MatchedEmployeeCard
                              key={match.id}
                              name={match.name}
                              avatar={match.avatar}
                              score={match.score || match.combinedScore || 0}
                              technicalScore={match.technicalScore || 0}
                              contextualScore={match.contextualScore || 0}
                              weights={
                                match.weights || {
                                  technical: 60,
                                  contextual: 40,
                                }
                              }
                              onSelect={() =>
                                handleEmployeeChange(
                                  selectedRoleIndex,
                                  match.id
                                )
                              }
                            />
                          ))}
                          {/* Add padding at the bottom to ensure last item is fully visible */}
                          <Box sx={{ height: "16px" }} />
                        </>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexGrow: 1,
                            p: { xs: 2, sm: 4 },
                            minHeight: "200px",
                          }}
                        >
                          <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                              textAlign: "center",
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                            }}
                          >
                            No hay más candidatos disponibles para este rol
                          </Typography>
                        </Box>
                      )
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexGrow: 1,
                          p: { xs: 2, sm: 4 },
                          minHeight: "200px",
                        }}
                      >
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{
                            textAlign: "center",
                            fontSize: { xs: "0.875rem", sm: "1rem" },
                          }}
                        >
                          Seleccione un rol primero
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: { xs: 2, sm: 3 } }} />

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "flex-end",
              gap: { xs: 2, sm: 0 },
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={confirming}
              sx={{
                mr: { xs: 0, sm: 2 },
                color: ACCENTURE_COLORS.accentPurple1,
                borderColor: ACCENTURE_COLORS.accentPurple1,
                "&:hover": {
                  borderColor: ACCENTURE_COLORS.accentPurple1,
                  backgroundColor: `${ACCENTURE_COLORS.accentPurple1}10`,
                },
                px: { xs: 2, sm: 3 },
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
              startIcon={<CloseIcon />}
            >
              CANCEL
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmAssignments}
              disabled={confirming || roles.length === 0}
              startIcon={
                confirming ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <CheckCircleIcon />
                )
              }
              sx={{
                fontWeight: 600,
                px: { xs: 2, sm: 3 },
                fontSize: { xs: "0.875rem", sm: "1rem" },
                backgroundColor: ACCENTURE_COLORS.corePurple1,
                "&:hover": {
                  backgroundColor: ACCENTURE_COLORS.corePurple2,
                },
              }}
            >
              {confirming ? "PROCESSING..." : "CONFIRM ASSIGNMENTS"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Diálogo de confirmación para guardar proyecto */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 500,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            pb: 1,
            color: ACCENTURE_COLORS.corePurple3,
            borderBottom: `1px solid ${ACCENTURE_COLORS.accentPurple5}`,
          }}
        >
          Confirmar Proyecto y Asignaciones
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText>
            Estás a punto de <strong>crear el proyecto y finalizar</strong> el
            proceso de asignación de roles. Se asignarán los siguientes roles:
            <Box component="ul" sx={{ mt: 2 }}>
              {roles.map((role, index) => (
                <Box component="li" key={index} sx={{ mb: 1 }}>
                  <strong>{role.role}</strong>:{" "}
                  {role.assigned?.name || "Sin asignar"}
                  {role.assigned?.score
                    ? ` (${role.assigned.score}% de compatibilidad)`
                    : ""}
                </Box>
              ))}
            </Box>
            ¿Deseas continuar con la creación del proyecto y las asignaciones?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            color="inherit"
            sx={{
              color: ACCENTURE_COLORS.accentPurple1,
              "&:hover": {
                backgroundColor: `${ACCENTURE_COLORS.accentPurple1}10`,
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleFinalConfirmation}
            variant="contained"
            autoFocus
            sx={{
              backgroundColor: ACCENTURE_COLORS.corePurple1,
              "&:hover": {
                backgroundColor: ACCENTURE_COLORS.corePurple2,
              },
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para salir */}
      <Dialog
        open={exitDialogOpen}
        onClose={handleCancelExit}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 500,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            pb: 1,
            color: ACCENTURE_COLORS.corePurple3,
            borderBottom: `1px solid ${ACCENTURE_COLORS.accentPurple5}`,
          }}
        >
          ¿Abandonar cambios?
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText>
            Tienes cambios sin guardar en las asignaciones de roles. Si sales
            ahora, perderás todos los cambios realizados.
            <Box
              sx={{
                mt: 2,
                fontWeight: 500,
                color: ACCENTURE_COLORS.corePurple3,
              }}
            >
              ¿Estás seguro de que deseas salir sin guardar?
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleCancelExit}
            color="inherit"
            autoFocus
            sx={{
              color: ACCENTURE_COLORS.accentPurple1,
              "&:hover": {
                backgroundColor: `${ACCENTURE_COLORS.accentPurple1}10`,
              },
            }}
          >
            Seguir editando
          </Button>
          <Button
            onClick={handleConfirmExit}
            variant="contained"
            sx={{
              backgroundColor: ACCENTURE_COLORS.corePurple1,
              "&:hover": {
                backgroundColor: ACCENTURE_COLORS.corePurple2,
              },
            }}
          >
            Salir sin guardar
          </Button>
        </DialogActions>
      </Dialog>

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
            width: "100%",
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RoleAssign;
