import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  TextField,
  Button,
  Divider,
  Grid,
  IconButton,
  useTheme,
  alpha,
  Autocomplete,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add,
  Code,
  Psychology,
  Close,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { supabase } from "../supabase/supabaseClient";

export const AddSkillsCard = ({ userId, userRole, darkMode = false }) => {
  const theme = useTheme();
  const [skills, setSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [category, setCategory] = useState("technical");
  const [expanded, setExpanded] = useState({
    technical: true,
    soft: true,
  });

  useEffect(() => {
    const fetchSkillsCard = async () => {
      try{
        setIsLoading(true);

        // Get all available skills
          const { data: allSkills, error: skillError } = await supabase
          .from('Skill')
          .select('skill_ID, name, type');

        if (skillError) throw skillError;

        // Get skills and their proficiency
          const { data: userSkills, error: userSkillError } = await supabase
          .from('UserSkill')
          .select('skill_ID, proficiency')
          .eq('user_ID', userId);

        if (userSkillError) throw userSkillError;

        const userSkillMap = {};
        userSkills.forEach(({ skill_ID, proficiency }) => {
          userSkillMap[skill_ID] = proficiency;
        });

        const userSkillList = allSkills
        .filter((skill) => userSkillMap[skill.skill_ID])
        .map(({ skill_ID, name, type }) => {
          const category =
            type === "Technical Skill"
              ? "technical"
              : type === "Soft Skill"
              ? "soft"
              : "other";

          return {
            id: skill_ID,
            name,
            category,
            level: userSkillMap[skill_ID] || 1,
            proficiency: userSkillMap[skill_ID] || 1,
          };
        });

      setSkills(userSkillList);

      const skillIDsUserHas = new Set(userSkills.map(s => s.skill_ID));

      const remainingSkills = allSkills
        .filter(skill => !skillIDsUserHas.has(skill.skill_ID))
        .map(({ skill_ID, name, type }) => ({
          id: skill_ID,
          name,
          category: type === "Technical Skill" ? "technical" : "soft",
        }));

      setAvailableSkills(remainingSkills);


    } catch (error) {
      console.error("Error fetching skills:", error);
      setError(error.message);
      setSkills([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (userId) {
    fetchSkillsCard();
  }
}, [userId]);

  // Predefined skill suggestions by category
  const getFallbackSkillSuggestions = {
    technical: [
      "JavaScript",
      "React",
      "Node.js",
      "TypeScript",
      "HTML",
      "CSS",
      "Python",
      "Java",
      "C#",
      "PHP",
      "Vue.js",
      "Angular",
      "Express",
      "MongoDB",
      "MySQL",
      "PostgreSQL",
    ],
    soft: [
      "Communication",
      "Teamwork",
      "Problem Solving",
      "Leadership",
      "Adaptability",
      "Time Management",
      "Creativity",
      "Empathy",
      "Critical Thinking",
      "Emotional Intelligence",
    ],
  };

  // Group skills by category
  const getFallbackGroupedSkills = {
    technical: skills.filter((skill) => skill.category === "technical"),
    soft: skills.filter((skill) => skill.category === "soft"),
  };

  const handleOpenDialog = (categoryType) => {
    setCategory(categoryType);
    setNewSkill("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleAddSkill = async () => {
    const trimmedSkill = newSkill.trim();
  
    if (trimmedSkill !== "") {
      
      const skillToAdd = availableSkills.find(
        (s) =>
          s.name.toLowerCase() === trimmedSkill.toLowerCase() &&
          s.category === category
      );
  
      if (!skillToAdd) {
        console.warn("Skill not found or already added.");
        return;
      }
  
      try {
        const { error } = await supabase.from("UserSkill").insert({
          user_ID: userId,
          skill_ID: skillToAdd.id,
          proficiency: "Low", // Nivel por defecto
        });
  
        if (error) throw error;
  
        const newSkillObj = {
          id: skillToAdd.id,
          name: skillToAdd.name,
          category: skillToAdd.category,
          level: "Low",
        };
  
        setSkills([...skills, newSkillObj]);
  
        setAvailableSkills(
          availableSkills.filter((s) => s.id !== skillToAdd.id)
        );
  
        setNewSkill("");
        handleCloseDialog();
      } catch (err) {
        console.error("Error inserting skill:", err.message);
      }
    }
  };
  
  const handleRemoveSkill = async (skillId) => {
    try {
      const { error } = await supabase
        .from("UserSkill")
        .delete()
        .eq("user_ID", userId)
        .eq("skill_ID", skillId);
  
      if (error) throw error;
  
      const removedSkill = skills.find((s) => s.id === skillId);
  
      setSkills(skills.filter((skill) => skill.id !== skillId));
  
      if (removedSkill) {
        setAvailableSkills([
          ...availableSkills,
          {
            id: removedSkill.id,
            name: removedSkill.name,
            category: removedSkill.category,
          },
        ]);
      }
    } catch (err) {
      console.error("Error deleting skill:", err.message);
    }
  };  

  const handleToggleCategory = (categoryType) => {
    setExpanded({
      ...expanded,
      [categoryType]: !expanded[categoryType],
    });
  };

  const getCategoryIcon = (categoryType) => {
    switch (categoryType) {
      case "technical":
        return <Code />;
      case "soft":
        return <Psychology />;
      default:
        return <Code />;
    }
  };

  const getCategoryColor = (categoryType) => {
    switch (categoryType) {
      case "technical":
        return theme.palette.primary.main;
      case "soft":
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const getSkillLevel = (level) => {
    switch (level) {
      case 1:
        return "Basic";
      case 2:
        return "Intermediate";
      case 3:
        return "Advanced";
      case 4:
        return "Expert";
      default:
        return "Intermediate";
    }
  };

  const renderSkillCategory = (categoryType, title, skills) => {
    const categoryColor = getCategoryColor(categoryType);
    
    return (
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            mb: 1,
          }}
          onClick={() => handleToggleCategory(categoryType)}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: alpha(categoryColor, 0.1),
                mr: 1.5,
              }}
            >
              {React.cloneElement(getCategoryIcon(categoryType), {
                fontSize: "small",
                sx: { color: categoryColor },
              })}
            </Box>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              sx={{ color: categoryColor }}
            >
              {title}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button
              size="small"
              startIcon={<Add />}
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDialog(categoryType);
              }}
              sx={{
                mr: 1,
                borderColor: alpha(categoryColor, 0.5),
                color: categoryColor,
                "&:hover": {
                  borderColor: categoryColor,
                  backgroundColor: alpha(categoryColor, 0.05),
                },
              }}
            >
              Add
            </Button>
            <IconButton
              size="small"
              sx={{ color: "text.secondary" }}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleCategory(categoryType);
              }}
            >
              {expanded[categoryType] ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>
        
        {expanded[categoryType] && (
          <Box sx={{ mt: 2 }}>
            {skills.length > 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {skills.map((skill) => (
                  <Tooltip
                    key={skill.id}
                    title={getSkillLevel(skill.level)}
                    arrow
                  >
                    <Chip
                      label={skill.name}
                      sx={{
                        bgcolor: alpha(categoryColor, 0.08),
                        color: darkMode ? '#ffffff' : "text.primary",
                        borderColor: alpha(categoryColor, 0.2),
                        "& .MuiChip-deleteIcon": {
                          color: alpha(categoryColor, 0.7),
                          "&:hover": {
                            color: categoryColor,
                          },
                        },
                      }}
                      variant="outlined"
                      onDelete={() => handleRemoveSkill(skill.id)}
                      deleteIcon={<Close fontSize="small" />}
                    />
                  </Tooltip>
                ))}
              </Box>
            ) : (
              <Typography
                variant="body2"
                color={darkMode ? 'rgba(255,255,255,0.7)' : "text.secondary"}
                sx={{ fontStyle: "italic", py: 1 }}
              >
                No skills added in this category yet.
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Card elevation={0} sx={{ 
      borderRadius: 2, 
      boxShadow: darkMode ? "0 2px 10px rgba(255,255,255,0.05)" : "0 2px 10px rgba(0,0,0,0.05)",
      backgroundColor: darkMode ? '#2e2e2e' : '#ffffff',
      border: darkMode ? '1px solid rgba(255,255,255,0.12)' : 'none'
    }}>
      <CardContent>
        <Typography
          variant="h6"
          fontWeight="bold"
          mb={2}
          display="flex"
          alignItems="center"
          color={darkMode ? '#bb86fc' : "primary.main"}
        >
          <Code sx={{ mr: 1 }} /> Skills & Competencies
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            {renderSkillCategory(
              "technical",
              "Technical Skills",
              skills.filter((skill) => skill.category === "technical")
            )}
            {renderSkillCategory(
              "soft",
              "Soft Skills",
              skills.filter((skill) => skill.category === "soft")
            )}
          </Grid>
        </Grid>
      </CardContent>

      {/* Dialog for adding new skill */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: darkMode ? '#2e2e2e' : '#ffffff',
          color: darkMode ? '#ffffff' : '#000000'
        }}>
          Add new {category === "technical" ? "technical" : "soft"} skill
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: darkMode ? '#2e2e2e' : '#ffffff' }}>
          <Autocomplete
            freeSolo
            options={
              availableSkills
                .filter((s) => s.category === category)
                .map((s) => s.name)
            }
            inputValue={newSkill}
            onInputChange={(_, value) => setNewSkill(value)}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label="Skill name"
                variant="outlined"
                autoFocus
                margin="dense"
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ backgroundColor: darkMode ? '#2e2e2e' : '#ffffff' }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleAddSkill}
            variant="contained"
            color="primary"
            disabled={!newSkill.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default AddSkillsCard;