import React from "react";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Paper,
  Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

// Mock skill list
const skills = [
  { name: "React", icon: "⚛️", description: "Component-based library" },
  { name: "HTML 5", icon: "🟧", description: "Markup language" },
  { name: "Angular", icon: "🅰️", description: "TypeScript-based framework" },
  { name: "VueJS", icon: "🟩", description: "Progressive framework" },
  { name: "NextJS", icon: "⬛", description: "React framework for SSR" },
  { name: "Tailwind CSS", icon: "🎨", description: "Utility-first CSS" },
];

export const SkillList = () => {
  return (
    <Box>
      <Typography
        variant="subtitle1"
        fontWeight={600}
        mb={2}
        color="text.secondary"
      >
        Skill list
      </Typography>

      {/* Aquí se cargan las Skills de la db */}
      <Stack spacing={2}>
        {skills.map((skill, index) => (
          <Paper
            key={index}
            elevation={1}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 1.5,
              borderRadius: 2,
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar>{skill.icon}</Avatar>
              <Box>
                <Typography fontWeight={600}>{skill.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {skill.description}
                </Typography>
              </Box>
            </Box>
            <IconButton color="primary">
              <AddIcon />
            </IconButton>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};
