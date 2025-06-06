import React, { useState } from "react";
import { Box, Grid, Typography, Paper, useTheme } from "@mui/material";
import { AddProjectCard } from "../components/AddProjectCard";
import { AddRoleCard } from "../components/AddRoleCard";
import { ACCENTURE_COLORS, contentPaperStyles } from "../styles/styles";
import { useDarkMode } from "../contexts/DarkModeContext";

const AddProject = () => {
  const theme = useTheme();
  const { darkMode } = useDarkMode();
  // Estado compartido entre componentes para los roles
  const [projectRoles, setProjectRoles] = useState([]);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState(null);

  // Función para manejar la creación de roles desde AddRoleCard
  const handleRoleCreated = (newRole) => {
    if (selectedRoleForEdit) {
      // Estamos editando un rol existente
      setProjectRoles(prev => 
        prev.map(role => 
          role.id === selectedRoleForEdit.id ? newRole : role
        )
      );
      setSelectedRoleForEdit(null); // Limpiar la selección después de editar
    } else {
      // Estamos agregando un nuevo rol
      setProjectRoles(prev => [...prev, newRole]);
    }
  };

  // Función para editar un rol
  const handleEditRole = (role) => {
    setSelectedRoleForEdit(role);
  };

  // Función para eliminar un rol
  const handleDeleteRole = (roleId) => {
    setProjectRoles(prev => prev.filter(role => role.id !== roleId));
    if (selectedRoleForEdit && selectedRoleForEdit.id === roleId) {
      setSelectedRoleForEdit(null); // Limpiar la selección si se elimina el rol que se estaba editando
    }
  };

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    setSelectedRoleForEdit(null);
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 60px)",
        width: "100%",
        p: 4,
        overflow: "auto", // Solo añadimos scroll a nivel de página
      }}
    >
      {/* Encabezado de página */}
      <Box mb={4} sx={{ px: 1 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600, 
            mb: 3,
            color: darkMode ? '#ffffff' : 'inherit'
          }}
        >
          Create New Project
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ width: "100%" }}>
        {/* Izquierda: Formulario de proyecto y lista de roles */}
        <Grid item xs={12} md={5} lg={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              ...contentPaperStyles,
              height: "auto", // Cambiamos a altura automática
              bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
              boxShadow: darkMode ? '0 2px 8px rgba(255, 255, 255, 0.04)' : contentPaperStyles.boxShadow,
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
            <AddProjectCard
              roles={projectRoles}
              onEditRole={handleEditRole}
              onDeleteRole={handleDeleteRole}
            />
          </Paper>
        </Grid>

        {/* Derecha: Formulario para crear/editar roles */}
        <Grid item xs={12} md={7} lg={8}>
          <Paper 
            elevation={0} 
            sx={{ 
              ...contentPaperStyles,
              height: "auto", // Cambiamos a altura automática
              bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
              boxShadow: darkMode ? '0 2px 8px rgba(255, 255, 255, 0.04)' : contentPaperStyles.boxShadow,
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
            <AddRoleCard
              onRoleCreated={handleRoleCreated}
              onCancel={handleCancelEdit}
              initialRole={selectedRoleForEdit}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddProject;