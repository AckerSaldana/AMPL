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

import { useTheme } from "@mui/material/styles";

const SelectedCertificates = ({ certificates, onCertificateRemove }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: "1px solid rgba(0,0,0,0.08)",
        bgcolor: theme.palette.background.paper,
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
            color={theme.palette.primary.main}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <WorkspacePremiumIcon fontSize="small" />
            Selected Certificates
          </Typography>
          <Chip
            label={`${certificates.length} certificates`}
            size="small"
            sx={{
              bgcolor: `${theme.palette.accenture.colors.corePurple1}15`,
              color: theme.palette.primary.main,
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
              backgroundColor: "rgba(0,0,0,0.02)",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.accenture.colors.accentPurple5,
              borderRadius: "3px",
              "&:hover": {
                backgroundColor: theme.palette.accenture.colors.accentPurple4,
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
                borderColor: "rgba(0,0,0,0.04)",
                transition: "background-color 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.01)",
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
                    backgroundColor: `${theme.palette.accenture.colors.corePurple1}15`,
                    color: theme.palette.primary.main,
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
                    color={theme.palette.accenture.colors.corePurple3}
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cert.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cert.issuer} • {cert.type}
                  </Typography>
                  {cert.description && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        mt: 0.5,
                        opacity: 0.8,
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
                      color: theme.palette.background.paper,
                      backgroundColor: theme.palette.accenture.colors.red,
                      width: 28,
                      height: 28,
                      opacity: 0.8,
                      "&:hover": {
                        backgroundColor: theme.palette.accenture.colors.red,
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
            color="text.secondary"
            sx={{
              fontWeight: 500,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <SchoolIcon
              sx={{
                fontSize: 36,
                color: theme.palette.accenture.colors.accentPurple3,
              }}
            />
            No certificates selected yet
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Add certificates from the list on the left
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default SelectedCertificates;
