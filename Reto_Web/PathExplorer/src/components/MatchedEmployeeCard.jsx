import React from "react";
import { Box, Typography, Paper, Avatar, IconButton, Chip, Tooltip } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PersonIcon from "@mui/icons-material/Person";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import BuildIcon from "@mui/icons-material/Build";
import { ACCENTURE_COLORS } from "../styles/styles";
import { useDarkMode } from "../contexts/DarkModeContext";

const MatchedEmployeeCard = ({ 
  name, 
  avatar, 
  score = 0,
  technicalScore = 0, 
  contextualScore = 0, 
  weights = { technical: 60, contextual: 40 },
  onSelect 
}) => {
  const { darkMode } = useDarkMode();
  
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
        cursor: "pointer",
        borderRadius: 1.5,
        transition: "all 0.2s ease-in-out",
        border: "1px solid",
        borderColor: darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
        bgcolor: darkMode ? "rgba(255,255,255,0.03)" : 'transparent',
        "&:hover": {
          boxShadow: darkMode ? "0 3px 8px rgba(255,255,255,0.08)" : "0 3px 8px rgba(0,0,0,0.08)",
          borderColor: ACCENTURE_COLORS.accentPurple4,
          transform: "translateY(-2px)",
          backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.9)",
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
          backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.15)' : `${ACCENTURE_COLORS.corePurple1}15`,
          color: darkMode ? '#a67aff' : ACCENTURE_COLORS.corePurple2,
          fontWeight: "bold",
          border: darkMode ? '1px solid rgba(161, 0, 255, 0.3)' : `1px solid ${ACCENTURE_COLORS.accentPurple5}`
        }}
      >
        {!avatar && <PersonIcon />}
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Typography 
          fontWeight={600} 
          variant="subtitle2"
          sx={{ 
            mb: 0.5,
            color: darkMode ? '#ffffff' : ACCENTURE_COLORS.corePurple3
          }}
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
              backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.08)' : `${ACCENTURE_COLORS.corePurple1}10`,
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : ACCENTURE_COLORS.corePurple2,
              border: darkMode ? '1px solid rgba(161, 0, 255, 0.2)' : `1px solid ${ACCENTURE_COLORS.accentPurple4}30`
            }}
          />
          <Chip
            label="JavaScript"
            size="small"
            sx={{ 
              height: 20, 
              fontSize: "0.7rem",
              backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.08)' : `${ACCENTURE_COLORS.corePurple1}10`,
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : ACCENTURE_COLORS.corePurple2,
              border: darkMode ? '1px solid rgba(161, 0, 255, 0.2)' : `1px solid ${ACCENTURE_COLORS.accentPurple4}30`
            }}
          />
          <Chip
            label="TypeScript"
            size="small"
            sx={{ 
              height: 20, 
              fontSize: "0.7rem",
              backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.08)' : `${ACCENTURE_COLORS.corePurple1}10`,
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : ACCENTURE_COLORS.corePurple2,
              border: darkMode ? '1px solid rgba(161, 0, 255, 0.2)' : `1px solid ${ACCENTURE_COLORS.accentPurple4}30`
            }}
          />
        </Box>
      </Box>
      <Tooltip
        title={
          <React.Fragment>
            <Box sx={{ p: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Desglose de compatibilidad:
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                <BuildIcon fontSize="small" sx={{ mr: 1, color: ACCENTURE_COLORS.corePurple1 }} />
                <Typography variant="body2">
                  Técnico: <b>{technicalScore}%</b> <small>(peso {weights?.technical || 60}%)</small>
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TipsAndUpdatesIcon fontSize="small" sx={{ mr: 1, color: ACCENTURE_COLORS.accentPurple1 }} />
                <Typography variant="body2">
                  Contextual: <b>{contextualScore}%</b> <small>(peso {weights?.contextual || 40}%)</small>
                </Typography>
              </Box>
            </Box>
          </React.Fragment>
        }
        arrow
        placement="top"
      >
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
              color: getScoreColor(score)
            }}
          >{`${score || 0}%`}</Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: "0.7rem",
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
            }}
          >
            Match Score
          </Typography>
        </Box>
      </Tooltip>
      <IconButton 
        size="small" 
        color="primary"
        sx={{ 
          backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.15)' : `${ACCENTURE_COLORS.accentPurple5}90`,
          color: darkMode ? '#a67aff' : ACCENTURE_COLORS.corePurple1,
          width: 32,
          height: 32,
          '&:hover': {
            backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.25)' : ACCENTURE_COLORS.accentPurple5,
          }
        }}
      >
        <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Paper>
  );
};

export default MatchedEmployeeCard;