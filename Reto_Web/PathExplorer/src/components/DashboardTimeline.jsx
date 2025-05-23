import React from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  alpha,
  Button,
  Chip,
  Avatar,
  Fade,
  Grow
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SchoolIcon from "@mui/icons-material/School";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useNavigate } from "react-router-dom";
import { ACCENTURE_COLORS } from "../styles/styles";

// Componente que muestra un elemento de la timeline
const DashboardTimelineItem = ({ item, isLast = false, profilePurple, index }) => {
  // Determinamos el tipo (certification o project)
  const isProject = item.type === "Project";
  
  // Extraemos el título real de la certificación o proyecto
  const title = item.name || "Untitled"; 
  
  // Extraemos la fecha que queremos mostrar
  const dateDisplay = item.displayDate || "May 2025";

  // Iconos según el tipo
  const getIcon = () => {
    if (isProject) return <WorkOutlineIcon sx={{ fontSize: 18 }} />;
    if (item.type === "Course") return <BookmarkBorderIcon sx={{ fontSize: 18 }} />;
    return <EmojiEventsIcon sx={{ fontSize: 18 }} />;
  };

  // Colores según el tipo usando Accenture colors
  const getTypeColor = () => {
    if (isProject) return ACCENTURE_COLORS.blue;
    if (item.type === "Course") return ACCENTURE_COLORS.orange;
    return profilePurple;
  };

  return (
    <Grow in={true} timeout={300 + (index * 100)}>
      <Box
        sx={{
          display: "flex",
          position: "relative",
          mb: isLast ? 0 : { xs: 3, sm: 4, md: 5, lg: 6 },
          ml: { xs: 3, sm: 4 },
          transition: 'all 0.3s ease',
          '&:hover': {
            '& .timeline-card': {
              transform: 'translateX(8px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              borderColor: alpha(profilePurple, 0.3),
            },
            '& .timeline-dot': {
              transform: 'translateY(-50%) scale(1.3)',
              boxShadow: `0 0 0 8px ${alpha(profilePurple, 0.1)}`,
            }
          }
        }}
      >
        {/* Enhanced timeline dot with animation */}
        <Box
          className="timeline-dot"
          sx={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: profilePurple,
            position: "absolute",
            left: { xs: -36, sm: -40, md: -46.5 },
            top: "50%",
            transform: "translateY(-50%)",
            border: `3px solid white`,
            boxShadow: `0 0 0 4px ${alpha(profilePurple, 0.1)}`,
            transition: 'all 0.3s ease',
            zIndex: 2,
          }}
        />
        
        {/* Timeline card with gradient border */}
        <Paper
          className="timeline-card"
          elevation={0}
          sx={{
            flex: 1,
            p: { xs: 2, sm: 2.5 },
            backgroundColor: '#ffffff',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
            border: `1px solid ${alpha(profilePurple, 0.15)}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
            transition: 'all 0.3s ease',
            height: 100, // Fixed height for all items
            display: 'flex',
            alignItems: 'center',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              backgroundColor: getTypeColor(),
              borderRadius: '8px 8px 0 0', // Match parent border radius
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            {/* Left content with icon */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(getTypeColor(), 0.1),
                  color: getTypeColor(),
                  width: 40,
                  height: 40,
                  flexShrink: 0
                }}
              >
                {getIcon()}
              </Avatar>
              
              <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <Typography
                  fontWeight={600}
                  variant="subtitle1"
                  sx={{
                    color: "text.primary",
                    fontSize: "0.95rem",
                    mb: 0.5,
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    wordBreak: 'break-word'
                  }}
                  title={title} // Show full text on hover
                >
                  {title}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={
                      item.status === 'Completed' || item.status === 'approved' 
                        ? (item.type || "Certification").charAt(0).toUpperCase() + (item.type || "Certification").slice(1)
                        : (item.type || "Certification")
                    }
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      bgcolor: alpha(getTypeColor(), 0.1),
                      color: getTypeColor(),
                      border: 'none'
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ 
                      color: "text.secondary",
                      fontSize: "0.8rem",
                      fontWeight: 500
                    }}
                  >
                    {dateDisplay}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Status indicator - Fixed width */}
            <Box sx={{ 
              textAlign: 'right',
              flexShrink: 0,
              ml: 2,
              minWidth: 100
            }}>
              <Chip
                icon={item.status ? <TrendingUpIcon sx={{ fontSize: '14px !important' }} /> : null}
                label={
                  item.status === 'approved' 
                    ? 'Approved'
                    : item.status === 'Completed'
                    ? 'Completed'
                    : item.status === 'In Progress'
                    ? 'In Progress'
                    : item.status || 'Planned'
                }
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  bgcolor: item.status === 'Completed' || item.status === 'approved'
                    ? alpha(ACCENTURE_COLORS.green, 0.15)
                    : item.status === 'In Progress'
                    ? alpha(ACCENTURE_COLORS.orange, 0.15)
                    : alpha(profilePurple, 0.1),
                  color: item.status === 'Completed' || item.status === 'approved'
                    ? '#4caf50'
                    : item.status === 'In Progress'
                    ? ACCENTURE_COLORS.orange
                    : profilePurple,
                  '& .MuiChip-icon': {
                    color: 'inherit'
                  }
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Box>
    </Grow>
  );
};

// Componente principal de Timeline
const DashboardTimeline = ({ items = [], profilePurple }) => {
  const navigate = useNavigate();
  
  // Si no hay items o no es un array, usamos datos de respaldo
  const fallbackItems = [
    { id: 1, type: "Certificate", name: "AWS Cloud Practitioner", displayDate: "May 2025", status: "In Progress" },
    { id: 2, type: "Certificate", name: "Azure Fundamentals", displayDate: "June 2025", status: "Planned" },
    { id: 3, type: "Course", name: "Advanced React Patterns", displayDate: "July 2025", status: "Planned" }
  ];
  
  // Nos aseguramos de que items sea un array y limitamos a 3 elementos
  const safeItems = Array.isArray(items) && items.length > 0 
    ? items.slice(0, 3) 
    : fallbackItems;

  // Debug - imprimimos en consola para ver los datos
  console.log("Timeline items:", safeItems);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        bgcolor: '#ffffff',
        boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        border: `1px solid ${alpha(profilePurple, 0.15)}`,
        minHeight: { xs: 350, sm: 400, md: 450, lg: 500 }, // Responsive height
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }
      }}
    >
      {/* Enhanced header */}
      <Box sx={{ 
        p: 2.5, 
        borderBottom: '1px solid',
        borderColor: alpha(profilePurple, 0.1),
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: alpha(profilePurple, 0.02),
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{ 
              bgcolor: profilePurple,
              width: 36,
              height: 36,
              mr: 2,
            }}
          >
            <SchoolIcon sx={{ fontSize: 20 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.125rem', color: 'text.primary' }}>
              MyPath Timeline
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            sx={{
              color: profilePurple,
              fontWeight: 500,
              fontSize: '0.875rem',
              textTransform: 'none',
              px: 2,
              py: 0.75,
              borderRadius: '20px',
              transition: 'all 0.3s ease',
              '&:hover': { 
                bgcolor: alpha(profilePurple, 0.08),
                transform: 'translateX(4px)',
              }
            }}
            onClick={() => navigate('/mypath')}
          >
            View Full Path
          </Button>
        </Box>
      </Box>
      
      {/* Enhanced timeline content with better spacing */}
      <Box
        sx={{
          position: "relative",
          ml: { xs: 2, sm: 3 },
          p: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3, sm: 4, md: 5 },
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          // Enhanced vertical line
          "&::before": {
            content: '""',
            position: "absolute",
            top: { xs: 20, sm: 25, md: 30 },
            bottom: { xs: 20, sm: 25, md: 30 },
            left: { xs: 16, sm: 20, md: 24 },
            width: 3,
            backgroundColor: alpha(profilePurple, 0.2),
            borderRadius: 2,
          }
        }}
      >
        {safeItems.map((item, index) => (
          <DashboardTimelineItem 
            key={index}
            item={item}
            index={index}
            isLast={index === safeItems.length - 1}
            profilePurple={profilePurple}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default DashboardTimeline;