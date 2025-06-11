import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs,
  Tab,
  Grid,
  Chip,
  Button,
  Paper,
  alpha,
  CircularProgress,
  Tooltip,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Divider,
  Avatar,
  Modal,
  Backdrop,
  Link,
  useTheme,
} from '@mui/material';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VerifiedIcon from '@mui/icons-material/Verified';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import { ACCENTURE_COLORS } from '../styles/styles';
import SubmitCertification from './SubmitCertification';
import { useDarkMode } from '../contexts/DarkModeContext';

// Enhanced color palette with elegant variations
const getElegantColors = (darkMode) => ({
  primary: ACCENTURE_COLORS.corePurple1, // Accenture purple
  primaryLight: ACCENTURE_COLORS.accentPurple3,
  primaryLighter: ACCENTURE_COLORS.accentPurple5,
  primaryDark: ACCENTURE_COLORS.corePurple3,
  secondary: '#FF395A', // Subtle accent for highlights
  success: darkMode ? '#4CAF50' : '#22A565',
  warning: darkMode ? '#FF9800' : '#F2994A',
  error: darkMode ? '#F44336' : '#E53935',
  neutral: darkMode ? '#121212' : '#F7F9FC',
  neutralDark: darkMode ? '#1e1e1e' : '#E5E9F2',
  textPrimary: darkMode ? '#ffffff' : '#2C3E50',
  textSecondary: darkMode ? 'rgba(255,255,255,0.7)' : '#64748B',
  cardBackground: darkMode ? '#1e1e1e' : '#FFFFFF',
  gradientStart: ACCENTURE_COLORS.corePurple1,
  gradientEnd: ACCENTURE_COLORS.corePurple3,
  borderColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
});

// Enhanced button styles
const getElegantButtonStyles = (ELEGANT_COLORS, darkMode) => ({
  primary: {
    borderRadius: 8,
    fontWeight: 500,
    boxShadow: darkMode ? '0 2px 6px rgba(0, 0, 0, 0.3)' : '0 2px 6px rgba(92, 45, 145, 0.15)',
    textTransform: 'none',
    fontSize: '0.875rem',
    padding: '8px 20px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      boxShadow: darkMode ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(92, 45, 145, 0.25)',
      transform: 'translateY(-1px)',
    },
  },
  outline: {
    borderRadius: 8,
    fontWeight: 500,
    textTransform: 'none',
    fontSize: '0.875rem',
    padding: '7px 20px',
    borderColor: ELEGANT_COLORS.primary,
    color: ELEGANT_COLORS.primary,
    '&:hover': {
      borderColor: ELEGANT_COLORS.primaryDark,
      backgroundColor: alpha(ELEGANT_COLORS.primary, darkMode ? 0.15 : 0.05),
    },
  },
  text: {
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.875rem',
    color: ELEGANT_COLORS.primary,
    '&:hover': {
      backgroundColor: alpha(ELEGANT_COLORS.primary, darkMode ? 0.15 : 0.05),
    },
  },
});

// Enhanced chip styles for status
const getElegantChipStyles = (ELEGANT_COLORS, darkMode) => ({
  approved: {
    bgcolor: alpha(ELEGANT_COLORS.success, darkMode ? 0.15 : 0.08),
    color: ELEGANT_COLORS.success,
    borderColor: alpha(ELEGANT_COLORS.success, darkMode ? 0.3 : 0.2),
    '& .MuiChip-icon': {
      color: ELEGANT_COLORS.success,
    },
  },
  pending: {
    bgcolor: alpha(ELEGANT_COLORS.warning, darkMode ? 0.15 : 0.08),
    color: ELEGANT_COLORS.warning,
    borderColor: alpha(ELEGANT_COLORS.warning, darkMode ? 0.3 : 0.2),
    '& .MuiChip-icon': {
      color: ELEGANT_COLORS.warning,
    },
  },
  rejected: {
    bgcolor: alpha(ELEGANT_COLORS.error, darkMode ? 0.15 : 0.08),
    color: ELEGANT_COLORS.error,
    borderColor: alpha(ELEGANT_COLORS.error, darkMode ? 0.3 : 0.2),
    '& .MuiChip-icon': {
      color: ELEGANT_COLORS.error,
    },
  },
});

// Fallback data - no longer used
// const fallbackUserCertifications = [];

