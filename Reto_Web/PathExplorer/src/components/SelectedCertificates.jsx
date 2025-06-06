import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Tooltip,
  Chip,
  Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SchoolIcon from "@mui/icons-material/School";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { ACCENTURE_COLORS } from "../styles/styles";
import { useDarkMode } from "../contexts/DarkModeContext";

const SelectedCertificates = ({ certificates, onCertificateRemove }) => {
  const { darkMode } = useDarkMode();
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: darkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)",
        bgcolor: darkMode ? "rgba(255,255,255,0.05)" : "white",
        height: "400px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: 2.5, pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={600}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: darkMode ? '#ffffff' : ACCENTURE_COLORS.corePurple2
            }}
          >
            <WorkspacePremiumIcon fontSize="small" sx={{ color: darkMode ? ACCENTURE_COLORS.accentPurple3 : 'inherit' }} />
            Selected Certificates
          </Typography>
          <Chip
            label={`${certificates.length} certificates`}
            size="small"
            sx={{
              bgcolor: darkMode ? 'rgba(161, 0, 255, 0.15)' : `${ACCENTURE_COLORS.corePurple1}15`,
              color: darkMode ? '#a67aff' : ACCENTURE_COLORS.corePurple2,
              border: darkMode ? '1px solid rgba(161, 0, 255, 0.3)' : 'none',
              fontWeight: 600,
              height: 20,
              fontSize: "0.625rem",
            }}
          />
        </Box>
      </Box>

      {certificates.length > 0 ? (
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            overflowX: "hidden",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: darkMode ? "rgba(161, 0, 255, 0.3)" : ACCENTURE_COLORS.accentPurple5,
              borderRadius: "3px",
              "&:hover": {
                backgroundColor: darkMode ? "rgba(161, 0, 255, 0.5)" : ACCENTURE_COLORS.accentPurple4,
              },
            },
          }}
        >
          {certificates.map((cert, index) => (
            <Box
              key={cert.id || index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderBottom:
                  index < certificates.length - 1 ? "1px solid" : "none",
                borderColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                transition: "background-color 0.2s ease",
                "&:hover": {
                  backgroundColor: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                },
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  flexWrap: "wrap",
                  minWidth: 0,
                }}
              >
                {/* Avatar que muestra la imagen del certificado o inicial */}
                <Avatar
                  src={cert.image}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.15)' : `${ACCENTURE_COLORS.corePurple1}15`,
                    color: darkMode ? '#a67aff' : ACCENTURE_COLORS.corePurple2,
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                  }}
                >
                  {cert.title ? cert.title[0].toUpperCase() : "C"}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: darkMode ? '#ffffff' : ACCENTURE_COLORS.corePurple3
                    }}
                  >
                    {cert.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
                    }}
                  >
                    {cert.issuer} • {cert.type}
                  </Typography>
                  {cert.description && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        mt: 0.5,
                        opacity: 0.8,
                        color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
                      }}
                    >
                      {cert.description}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <Tooltip title="Remove certificate">
                  <IconButton
                    size="small"
                    onClick={() => onCertificateRemove(index)}
                    sx={{
                      color: "white",
                      backgroundColor: ACCENTURE_COLORS.red,
                      width: 28,
                      height: 28,
                      opacity: 0.8,
                      "&:hover": {
                        backgroundColor: ACCENTURE_COLORS.red,
                        opacity: 1,
                      },
                      ml: 0.5,
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            opacity: 0.7,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
            }}
          >
            <SchoolIcon
              sx={{ fontSize: 36, color: darkMode ? ACCENTURE_COLORS.accentPurple3 : ACCENTURE_COLORS.accentPurple3 }}
            />
            No certificates selected yet
          </Typography>
          <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary' }}>
            Add certificates from the list on the left
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default SelectedCertificates;
