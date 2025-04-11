import React from "react";
import { Box, Typography, Paper, Avatar, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import { alpha } from "@mui/material/styles";

const RoleCard = ({ role, name, avatar, percentage, onClick, selected }) => (
  <Paper
    elevation={selected ? 4 : 1}
    sx={{
      display: "flex",
      alignItems: "center",
      p: 2,
      mb: 2,
      border: selected ? "2px solid" : "1px solid",
      borderColor: selected ? "primary.main" : alpha("#000", 0.08),
      borderRadius: 1.5,
      cursor: "pointer",
      transition: "all 0.2s ease-in-out",
      backgroundColor: selected ? alpha("#673ab7", 0.04) : "background.paper",
      "&:hover": {
        boxShadow: 3,
        borderColor: selected ? "primary.main" : alpha("#673ab7", 0.3),
      },
    }}
    onClick={onClick}
  >
    <Avatar
      src={avatar}
      sx={{ 
        width: 56, 
        height: 56, 
        mr: 2.5, 
        backgroundColor: "primary.light",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        border: "2px solid #fff"
      }}
    >
      {!avatar && <PersonIcon />}
    </Avatar>
    <Box sx={{ flexGrow: 1 }}>
      <Typography
        variant="subtitle1"
        fontWeight={700}
        color="text.primary"
        sx={{ mb: 0.5 }}
      >{`${role}`}</Typography>
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5
        }}
      >
        Assigned to: <span style={{ fontWeight: 500, color: "#424242" }}>{name}</span>
      </Typography>
    </Box>
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center",
      mr: 2
    }}>
      <Typography 
        variant="h6" 
        fontWeight={700}
        color={percentage >= 90 ? "success.main" : percentage >= 70 ? "warning.main" : "error.main"}
      >{`${percentage}%`}</Typography>
      <Typography 
        variant="caption" 
        color="text.secondary"
        sx={{ fontSize: "0.7rem" }}
      >
        Match Score
      </Typography>
    </Box>
    <IconButton 
      size="small" 
      color="primary"
      sx={{ 
        backgroundColor: alpha("#673ab7", 0.08),
        "&:hover": {
          backgroundColor: alpha("#673ab7", 0.15),
        }
      }}
    >
      <EditIcon fontSize="small" />
    </IconButton>
  </Paper>
);

export default RoleCard;