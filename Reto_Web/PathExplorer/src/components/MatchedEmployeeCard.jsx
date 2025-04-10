import React from "react";
import { Box, Typography, Paper, Avatar, IconButton, Chip } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PersonIcon from "@mui/icons-material/Person";
import { alpha } from "@mui/material/styles";

const MatchedEmployeeCard = ({ name, avatar, score, onSelect }) => (
  <Paper
    elevation={1}
    sx={{
      display: "flex",
      alignItems: "center",
      p: 2,
      mb: 2,
      cursor: "pointer",
      borderRadius: 1.5,
      transition: "all 0.2s ease-in-out",
      border: "1px solid",
      borderColor: alpha("#000", 0.08),
      "&:hover": {
        boxShadow: 3,
        borderColor: alpha("#673ab7", 0.3),
        backgroundColor: alpha("#673ab7", 0.02),
      },
    }}
    onClick={onSelect}
  >
    <Avatar
      src={avatar}
      sx={{ 
        width: 48, 
        height: 48, 
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
        fontWeight={600} 
        variant="subtitle2"
        color="text.primary"
        sx={{ mb: 0.5 }}
      >
        {name}
      </Typography>
      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
        <Chip
          label="React"
          size="small"
          sx={{ 
            height: 20, 
            fontSize: "0.7rem",
            backgroundColor: alpha("#61dafb", 0.1),
            borderColor: alpha("#61dafb", 0.2),
            color: "text.secondary" 
          }}
          variant="outlined"
        />
        <Chip
          label="JavaScript"
          size="small"
          sx={{ 
            height: 20, 
            fontSize: "0.7rem",
            backgroundColor: alpha("#f7df1e", 0.1),
            borderColor: alpha("#f7df1e", 0.2),
            color: "text.secondary" 
          }}
          variant="outlined"
        />
        <Chip
          label="TypeScript"
          size="small"
          sx={{ 
            height: 20, 
            fontSize: "0.7rem",
            backgroundColor: alpha("#3178c6", 0.1),
            borderColor: alpha("#3178c6", 0.2),
            color: "text.secondary" 
          }}
          variant="outlined"
        />
      </Box>
    </Box>
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center",
      mr: 1.5,
      minWidth: "60px"
    }}>
      <Typography 
        variant="h6" 
        fontWeight={700}
        sx={{ 
          color: score >= 90 ? "success.main" : score >= 70 ? "warning.main" : "error.main"
        }}
      >{`${score}%`}</Typography>
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
      <ArrowForwardIosIcon fontSize="small" />
    </IconButton>
  </Paper>
);

export default MatchedEmployeeCard;