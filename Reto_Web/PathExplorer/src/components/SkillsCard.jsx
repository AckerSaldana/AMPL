import React from "react";
import { Paper, Typography, Box, Chip, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const mockSkills = ["React", "JavaScript", "CSS", "HTML", "Node.js", "UI/UX"];

export const SkillsCard = () => {
  return (
    <Paper
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        mb: 3,
      }}
    >
      <Typography variant="body1" sx={{ flexShrink: 0, mr: 2 }}>
        <b>Skills</b>
      </Typography>

      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          gap: 1,
          flexGrow: 1,
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {mockSkills.map((skill, index) => (
          <Chip
            key={index}
            label={skill}
            sx={{
              backgroundColor: "primary.light",
              color: "text.white",
            }}
          />
        ))}
      </Box>


      <IconButton
        sx={{
          color: "text.secondary",
          ml: 2,
          "&:hover": { backgroundColor: "primary.light" },
        }}
      >
        <AddIcon />
      </IconButton>

    </Paper>
  );
};
