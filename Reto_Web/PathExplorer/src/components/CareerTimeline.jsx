import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Avatar, useMediaQuery, Fade, Grow } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  WorkspacePremium,
  Code,
  CalendarMonth,
  Person,
  Business,
} from "@mui/icons-material";
import { ACCENTURE_COLORS } from "../styles/styles";

//

// Default item to avoid errors with undefined properties
const defaultItem = {
  id: "default",
  name: "Event",
  type: "project",
  displayDate: "No date",
  role: "No role",
  issuer: "No issuer",
  description: "",
  company: ""
};

const TimelineItem = ({ item = defaultItem, isLast = false, index = 0, darkMode = false }) => {
  // Combine default item with provided item to ensure all properties
  const safeItem = { ...defaultItem, ...item };
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 150); // Staggered animation delay
    return () => clearTimeout(timer);
  }, [index]);

  const getColor = () => {
    if (safeItem.isSuggested) return ACCENTURE_COLORS.corePurple1;
    return safeItem.type === "project" 
      ? ACCENTURE_COLORS.corePurple1
      : ACCENTURE_COLORS.corePurple2;
  };

  const Icon = safeItem.type === "project" ? Code : WorkspacePremium;

  return (
    <Fade in={isVisible} timeout={1000}>
      <Box
        sx={{
          display: "flex",
          position: "relative",
          mb: isLast ? 0 : 5,
        }}
      >
      {/* Left column with timeline element */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: { xs: 50, md: 80 },
          flexShrink: 0,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Avatar
          sx={{
            width: { xs: 36, md: 44 },
            height: { xs: 36, md: 44 },
            bgcolor: darkMode ? '#1e1e1e' : "#fff",
            color: getColor(),
            border: `2px solid ${getColor()}`,
            boxShadow: `0 0 0 4px ${getColor()}10`,
            zIndex: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: `0 0 0 6px ${getColor()}20`,
            },
          }}
        >
          <Icon fontSize="small" />
        </Avatar>
        {!isLast && (
          <Box
            sx={{
              width: 2,
              height: "calc(100% + 40px)",
              position: "absolute",
              top: { xs: 36, md: 44 },
              background: `linear-gradient(to bottom, ${ACCENTURE_COLORS.corePurple1}40, ${ACCENTURE_COLORS.corePurple1}20)`,
              zIndex: 1,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
              transformOrigin: 'top',
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: `${index * 150 + 300}ms`,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '-2px',
                left: '50%',
                width: 6,
                height: 6,
                bgcolor: ACCENTURE_COLORS.corePurple1,
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: isVisible ? 0.6 : 0,
                transition: 'opacity 0.5s ease',
                transitionDelay: `${index * 150 + 800}ms`,
              },
            }}
          />
        )}
      </Box>

      {/* Right column with content */}
      <Box sx={{ flex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            bgcolor: darkMode ? '#1e1e1e' : "#fff",
            boxShadow: darkMode ? "0 2px 12px rgba(255, 255, 255, 0.03)" : "0 2px 12px rgba(0, 0, 0, 0.03)",
            border: darkMode ? '1px solid rgba(255,255,255,0.12)' : `1px solid ${getColor()}10`,
            position: "relative",
            transition: 'all 0.3s ease',
            "&:hover": {
              boxShadow: darkMode ? "0 4px 20px rgba(255, 255, 255, 0.08)" : "0 4px 20px rgba(0, 0, 0, 0.08)",
              transform: "translateY(-2px)",
              borderColor: `${getColor()}20`,
            },
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 500,
              color: darkMode ? '#ffffff' : ACCENTURE_COLORS.black,
              mb: 1.5,
            }}
          >
            {safeItem.name}
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CalendarMonth
                fontSize="small"
                sx={{ color: ACCENTURE_COLORS.accentPurple1 }}
              />
              <Typography
                variant="body2"
                sx={{ 
                  color: safeItem.isSuggested ? ACCENTURE_COLORS.corePurple1 : (darkMode ? 'rgba(255,255,255,0.7)' : ACCENTURE_COLORS.darkGray),
                  fontWeight: safeItem.isSuggested ? 500 : 400
                }}
              >
                {safeItem.displayDate}
              </Typography>
            </Box>

            {safeItem.type === "project" ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Person
                  fontSize="small"
                  sx={{ color: ACCENTURE_COLORS.corePurple1 }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : ACCENTURE_COLORS.darkGray }}
                >
                  {safeItem.role}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Business
                  fontSize="small"
                  sx={{ color: ACCENTURE_COLORS.corePurple2 }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : ACCENTURE_COLORS.darkGray }}
                >
                  {safeItem.issuer}
                </Typography>
              </Box>
            )}
          </Box>

          {safeItem.type === "project" && safeItem.description && (
            <Typography
              variant="body2"
              sx={{
                color: ACCENTURE_COLORS.darkGray,
                mt: 1.5,
                fontStyle: "italic",
              }}
            >
              {safeItem.description}
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
    </Fade>
  );
};

const CareerTimeline = ({ timelineItems = [], darkMode = false }) => {
  // Ensure timelineItems is an array
  const safeTimelineItems = Array.isArray(timelineItems) ? timelineItems : [];
  const [showLine, setShowLine] = useState(false);

  useEffect(() => {
    if (safeTimelineItems.length > 0) {
      setTimeout(() => setShowLine(true), 100);
    }
  }, [safeTimelineItems.length]);

  return (
    <Box
      sx={{
        position: "relative",
        pb: 2,
        pl: { xs: 0, sm: 2 },
        pr: { xs: 0, sm: 2 },
      }}
    >
      
      {safeTimelineItems.map((item, index) => (
        <TimelineItem
          key={`${item?.type || 'item'}-${item?.id || index}`}
          item={item}
          index={index}
          isLast={index === safeTimelineItems.length - 1}
          darkMode={darkMode}
        />
      ))}

      {/* Message when there are no items */}
      {safeTimelineItems.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            bgcolor: darkMode ? '#1e1e1e' : "#fff",
            boxShadow: darkMode ? "0 2px 12px rgba(255, 255, 255, 0.03)" : "0 2px 12px rgba(0, 0, 0, 0.03)",
            textAlign: "center",
            border: darkMode ? '1px dashed rgba(255,255,255,0.2)' : `1px dashed ${ACCENTURE_COLORS.corePurple1}30`
          }}
        >
          <Typography
            variant="body1"
            sx={{ color: ACCENTURE_COLORS.darkGray }}
          >
            No events in your timeline yet.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default CareerTimeline;