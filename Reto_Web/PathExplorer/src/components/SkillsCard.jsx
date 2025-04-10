import React from "react";
import { Paper, Typography, Box, Chip, IconButton } from "@mui/material";

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
        width: "100%",
        boxSizing: "border-box",
        maxWidth: "100%",
        minWidth: 0,
      }}
    >
      <Typography variant="body1" sx={{ flexShrink: 0, mr: 2 }}>
        <b>Skills</b>
      </Typography>

      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          minWidth: 0,
          maxWidth: "55vw",
          width: "100%",
          gap: 1,
          flexGrow: 1,
          scrollbarWidth: "thin", // for Firefox
          "&::-webkit-scrollbar": {
            height: 6,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#999",
            borderRadius: 4,
          },
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
    </Paper>
  );
};
