import React, { useState } from "react";
import { Box, Grid, Typography, Paper } from "@mui/material";
import { AddProjectCard } from "../components/AddProjectCard";
import { AddRoleCard } from "../components/AddRoleCard";
import { contentPaperStyles } from "../styles/styles";

import { useTheme } from "@mui/material/styles";

const AddProject = () => {
  const theme = useTheme();
  // Estado compartido entre componentes para los roles
  const [projectRoles, setProjectRoles] = useState([]);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState(null);

  // Función para manejar la creación de roles desde AddRoleCard
  const handleRoleCreated = (newRole) => {
    if (selectedRoleForEdit) {
      // Estamos editando un rol existente
      setProjectRoles((prev) =>
        prev.map((role) =>
          role.id === selectedRoleForEdit.id ? newRole : role
        )
      );
      setSelectedRoleForEdit(null); // Limpiar la selección después de editar
    } else {
      // Estamos agregando un nuevo rol
      setProjectRoles((prev) => [...prev, newRole]);
    }
  };

  // Función para editar un rol
  const handleEditRole = (role) => {
    setSelectedRoleForEdit(role);
  };

  // Función para eliminar un rol
  const handleDeleteRole = (roleId) => {
    setProjectRoles((prev) => prev.filter((role) => role.id !== roleId));
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
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
          Create New Project
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ width: "100%" }}>
        {/* Izquierda: Formulario de proyecto y lista de roles */}
        <Grid item xs={12} md={5} lg={4}>
          <Paper
            elevation={0}
            sx={{
              ...contentPaperStyles(theme),
              height: "auto", // Cambiamos a altura automática
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "4px",
                background: theme.palette.primary.main,
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
              ...contentPaperStyles(theme),
              height: "auto", // Cambiamos a altura automática
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "4px",
                background: theme.palette.primary.main,
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
