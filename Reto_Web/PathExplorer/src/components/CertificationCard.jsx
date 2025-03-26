import { Paper, Typography, Link, Box } from "@mui/material";
import React from "react";

export const CertificationCard = ({ title, url }) => {
  return (
    <Paper
      elevation={4}
      sx={{
        height: 250,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: 2,
      }}
    >
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ flex: 1, display: "block" }}
      >
        <Box
          sx={{
            height: "100%",
            backgroundImage: `url('/default-certification.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "transform 0.3s",
            "&:hover": {
              transform: "scale(1.03)",
            },
          }}
        />
      </Link>

      <Box
        sx={{
          backgroundColor: "#fff",
          p: 1.5,
          borderTop: "1px solid #ddd",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          {title}
        </Typography>
      </Box>
    </Paper>
  );
};
