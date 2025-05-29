import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  useTheme,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  Divider,
  Stack,
  Paper,
  Fade,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import CategoryIcon from "@mui/icons-material/Category";
import DescriptionIcon from "@mui/icons-material/Description";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import TimerIcon from "@mui/icons-material/Timer";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import {
  ACCENTURE_COLORS,
  formFieldStyles,
  primaryButtonStyles,
  outlineButtonStyles,
  chipStyles,
} from "../styles/styles";
import CertificatePicker from "../components/CertificatePicker.jsx";
import SelectedCertificates from "../components/SelectedCertificates.jsx";

export const AddRoleCard = ({
  onRoleCreated,
  onCancel,
  initialRole = null,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [roleData, setRoleData] = useState({
    id: Date.now(),
    name: "",
    area: "FRONTEND",
    description: "",
    skills: [],
  });

  // Estado para las skills disponibles de la base de datos
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleCertificates, setRoleCertificates] = useState([]);

  // Cargar datos del rol si estamos editando
  useEffect(() => {
    if (initialRole) {
      setRoleData({
        id: initialRole.id,
        name: initialRole.name || "",
        area: initialRole.area || "FRONTEND",
        description: initialRole.description || "",
        skills:
          initialRole.skills?.map((skill) => ({
            id: skill.id || skill.skill_ID,
            name: skill.name,
            years: skill.years,
          })) || [],
      });

      // Cargar certificados si existen
      if (initialRole.certificates && Array.isArray(initialRole.certificates)) {
        setRoleCertificates(initialRole.certificates);
      }
    }
  }, [initialRole]);

  // Cargar skills desde la base de datos
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoadingSkills(true);
        const { data, error } = await supabase
          .from("Skill")
          .select("skill_ID, name, description, category, type");

        if (error) throw error;

        // Transformar datos para el formato que necesitamos
        const formattedSkills = data.map((skill) => ({
          id: skill.skill_ID,
          name: skill.name,
          description: skill.description || skill.category || "Skill",
          type: skill.type || "Technical", // Por defecto es técnica si no hay valor
        }));

        setAvailableSkills(formattedSkills);
      } catch (error) {
        console.error("Error fetching skills:", error);
        setSnackbar({
          open: true,
          message: "Error cargando las habilidades",
          severity: "error",
        });
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchSkills();
  }, []);

  // Filtrado de habilidades
  const filteredSkills = availableSkills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estados UI
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Handlers para el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoleData({
      ...roleData,
      [name]: value,
    });
  };

  // Manejar skills
  const handleDeleteSkill = (index) => {
    const newSkills = [...roleData.skills];
    newSkills.splice(index, 1);
    setRoleData({ ...roleData, skills: newSkills });
  };

  const handleAddSkill = (skillId) => {
    // Encontrar la skill por ID
    const skillToAdd = availableSkills.find((skill) => skill.id === skillId);

    if (!skillToAdd) {
      console.error(`Skill with ID ${skillId} not found`);
      return;
    }

    // Verificar si la habilidad ya existe
    if (!roleData.skills.some((skill) => skill.id === skillId)) {
      setRoleData({
        ...roleData,
        skills: [
          ...roleData.skills,
          {
            id: skillId,
            skill_ID: skillId, // Añadir para compatibilidad
            name: skillToAdd.name,
            years: 1,
            importance: 1, // Añadir para compatibilidad con el API de matching
          },
        ],
      });
    } else {
      // Mostrar mensaje de que la habilidad ya existe
      setSnackbar({
        open: true,
        message: "This skill is already in your list",
        severity: "info",
      });
    }
  };

  const handleChangeYears = (index, value) => {
    const newSkills = [...roleData.skills];
    newSkills[index].years = parseInt(value) || 0;
    setRoleData({ ...roleData, skills: newSkills });
  };

  // Enviar el formulario
  const handleSubmit = () => {
    // Validar datos
    if (!roleData.name.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a role name",
        severity: "warning",
      });
      return;
    }

    try {
      setLoading(true);

      // Preparar el rol con el formato esperado para RoleAssign - Sin yearsOfExperience
      // Dentro de handleSubmit, actualiza el objeto formattedRole:
      const formattedRole = {
        id: roleData.id,
        name: roleData.name,
        area: roleData.area,
        description: roleData.description,
        skills: roleData.skills.map((skill) => ({
          id: skill.id,
          skill_ID: skill.id,
          name: skill.name,
          years: skill.years,
          importance: skill.importance || 1,
        })),
        certificates: roleCertificates,
      };

      // Llamar al callback con los datos del rol
      if (typeof onRoleCreated === "function") {
        onRoleCreated(formattedRole);

        // Si todo va bien, mostrar mensaje de éxito
        setSnackbar({
          open: true,
          message: initialRole
            ? "Role updated successfully"
            : "Role added successfully",
          severity: "success",
        });

        // Limpiar formulario si no estamos editando
        if (!initialRole) {
          setRoleData({
            id: Date.now(),
            name: "",
            area: "FRONTEND",
            description: "",
            skills: [],
          });
          setRoleCertificates([]);
        }
      } else {
        console.error("onRoleCreated is not a function", onRoleCreated);
        throw new Error(
          "Error al guardar el rol: onRoleCreated no es una función"
        );
      }
    } catch (error) {
      console.error("Error saving role:", error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Manejar certificados
  const handleAddCertificate = (certificate) => {
    if (!roleCertificates.some((cert) => cert.id === certificate.id)) {
      setRoleCertificates([...roleCertificates, certificate]);
    } else {
      setSnackbar({
        open: true,
        message: "This certificate is already in your list",
        severity: "info",
      });
    }
  };

  const handleRemoveCertificate = (index) => {
    const newCertificates = [...roleCertificates];
    newCertificates.splice(index, 1);
    setRoleCertificates(newCertificates);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Encabezado */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          fontWeight={600}
          color={ACCENTURE_COLORS.corePurple3}
          gutterBottom
        >
          {initialRole ? "Edit Role" : "Create Role"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {initialRole
            ? "Update the details and skills for this role"
            : "Define a new role for the project by providing details and required skills"}
        </Typography>
      </Box>

      {/* Role Information - Full Width */}
      <Grid container spacing={3} sx={{ mb: 3, flexGrow: 0 }}>
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{
                color: ACCENTURE_COLORS.corePurple2,
                mb: 2,
                pb: 1,
                borderBottom: `1px solid ${ACCENTURE_COLORS.accentPurple5}`,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <PersonIcon fontSize="small" />
              Role Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography
                  fontWeight={600}
                  mb={0.5}
                  color="text.primary"
                  fontSize="0.875rem"
                >
                  Role name *
                </Typography>
                <TextField
                  fullWidth
                  name="name"
                  value={roleData.name}
                  onChange={handleInputChange}
                  placeholder="Frontend Developer"
                  size="small"
                  required
                  sx={{
                    ...formFieldStyles,
                    "& .MuiOutlinedInput-root": {
                      ...formFieldStyles["& .MuiOutlinedInput-root"],
                      backgroundColor: "rgba(255,255,255,0.6)",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography
                  fontWeight={600}
                  mb={0.5}
                  color="text.primary"
                  fontSize="0.875rem"
                >
                  Area
                </Typography>
                <TextField
                  select
                  fullWidth
                  name="area"
                  value={roleData.area}
                  onChange={handleInputChange}
                  size="small"
                  sx={{
                    ...formFieldStyles,
                    "& .MuiOutlinedInput-root": {
                      ...formFieldStyles["& .MuiOutlinedInput-root"],
                      backgroundColor: "rgba(255,255,255,0.6)",
                    },
                  }}
                >
                  <MenuItem value="FRONTEND">FRONTEND</MenuItem>
                  <MenuItem value="BACKEND">BACKEND</MenuItem>
                  <MenuItem value="FULLSTACK">FULLSTACK</MenuItem>
                  <MenuItem value="DEVOPS">DEVOPS</MenuItem>
                  <MenuItem value="UX/UI">UX/UI</MenuItem>
                  <MenuItem value="QA">QA</MenuItem>
                  <MenuItem value="MOBILE">MOBILE</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography
                  fontWeight={600}
                  mb={0.5}
                  color="text.primary"
                  fontSize="0.875rem"
                >
                  Description
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="description"
                  value={roleData.description}
                  onChange={handleInputChange}
                  placeholder="Add a description here..."
                  sx={{
                    ...formFieldStyles,
                    "& .MuiOutlinedInput-root": {
                      ...formFieldStyles["& .MuiOutlinedInput-root"],
                      backgroundColor: "rgba(255,255,255,0.6)",
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Skills Section */}
      <Grid container spacing={3} sx={{ mb: 3, flexGrow: 1 }}>
        {/* Available Skills - Left Column */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(0,0,0,0.05)",
              height: "400px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{
                color: ACCENTURE_COLORS.corePurple2,
                mb: 2,
                pb: 1,
                borderBottom: `1px solid ${ACCENTURE_COLORS.accentPurple5}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CategoryIcon fontSize="small" />
                Available Skills
              </Box>
              <Chip
                label={`${availableSkills.length} total`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.625rem",
                  bgcolor: ACCENTURE_COLORS.accentPurple5,
                  color: ACCENTURE_COLORS.corePurple2,
                  fontWeight: 600,
                }}
              />
            </Typography>

            {/* Buscador de skills */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                mb: 2,
                ...formFieldStyles,
                "& .MuiOutlinedInput-root": {
                  ...formFieldStyles["& .MuiOutlinedInput-root"],
                  backgroundColor: "white",
                  borderRadius: 6,
                  fontSize: "0.8rem",
                },
              }}
            />

            <Box
              sx={{
                flexGrow: 1,
                overflow: "hidden",
                position: "relative",
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(0,0,0,0.03)",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  overflowY: "auto",
                  py: 1,
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "rgba(0,0,0,0.02)",
                    borderRadius: "3px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: ACCENTURE_COLORS.accentPurple5,
                    borderRadius: "3px",
                    "&:hover": {
                      backgroundColor: ACCENTURE_COLORS.accentPurple4,
                    },
                  },
                }}
              >
                {loadingSkills ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                    <CircularProgress
                      size={24}
                      sx={{ color: ACCENTURE_COLORS.corePurple1 }}
                    />
                  </Box>
                ) : filteredSkills.length > 0 ? (
                  <Stack spacing={1} sx={{ px: 1.5 }}>
                    {filteredSkills.map((skill, index) => (
                      <Fade
                        key={skill.id}
                        in={true}
                        timeout={300}
                        style={{ transitionDelay: `${index * 30}ms` }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: "white",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                            border: "1px solid rgba(0,0,0,0.04)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                              borderColor: ACCENTURE_COLORS.accentPurple4,
                              transform: "translateY(-1px)",
                            },
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: "6px",
                                backgroundColor: `${ACCENTURE_COLORS.corePurple1}15`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: ACCENTURE_COLORS.corePurple2,
                                fontWeight: "bold",
                                fontSize: "0.7rem",
                                flexShrink: 0,
                              }}
                            >
                              {skill.name[0].toUpperCase()}
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight={500}
                                color={ACCENTURE_COLORS.corePurple3}
                                fontSize="0.8rem"
                              >
                                {skill.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontSize: "0.7rem",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <Box
                                  component="span"
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    bgcolor:
                                      skill.type === "Soft"
                                        ? ACCENTURE_COLORS.accentPurple1
                                        : ACCENTURE_COLORS.corePurple2,
                                  }}
                                />
                                {skill.description}
                              </Typography>
                            </Box>
                          </Box>
                          <Tooltip title="Add skill">
                            <Box>
                              <IconButton
                                size="small"
                                onClick={() => handleAddSkill(skill.id)}
                                disabled={roleData.skills.some(
                                  (s) => s.id === skill.id
                                )}
                                sx={{
                                  color: ACCENTURE_COLORS.corePurple1,
                                  bgcolor: roleData.skills.some(
                                    (s) => s.id === skill.id
                                  )
                                    ? `${ACCENTURE_COLORS.accentPurple4}50`
                                    : `${ACCENTURE_COLORS.accentPurple5}90`,
                                  width: 28,
                                  height: 28,
                                  "&:hover": {
                                    bgcolor: ACCENTURE_COLORS.accentPurple5,
                                  },
                                  "&.Mui-disabled": {
                                    bgcolor: `${ACCENTURE_COLORS.accentPurple4}30`,
                                    color: `${ACCENTURE_COLORS.corePurple1}50`,
                                  },
                                }}
                              >
                                <AddCircleIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          </Tooltip>
                        </Box>
                      </Fade>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: "center", p: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No skills match your search
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Selected Skills - Right Column */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: "1px solid rgba(0,0,0,0.08)",
              bgcolor: "white",
              height: "400px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ p: 2.5, pb: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color={ACCENTURE_COLORS.corePurple2}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <AutoAwesomeIcon fontSize="small" />
                  Selected Skills
                </Typography>
                <Chip
                  label={`${roleData.skills.length} skills`}
                  size="small"
                  sx={{
                    bgcolor: `${ACCENTURE_COLORS.corePurple1}15`,
                    color: ACCENTURE_COLORS.corePurple2,
                    fontWeight: 600,
                    height: 20,
                    fontSize: "0.625rem",
                  }}
                />
              </Box>
            </Box>

            {roleData.skills.length > 0 ? (
              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: "auto",
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "rgba(0,0,0,0.02)",
                    borderRadius: "3px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: ACCENTURE_COLORS.accentPurple5,
                    borderRadius: "3px",
                    "&:hover": {
                      backgroundColor: ACCENTURE_COLORS.accentPurple4,
                    },
                  },
                }}
              >
                {roleData.skills.map((skill, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 2,
                      borderBottom:
                        index < roleData.skills.length - 1
                          ? "1px solid"
                          : "none",
                      borderColor: "rgba(0,0,0,0.04)",
                      transition: "background-color 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.01)",
                      },
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "8px",
                          backgroundColor: `${ACCENTURE_COLORS.corePurple1}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: ACCENTURE_COLORS.corePurple2,
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                        }}
                      >
                        {skill.name[0].toUpperCase()}
                      </Box>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        color={ACCENTURE_COLORS.corePurple3}
                      >
                        {skill.name}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          bgcolor: "rgba(0,0,0,0.02)",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1.5,
                        }}
                      >
                        <TimerIcon
                          sx={{
                            fontSize: 16,
                            color: ACCENTURE_COLORS.corePurple2,
                          }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Years
                        </Typography>
                        <TextField
                          size="small"
                          type="number"
                          value={skill.years}
                          onChange={(e) =>
                            handleChangeYears(index, e.target.value)
                          }
                          inputProps={{ min: 0 }}
                          InputProps={{
                            sx: {
                              borderRadius: 1,
                              height: 28,
                              width: 50,
                              py: 0,
                              "& input": {
                                p: 0.75,
                                textAlign: "center",
                              },
                            },
                          }}
                        />
                      </Box>
                      <Tooltip title="Remove skill">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteSkill(index)}
                          sx={{
                            color: "white",
                            backgroundColor: ACCENTURE_COLORS.red,
                            width: 28,
                            height: 28,
                            opacity: 0.8,
                            "&:hover": {
                              backgroundColor: ACCENTURE_COLORS.red,
                              opacity: 1,
                            },
                            ml: 0.5,
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  p: 4,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  opacity: 0.7,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <CategoryIcon
                    sx={{ fontSize: 36, color: ACCENTURE_COLORS.accentPurple3 }}
                  />
                  No skills selected yet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Add skills from the list on the left
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Certificates Section */}
      <Grid container spacing={3} sx={{ mb: 3, flexGrow: 0 }}>
        {/* Available Certificates - Left Column */}
        <Grid item xs={12} md={6}>
          <CertificatePicker
            onCertificateAdd={handleAddCertificate}
            selectedCertificateIds={roleCertificates.map((cert) => cert.id)}
          />
        </Grid>

        {/* Selected Certificates - Right Column */}
        <Grid item xs={12} md={6}>
          <SelectedCertificates
            certificates={roleCertificates}
            onCertificateRemove={handleRemoveCertificate}
          />
        </Grid>
      </Grid>

      {/* Contenedor para los botones */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          pt: 2,
          mt: "auto",
          flexShrink: 0,
        }}
      >
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : null
          }
          sx={{
            ...primaryButtonStyles,
            minWidth: 130,
            mx: 1,
            backgroundColor: ACCENTURE_COLORS.corePurple1,
            "&:hover": {
              backgroundColor: ACCENTURE_COLORS.corePurple2,
            },
          }}
        >
          {initialRole ? "UPDATE" : "CREATE"}
        </Button>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
          sx={{
            ...outlineButtonStyles,
            minWidth: 130,
            mx: 1,
            borderColor: ACCENTURE_COLORS.accentPurple1,
            color: ACCENTURE_COLORS.accentPurple1,
            "&:hover": {
              borderColor: ACCENTURE_COLORS.accentPurple1,
              backgroundColor: `${ACCENTURE_COLORS.accentPurple1}10`,
            },
          }}
        >
          CANCEL
        </Button>
      </Box>

      {/* Snackbar para mensajes */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
