import React, { useState, useRef } from "react";
import {
  Box,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import {
  CameraAlt,
} from "@mui/icons-material";

export const EditBannerProfile = ({ initialBanner, onBannerChange }) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [bannerImage, setBannerImage] = useState(initialBanner || null);
  const [isHovering, setIsHovering] = useState(false);

  const handleFileUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setBannerImage(reader.result);
        if (onBannerChange) {
          onBannerChange(reader.result, file);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const openFileSelector = () => {
    fileInputRef.current.click();
  };

  return (
    <Box
      sx={{
        position: "relative",
        height: 200,
        width: "100%",
        borderRadius: "8px 8px 0 0",
        overflow: "hidden",
        backgroundColor: "#6699cc", // Default light blue color
        backgroundImage: bannerImage ? `url(${bannerImage})` : 'none',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Upload overlay - only visible on hover */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isHovering ? "rgba(0, 0, 0, 0.4)" : "transparent",
          opacity: isHovering ? 1 : 0,
          transition: "opacity 0.3s ease",
          zIndex: 2,
          cursor: "pointer",
        }}
        onClick={openFileSelector}
      >
        <CameraAlt sx={{ color: "white", fontSize: 40, mb: 1 }} />
        <Typography variant="subtitle1" sx={{ color: "white", fontWeight: 500 }}>
          Click to upload banner image
        </Typography>
      </Box>

      <input
        type="file"
        hidden
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
      />
    </Box>
  );
};

export default EditBannerProfile;