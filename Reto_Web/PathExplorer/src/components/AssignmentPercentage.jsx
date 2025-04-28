import { Paper, CircularProgress, Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export const AssignmentPercentage = () => {
  const [progress, setProgress] = useState(0);
  const [finalValue, setFinalValue] = useState(0);

  useEffect(() => {
    const fetchPercentage = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return;

      const { data, error } = await supabase
        .from("User")
        .select("percentage")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setFinalValue(data.percentage || 0);
      }
    };

    fetchPercentage();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= finalValue) {
          clearInterval(interval);
          return finalValue;
        }
        return prev + 2;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [finalValue]);

  return (
    <Paper
      sx={{ p: 3, mb: 3, display: "flex", flexDirection: "column", gap: 1.5 }}
    >
      <Typography variant="body1" fontWeight="bold">
        Assignment Percentage
      </Typography>
      <Box
        sx={{
          position: "relative",
          display: "inline-flex",
          justifyContent: "center",
          mt: 1,
        }}
      >
        {/* Outer Ring */}
        <CircularProgress
          variant="determinate"
          value={100}
          size={80}
          sx={{ color: "#E0E0E0", position: "absolute" }}
        />

        {/* Animated Progress */}
        <CircularProgress variant="determinate" value={progress} size={80} />

        {/* Percentage Text */}
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ fontWeight: "bold" }}>{`${progress}%`}</Typography>
        </Box>
      </Box>
    </Paper>
  );
};
