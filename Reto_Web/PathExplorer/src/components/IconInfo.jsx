import React from "react";
import { Box, Typography, Paper, useTheme } from "@mui/material";
import PropTypes from "prop-types";

export const IconInfo = ({ icon: Icon, title, value, color = "primary" }) => {
  const theme = useTheme();

  // Function to get the correct color
  const getIconColor = () => {
    switch (color) {
      case "primary":
        return theme.palette.primary.main;
      case "secondary":
        return theme.palette.secondary.main;
      case "accent":
        return theme.palette.accent.main;
      default:
        return color; // Allow custom color strings
    }
  };

  return (
    <Paper
      sx={{
        display: "flex",
        alignItems: "center",
        p: 2,
        height: "100%",
        width: "100%",
        justifyContent: "space-between",
        backgroundColor: `${getIconColor()}10`, // Light background with 10% opacity
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexDirection: "column",
          width: "100%",
        }}
      >
        {Icon && (
          <Icon
            sx={{
              fontSize: 40,
              color: getIconColor(),
            }}
          />
        )}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            textAlign: "center",
          }}
        >
          <Typography color="text.primary">{title}</Typography>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ color: getIconColor() }}
          >
            {value}
          </Typography>
        </Box>
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
