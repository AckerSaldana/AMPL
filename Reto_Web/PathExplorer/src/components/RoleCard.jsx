import React from "react";
import { Box, Typography, Paper, Avatar, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import { ACCENTURE_COLORS } from "../styles/styles";

const RoleCard = ({ role, name, avatar, percentage, onClick, selected }) => {
  // Determinar el color del score basado en el porcentaje
  const getScoreColor = (value) => {
    if (value >= 90) return ACCENTURE_COLORS.green;
    if (value >= 70) return ACCENTURE_COLORS.orange;
    return ACCENTURE_COLORS.red;
  };
  
  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        alignItems: "center",
        p: 2,
        mb: 2,
        border: selected ? "2px solid" : "1px solid",
        borderColor: selected 
          ? ACCENTURE_COLORS.corePurple1 
          : "rgba(0,0,0,0.08)",
        borderRadius: 1.5,
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        backgroundColor: selected 
          ? `${ACCENTURE_COLORS.corePurple1}08`
          : "white",
        "&:hover": {
          boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
          borderColor: selected 
            ? ACCENTURE_COLORS.corePurple1 
            : ACCENTURE_COLORS.accentPurple4,
          transform: "translateY(-2px)"
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
          backgroundColor: `${ACCENTURE_COLORS.corePurple1}15`,
          color: ACCENTURE_COLORS.corePurple2,
          fontWeight: "bold",
          border: `1px solid ${ACCENTURE_COLORS.accentPurple5}`
        }}
      >
        {!avatar && <PersonIcon />}
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          color={ACCENTURE_COLORS.corePurple3}
          sx={{ mb: 0.5 }}
        >
          {role}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5
          }}
        >
          Assigned to: <span style={{ 
            fontWeight: 500, 
            color: ACCENTURE_COLORS.corePurple2
          }}>{name}</span>
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
          sx={{ 
            color: getScoreColor(percentage)
          }}
        >
          {`${percentage}%`}
        </Typography>
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
          backgroundColor: `${ACCENTURE_COLORS.accentPurple5}90`,
          color: ACCENTURE_COLORS.corePurple1,
          width: 32,
          height: 32,
          '&:hover': {
            backgroundColor: ACCENTURE_COLORS.accentPurple5,
          }
        }}
      >
        <EditIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Paper>
  );
};

export default RoleCard;