import React from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
} from "@mui/material";
import {
  WorkspacePremium,
  CalendarMonth,
  School,
} from "@mui/icons-material";
import { ACCENTURE_COLORS } from "../styles/styles";

const CertificationCard = ({ certification }) => {
  return (
    <Paper 
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        height: "100%",
        boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        },
        bgcolor: "#fff",
        position: "relative",
      }}
    >
      {/* Color accent line - Full width */}
      <Box 
        sx={{ 
          width: "100%", 
          height: "4px", 
          bgcolor: ACCENTURE_COLORS.corePurple2,
          position: "absolute",
          top: 0,
          left: 0,
        }} 
      />

      {/* Header */}
      <Box sx={{ p: 3, pt: 4 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 500,
            fontSize: "1.1rem",
            color: ACCENTURE_COLORS.black,
            mb: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {certification.name}
          {certification.score && (
            <Chip
              size="small"
              label={certification.score}
              sx={{
                height: 20,
                fontSize: "0.65rem",
                bgcolor: `${ACCENTURE_COLORS.corePurple2}10`,
                color: ACCENTURE_COLORS.corePurple2,
                fontWeight: 500,
                ml: 1,
              }}
            />
          )}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <School 
            fontSize="small" 
            sx={{ color: ACCENTURE_COLORS.corePurple2, opacity: 0.8 }} 
          />
          <Typography
            variant="body2"
            sx={{ color: ACCENTURE_COLORS.darkGray }}
          >
            {certification.issuer}
          </Typography>
        </Box>

        {/* Credential ID */}
        <Box
          sx={{
            bgcolor: "rgba(0,0,0,0.02)",
            px: 2,
            py: 1.5,
            borderRadius: 1,
            fontFamily: "monospace",
            fontSize: "0.75rem",
            color: ACCENTURE_COLORS.darkGray,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "3px",
              bgcolor: `${ACCENTURE_COLORS.corePurple2}40`,
            }
          }}
        >
          ID: {certification.credentialId}
        </Box>
      </Box>

      <Divider sx={{ mt: "auto", opacity: 0.5 }} />

      {/* Footer */}
      <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <CalendarMonth
            fontSize="small"
            sx={{ color: ACCENTURE_COLORS.corePurple2, opacity: 0.6 }}
          />
          <Box>
            <Typography
              variant="body2"
              sx={{ color: ACCENTURE_COLORS.darkGray }}
            >
              {certification.date}
            </Typography>
            {certification.expiryDate && (
              <Typography
                variant="caption"
                sx={{ 
                  color: ACCENTURE_COLORS.darkGray,
                  display: "block",
                  mt: 0.25,
                }}
              >
                Expires: {certification.expiryDate}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Box 
          sx={{ 
            opacity: 0.7,
            display: "flex",
            alignItems: "center",
          }}
        >
          <WorkspacePremium
            fontSize="small"
            sx={{ color: ACCENTURE_COLORS.corePurple2 }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default CertificationCard;