import React from "react";
import { Box, Avatar, Typography, Paper, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const BannerProfile = () => {
  const navigate = useNavigate();

  return (
    <Paper
      sx={{
        position: "relative",
        height: 260,
        width: "100%",
        backgroundImage: "url('/defaultBanner.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "column",
        textAlign: "left",
        p: 3,
        overflow: "hidden",
        "&::before": {
          content: "''",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
          zIndex: 1,
        },
        "&::after": {
          content: "''",
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "50px",
          backgroundColor: "white",
          zIndex: 2,
        },
      }}
    >
      {/* Profile Info */}
      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          left: 30,
          display: "flex",
          alignItems: "center",
          zIndex: 3,
        }}
      >
        <Avatar
          src="/path-to-profile-image.jpg"
          sx={{ width: 100, height: 100, border: "3px solid white" }}
        />
        <Box sx={{ ml: 2, color: "white", position: "relative", bottom: 15 }}>
          <Typography variant="h5">Benito Martinez</Typography>
          <Typography variant="subtitle1">Frontend Developer</Typography>
        </Box>
      </Box>

      {/* Edit Profile Button */}
      <Button
        variant="contained"
        sx={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 3,
          backgroundColor: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(5px)",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.3)",
          },
        }}
        onClick={() => navigate("/edit-profile")}
      >
        Edit Profile
      </Button>
    </Paper>
  );
};
