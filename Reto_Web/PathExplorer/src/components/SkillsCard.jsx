import React, { useEffect, useState } from "react";
import { Paper, Typography, Box, Chip, IconButton } from "@mui/material";
import { supabase } from "../supabase/supabaseClient";

export const SkillsCard = () => {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const fetchSkills = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return;

      const { data, error } = await supabase
        .from("UserSkill")
        .select("skill_ID(name)")
        .eq("user_ID", user.id);

      if (!error && data) {
        const skillTitles = data.map((entry) => entry.skill_ID.name);
        setSkills(skillTitles);
      }
    };

    fetchSkills();
  }, []);

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
        {skills.map((skill, index) => (
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
