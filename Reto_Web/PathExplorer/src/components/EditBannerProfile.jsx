import React, { useState } from "react";
import { Box, Avatar, Paper, IconButton } from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";

export const EditBannerProfile = () => {
  const [banner, setBanner] = useState("/defaultBanner.jpg");
  const [profilePic, setProfilePic] = useState("/path-to-profile-image.jpg");

  const handleBannerChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setBanner(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setProfilePic(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Paper
      sx={{
        position: "relative",
        height: 260,
        width: "100%",
        backgroundImage: `url(${banner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "column",
        textAlign: "left",
        p: 3,
        overflow: "hidden",
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
      {/* Banner Edit Icon */}
      <IconButton
        sx={{
          position: "absolute",
          top: 15,
          right: 15,
          backgroundColor: "rgba(255,255,255,0.6)",
          "&:hover": { backgroundColor: "rgba(255,255,255,0.8)" },
        }}
        component="label"
      >
        <PhotoCamera />
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleBannerChange}
        />
      </IconButton>

      {/* Profile Picture */}
      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          left: 30,
          textAlign: "center",
          zIndex: 3,
        }}
      >
        <Avatar
          src={profilePic}
          sx={{ width: 100, height: 100, border: "4px solid white" }}
        />
        <IconButton
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            backgroundColor: "rgba(255,255,255,0.6)",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.8)" },
          }}
          component="label"
        >
          <PhotoCamera />
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleProfilePicChange}
          />
        </IconButton>
      </Box>
    </Paper>
  );
};
