import React, { useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { AddProjectCard } from "../components/AddProjectCard";
import { AddRoleCard } from "../components/AddRoleCard";

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
        p: 4,
        minHeight: "calc(100vh - 60px)",
        width: "100%", 
      }}
    >
      <Grid container spacing={3}>
        {/* Izquierda: Formulario de proyecto y lista de roles */}
        <Grid item xs={12} md={4}>
          <AddProjectCard
            roles={projectRoles}
            onEditRole={handleEditRole}
            onDeleteRole={handleDeleteRole}
          />
        </Grid>

        {/* Derecha: Formulario para crear/editar roles */}
        <Grid item xs={12} md={8}>
          <AddRoleCard
            onRoleCreated={handleRoleCreated}
            onCancel={handleCancelEdit}
            initialRole={selectedRoleForEdit}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddProject;