import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  useTheme,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export const AddRoleCard = () => {
  const theme = useTheme();
  const [skills, setSkills] = useState([
    { name: "NextJS", years: 3 },
    { name: "React", years: 2 },
  ]);

  const handleDeleteSkill = (index) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSkill = (skillName) => {
    // Verificar si la habilidad ya existe
    if (!skills.some(skill => skill.name === skillName)) {
      setSkills([...skills, { name: skillName, years: 1 }]);
    }
  };

  const handleChangeYears = (index, value) => {
    const newSkills = [...skills];
    newSkills[index].years = value;
    setSkills(newSkills);
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
          Create Role
        </Typography>
      </Box>

      {/* Contenido Principal - con flex-grow para que ocupe el espacio disponible */}
      <Box sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Área scrollable principal */}
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Grid container spacing={3}>
            {/* Columna izquierda: Detalles del rol */}
            <Grid item xs={12} md={6}>
              <Box mb={3}>
                <Typography fontWeight={600} mb={1} color="text.primary">
                  Role name
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Frontend Developer"
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
                  Area
                </Typography>
                <TextField
                  select
                  fullWidth
                  defaultValue="FRONTEND"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                    },
                  }}
                >
                  <MenuItem value="FRONTEND">FRONTEND</MenuItem>
                  <MenuItem value="BACKEND">BACKEND</MenuItem>
                  <MenuItem value="FULLSTACK">FULLSTACK</MenuItem>
                </TextField>
              </Box>
              
              <Box mb={3}>
                <Typography fontWeight={600} mb={1} color="text.primary">
                  Years of experience on the area
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="3"
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
            </Grid>
            
            {/* Columna derecha: Habilidades */}
            <Grid item xs={12} md={6}>
              <Box mb={3}>
                <Typography fontWeight={600} mb={1} color="text.primary">
                  Skill list
                </Typography>
                <Box sx={{ 
                  maxHeight: "415px", 
                  overflowY: "auto",
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "rgba(0,0,0,0.05)",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: theme.palette.primary.light,
                    borderRadius: "4px",
                  },
                }}>
                  {["React", "HTML 5", "Angular", "VueJS", "NextJS", "Tailwind CSS"].map((skill, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1.5,
                        mb: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Box 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: "4px",
                            backgroundColor: theme.palette.primary.light,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          {skill[0]}
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {skill}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {index % 2 === 0 ? "Component-based library" : "Framework"}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleAddSkill(skill)}
                        sx={{
                          minWidth: "32px",
                          width: "32px",
                          height: "32px",
                          p: 0,
                          color: theme.palette.primary.main,
                          borderColor: theme.palette.primary.main,
                          borderRadius: 1,
                        }}
                      >
                        +
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          {/* Skills Selected - Con scroll independiente */}
          <Box mb={3}>
            <Typography fontWeight={600} mb={1.5} color="text.primary">
              Skills selected
            </Typography>
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                maxHeight: "180px", // altura máxima fija
                overflow: "hidden", // oculta el contenido que excede el tamaño
              }}
            >
              <Box
                sx={{
                  maxHeight: "180px",
                  overflowY: "auto",
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "rgba(0,0,0,0.05)",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: theme.palette.primary.light,
                    borderRadius: "4px",
                  },
                }}
              >
                {skills.length > 0 ? (
                  skills.map((skill, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1.5,
                        borderBottom: index < skills.length - 1 ? "1px solid" : "none",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body2" fontWeight={500}>{skill.name}</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="caption" color="text.secondary">
                          Years of Experience
                        </Typography>
                        <TextField
                          size="small"
                          type="number"
                          value={skill.years}
                          onChange={(e) => handleChangeYears(index, e.target.value)}
                          InputProps={{
                            sx: { 
                              borderRadius: 1,
                              height: 32,
                              width: 60,
                            }
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteSkill(index)}
                          sx={{ 
                            color: "white",
                            backgroundColor: theme.palette.error.main,
                            width: 24,
                            height: 24,
                            '&:hover': {
                              backgroundColor: theme.palette.error.dark,
                            },
                            ml: 1
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      No skills selected yet
                    </Typography>
                  </Box>
                )}
              </Box>
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
            CREATE
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