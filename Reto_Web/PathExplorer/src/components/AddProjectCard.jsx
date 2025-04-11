import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  useTheme,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useNavigate } from "react-router-dom";

export const AddProjectCard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([
    "Frontend Developer",
    "Backend Developer",
  ]);

  const handleAddRole = () => {
    const newRole = `Role ${roles.length + 1}`;
    setRoles((prev) => [...prev, newRole]);
  };

  const handleDeleteRole = (index) => {
    setRoles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Paper 
      sx={{ 
        height: "100%", 
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
        borderRadius: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Encabezado */}
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          py: 2,
          px: 3,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
        }}
      >
        <Typography variant="h6" fontWeight={600} color="white">
          Add a project
        </Typography>
      </Box>

      {/* Contenido principal - con flex-grow para que ocupe el espacio disponible */}
      <Box sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Contenido scrollable */}
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          <Box mb={3}>
            <Typography fontWeight={600} mb={1} color="text.primary">
              Project title
            </Typography>
            <TextField
              fullWidth
              placeholder="Add project title here..."
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                },
              }}
            />
          </Box>

          <Box mb={3}>
            <Typography fontWeight={600} mb={1} color="text.primary">
              Description
            </Typography>
            <TextField
              fullWidth
              placeholder="Add a description here..."
              multiline
              rows={4}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                },
              }}
            />
          </Box>

          <Box display="flex" gap={3} mb={3}>
            <Box flex={1}>
              <Typography fontWeight={600} mb={1} color="text.primary">
                Status
              </Typography>
              <TextField
                select
                fullWidth
                defaultValue="Not Started"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                  },
                }}
              >
                <MenuItem value="Not Started">Not Started</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>
            </Box>
            <Box flex={1}>
              <Typography fontWeight={600} mb={1} color="text.primary">
                Priority
              </Typography>
              <TextField
                select
                fullWidth
                defaultValue="High"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                  },
                }}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </TextField>
            </Box>
          </Box>

          <Box mb={3}>
            <Typography fontWeight={600} mb={1} color="text.primary">
              Start Date
            </Typography>
            <TextField
              fullWidth
              type="date"
              defaultValue="2025-02-10"
              size="small"
              InputProps={{
                sx: {
                  borderRadius: 1,
                },
              }}
            />
          </Box>

          <Box mb={3}>
            <Typography fontWeight={600} mb={1} color="text.primary">
              End Date
            </Typography>
            <TextField
              fullWidth
              type="date"
              defaultValue="2025-10-25"
              size="small"
              InputProps={{
                sx: {
                  borderRadius: 1,
                },
              }}
            />
          </Box>

          <Box mb={3}>
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              mb={1.5}
            >
              <Typography fontWeight={600} color="text.primary">
                Role list
              </Typography>
              <Button
                startIcon={<AddCircleOutlineIcon />}
                size="small"
                variant="text"
                color="primary"
                onClick={handleAddRole}
                sx={{
                  textTransform: "uppercase",
                }}
              >
                ADD ROLE
              </Button>
            </Box>
            
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                p: 0,
                maxHeight: 200,
                overflowY: "auto",
              }}
            >
              {roles.map((role, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1.5,
                    borderBottom: index < roles.length - 1 ? "1px solid" : "none",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="body2" fontWeight={500}>{role}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteRole(index)}
                    sx={{ 
                      color: "white",
                      backgroundColor: theme.palette.error.main,
                      width: 24,
                      height: 24,
                      '&:hover': {
                        backgroundColor: theme.palette.error.dark,
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Contenedor para los botones - Posición fija en la parte inferior */}
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "center",
            pt: 3,
            mt: "auto", // Empuja hacia abajo
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/role-assign")}
            sx={{ 
              minWidth: 110, 
              mx: 1, 
              py: 1,
              px: 3, 
              borderRadius: 1,
              textTransform: "uppercase",
              fontWeight: 600,
              backgroundColor: theme.palette.primary.main,
            }}
          >
            ASSIGN
          </Button>
          <Button
            variant="contained"
            sx={{ 
              minWidth: 110, 
              mx: 1, 
              py: 1,
              px: 3, 
              borderRadius: 1,
              backgroundColor: theme.palette.grey[700],
              "&:hover": {
                backgroundColor: theme.palette.grey[800],
              },
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            CANCEL
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};