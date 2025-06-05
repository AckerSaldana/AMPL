// src/components/AddProjectButton.jsx
import React from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { primaryButtonStyles } from "../styles/styles";
import { useTheme } from "@mui/material/styles";

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
        ...primaryButtonStyles,
        py: 1.5,
        bgcolor: theme.palette.primary.main,
        borderRadius: 1.5,
        fontSize: "0.875rem",
        fontWeight: 500,
        transition: "all 0.2s ease",
        "&:hover": {
          bgcolor: theme.palette.primary.main,
          boxShadow: "0 4px 10px rgba(161, 0, 255, 0.25)",
        },
        "&:active": {
          transform: "translateY(0)",
          boxShadow: "0 1px 3px rgba(161, 0, 255, 0.15)",
        },
      }}
    >
      Add Project
    </Button>
  );
};

export default AddProjectButton;
