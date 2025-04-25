import { Paper, Typography, Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export const About = () => {

  const [aboutText, setAboutText] = useState("");

  useEffect(() => {
    const fetchAbout = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return;

      const { data, error } = await supabase
        .from("User")
        .select("about")
        .eq("user_id", user.id)
        .single();

      if (!error && data?.about) {
        setAboutText(data.about);
      }
    };

    fetchAbout();
  }, []);

  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        maxWidth: "100%",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Typography variant="body1">
        <b>About</b>
      </Typography>
      <Box
        sx={{
          maxHeight: "300px",
          overflowY: "auto",
        }}
      >
        <Typography variant="body2">{aboutText}</Typography>
      </Box>
    </Paper>
  );
};
