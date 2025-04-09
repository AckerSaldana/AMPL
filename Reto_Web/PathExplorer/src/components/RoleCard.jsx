import React from "react";
import { Box, Typography, Paper, Avatar, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

const RoleCard = ({ role, name, avatar, percentage }) => {
  return (
    <Paper
      elevation={3}
      sx={{ display: "flex", alignItems: "center", p: 2, mb: 2 }}
    >
      <Avatar
        src={avatar}
        sx={{ width: 56, height: 56, mr: 2, backgroundColor: "primary.light" }}
      />
      <Box sx={{ flexGrow: 1 }}>
        <Typography
          variant="body1"
          fontWeight={600}
        >{`ROLE: ${role}`}</Typography>
        <Typography variant="body2" color="text.secondary">
          Employee: {name}
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ mr: 2 }}>{`${percentage}%`}</Typography>
      <IconButton>
        <EditIcon />
      </IconButton>
    </Paper>
  );
};

export default RoleCard;
