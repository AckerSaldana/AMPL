import { Paper, CircularProgress, Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

export const AssignmentPercentage = () => {
  const [progress, setProgress] = useState(0);
  const finalValue = 86; // Temp target value

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= finalValue) {
          clearInterval(interval);
          return finalValue;
        }
        return prev + 2; // Adjust speed by changing this value
      });
    }, 20); // Adjust interval duration for smoothness

    return () => clearInterval(interval);
  }, []);

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
