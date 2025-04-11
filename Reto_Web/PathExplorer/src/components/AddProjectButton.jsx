// src/components/AddProjectButton.jsx
import React from "react";
import { Button, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

/**
 * Botón para agregar un nuevo proyecto
 * @param {function} onClick - Función a ejecutar cuando se hace clic en el botón
 */
const AddProjectButton = ({ onClick }) => {
  const theme = useTheme();

  return (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      fullWidth
      onClick={onClick}
      sx={{
        py: 1.5,
        bgcolor: theme.palette.primary.main,
        borderRadius: 1.5,
        textTransform: "none",
        fontWeight: 500,
        boxShadow: "none",
        "&:hover": {
          bgcolor: theme.palette.primary.dark,
          boxShadow: "none",
        },
      }}
    >
      Add Project
    </Button>
  );
};

export default AddProjectButton;