const MyCertifications = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { darkMode } = useDarkMode();
  const ELEGANT_COLORS = getElegantColors(darkMode);
  const elegantButtonStyles = getElegantButtonStyles(ELEGANT_COLORS, darkMode);
  const elegantChipStyles = getElegantChipStyles(ELEGANT_COLORS, darkMode);

  // States
  const [activeTab, setActiveTab] = useState('all');
  const [userCertifications, setUserCertifications] = useState([]);
  const [filteredCertifications, setFilteredCertifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({ all: 0, approved: 0, pending: 0, rejected: 0 });
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [selectedCertName, setSelectedCertName] = useState('');

  // Get the current user ID (you may have to adjust this based on your auth implementation)
  const getCurrentUserId = () => {
    // Replace with actual user ID retrieval logic
    return supabase.auth.getUser().then(({ data }) => data.user?.id || 'current-user-id');
  };

  // Fetch user certifications
  useEffect(() => {
    const fetchUserCertifications = async () => {
      try {
        setIsLoading(true);
        
        const userId = await getCurrentUserId();
        
        // Fetch user certifications with certification details
        const { data, error } = await supabase
          .from('UserCertifications')
          .select(`
            *,
            certification:certification_ID (
              title,
              issuer,
              type,
              certification_Image,
              url
            )
          `)
          .eq('user_ID', userId);
          
        if (error) {
          throw new Error(`Error fetching certifications: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
          console.log("No user certifications found");
          processCertifications([]);
          return;
        }
        
        processCertifications(data);
      } catch (error) {
        console.error("Error fetching user certifications:", error);
        setError(error.message);
        // Don't use fallback data on error, just show empty state
        processCertifications([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    const processCertifications = (certs) => {
      // Process and format the certifications data
      const processedCerts = certs.map(cert => ({
        id: cert.id,
        certification_id: cert.certification_ID || cert.certification_id,
        user_id: cert.user_ID || cert.user_id,
        status: cert.status || 'pending',
        score: cert.score,
        evidence: cert.evidence,
        rejection_reason: cert.rejection_reason,
        completed_Date: cert.completed_Date,
        valid_Until: cert.valid_Until,
        certification: {
          title: cert.certification?.title || 'Unknown Certification',
          issuer: cert.certification?.issuer || 'Unknown Issuer',
          type: cert.certification?.type || 'Uncategorized',
          certification_Image: cert.certification?.certification_Image || getDefaultImageByType(cert.certification?.type),
          url: cert.certification?.url
        }
      }));
      
      setUserCertifications(processedCerts);
      
      // Calculate counts for tabs
      const countByStatus = processedCerts.reduce((acc, cert) => {
        const status = cert.status?.toLowerCase() || 'pending';
        acc.all++;
        acc[status]++;
        return acc;
      }, { all: 0, approved: 0, pending: 0, rejected: 0 });
      
      setCounts(countByStatus);
      
      // By default, show all certifications
      setFilteredCertifications(processedCerts);
    };
    
    // Function to get a default image by type
    const getDefaultImageByType = (type) => {
      const typeImageMap = {
        'Project Management': 'https://img-c.udemycdn.com/course/750x422/2806490_5db0.jpg',
        'Cloud Computing': 'https://d1.awsstatic.com/training-and-certification/certification-badges/AWS-Certified-Cloud-Practitioner_badge.634f8a21af2e0e956ed8905a72366146ba22b74c.png',
        'Leadership': 'https://media.licdn.com/dms/image/D5612AQEZ9MmzDX0Quw/article-cover_image-shrink_600_2000/0/1655660612362?e=2147483647&v=beta&t=HANgb1jU-vKOK4L_fUDFPqz_FVjNg-8XKY3BONvObs4',
        'Cybersecurity': 'https://img-c.udemycdn.com/course/750x422/614772_233b_9.jpg',
        'Human Resources': 'https://www.shrm.org/adobe/dynamicmedia/deliver/dm-aid--f30d95fb-cf54-463f-8557-eb68a1b0065a/shrm-cp-badge.png'
      };
      
      return typeImageMap[type] || 'https://img-c.udemycdn.com/course/750x422/1650610_2673_6.jpg';
    };

    fetchUserCertifications();
  }, []);

  // Effect to filter certifications
  useEffect(() => {
    if (!userCertifications.length) return;
    
    let filtered = [...userCertifications];
    
    // Filter by status tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(cert => cert.status?.toLowerCase() === activeTab);
    }
    
    // Apply search term filter if any
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(cert => 
        cert.certification.title.toLowerCase().includes(search) || 
        cert.certification.issuer.toLowerCase().includes(search) ||
        cert.certification.type.toLowerCase().includes(search)
      );
    }
    
    // Apply sorting
    filtered = sortCertifications(filtered, sortBy);
    
    setFilteredCertifications(filtered);
  }, [activeTab, userCertifications, sortBy, searchTerm]);

  // Sort certifications
  const sortCertifications = (certs, sortMethod) => {
    switch(sortMethod) {
      case 'newest':
        return [...certs].sort((a, b) => new Date(b.completed_Date || 0) - new Date(a.completed_Date || 0));
      case 'oldest':
        return [...certs].sort((a, b) => new Date(a.completed_Date || 0) - new Date(b.completed_Date || 0));
      case 'a-z':
        return [...certs].sort((a, b) => a.certification.title.localeCompare(b.certification.title));
      case 'z-a':
        return [...certs].sort((a, b) => b.certification.title.localeCompare(a.certification.title));
      default:
        return certs;
    }
  };

  // Handle tab change to filter certifications
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Navigate back to Certifications page
  const handleGoBack = () => {
    navigate('/certifications');
  };

  // Handlers for modal
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    // Refetch user certifications after closing modal
    window.location.reload();
  };

  // Handle opening sort menu
  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  // Handle closing sort menu
  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  // Handle selecting a sort option
  const handleSortSelect = (sortOption) => {
    setSortBy(sortOption);
    handleSortClose();
  };

  // Handle viewing evidence for a certification
  const handleViewEvidence = (evidence, certName) => {
    if (evidence) {
      setSelectedEvidence(evidence);
      setSelectedCertName(certName);
      setEvidenceModalOpen(true);
    }
  };

  // Handle closing evidence modal
  const handleCloseEvidence = () => {
    setEvidenceModalOpen(false);
    setSelectedEvidence(null);
    setSelectedCertName('');
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved':
        return <CheckCircleIcon sx={{ color: ELEGANT_COLORS.success, fontSize: 20 }} />;
      case 'pending':
        return <PendingIcon sx={{ color: ELEGANT_COLORS.warning, fontSize: 20 }} />;
      case 'rejected':
        return <CancelIcon sx={{ color: ELEGANT_COLORS.error, fontSize: 20 }} />;
      default:
        return <ErrorOutlineIcon sx={{ color: ELEGANT_COLORS.textSecondary, fontSize: 20 }} />;
    }
  };

  // Handle searching
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Loading state with elegant animation
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '200px',
          height: '35vh',
          gap: 3,
          p: 4,
          width: '100%',
          bgcolor: ELEGANT_COLORS.neutral,
          borderRadius: 4,
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CircularProgress 
            size={60} 
            thickness={3} 
            sx={{ 
              color: ELEGANT_COLORS.primary,
              opacity: 0.2,
            }} 
          />
          <CircularProgress 
            size={60} 
            thickness={3} 
            variant="determinate"
            value={70}
            sx={{ 
              color: ELEGANT_COLORS.primary,
              position: 'absolute',
              left: 0,
              top: 0,
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': {
                  opacity: 1,
                },
                '50%': {
                  opacity: 0.6,
                },
                '100%': {
                  opacity: 1,
                },
              },
            }} 
          />
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            color: ELEGANT_COLORS.textSecondary,
            fontWeight: 500,
            letterSpacing: 0.5,
          }}
        >
          Loading Your Certifications
        </Typography>
      </Box>
    );
  }

  // Error state with elegant styling
  if (error && !userCertifications.length) {
    return (
      <Box sx={{ width: '100%', p: { xs: 2, md: 4 } }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 3,
            border: '1px solid',
            borderColor: alpha(ELEGANT_COLORS.error, 0.2),
            bgcolor: alpha(ELEGANT_COLORS.error, darkMode ? 0.15 : 0.03),
            boxShadow: `0 10px 30px ${alpha(ELEGANT_COLORS.error, 0.05)}`,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(ELEGANT_COLORS.error, 0.1),
              mx: 'auto',
              mb: 3,
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 40, color: ELEGANT_COLORS.error }} />
          </Box>
          <Typography 
            variant="h5" 
            sx={{ 
              color: ELEGANT_COLORS.textPrimary,
              fontWeight: 600,
              mb: 1, 
            }}
          >
            Unable to Load Certifications
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: ELEGANT_COLORS.textSecondary,
              maxWidth: 500,
              mx: 'auto',
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            {error}
          </Typography>
          <Button 
            variant="contained" 
            sx={{ 
              ...elegantButtonStyles.primary,
              bgcolor: ELEGANT_COLORS.primary,
              px: 4,
              py: 1.2,
            }}
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Paper>
      </Box>
    );
  }

  // Sort menu items
  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: <ArrowBackIcon sx={{ transform: 'rotate(-90deg)' }} /> },
    { value: 'oldest', label: 'Oldest First', icon: <ArrowBackIcon sx={{ transform: 'rotate(90deg)' }} /> },
    { value: 'a-z', label: 'A-Z', icon: <SortIcon /> },
    { value: 'z-a', label: 'Z-A', icon: <SortIcon sx={{ transform: 'scaleY(-1)' }} /> }
  ];

  return (
    <Box
      sx={{
        width: "100%",
        p: { xs: 3, md: 4 },
        position: 'relative',
        borderRadius: 3,
      }}
    >
      {/* Elegant background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 260,
          borderRadius: '16px 16px 0 0',
          opacity: 0.03,
          zIndex: 0,
        }}
      />
      
      {/* Header with back button */}
      <Box 
        sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={handleGoBack}
            sx={{ 
              color: ELEGANT_COLORS.primary,
              bgcolor: alpha(ELEGANT_COLORS.primary, 0.1),
              height: 44,
              width: 44,
              '&:hover': {
                bgcolor: alpha(ELEGANT_COLORS.primary, 0.15),
                transform: 'translateX(-2px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: ELEGANT_COLORS.textPrimary,
                fontSize: { xs: '1.75rem', md: '2.25rem' },
                letterSpacing: '-0.02em',
              }}
            >
              My Certifications
            </Typography>
          </Box>
        </Box>

        {/* Actions area */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              ...elegantButtonStyles.primary,
              bgcolor: ELEGANT_COLORS.primary,
              height: 44,
              '&:hover': {
                bgcolor: ELEGANT_COLORS.primaryDark,
              },
            }}
            onClick={handleOpenModal}
          >
            Add Certification
          </Button>
          
          <Tooltip title="Sort" arrow>
            <IconButton 
              onClick={handleSortClick}
              sx={{ 
                color: ELEGANT_COLORS.primary,
                bgcolor: alpha(ELEGANT_COLORS.primary, 0.08),
                height: 44,
                width: 44,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(ELEGANT_COLORS.primary, 0.15),
                  transform: 'translateY(-1px)',
                }
              }}
            >
              <SortIcon />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={handleSortClose}
            PaperProps={{
              elevation: 3,
              sx: {
                borderRadius: 2,
                minWidth: 200,
                mt: 1,
                boxShadow: darkMode ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.08)',
                overflow: 'visible',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            TransitionComponent={Fade}
          >
            <Typography
              variant="subtitle2"
              sx={{
                px: 2,
                py: 1.5,
                color: ELEGANT_COLORS.textSecondary,
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              Sort Certifications
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {sortOptions.map((option) => (
              <MenuItem 
                key={option.value} 
                onClick={() => handleSortSelect(option.value)}
                selected={sortBy === option.value}
                sx={{
                  py: 1.5,
                  px: 2,
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    bgcolor: alpha(ELEGANT_COLORS.primary, 0.08),
                    '&:hover': {
                      bgcolor: alpha(ELEGANT_COLORS.primary, 0.12),
                    }
                  },
                  '&:hover': {
                    bgcolor: alpha(ELEGANT_COLORS.primaryLighter, 0.15),
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: ELEGANT_COLORS.primary }}>
                  {option.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={option.label} 
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: sortBy === option.value ? 600 : 400,
                      color: sortBy === option.value ? ELEGANT_COLORS.primary : ELEGANT_COLORS.textPrimary,
                    }
                  }}
                />
                {sortBy === option.value && (
                  <CheckCircleIcon fontSize="small" sx={{ color: ELEGANT_COLORS.primary, ml: 1 }} />
                )}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      {/* Status Tabs */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 3, 
          mb: 4, 
          overflow: 'hidden',
          border: '1px solid',
          borderColor: darkMode ? alpha('#fff', 0.12) : alpha('#000', 0.06),
          bgcolor: darkMode ? theme.palette.background.paper : 'white',
          boxShadow: darkMode ? '0 5px 20px rgba(0,0,0,0.2)' : '0 5px 20px rgba(0,0,0,0.03)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            px: 2,
            '& .MuiTabs-indicator': {
              backgroundColor: ELEGANT_COLORS.primary,
              height: 3,
              borderRadius: '3px 3px 0 0'
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              color: alpha(ELEGANT_COLORS.textPrimary, 0.6),
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                color: ELEGANT_COLORS.primary,
              },
              fontSize: { xs: '0.875rem', md: '1rem' },
              px: { xs: 2, md: 3 },
              py: 2.5,
            }
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography component="span">All</Typography>
                <Chip
                  label={counts.all}
                  size="small"
                  sx={{
                    height: 20,
                    minWidth: 20,
                    fontSize: '0.75rem',
                    bgcolor: alpha(ELEGANT_COLORS.primary, 0.1),
                    color: ELEGANT_COLORS.primary,
                    fontWeight: 600
                  }}
                />
              </Box>
            } 
            value="all" 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon fontSize="small" sx={{ color: ELEGANT_COLORS.success, fontSize: 16 }} />
                <Typography component="span">Approved</Typography>
                <Chip
                  label={counts.approved}
                  size="small"
                  sx={{
                    height: 20,
                    minWidth: 20,
                    fontSize: '0.75rem',
                    bgcolor: alpha(ELEGANT_COLORS.success, 0.1),
                    color: ELEGANT_COLORS.success,
                    fontWeight: 600
                  }}
                />
              </Box>
            } 
            value="approved" 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PendingIcon fontSize="small" sx={{ color: ELEGANT_COLORS.warning, fontSize: 16 }} />
                <Typography component="span">Pending</Typography>
                <Chip
                  label={counts.pending}
                  size="small"
                  sx={{
                    height: 20,
                    minWidth: 20,
                    fontSize: '0.75rem',
                    bgcolor: alpha(ELEGANT_COLORS.warning, 0.1),
                    color: ELEGANT_COLORS.warning,
                    fontWeight: 600
                  }}
                />
              </Box>
            } 
            value="pending" 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CancelIcon fontSize="small" sx={{ color: ELEGANT_COLORS.error, fontSize: 16 }} />
                <Typography component="span">Rejected</Typography>
                <Chip
                  label={counts.rejected}
                  size="small"
                  sx={{
                    height: 20,
                    minWidth: 20,
                    fontSize: '0.75rem',
                    bgcolor: alpha(ELEGANT_COLORS.error, 0.1),
                    color: ELEGANT_COLORS.error,
                    fontWeight: 600
                  }}
                />
              </Box>
            } 
            value="rejected" 
          />
        </Tabs>
      </Paper>

      {/* Certifications Grid */}
      {filteredCertifications.length > 0 ? (
        <Grid container spacing={3}>
          {filteredCertifications.map((cert, index) => (
            <Grid item xs={12} sm={6} lg={4} key={cert.id}>
              <Fade in={true} timeout={300 + index * 100} style={{ transitionDelay: `${index * 50}ms` }}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: ELEGANT_COLORS.borderColor,
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    bgcolor: darkMode ? theme.palette.background.paper : 'white',
                    '&:hover': {
                      boxShadow: darkMode ? '0 12px 24px rgba(255,255,255,0.05)' : '0 12px 24px rgba(0,0,0,0.06)',
                      transform: 'translateY(-4px)',
                      borderColor: alpha(ELEGANT_COLORS.primary, 0.3),
                    }
                  }}
                >
                  {/* Status indicator - elegant dot in the corner */}
                  <Tooltip 
                    title={`Status: ${cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}`} 
                    arrow
                    placement="top"
                  >
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 16, 
                        right: 16, 
                        zIndex: 5,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: cert.status === 'approved' 
                          ? ELEGANT_COLORS.success
                          : cert.status === 'pending' 
                            ? ELEGANT_COLORS.warning
                            : ELEGANT_COLORS.error,
                        boxShadow: darkMode ? '0 0 0 2px rgba(0,0,0,0.5)' : '0 0 0 2px rgba(255,255,255,0.9)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.2)',
                        }
                      }}
                    />
                  </Tooltip>
                  
                  {/* Header with image and type */}
                  <Box
                    sx={{
                      position: 'relative',
                      height: 140,
                      background: `linear-gradient(135deg, ${ELEGANT_COLORS.gradientStart}, ${ELEGANT_COLORS.gradientEnd})`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      p: 2.5,
                    }}
                  >
                    {/* Add a subtle pattern overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.07,
                        background: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")',
                      }}
                    />
                    
                    {/* Certification icon/badge */}
                    <Avatar
                      src={cert.certification.certification_Image}
                      alt={cert.certification.title}
                      sx={{
                        position: 'absolute',
                        top: 20,
                        left: 20,
                        width: 64,
                        height: 64,
                        border: darkMode ? '4px solid #1e1e1e' : '4px solid white',
                        boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)',
                        bgcolor: theme.palette.background.paper,
                        transition: 'all 0.2s ease',
                        '.MuiPaper-root:hover &': {
                          boxShadow: darkMode ? '0 6px 16px rgba(0,0,0,0.6)' : '0 6px 16px rgba(0,0,0,0.15)',
                        }
                      }}
                    />
                    
                    {/* Type chip */}
                    <Chip
                      label={cert.certification.type}
                      size="small"
                      sx={{
                        alignSelf: 'flex-start',
                        height: 24,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)',
                        color: 'white',
                        borderRadius: 12,
                        backdropFilter: 'blur(4px)',
                        mb: 1.5,
                        border: darkMode ? '0.5px solid rgba(255,255,255,0.2)' : '0.5px solid rgba(255,255,255,0.3)',
                        px: 1,
                        ml: 'auto',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.25)',
                        }
                      }}
                    />
                    
                    {/* Status text - appear on hover */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 36,
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        '.MuiPaper-root:hover &': {
                          opacity: 1
                        }
                      }}
                    >
                      {cert.status}
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'white',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        lineHeight: 1.3,
                        position: 'relative',
                        zIndex: 1,
                        textShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        transition: 'all 0.2s ease',
                        letterSpacing: '-0.01em',
                        '.MuiPaper-root:hover &': {
                          transform: 'translateY(-1px)',
                        }
                      }}
                    >
                      {cert.certification.title}
                    </Typography>
                  </Box>

                  {/* Content */}
                  <Box 
                    sx={{ 
                      p: 2.5, 
                      flexGrow: 1, 
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    {/* Issuer with subtle separator */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: ELEGANT_COLORS.textSecondary,
                        fontSize: '0.85rem',
                        pb: 2,
                        mb: 2,
                        borderBottom: '1px solid',
                        borderColor: ELEGANT_COLORS.borderColor,
                      }}
                    >
                      {cert.certification.issuer}
                    </Typography>

                    {/* Details with minimal icons */}
                    <Box sx={{ mb: 'auto' }}>
                      {cert.completed_Date && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            color: ELEGANT_COLORS.textPrimary,
                            mb: 1.5,
                            fontSize: '0.85rem',
                          }}
                        >
                          <CalendarTodayIcon sx={{ fontSize: 16, color: ELEGANT_COLORS.primary }} />
                          Completed: <Box component="span" sx={{ fontWeight: 600 }}>{formatDate(cert.completed_Date)}</Box>
                        </Typography>
                      )}
                      
                      {cert.valid_Until && cert.status === 'approved' && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            color: ELEGANT_COLORS.textPrimary,
                            mb: 1.5,
                            fontSize: '0.85rem',
                          }}
                        >
                          <VerifiedIcon sx={{ fontSize: 16, color: ELEGANT_COLORS.primary }} />
                          Valid until: <Box component="span" sx={{ fontWeight: 600 }}>{formatDate(cert.valid_Until)}</Box>
                        </Typography>
                      )}
                      
                      {cert.score && cert.status === 'approved' && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            color: ELEGANT_COLORS.textPrimary,
                            fontSize: '0.85rem',
                          }}
                        >
                          <EmojiEventsIcon sx={{ fontSize: 16, color: ELEGANT_COLORS.primary }} />
                          Score: 
                          <Box 
                            component="span" 
                            sx={{ 
                              fontWeight: 600,
                              ml: 0.5,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'inline-block',
                                width: 60,
                                height: 8,
                                bgcolor: alpha(ELEGANT_COLORS.primary, darkMode ? 0.2 : 0.1),
                                borderRadius: 4,
                                position: 'relative',
                                overflow: 'hidden',
                              }}
                            >
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  height: '100%',
                                  width: `${cert.score}%`,
                                  bgcolor: cert.score >= 90 ? ELEGANT_COLORS.success : ELEGANT_COLORS.primary,
                                  borderRadius: 4,
                                }}
                              />
                            </Box>
                            {cert.score}%
                          </Box>
                        </Typography>
                      )}
                    </Box>

                    {/* Rejection reason with refined styling */}
                    {cert.status === 'rejected' && cert.rejection_reason && (
                      <Box 
                        sx={{ 
                          mt: 2, 
                          p: 1.5, 
                          bgcolor: alpha(ELEGANT_COLORS.error, darkMode ? 0.15 : 0.03),
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: alpha(ELEGANT_COLORS.error, 0.1),
                          display: 'flex',
                          gap: 1,
                          mb: 2
                        }}
                      >
                        <ErrorOutlineIcon sx={{ color: ELEGANT_COLORS.error, fontSize: 18, mt: 0.3 }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: alpha(ELEGANT_COLORS.error, 0.9),
                            fontSize: '0.8rem',
                            lineHeight: 1.5
                          }}
                        >
                          {cert.rejection_reason}
                        </Typography>
                      </Box>
                    )}

                    {/* Actions */}
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 2,
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: ELEGANT_COLORS.borderColor,
                      }}
                    >
                      {/* Status indicator */}
                      <Box>
                        {cert.status === 'approved' ? (
                          <Chip
                            icon={<CheckCircleIcon style={{ fontSize: 14 }} />}
                            label="Verified"
                            size="small"
                            sx={{
                              ...elegantChipStyles.approved,
                              height: 28,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              borderRadius: 14,
                              border: '1px solid',
                              px: 1,
                            }}
                          />
                        ) : cert.status === 'pending' ? (
                          <Chip
                            icon={<PendingIcon style={{ fontSize: 14 }} />}
                            label="In Review"
                            size="small"
                            sx={{
                              ...elegantChipStyles.pending,
                              height: 28,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              borderRadius: 14,
                              border: '1px solid',
                              px: 1,
                            }}
                          />
                        ) : (
                          <Chip
                            icon={<CancelIcon style={{ fontSize: 14 }} />}
                            label="Not Approved"
                            size="small"
                            sx={{
                              ...elegantChipStyles.rejected,
                              height: 28,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              borderRadius: 14,
                              border: '1px solid',
                              px: 1,
                            }}
                          />
                        )}
                      </Box>
                      
                      {/* Action buttons */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {cert.evidence && (
                          <Tooltip title="View Evidence" arrow>
                            <IconButton
                              onClick={() => handleViewEvidence(cert.evidence, cert.certification.title)}
                              size="small"
                              sx={{ 
                                color: ELEGANT_COLORS.primary,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: alpha(ELEGANT_COLORS.primary, 0.08),
                                  transform: 'translateY(-1px)',
                                }
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {cert.status === 'approved' && (
                          <Tooltip title="Download Certificate" arrow>
                            <IconButton
                              size="small"
                              sx={{ 
                                color: ELEGANT_COLORS.primary,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: alpha(ELEGANT_COLORS.primary, 0.08),
                                  transform: 'translateY(-1px)',
                                }
                              }}
                            >
                              <FileDownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {cert.status === 'rejected' && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon fontSize="small" />}
                            sx={{
                              ...elegantButtonStyles.outline,
                              height: 32,
                              fontSize: '0.75rem',
                              borderColor: alpha(ELEGANT_COLORS.primary, 0.3),
                            }}
                          >
                            Resubmit
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Fade>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Fade in={true} timeout={500}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 5, 
              textAlign: 'center', 
              borderRadius: 3,
              border: '1px dashed',
              borderColor: alpha(ELEGANT_COLORS.primary, 0.2),
              bgcolor: alpha(ELEGANT_COLORS.neutral, 0.8),
              boxShadow: darkMode ? '0 6px 20px rgba(0,0,0,0.2)' : '0 6px 20px rgba(0,0,0,0.02)',
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(ELEGANT_COLORS.primary, 0.08),
                mx: 'auto',
                mb: 3,
              }}
            >
              <WorkspacePremiumIcon sx={{ fontSize: 40, color: ELEGANT_COLORS.primary, opacity: 0.7 }} />
            </Box>
            <Typography 
              variant="h5" 
              sx={{ 
                color: ELEGANT_COLORS.textPrimary,
                fontWeight: 600,
                mb: 1,
              }}
            >
              No certifications found
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: ELEGANT_COLORS.textSecondary,
                maxWidth: 450,
                mx: 'auto',
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              {activeTab === 'all'
                ? "You haven't submitted any certifications yet. Start building your professional profile by adding your first certification." 
                : `You don't have any ${activeTab} certifications. Check other categories or add new ones.`
              }
            </Typography>
            <Button 
              variant="contained"
              onClick={handleOpenModal}
              sx={{ 
                ...elegantButtonStyles.primary,
                bgcolor: ELEGANT_COLORS.primary,
                px: 4,
                py: 1.2,
              }}
              startIcon={<AddIcon />}
            >
              Add Your First Certification
            </Button>
          </Paper>
        </Fade>
      )}

      {/* Modal for certification submission */}
      <Modal 
        open={openModal} 
        onClose={handleCloseModal}
        aria-labelledby="modal-submit-certification"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 600 },
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 0,
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <SubmitCertification onClose={handleCloseModal} />
        </Box>
      </Modal>

      {/* Evidence Modal */}
      <Modal
        open={evidenceModalOpen}
        onClose={handleCloseEvidence}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { 
            backgroundColor: alpha('#000', darkMode ? 0.8 : 0.6),
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
              backgroundColor: theme.palette.background.paper,
              position: 'relative',
              boxShadow: `0 20px 80px -12px ${alpha(ELEGANT_COLORS.primary, 0.35)}`,
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
                borderBottom: `1px solid ${alpha(ELEGANT_COLORS.primary, darkMode ? 0.2 : 0.1)}`,
                background: `linear-gradient(135deg, ${alpha(ELEGANT_COLORS.primary, darkMode ? 0.1 : 0.03)} 0%, ${alpha(ELEGANT_COLORS.primary, darkMode ? 0.05 : 0.01)} 100%)`,
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
                    bgcolor: alpha(ELEGANT_COLORS.primary, 0.1),
                    color: ELEGANT_COLORS.primary,
                  }}
                >
                  <PictureAsPdfIcon />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: ELEGANT_COLORS.textPrimary,
                    fontSize: '1.1rem'
                  }}>
                    Certification Evidence
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: alpha(ELEGANT_COLORS.textPrimary, 0.6),
                    fontSize: '0.75rem'
                  }}>
                    {selectedCertName}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={handleCloseEvidence}
                sx={{
                  color: alpha(ELEGANT_COLORS.textPrimary, 0.6),
                  '&:hover': {
                    bgcolor: alpha(ELEGANT_COLORS.primary, 0.08),
                    color: ELEGANT_COLORS.primary,
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
              bgcolor: alpha(ELEGANT_COLORS.primary, darkMode ? 0.05 : 0.02),
            }}>
              {selectedEvidence && selectedEvidence.endsWith('.pdf') ? (
                <iframe
                  src={selectedEvidence}
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
                      bgcolor: alpha(ELEGANT_COLORS.primary, 0.1),
                      color: ELEGANT_COLORS.primary,
                      margin: '0 auto',
                      mb: 3,
                    }}
                  >
                    <VerifiedIcon sx={{ fontSize: 40 }} />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 2, color: ELEGANT_COLORS.textPrimary }}>
                    Evidence Available
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: alpha(ELEGANT_COLORS.textPrimary, 0.7),
                    mb: 3,
                    lineHeight: 1.6
                  }}>
                    The evidence for this certification is available at the following URL:
                  </Typography>
                  <Link
                    href={selectedEvidence}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      bgcolor: ELEGANT_COLORS.primary,
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: ELEGANT_COLORS.primaryDark,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(ELEGANT_COLORS.primary, 0.3)}`,
                      }
                    }}
                  >
                    Open in New Tab
                    <VisibilityIcon fontSize="small" />
                  </Link>
                </Box>
              )}
            </Box>
          </Paper>
        </Fade>
      </Modal>
    </Box>
  );
};

export default MyCertifications;