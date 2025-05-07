// src/components/PopularCertifications.jsx
import React from "react";
import { 
  Box, 
  Typography, 
  Card,
  CardContent, 
  Avatar,
  Chip,
  Button,
  useTheme,
  alpha,
  Divider,
  LinearProgress,
  Stack
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
import { useNavigate } from "react-router-dom";

export const PopularCertifications = ({ certifications }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Updated to match Dashboard profile color
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
  
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 2,
        border: `1px solid ${alpha(profilePurple, 0.1)}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${alpha(profilePurple, 0.1)}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              bgcolor: alpha(profilePurple, 0.1), 
              color: profilePurple,
              width: 34,
              height: 34,
              mr: 1.5
            }}
          >
            <EmojiEventsIcon fontSize="small" />
          </Avatar>
          <Typography variant="h6" fontWeight={500}>
            Popular Certifications
          </Typography>
        </Box>
        <Button 
          size="small"
          variant="text"
          color="primary"
          endIcon={<ArrowForwardIosIcon sx={{ fontSize: '0.7rem' }} />}
          onClick={() => navigate('/certifications')}
          sx={{ 
            textTransform: 'none',
            fontSize: '0.8rem',
            color: profilePurple,
            '&:hover': {
              bgcolor: alpha(profilePurple, 0.05)
            }
          }}
        >
          View All
        </Button>
      </Box>
      
      {/* Content */}
      <Box 
        sx={{ 
          flex: 1,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto'
        }}
      >
        {certifications.length > 0 ? (
          certifications.map((cert) => (
            <Card 
              key={cert.id}
              elevation={0}
              sx={{
                borderRadius: 2,
                border: `1px solid ${alpha(profilePurple, 0.1)}`,
                transition: 'all 0.2s',
                overflow: 'hidden',
                '&:hover': {
                  borderColor: alpha(profilePurple, 0.3),
                  bgcolor: alpha(profilePurple, 0.03)
                }
              }}
            >
              <CardContent sx={{ p: 2 }}>  
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(profilePurple, 0.1),
                      color: profilePurple,
                      mr: 1.5,
                      width: 38,
                      height: 38
                    }}
                  >
                    {getIconByType(cert.iconType)}
                  </Avatar>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight={600} gutterBottom>
                      {cert.name}
                    </Typography>
                    
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Chip 
                        label={cert.category} 
                        size="small"
                        sx={{ 
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor: alpha(profilePurple, 0.1),
                          color: profilePurple,
                          fontWeight: 500
                        }}
                      />
                      
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {cert.completions} completions
                      </Typography>
                    </Stack>
                    
                    <Box sx={{ mt: 1, mb: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Popularity
                        </Typography>
                        <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '0.7rem' }}>
                          {cert.popularity}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={cert.popularity} 
                        sx={{ 
                          height: 4, 
                          borderRadius: 2,
                          bgcolor: alpha(profilePurple, 0.1),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: profilePurple
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              No popular certifications found
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};