import React from "react";
import { Paper, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const RoleItem = ({ title, onDelete }) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: 2,
        py: 1,
      }}
    >
      <Typography>{title}</Typography>
      <IconButton onClick={onDelete}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
};

export default RoleItem;
