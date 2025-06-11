import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  alpha,
  useTheme,
  Tooltip,
  IconButton
} from "@mui/material";
import { 
  Info as InfoIcon
} from "@mui/icons-material";
import CertificationDetailModal from "./CertificationDetailModal";
import { ACCENTURE_COLORS, primaryButtonStyles } from "../styles/styles";

/**
 * Enhanced component for certification cards following Accenture design guidelines
 * @param {Object} props - Component properties
 * @param {string} props.id - Unique certification ID
 * @param {string} props.title - Certification title
 * @param {string} props.url - Course URL
 * @param {Array} props.skills - List of associated skills
 * @param {string} props.backgroundImage - Background image URL
 * @param {boolean} props.isListView - Indicates if displayed in list view
 * @param {string} props.duration - Course duration or issuer
 * @param {string} props.level - Difficulty level
 */
export const CertificationCard = ({ 
  id,  // Added ID as prop
  title, 
  url, 
  skills = [], 
  backgroundImage = '/default-certification.jpg',
  isListView = false,
  duration = "40 hours",
  level = "Beginner",
  darkMode = false
}) => {
  const theme = useTheme();
  
  // State to control modal opening
  const [modalOpen, setModalOpen] = useState(false);
  
  // Function to open course URL in a new tab
  const handleTakeCourse = (e) => {
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Function to handle "Details" click
  const handleViewDetails = (e) => {
    e.stopPropagation();
    setModalOpen(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          overflow: "hidden",
          transition: "all 0.2s ease",
          border: darkMode ? `1px solid ${alpha('#fff', 0.12)}` : `1px solid ${alpha('#000', 0.08)}`,
          bgcolor: darkMode ? '#1e1e1e' : "white",
          "&:hover": {
            boxShadow: darkMode 
              ? `0 4px 20px ${alpha(ACCENTURE_COLORS.corePurple1, 0.25)}` 
              : `0 4px 12px ${alpha(ACCENTURE_COLORS.corePurple1, 0.12)}`,
            borderColor: darkMode 
              ? alpha(ACCENTURE_COLORS.corePurple1, 0.4) 
              : alpha(ACCENTURE_COLORS.corePurple1, 0.15),
            transform: "translateY(-2px)",
          },
          position: "relative",
        }}
      >
        {/* Certification image */}
        <CardMedia
          component="div"
          sx={{
            height: 0,
            paddingTop: "56.25%", // 16:9 aspect ratio
            width: "100%",
            position: "relative",
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: darkMode
                ? `linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 40%, rgba(0, 0, 0, 0) 100%)`
                : `linear-gradient(180deg, rgba(65, 0, 115, 0.8) 0%, rgba(65, 0, 115, 0.4) 40%, rgba(65, 0, 115, 0) 100%)`,
              zIndex: 1
            }
          }}
        >
          {/* Skills tags displayed over the image */}
          <Box 
            sx={{ 
              position: "absolute", 
              top: 12, 
              left: 12, 
              display: "flex",
              gap: 0.75,
              flexWrap: "wrap",
              maxWidth: "calc(100% - 24px)",
              zIndex: 2
            }}
          >
            {skills.slice(0, 3).map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                sx={{
                  bgcolor: darkMode 
                    ? alpha(ACCENTURE_COLORS.corePurple1, 0.3)
                    : alpha(ACCENTURE_COLORS.corePurple1, 0.2),
                  color: "white",
                  fontWeight: 500,
                  fontSize: "0.7rem",
                  height: 24,
                  borderRadius: "4px",
                  mb: 0.5,
                  backdropFilter: "blur(4px)",
                  border: "1px solid",
                  borderColor: darkMode 
                    ? alpha("#fff", 0.4)
                    : alpha("#fff", 0.3),
                  "& .MuiChip-label": {
                    px: 1,
                  },
                  "&:hover": {
                    bgcolor: darkMode 
                      ? alpha(ACCENTURE_COLORS.corePurple1, 0.4)
                      : alpha(ACCENTURE_COLORS.corePurple1, 0.25),
                  }
                }}
              />
            ))}
            {skills.length > 3 && (
              <Chip
                label={`+${skills.length - 3}`}
                size="small"
                sx={{
                  bgcolor: darkMode 
                    ? alpha("#fff", 0.15)
                    : alpha("#fff", 0.2),
                  color: "white",
                  fontWeight: 500,
                  fontSize: "0.7rem",
                  height: 24,
                  borderRadius: "4px",
                  mb: 0.5,
                  backdropFilter: "blur(4px)",
                  border: "1px solid",
                  borderColor: darkMode 
                    ? alpha("#fff", 0.3)
                    : alpha("#fff", 0.3),
                  "&:hover": {
                    bgcolor: darkMode 
                      ? alpha("#fff", 0.2)
                      : alpha("#fff", 0.25),
                  }
                }}
              />
            )}
          </Box>
        </CardMedia>
        
        {/* Certification content */}
        <CardContent
          sx={{
            p: 2.5,
            pb: "16px !important", // Overrides padding-bottom applied by MaterialUI
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            position: "relative",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: "1rem",
                mb: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                lineHeight: 1.4,
                color: darkMode ? '#ffffff' : "#333",
                minHeight: "2.8rem", // Maintains consistent height for titles
              }}
            >
              {title}
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 1,
                color: darkMode ? alpha('#fff', 0.7) : "text.secondary",
                fontSize: "0.875rem",
              }}
            >
              {duration}
            </Typography>
          </Box>
          
          {/* Action buttons */}
          <Box 
            sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              mt: 1.5
            }}
          >
            <Button
              variant="contained"
              size="small"
              onClick={handleTakeCourse}
              sx={{
                ...primaryButtonStyles,
                bgcolor: darkMode 
                  ? ACCENTURE_COLORS.corePurple2
                  : ACCENTURE_COLORS.corePurple1,
                px: 2,
                fontSize: "0.8rem",
                borderRadius: 6,
                height: 32,
                color: "white",
                "&:hover": {
                  bgcolor: darkMode 
                    ? ACCENTURE_COLORS.corePurple1
                    : alpha(ACCENTURE_COLORS.corePurple1, 0.9),
                  transform: "translateY(-1px)",
                  boxShadow: darkMode
                    ? `0 4px 12px ${alpha(ACCENTURE_COLORS.corePurple1, 0.4)}`
                    : `0 4px 12px ${alpha(ACCENTURE_COLORS.corePurple1, 0.3)}`,
                },
              }}
            >
              Take course
            </Button>
            
            <Tooltip title="View details">
              <IconButton
                size="small"
                onClick={handleViewDetails}
                sx={{
                  color: darkMode 
                    ? alpha('#fff', 0.9) 
                    : ACCENTURE_COLORS.corePurple3,
                  bgcolor: darkMode 
                    ? alpha(ACCENTURE_COLORS.corePurple1, 0.2) 
                    : alpha(ACCENTURE_COLORS.corePurple1, 0.08),
                  "&:hover": {
                    bgcolor: darkMode
                      ? alpha(ACCENTURE_COLORS.corePurple1, 0.3)
                      : alpha(ACCENTURE_COLORS.corePurple1, 0.15),
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease",
                  width: 32,
                  height: 32,
                }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* Details modal */}
      <CertificationDetailModal 
        open={modalOpen}
        handleClose={handleCloseModal}
        certificationId={id}
        darkMode={darkMode}
      />
    </>
  );
};

export default CertificationCard;