import React from "react";
import { Box, Typography, Paper, useTheme } from "@mui/material";
import PropTypes from "prop-types";

export const IconInfo = ({ icon: Icon, title, value, color = "primary" }) => {
  const theme = useTheme();

  const getColor = () => {
    switch (color) {
      case "primary":
        return theme.palette.primary.main;
      case "secondary":
        return theme.palette.secondary.main;
      case "accent":
        return theme.palette.accent?.main || "#ff4081";
      default:
        return color;
    }
  };

  const iconColor = getColor();

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 2,
        height: "100%",
        width: "100%",
        backgroundColor: `${iconColor}10`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1,
          width: "100%",
          flexGrow: 1,
        }}
      >
        {/* Top Section: Icon inside colored circle */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 50,
            height: 50,
            borderRadius: "50%",
            backgroundColor: iconColor,
            mb: 2,
          }}
        >
          {Icon && <Icon sx={{ fontSize: 30, color: "#fff" }} />}
        </Box>

        {/* Middle Section: Title */}
        <Typography
          color="text.primary"
          align="center"
          sx={{ minHeight: 40, mb: 1 }}
        >
          {title}
        </Typography>

        {/* Bottom Section: Value */}
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ color: iconColor, mt: "auto" }}
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  );
};

IconInfo.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.oneOf(["primary", "secondary", "accent", "inherit"]),
};

export default IconInfo;
