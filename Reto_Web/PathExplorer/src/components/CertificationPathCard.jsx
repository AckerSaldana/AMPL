import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Link,
  Tooltip,
  Grow,
  Fade,
  Modal,
  IconButton,
  Backdrop,
  alpha
} from "@mui/material";
import {
  WorkspacePremium,
  CalendarMonth,
  School,
  VerifiedUser,
  Visibility,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  Verified as VerifiedIcon
} from "@mui/icons-material";
import { ACCENTURE_COLORS } from "../styles/styles";

const CertificationCard = ({ certification, index = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  const handleOpenEvidence = (e) => {
    e.preventDefault();
    setEvidenceModalOpen(true);
  };

  const handleCloseEvidence = () => {
    setEvidenceModalOpen(false);
  };

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
    <>
    <Grow in={isVisible} timeout={600} style={{ transformOrigin: '50% 50%' }}>
      <Paper 
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          height: "100%",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: "translateY(0)",
          "&:hover": {
            transform: "translateY(-8px) scale(1.02)",
            boxShadow: `0 12px 24px ${ACCENTURE_COLORS.corePurple2}15`,
            '& .accent-line': {
              height: '6px',
            },
            '& .cert-icon': {
              transform: 'scale(1.2)',
            },
            '& .cert-title': {
              color: ACCENTURE_COLORS.corePurple2,
            },
            '& .credential-box': {
              bgcolor: `${ACCENTURE_COLORS.corePurple2}08`,
            },
          },
          bgcolor: "#fff",
          position: "relative",
        }}
      >
      {/* Color accent line - Animated */}
      <Box 
        className="accent-line"
        sx={{ 
          width: "100%", 
          height: "4px", 
          bgcolor: ACCENTURE_COLORS.corePurple2,
          position: "absolute",
          top: 0,
          left: 0,
          transition: 'height 0.3s ease',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: isVisible ? '100%' : '0%',
            height: '100%',
            bgcolor: ACCENTURE_COLORS.corePurple2,
            left: 0,
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDelay: `${index * 100 + 300}ms`,
          },
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
          className="cert-title"
          sx={{
            fontWeight: 500,
            fontSize: "1.1rem",
            color: ACCENTURE_COLORS.black,
            mb: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            pr: safeCert.status !== "approved" ? 8 : 0, // Space for badge
            transition: 'color 0.3s ease',
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
            className="cert-icon"
            sx={{ 
              color: ACCENTURE_COLORS.corePurple2, 
              opacity: 0.8,
              transition: 'transform 0.3s ease',
            }} 
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
                href="#"
                onClick={handleOpenEvidence}
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 0.5,
                  color: ACCENTURE_COLORS.corePurple2,
                  textDecoration: "none",
                  cursor: "pointer",
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
          className="credential-box"
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
            transition: 'all 0.3s ease',
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "3px",
              bgcolor: `${ACCENTURE_COLORS.corePurple2}40`,
              transition: 'width 0.3s ease',
            },
            "&:hover::before": {
              width: "5px",
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
            className="cert-icon"
            sx={{ 
              color: ACCENTURE_COLORS.corePurple2, 
              opacity: 0.6,
              transition: 'transform 0.3s ease',
            }}
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
            className="cert-icon"
            sx={{ 
              color: ACCENTURE_COLORS.corePurple2,
              transition: 'transform 0.3s ease',
            }}
          />
        </Box>
      </Box>
    </Paper>
    </Grow>

    {/* Evidence Modal */}
    <Modal
      open={evidenceModalOpen}
      onClose={handleCloseEvidence}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: { 
          backgroundColor: alpha('#000', 0.6),
          backdropFilter: 'blur(8px)'
        }
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Fade in={evidenceModalOpen}>
        <Paper
          elevation={0}
          sx={{
            width: { xs: '90%', sm: '80%', md: '900px' },
            height: { xs: '90vh', sm: '85vh' },
            overflow: 'hidden',
            borderRadius: 3,
            backgroundColor: '#ffffff',
            position: 'relative',
            boxShadow: `0 20px 80px -12px ${alpha(ACCENTURE_COLORS.corePurple2, 0.35)}`,
            display: 'flex',
            flexDirection: 'column',
            '&:focus': { outline: 'none' },
          }}
        >
          {/* Modal Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2.5,
              borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.corePurple2, 0.1)}`,
              background: `linear-gradient(135deg, ${alpha(ACCENTURE_COLORS.corePurple2, 0.03)} 0%, ${alpha(ACCENTURE_COLORS.corePurple2, 0.01)} 100%)`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(ACCENTURE_COLORS.corePurple2, 0.1),
                  color: ACCENTURE_COLORS.corePurple2,
                }}
              >
                <PdfIcon />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: ACCENTURE_COLORS.black,
                  fontSize: '1.1rem'
                }}>
                  Certification Evidence
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: alpha(ACCENTURE_COLORS.black, 0.6),
                  fontSize: '0.75rem'
                }}>
                  {safeCert.name}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleCloseEvidence}
              sx={{
                color: alpha(ACCENTURE_COLORS.black, 0.6),
                '&:hover': {
                  bgcolor: alpha(ACCENTURE_COLORS.corePurple2, 0.08),
                  color: ACCENTURE_COLORS.corePurple2,
                },
                transition: 'all 0.2s ease',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Modal Content */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(ACCENTURE_COLORS.corePurple2, 0.02),
          }}>
            {safeCert.evidence.endsWith('.pdf') ? (
              <iframe
                src={safeCert.evidence}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="Certification Evidence"
              />
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                p: 4,
                maxWidth: 500,
                margin: '0 auto',
              }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(ACCENTURE_COLORS.corePurple2, 0.1),
                    color: ACCENTURE_COLORS.corePurple2,
                    margin: '0 auto',
                    mb: 3,
                  }}
                >
                  <VerifiedIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" sx={{ mb: 2, color: ACCENTURE_COLORS.black }}>
                  Evidence Available
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: alpha(ACCENTURE_COLORS.black, 0.7),
                  mb: 3,
                  lineHeight: 1.6
                }}>
                  The evidence for this certification is available at the following URL:
                </Typography>
                <Link
                  href={safeCert.evidence}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    bgcolor: ACCENTURE_COLORS.corePurple2,
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: ACCENTURE_COLORS.corePurple3,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(ACCENTURE_COLORS.corePurple2, 0.3)}`,
                    }
                  }}
                >
                  Open in New Tab
                  <Visibility fontSize="small" />
                </Link>
              </Box>
            )}
          </Box>
        </Paper>
      </Fade>
    </Modal>
    </>
  );
};

export default CertificationCard;