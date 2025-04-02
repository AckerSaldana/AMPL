import React from "react";
import { Paper, Box, Typography } from "@mui/material";
import {
  Person,
  Phone,
  Email,
  Star,
  CalendarToday,
  Work,
} from "@mui/icons-material";

export const Information = ({
  fullName,
  phone,
  email,
  level,
  joinDate,
  lastProjectDate,
}) => {
  return (
    <Paper
      sx={{ p: 3, mb: 3, display: "flex", flexDirection: "column", gap: 1.5 }}
    >
      <Typography variant="body1">
        <b>Information</b>
      </Typography>

      {/* Full Name */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Person color="primary" />
        <Typography variant="body1">{fullName}</Typography>
      </Box>

      {/* Phone */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Phone color="primary" />
        <Typography variant="body1">{phone}</Typography>
      </Box>

      {/* Email */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Email color="primary" />
        <Typography variant="body1">{email}</Typography>
      </Box>

      {/* Level */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Star color="primary" />
        <Typography variant="body1">Level: {level}/12</Typography>
      </Box>

      {/* Join Date */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CalendarToday color="primary" />
        <Typography variant="body1">Joined: {joinDate}</Typography>
      </Box>

      {/* Last Project Date */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Work color="primary" />
        <Typography variant="body1">Last Project: {lastProjectDate}</Typography>
      </Box>
    </Paper>
  );
};
