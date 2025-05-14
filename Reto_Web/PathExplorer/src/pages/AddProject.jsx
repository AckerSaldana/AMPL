import React, { useState } from "react";
import { Box, Grid, Typography, Paper } from "@mui/material";
import { AddProjectCard } from "../components/AddProjectCard";
import { AddRoleCard } from "../components/AddRoleCard";
import { ACCENTURE_COLORS, contentPaperStyles } from "../styles/styles";

const AddProject = () => {
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
        height: "100%",
        width: "100%",
        p: 4,
      }}
    >
      {/* Encabezado de página */}
      <Box mb={4} sx={{ px: 1 }}>
        <Typography 
          variant="h4" 
          sx={{ fontWeight: 600, mb: 3 }}
        >
          Create New Project
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ height: "calc(100% - 100px)" }}>
        {/* Izquierda: Formulario de proyecto y lista de roles */}
        <Grid item xs={12} md={5} lg={4} sx={{ height: { md: "100%" } }}>
          <Paper 
            elevation={0} 
            sx={{ 
              ...contentPaperStyles,
              height: "100%",
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
        <Grid item xs={12} md={7} lg={8} sx={{ height: { md: "100%" } }}>
          <Paper 
            elevation={0} 
            sx={{ 
              ...contentPaperStyles,
              height: "100%",
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