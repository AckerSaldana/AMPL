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
  level = "Beginner"
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
          border: `1px solid ${alpha('#000', 0.08)}`,
          bgcolor: "white",
          "&:hover": {
            boxShadow: `0 4px 12px ${alpha(ACCENTURE_COLORS.corePurple1, 0.12)}`,
            borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.15),
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
              backgroundImage: `linear-gradient(180deg, rgba(65, 0, 115, 0.8) 0%, rgba(65, 0, 115, 0.4) 40%, rgba(65, 0, 115, 0) 100%)`,
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
                  bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.2),
                  color: "white",
                  fontWeight: 500,
                  fontSize: "0.7rem",
                  height: 24,
                  borderRadius: "4px",
                  mb: 0.5,
                  backdropFilter: "blur(4px)",
                  border: "1px solid",
                  borderColor: alpha("#fff", 0.3),
                  "& .MuiChip-label": {
                    px: 1,
                  }
                }}
              />
            ))}
            {skills.length > 3 && (
              <Chip
                label={`+${skills.length - 3}`}
                size="small"
                sx={{
                  bgcolor: alpha("#fff", 0.2),
                  color: "white",
                  fontWeight: 500,
                  fontSize: "0.7rem",
                  height: 24,
                  borderRadius: "4px",
                  mb: 0.5,
                  backdropFilter: "blur(4px)",
                  border: "1px solid",
                  borderColor: alpha("#fff", 0.3),
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
                color: "#333",
                minHeight: "2.8rem", // Maintains consistent height for titles
              }}
            >
              {title}
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: 1 }}
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
                bgcolor: ACCENTURE_COLORS.corePurple1,
                px: 2,
                fontSize: "0.8rem",
                borderRadius: 6,
                height: 32,
              }}
            >
              Take course
            </Button>
            
            <Tooltip title="View details">
              <IconButton
                size="small"
                onClick={handleViewDetails}
                sx={{
                  color: ACCENTURE_COLORS.corePurple3,
                  bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.08),
                  "&:hover": {
                    bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.15),
                  },
                  transition: "background-color 0.2s",
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
      />
    </>
  );
};

export default CertificationCard;