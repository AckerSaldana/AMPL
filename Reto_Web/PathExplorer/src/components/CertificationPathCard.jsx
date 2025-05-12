import React from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Link,
  Tooltip
} from "@mui/material";
import {
  WorkspacePremium,
  CalendarMonth,
  School,
  VerifiedUser,
  Visibility
} from "@mui/icons-material";
import { ACCENTURE_COLORS } from "../styles/styles";

const CertificationCard = ({ certification }) => {
  // Ensure certification has default values
  const safeCert = {
    name: "Certification",
    issuer: "Issuer",
    date: "No date",
    credentialId: "N/A",
    status: "pending",
    ...certification
  };

  // Determine if there's evidence and if it's a link
  const hasEvidence = safeCert.evidence && safeCert.evidence.trim() !== "";
  const isEvidenceLink = hasEvidence && 
    (safeCert.evidence.startsWith('http://') || 
    safeCert.evidence.startsWith('https://'));

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

      {/* Status badge if not approved */}
      {safeCert.status !== "approved" && (
        <Chip
          label={safeCert.status === "rejected" ? "Rejected" : "Pending"}
          size="small"
          color={safeCert.status === "rejected" ? "error" : "warning"}
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            fontSize: "0.65rem",
            fontWeight: 500,
            zIndex: 1
          }}
        />
      )}

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
            pr: safeCert.status !== "approved" ? 8 : 0, // Space for badge
          }}
        >
          {safeCert.name}
          {safeCert.score && (
            <Chip
              size="small"
              label={safeCert.score}
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
            {safeCert.issuer}
          </Typography>
        </Box>

        {/* Status and Evidence */}
        {(safeCert.status === "approved" && hasEvidence) && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <VerifiedUser
              fontSize="small"
              sx={{ color: "success.main", opacity: 0.8 }}
            />
            {isEvidenceLink ? (
              <Link 
                href={safeCert.evidence} 
                target="_blank"
                rel="noopener"
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 0.5,
                  color: ACCENTURE_COLORS.corePurple2,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline"
                  }
                }}
              >
                <Typography variant="body2">
                  View evidence
                </Typography>
                <Visibility fontSize="small" />
              </Link>
            ) : (
              <Typography
                variant="body2"
                sx={{ color: ACCENTURE_COLORS.darkGray }}
              >
                Evidence available
              </Typography>
            )}
          </Box>
        )}


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
          ID: {safeCert.credentialId}
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
              {safeCert.date}
            </Typography>
            {safeCert.expiryDate && (
              <Typography
                variant="caption"
                sx={{ 
                  color: ACCENTURE_COLORS.darkGray,
                  display: "block",
                  mt: 0.25,
                }}
              >
                Expires: {safeCert.expiryDate}
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