// src/components/PopularCertifications.jsx
import React from "react";
import { 
  Box, 
  Typography, 
  Card,
  Avatar,
  Button,
  alpha,
  Stack,
  Grid,
  Divider,
  Tooltip
} from "@mui/material";

// Iconos
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import StorageIcon from "@mui/icons-material/Storage";
import CodeIcon from "@mui/icons-material/Code";
import WorkIcon from "@mui/icons-material/Work";
import CloudIcon from "@mui/icons-material/Cloud";
import DataObjectIcon from "@mui/icons-material/DataObject";
import SecurityIcon from "@mui/icons-material/Security";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import StarIcon from "@mui/icons-material/Star";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import { useNavigate } from "react-router-dom";

export const PopularCertifications = ({ certifications }) => {
  const navigate = useNavigate();
  
  // Match Dashboard profile color
  const profilePurple = '#9c27b0';
  
  // Get icon based on certification type
  const getIconByType = (iconType) => {
    switch (iconType) {
      case 'Storage': return <StorageIcon />;
      case 'Code': return <CodeIcon />;
      case 'Work': return <WorkIcon />;
      case 'Cloud': return <CloudIcon />;
      case 'DataObject': return <DataObjectIcon />;
      case 'Security': return <SecurityIcon />;
      case 'Analytics': return <AnalyticsIcon />;
      default: return <EmojiEventsIcon />;
    }
  };
  
  // Calculate star rating based on popularity percentage
  const calculateStars = (popularity) => {
    // Transform popularity percentage to a 0-5 scale
    return Math.round(popularity / 20);
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid',
          borderColor: alpha(profilePurple, 0.1)
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmojiEventsIcon 
            sx={{ 
              color: profilePurple, 
              mr: 1.5,
              fontSize: 20
            }} 
          />
          <Typography variant="h6" fontWeight={500} sx={{ fontSize: '1rem' }}>
            Popular Certifications
          </Typography>
        </Box>
        <Button 
          size="small"
          endIcon={<ArrowForwardIosIcon sx={{ fontSize: '0.7rem' }} />}
          onClick={() => navigate('/certifications')}
          sx={{ 
            textTransform: 'none',
            fontSize: '0.75rem',
            color: profilePurple,
            fontWeight: 400,
            '&:hover': {
              bgcolor: 'transparent'
            }
          }}
        >
          View All
        </Button>
      </Box>
      
      {/* Content - Card Grid Layout */}
      <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
        <Grid container spacing={2}>
          {certifications.length > 0 ? (
          certifications.map((cert, index) => {
            // Calculate star rating (0-5)
            const starRating = calculateStars(cert.popularity);
            
            return (
              <Grid item xs={12} key={cert.id}>
                <Card 
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${alpha(profilePurple, 0.1)}`,
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: alpha(profilePurple, 0.3),
                      boxShadow: `0 4px 12px ${alpha(profilePurple, 0.08)}`,
                      '& .cert-number': {
                        opacity: 1
                      }
                    }
                  }}
                >
                  {/* Position indicator */}
                  <Box 
                    className="cert-number"
                    sx={{ 
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: 30,
                      height: 30,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(profilePurple, 0.1),
                      color: profilePurple,
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      opacity: 0.7,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    {index + 1}
                  </Box>
                
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: alpha(profilePurple, 0.08),
                          color: profilePurple,
                          mr: 2,
                          width: 42,
                          height: 42
                        }}
                      >
                        {getIconByType(cert.iconType)}
                      </Avatar>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {cert.name}
                        </Typography>
                        
                        <Typography variant="caption" sx={{ 
                          color: alpha(profilePurple, 0.8),
                          fontWeight: 500,
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}>
                          {cert.category}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 1.5, borderColor: alpha(profilePurple, 0.08) }} />
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      {/* Star Rating */}
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {[...Array(5)].map((_, i) => (
                          <StarIcon 
                            key={i} 
                            sx={{ 
                              fontSize: '0.95rem',
                              color: i < starRating ? profilePurple : alpha(profilePurple, 0.2),
                              mr: 0.3
                            }} 
                          />
                        ))}
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontWeight: 600, 
                            ml: 0.5,
                            color: 'text.secondary'
                          }}
                        >
                          {cert.popularity}%
                        </Typography>
                      </Box>
                      
                      {/* People count with icon */}
                      <Tooltip title={`${cert.completions} professionals completed this certification`}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PeopleAltOutlinedIcon sx={{ 
                            fontSize: '1rem', 
                            color: profilePurple,
                            mr: 0.5
                          }} />
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontWeight: 500,
                              color: 'text.secondary'
                            }}
                          >
                            {cert.completions}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })
        ) : (
          <Grid item xs={12}>
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              border: `1px dashed ${alpha(profilePurple, 0.2)}`,
              borderRadius: 2
            }}>
              <Typography variant="body2" color="text.secondary">
                No popular certifications found
              </Typography>
            </Box>
          </Grid>
        )}
        </Grid>
      </Box>
    </Box>
  );
};