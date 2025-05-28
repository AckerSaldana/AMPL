import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Modal,
  Fade,
  Backdrop,
  Chip,
  Button,
  alpha,
  IconButton,
  Divider,
  Paper,
  CircularProgress,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { supabase } from '../supabase/supabaseClient';
import { ACCENTURE_COLORS } from '../styles/styles';

/**
 * Ultra minimal and elegant modal component to display certification details
 */
const CertificationDetailModal = ({ open, handleClose, certificationId }) => {
  // State to store certification data
  const [certification, setCertification] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load certification data when modal opens
  useEffect(() => {
    if (open && certificationId) {
      fetchCertificationDetails();
    }
  }, [open, certificationId]);

  // Function to fetch certification details
  const fetchCertificationDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get certification data
      const { data: certData, error: certError } = await supabase
        .from('Certifications')
        .select('*')
        .eq('certification_id', certificationId)
        .single();

      if (certError) throw new Error('Error retrieving certification data');

      setCertification(certData);

      // If there are associated skills, retrieve them
      if (certData.skill_acquired && certData.skill_acquired.length > 0) {
        // Check if skill_acquired is an array or a single value
        const skillIds = Array.isArray(certData.skill_acquired) 
          ? certData.skill_acquired 
          : [certData.skill_acquired];

        const { data: skillsData, error: skillsError } = await supabase
          .from('Skill')
          .select('*')
          .in('skill_ID', skillIds);

        if (skillsError) throw new Error('Error retrieving skill data');

        setSkills(skillsData || []);
      }
    } catch (error) {
      console.error('Error fetching certification details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Return null if modal is not open
  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
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
      <Fade in={open}>
        <Paper
          elevation={0}
          sx={{
            width: { xs: '90%', sm: '80%', md: '650px' },
            maxHeight: '85vh',
            overflowY: 'auto',
            p: 0,
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            '&:focus': {
              outline: 'none',
            },
            boxShadow: `0 20px 80px -12px ${alpha(ACCENTURE_COLORS.corePurple3, 0.35)}`,
            position: 'relative',
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(ACCENTURE_COLORS.corePurple1, 0.2),
              borderRadius: '4px',
            },
            transition: 'transform 0.3s ease',
            animation: 'modalEntrance 0.4s ease',
            '@keyframes modalEntrance': {
              '0%': {
                transform: 'scale(0.96)',
                opacity: 0
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 1
              }
            }
          }}
        >
          {/* Close button - floating glass effect */}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            size="small"
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: 'white',
              bgcolor: alpha('#000', 0.25),
              width: 32,
              height: 32,
              backdropFilter: 'blur(4px)',
              zIndex: 10,
              '&:hover': {
                bgcolor: alpha('#000', 0.4),
                transform: 'scale(1.08)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {loading ? (
            // Loading state - elegant pulse animation
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              py: 12, 
              gap: 2,
              bgcolor: '#ffffff' 
            }}>
              <CircularProgress 
                size={40} 
                thickness={3} 
                sx={{ 
                  color: ACCENTURE_COLORS.corePurple1,
                  opacity: 0.7,
                  animation: 'pulse 1.5s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 0.4 },
                    '50%': { opacity: 0.8 },
                    '100%': { opacity: 0.4 }
                  }
                }} 
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: alpha('#000', 0.5), 
                  mt: 1,
                  fontSize: '0.85rem',
                  letterSpacing: '0.01em'
                }}
              >
                Loading details...
              </Typography>
            </Box>
          ) : error ? (
            // Error state - clean and helpful
            <Box sx={{ 
              textAlign: 'center', 
              p: 6, 
              bgcolor: '#ffffff',
              borderRadius: '16px'
            }}>
              <Box sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(ACCENTURE_COLORS.red, 0.08),
                color: ACCENTURE_COLORS.red,
                mx: 'auto',
                mb: 3
              }}>
                <CloseIcon sx={{ fontSize: '2rem', opacity: 0.8 }} />
              </Box>
              <Typography 
                variant="subtitle1" 
                color="error" 
                gutterBottom 
                sx={{ 
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  fontSize: '1.05rem'
                }}
              >
                Unable to load details
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 3,
                  maxWidth: '280px',
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                There was a problem retrieving this certification. Please try again later.
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.5),
                  color: ACCENTURE_COLORS.corePurple1,
                  borderRadius: '30px',
                  px: 4,
                  py: 1,
                  mt: 1,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: ACCENTURE_COLORS.corePurple1,
                    bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.04),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 3px 10px ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`
                  },
                  transition: 'all 0.2s ease',
                }}
                onClick={handleClose}
              >
                Close
              </Button>
            </Box>
          ) : certification ? (
            // Modal content - refined elegance
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {/* Header image with enhanced gradient */}
              <Box
                sx={{
                  position: 'relative',
                  height: '200px',
                  width: '100%',
                  backgroundImage: `url(${certification.certification_Image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderTopLeftRadius: '16px',
                  borderTopRightRadius: '16px',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(to bottom, ${alpha(ACCENTURE_COLORS.corePurple3, 0)} 0%, ${alpha(ACCENTURE_COLORS.corePurple3, 0.85)} 100%)`,
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                  }
                }}
              >
                {/* Title overlay with improved typography */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 3,
                    pb: 2.5,
                    color: 'white',
                  }}
                >
                  <Typography variant="h5" sx={{ 
                    fontWeight: 600, 
                    fontSize: { xs: '1.35rem', sm: '1.6rem' },
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                    mb: 1
                  }}>
                    {certification.title}
                  </Typography>
                </Box>
              </Box>

              {/* Content area with enhanced spacing and typography */}
              <Box sx={{ p: { xs: 3, sm: 4 }, bgcolor: '#ffffff' }}>


                {/* Issuer and Category section */}
                <Box sx={{ mb: 4, mt: 1 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 3,
                    mb: 3,
                    p: 2.5,
                    borderRadius: '12px',
                    backgroundColor: alpha(ACCENTURE_COLORS.accentPurple5, 0.5),
                    border: `1px solid ${alpha(ACCENTURE_COLORS.accentPurple4, 0.2)}`
                  }}>
                    {/* Issuer information */}
                    <Box sx={{ minWidth: '45%' }}>
                      <Typography variant="body2" sx={{ 
                        color: alpha('#000', 0.5),
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        mb: 0.5
                      }}>
                        Issuer
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: ACCENTURE_COLORS.corePurple3,
                        fontWeight: 500,
                        fontSize: '0.95rem'
                      }}>
                        {certification.issuer || 'Not specified'}
                      </Typography>
                    </Box>
                    
                    {/* Category information */}
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: alpha('#000', 0.5),
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        mb: 0.5
                      }}>
                        Category
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: ACCENTURE_COLORS.corePurple3,
                        fontWeight: 500,
                        fontSize: '0.95rem'
                      }}>
                        {certification.type || 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Description with refined typography */}
                {certification.description && (
                  <Box sx={{ mb: 4 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        color: '#111', 
                        fontWeight: 600,
                        fontSize: '1rem',
                        mb: 1.5,
                        letterSpacing: '-0.01em',
                        position: 'relative',
                        pb: 1,
                        '&:after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: 30,
                          height: 2,
                          backgroundColor: alpha(ACCENTURE_COLORS.corePurple1, 0.3),
                          borderRadius: 1
                        }
                      }}
                    >
                      About this certification
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: alpha('#000', 0.7),
                        lineHeight: 1.7,
                        fontSize: '0.9rem',
                        letterSpacing: '0.01em'
                      }}
                    >
                      {certification.description}
                    </Typography>
                  </Box>
                )}

                {/* Skills section with improved chips */}
                {skills.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        color: '#111', 
                        fontWeight: 600,
                        fontSize: '1rem',
                        mb: 2,
                        letterSpacing: '-0.01em',
                        position: 'relative',
                        pb: 1,
                        '&:after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: 30,
                          height: 2,
                          backgroundColor: alpha(ACCENTURE_COLORS.corePurple1, 0.3),
                          borderRadius: 1
                        }
                      }}
                    >
                      Skills you'll gain
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1.5,
                      maxWidth: '100%'
                    }}>
                      {skills.map((skill) => (
                        <Chip
                          key={skill.skill_ID}
                          label={skill.name}
                          size="small"
                          sx={{
                            bgcolor: '#fff',
                            color: ACCENTURE_COLORS.corePurple2,
                            fontWeight: 500,
                            borderRadius: '12px',
                            px: 1,
                            height: 28,
                            '& .MuiChip-label': {
                              px: 1,
                              fontWeight: 500,
                              fontSize: '0.75rem'
                            },
                            border: '1px solid',
                            borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.2),
                            transition: 'all 0.25s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 3px 6px ${alpha(ACCENTURE_COLORS.corePurple1, 0.15)}`,
                              borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.3),
                              backgroundColor: alpha(ACCENTURE_COLORS.corePurple1, 0.03)
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Elegant divider */}
                <Divider sx={{ 
                  my: 3.5, 
                  opacity: 0.06
                }} />

                {/* Action buttons with enhanced styling */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: 2,
                    mt: 2
                  }}
                >
                  <Button
                    variant="text"
                    onClick={handleClose}
                    sx={{
                      color: alpha('#000', 0.6),
                      borderRadius: '30px',
                      px: 2.5,
                      py: 0.75,
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      letterSpacing: '0.01em',
                      '&:hover': {
                        backgroundColor: alpha('#000', 0.04),
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Close
                  </Button>
                  
                  {certification.url && (
                    <Button
                      variant="contained"
                      endIcon={<OpenInNewIcon sx={{ fontSize: '1rem', ml: 0.5 }} />}
                      onClick={() => window.open(certification.url, '_blank', 'noopener,noreferrer')}
                      sx={{
                        background: `linear-gradient(135deg, ${ACCENTURE_COLORS.corePurple1} 0%, ${ACCENTURE_COLORS.corePurple2} 100%)`,
                        borderRadius: '30px',
                        px: 3,
                        py: 0.75,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        boxShadow: `0 2px 8px ${alpha(ACCENTURE_COLORS.corePurple1, 0.25)}`,
                        letterSpacing: '0.01em',
                        border: 'none',
                        '&:hover': {
                          boxShadow: `0 4px 12px ${alpha(ACCENTURE_COLORS.corePurple1, 0.35)}`,
                          background: `linear-gradient(135deg, ${ACCENTURE_COLORS.corePurple1} 0%, ${ACCENTURE_COLORS.corePurple2} 70%)`
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      View Course
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          ) : (
            // No data state - clean and minimal
            <Box sx={{ 
              textAlign: 'center', 
              p: 6, 
              bgcolor: '#ffffff',
              borderRadius: '16px'
            }}>
              <Box sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(ACCENTURE_COLORS.accentPurple4, 0.2),
                color: ACCENTURE_COLORS.corePurple1,
                mx: 'auto',
                mb: 3
              }}>
                <SchoolOutlinedIcon sx={{ fontSize: '1.8rem', opacity: 0.7 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ 
                mb: 1.5, 
                fontWeight: 600,
                color: alpha('#000', 0.7)
              }}>
                No details available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                We couldn't find information for this certification.
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.5),
                  color: ACCENTURE_COLORS.corePurple1,
                  borderRadius: '30px',
                  px: 3,
                  py: 0.75,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: ACCENTURE_COLORS.corePurple1,
                    bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.04),
                    boxShadow: `0 3px 10px ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`
                  },
                  transition: 'all 0.2s ease',
                }}
                onClick={handleClose}
              >
                Close
              </Button>
            </Box>
          )}
        </Paper>
      </Fade>
    </Modal>
  );
};

export default CertificationDetailModal;