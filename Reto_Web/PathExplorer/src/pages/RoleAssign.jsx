import React, { useState } from "react";
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  useTheme, 
  Button, 
  Divider,
  IconButton,
  Chip
} from "@mui/material";
import AssistantIcon from "@mui/icons-material/Assistant";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import { alpha } from "@mui/material/styles";
import RoleCard from "../components/RoleCard";
import MatchedEmployeeCard from "../components/MatchedEmployeeCard";

// Base de datos inicial de empleados y roles
const initialRoles = [
  {
    id: "frontend1",
    role: "Frontend Developer",
    assigned: {
      id: "bruno",
      name: "Bruno Jiménez",
      avatar: "/avatars/1.jpg",
      score: 100,
    },
    allCandidates: [
      {
        id: "bruno",
        name: "Bruno Jiménez",
        avatar: "/avatars/1.jpg",
        score: 100,
      },
      {
        id: "valeria",
        name: "Valeria Oliva",
        avatar: "/avatars/6.jpg",
        score: 94,
      },
      {
        id: "daniel",
        name: "Daniel Morales",
        avatar: "/avatars/7.jpg",
        score: 90,
      },
      {
        id: "yeni",
        name: "Yeni Cruz",
        avatar: "/avatars/8.jpg",
        score: 83,
      },
    ],
  },
  {
    id: "frontend2",
    role: "Frontend Developer",
    assigned: {
      id: "bruno2",
      name: "Bruno Jiménez",
      avatar: "/avatars/1.jpg",
      score: 100,
    },
    allCandidates: [
      {
        id: "bruno2",
        name: "Bruno Jiménez",
        avatar: "/avatars/1.jpg",
        score: 100,
      },
      {
        id: "valeria2",
        name: "Valeria Oliva",
        avatar: "/avatars/6.jpg",
        score: 94,
      },
      {
        id: "daniel2",
        name: "Daniel Morales",
        avatar: "/avatars/7.jpg",
        score: 90,
      },
    ],
  },
  {
    id: "frontend3",
    role: "Frontend Developer",
    assigned: {
      id: "bruno3",
      name: "Bruno Jiménez",
      avatar: "/avatars/1.jpg",
      score: 100,
    },
    allCandidates: [
      {
        id: "bruno3",
        name: "Bruno Jiménez",
        avatar: "/avatars/1.jpg",
        score: 100,
      },
      {
        id: "valeria3",
        name: "Valeria Oliva",
        avatar: "/avatars/6.jpg",
        score: 94,
      },
    ],
  },
  {
    id: "frontend4",
    role: "Frontend Developer",
    assigned: {
      id: "bruno4",
      name: "Bruno Jiménez",
      avatar: "/avatars/1.jpg",
      score: 83,
    },
    allCandidates: [
      {
        id: "bruno4",
        name: "Bruno Jiménez",
        avatar: "/avatars/1.jpg",
        score: 83,
      },
      {
        id: "valeria4",
        name: "Valeria Oliva",
        avatar: "/avatars/6.jpg",
        score: 94,
      },
    ],
  },
  {
    id: "backend",
    role: "Backend Developer",
    assigned: {
      id: "andres",
      name: "Andrés Aguilar",
      avatar: "/avatars/2.jpg",
      score: 100,
    },
    allCandidates: [
      {
        id: "andres",
        name: "Andrés Aguilar",
        avatar: "/avatars/2.jpg",
        score: 100,
      },
      {
        id: "rodrigo",
        name: "Rodrigo Cortés",
        avatar: "/avatars/6.jpg",
        score: 93,
      },
      {
        id: "daniela",
        name: "Daniela Morales",
        avatar: "/avatars/7.jpg",
        score: 92,
      },
      {
        id: "carlos",
        name: "Carlos Pérez",
        avatar: "/avatars/8.jpg",
        score: 85,
      },
      {
        id: "juan",
        name: "Juan Pérez",
        avatar: "/avatars/8.jpg",
        score: 85,
      },
      {
        id: "amehd",
        name: "Amhed Pérez",
        avatar: "/avatars/8.jpg",
        score: 85,
      },
      {
        id: "dana",
        name: "Dana Pérez",
        avatar: "/avatars/8.jpg",
        score: 85,
      },
    ],
  },
];

const RoleAssign = () => {
  const theme = useTheme();
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  
  // Inicializar el estado con el formato correcto que incluye allCandidates y calcula matches
  const [roles, setRoles] = useState(() => {
    return initialRoles.map(role => ({
      ...role,
      // Calcular candidatos disponibles (todos excepto el asignado)
      matches: role.allCandidates.filter(candidate => 
        candidate.id !== role.assigned.id
      )
    }));
  });

  // Función para manejar el cambio de empleado asignado
  const handleEmployeeChange = (roleIndex, newEmployeeId) => {
    setRoles(prevRoles => {
      const updatedRoles = [...prevRoles];
      const currentRole = {...updatedRoles[roleIndex]};
      
      // Encontrar el nuevo empleado a asignar de la lista completa
      const newEmployee = currentRole.allCandidates.find(
        candidate => candidate.id === newEmployeeId
      );
      
      // Si no encontramos al empleado, no hacemos cambios
      if (!newEmployee) return prevRoles;
      
      // Guardar el empleado actualmente asignado (para intercambiarlo)
      const previouslyAssigned = currentRole.assigned;
      
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
  
  // Calcular los candidatos disponibles (excluyendo el asignado)
  const availableCandidates = roles[selectedRoleIndex]?.matches || [];

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
          Assign Roles
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
          {/* Left Side */}
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
                  name={r.assigned.name}
                  avatar={r.assigned.avatar}
                  percentage={r.assigned.score}
                  onClick={() => setSelectedRoleIndex(i)}
                  selected={selectedRoleIndex === i}
                />
              ))}
            </Box>
          </Grid>

          {/* Right Side */}
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
                Candidate Matches for{" "}
                <Typography 
                  component="span" 
                  color="primary"
                  sx={{ fontWeight: 700 }}
                >
                  {roles[selectedRoleIndex].role}
                </Typography>
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
              {availableCandidates.length > 0 ? (
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
                  <Typography>No other candidates available for this role</Typography>
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
            startIcon={<CheckCircleIcon />}
            sx={{ 
              fontWeight: 600,
              boxShadow: 2,
              px: 3,
              "&:hover": {
                boxShadow: 4,
              }
            }}
          >
            CONFIRM ASSIGNMENTS
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default RoleAssign;