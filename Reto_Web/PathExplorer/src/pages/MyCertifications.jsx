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
  useTheme,
  alpha,
  CircularProgress,
  Tooltip,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
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

import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import { ACCENTURE_COLORS, primaryButtonStyles, outlineButtonStyles, statusChipStyles } from '../styles/styles';

// Fallback data if needed
const fallbackUserCertifications = [
  {
    id: "0c4ba71c-82ca-4f6a-8b9c-3a8c33f7",
    certification_id: "011d0850-533f-44cf-8e1a-3581916b24c",
    user_id: "current-user-id", 
    status: "approved",
    score: 92,
    evidence: "https://example.com/certificates/pmp-certification.pdf",
    completed_Date: "2024-02-15",
    valid_Until: "2027-02-15",
    certification: {
      title: "Project Management Professional (PMP)",
      issuer: "Project Management Institute (PMI)",
      type: "Project Management",
      certification_Image: "https://img-c.udemycdn.com/course/750x422/2806490_5db0.jpg",
    }
  },
  {
    id: "1d5eb82d-93db-5g7b-9c0d-4b9d44f8",
    certification_id: "338cce1c-eef2-4391-9ff8-fb9fa20820a3",
    user_id: "current-user-id",
    status: "pending",
    evidence: "https://example.com/certificates/aws-submission.pdf",
    completed_Date: "2025-04-01",
    certification: {
      title: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services (AWS)",
      type: "Cloud Computing",
      certification_Image: "https://d1.awsstatic.com/training-and-certification/certification-badges/AWS-Certified-Solutions-Architect-Associate_badge.3419559c4ef4d0693bff300b6e5fb80f4f8e7c48.png",
    }
  },
  {
    id: "2e6fc93e-04ec-6h8c-0d1e-5c0e55f9",
    certification_id: "4cdad98b-6466-4691-bc90-b5e346636e8",
    user_id: "current-user-id",
    status: "rejected",
    rejection_reason: "Submitted evidence does not match the certification requirements. Please provide the official certificate from Coursera.",
    evidence: "https://example.com/certificates/leadership-submission.pdf",
    completed_Date: "2025-03-10",
    certification: {
      title: "Leading People and Teams Specialization",
      issuer: "Coursera (University of Michigan)",
      type: "Leadership",
      certification_Image: "https://d3njjcbhbojbot.cloudfront.net/adobe/dynamicmedia/deliver/dm-aid--f30d95fb-cf54-463f-8557-eb68a1b0065a/shrm-cp-badge.png",
    }
  }
];

const MyCertifications = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // States
  const [activeTab, setActiveTab] = useState('all');
  const [userCertifications, setUserCertifications] = useState([]);
  const [filteredCertifications, setFilteredCertifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({ all: 0, approved: 0, pending: 0, rejected: 0 });
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

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
          console.log("No user certifications found, using fallback data");
          processCertifications(fallbackUserCertifications);
          return;
        }
        
        processCertifications(data);
      } catch (error) {
        console.error("Error fetching user certifications:", error);
        setError(error.message);
        processCertifications(fallbackUserCertifications);
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
    
    // Apply sorting
    filtered = sortCertifications(filtered, sortBy);
    
    setFilteredCertifications(filtered);
  }, [activeTab, userCertifications, sortBy]);

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
  const handleViewEvidence = (evidence) => {
    if (evidence) {
      window.open(evidence, '_blank');
    }
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
        return <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 20 }} />;
      case 'pending':
        return <PendingIcon sx={{ color: '#FF9800', fontSize: 20 }} />;
      case 'rejected':
        return <CancelIcon sx={{ color: '#F44336', fontSize: 20 }} />;
      default:
        return <ErrorOutlineIcon sx={{ color: '#9E9E9E', fontSize: 20 }} />;
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

  // Loading state
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
          bgcolor: alpha('#fafafa', 0.6)
        }}
      >
        <CircularProgress 
          size={48} 
          thickness={4} 
          sx={{ color: ACCENTURE_COLORS.corePurple1 }} 
        />
        <Typography variant="subtitle1" color="text.secondary">
          Loading Your Certifications...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error && !userCertifications.length) {
    return (
      <Box sx={{ width: '100%', p: { xs: 2, md: 4 } }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            border: '1px solid',
            borderColor: alpha('#000', 0.08),
          }}
        >
          <SchoolIcon sx={{ fontSize: 48, color: theme.palette.error.main, mb: 2 }} />
          <Typography variant="h6" color="error" gutterBottom>
            Error Loading Your Certifications
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            sx={{ 
              ...primaryButtonStyles,
              bgcolor: ACCENTURE_COLORS.corePurple1
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
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'a-z', label: 'A-Z' },
    { value: 'z-a', label: 'Z-A' }
  ];

  return (
    <Box
      sx={{
        width: "100%",
        p: { xs: 2, md: 3 },
        position: 'relative',
        bgcolor: alpha('#fafafa', 0.6)
      }}
    >
      {/* Header with back button */}
      <Box 
        sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton 
            onClick={handleGoBack}
            sx={{ 
              color: ACCENTURE_COLORS.corePurple1,
              bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.08),
              '&:hover': {
                bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.15),
              }
            }}
            size="small"
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: '#333333',
              fontSize: { xs: '1.75rem', md: '2.25rem' }
            }}
          >
            My Certifications
          </Typography>
        </Box>

        {/* Actions area */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Tooltip title="Sort">
            <IconButton 
              onClick={handleSortClick}
              sx={{ 
                color: ACCENTURE_COLORS.corePurple1,
                bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.08),
                height: 40,
                width: 40,
                '&:hover': {
                  bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.15),
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
                minWidth: 180,
                mt: 1,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
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
          >
            {sortOptions.map((option) => (
              <MenuItem 
                key={option.value} 
                onClick={() => handleSortSelect(option.value)}
                selected={sortBy === option.value}
                sx={{
                  py: 1.5,
                  '&.Mui-selected': {
                    bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.08),
                    '&:hover': {
                      bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.12),
                    }
                  }
                }}
              >
                <ListItemText primary={option.label} />
                {sortBy === option.value && (
                  <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: ACCENTURE_COLORS.corePurple1 }} />
                  </ListItemIcon>
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
          borderRadius: 2, 
          mb: 3, 
          overflow: 'hidden',
          border: '1px solid',
          borderColor: alpha('#000', 0.08),
          bgcolor: 'white'
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
              backgroundColor: ACCENTURE_COLORS.corePurple1,
              height: 3,
              borderRadius: '3px 3px 0 0'
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              color: alpha('#000', 0.6),
              '&.Mui-selected': {
                color: ACCENTURE_COLORS.corePurple1,
              },
              fontSize: { xs: '0.875rem', md: '1rem' },
              px: { xs: 2, md: 3 },
              py: 2,
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
                    bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.1),
                    color: ACCENTURE_COLORS.corePurple1,
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
                <CheckCircleIcon fontSize="small" sx={{ color: '#4CAF50', fontSize: 16 }} />
                <Typography component="span">Approved</Typography>
                <Chip
                  label={counts.approved}
                  size="small"
                  sx={{
                    height: 20,
                    minWidth: 20,
                    fontSize: '0.75rem',
                    bgcolor: alpha('#4CAF50', 0.1),
                    color: '#4CAF50',
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
                <PendingIcon fontSize="small" sx={{ color: '#FF9800', fontSize: 16 }} />
                <Typography component="span">Pending</Typography>
                <Chip
                  label={counts.pending}
                  size="small"
                  sx={{
                    height: 20,
                    minWidth: 20,
                    fontSize: '0.75rem',
                    bgcolor: alpha('#FF9800', 0.1),
                    color: '#FF9800',
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
                <CancelIcon fontSize="small" sx={{ color: '#F44336', fontSize: 16 }} />
                <Typography component="span">Rejected</Typography>
                <Chip
                  label={counts.rejected}
                  size="small"
                  sx={{
                    height: 20,
                    minWidth: 20,
                    fontSize: '0.75rem',
                    bgcolor: alpha('#F44336', 0.1),
                    color: '#F44336',
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
          {filteredCertifications.map((cert) => (
            <Grid item xs={12} sm={6} lg={4} key={cert.id}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: alpha('#000', 0.08),
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.2s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  bgcolor: 'white',
                  '&:hover': {
                    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                    transform: 'translateY(-1px)',
                    borderColor: ACCENTURE_COLORS.corePurple1,
                    borderWidth: '1px'
                  }
                }}
              >
                {/* Status indicator - elegant dot in the corner */}
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 12, 
                    right: 12, 
                    zIndex: 5,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: cert.status === 'approved' 
                      ? '#4CAF50' 
                      : cert.status === 'pending' 
                        ? '#FF9800' 
                        : '#F44336',
                    boxShadow: '0 0 0 2px rgba(255,255,255,0.8)',
                  }}
                />
                
                {/* Header with image and type */}
                <Box
                  sx={{
                    position: 'relative',
                    height: 120,
                    background: `linear-gradient(135deg, ${ACCENTURE_COLORS.corePurple1}, ${ACCENTURE_COLORS.corePurple3})`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    p: 2,
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
                  
                  {/* Image thumbnail */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0.2,
                      backgroundImage: `url(${cert.certification.certification_Image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      mixBlendMode: 'soft-light',
                    }}
                  />

                  {/* Type chip */}
                  <Chip
                    label={cert.certification.type}
                    size="small"
                    sx={{
                      alignSelf: 'flex-start',
                      height: 20,
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      bgcolor: 'rgba(255,255,255,0.25)',
                      color: 'white',
                      borderRadius: 1,
                      backdropFilter: 'blur(4px)',
                      mb: 1,
                      border: '0.5px solid rgba(255,255,255,0.5)',
                      px: 0.5
                    }}
                  />
                  
                  {/* Status text - appear on hover */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 30,
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
                      fontSize: '1rem',
                      fontWeight: 700,
                      lineHeight: 1.3,
                      position: 'relative',
                      zIndex: 1,
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
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
                      color: alpha('#000', 0.6),
                      fontSize: '0.8rem',
                      pb: 2,
                      mb: 2,
                      borderBottom: '1px solid',
                      borderColor: alpha('#000', 0.06),
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
                          color: alpha('#000', 0.75),
                          mb: 1.5,
                          fontSize: '0.85rem',
                        }}
                      >
                        <CalendarTodayIcon sx={{ fontSize: 16, color: ACCENTURE_COLORS.corePurple1 }} />
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
                          color: alpha('#000', 0.75),
                          mb: 1.5,
                          fontSize: '0.85rem',
                        }}
                      >
                        <VerifiedIcon sx={{ fontSize: 16, color: ACCENTURE_COLORS.corePurple1 }} />
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
                          color: alpha('#000', 0.75),
                          fontSize: '0.85rem',
                        }}
                      >
                        <EmojiEventsIcon sx={{ fontSize: 16, color: ACCENTURE_COLORS.corePurple1 }} />
                        Score: <Box component="span" sx={{ fontWeight: 600 }}>{cert.score}%</Box>
                      </Typography>
                    )}
                  </Box>

                  {/* Rejection reason with refined styling */}
                  {cert.status === 'rejected' && cert.rejection_reason && (
                    <Box 
                      sx={{ 
                        mt: 2, 
                        p: 1.5, 
                        bgcolor: alpha('#F44336', 0.03),
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: alpha('#F44336', 0.1),
                        display: 'flex',
                        gap: 1,
                        mb: 2
                      }}
                    >
                      <ErrorOutlineIcon sx={{ color: '#F44336', fontSize: 18, mt: 0.3 }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: alpha('#F44336', 0.9),
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
                      borderColor: alpha('#000', 0.06),
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
                            height: 24,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            bgcolor: alpha('#4CAF50', 0.1),
                            color: '#4CAF50',
                            borderRadius: 6,
                            '& .MuiChip-icon': {
                              color: '#4CAF50'
                            }
                          }}
                        />
                      ) : cert.status === 'pending' ? (
                        <Chip
                          icon={<PendingIcon style={{ fontSize: 14 }} />}
                          label="In Review"
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            bgcolor: alpha('#FF9800', 0.1),
                            color: '#FF9800',
                            borderRadius: 6,
                            '& .MuiChip-icon': {
                              color: '#FF9800'
                            }
                          }}
                        />
                      ) : (
                        <Chip
                          icon={<CancelIcon style={{ fontSize: 14 }} />}
                          label="Not Approved"
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            bgcolor: alpha('#F44336', 0.1),
                            color: '#F44336',
                            borderRadius: 6,
                            '& .MuiChip-icon': {
                              color: '#F44336'
                            }
                          }}
                        />
                      )}
                    </Box>
                    
                    {/* Action buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {cert.evidence && (
                        <Tooltip title="View Evidence">
                          <IconButton
                            onClick={() => handleViewEvidence(cert.evidence)}
                            size="small"
                            sx={{ 
                              color: ACCENTURE_COLORS.corePurple1,
                              '&:hover': {
                                bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.08)
                              }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {cert.status === 'approved' && (
                        <Tooltip title="Download Certificate">
                          <IconButton
                            size="small"
                            sx={{ 
                              color: ACCENTURE_COLORS.corePurple1,
                              '&:hover': {
                                bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.08)
                              }
                            }}
                          >
                            <FileDownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {cert.status === 'rejected' && (
                        <Button
                          variant="text"
                          size="small"
                          sx={{
                            color: ACCENTURE_COLORS.corePurple1,
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            textTransform: 'none',
                            '&:hover': {
                              bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.05)
                            }
                          }}
                        >
                          Resubmit
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 2,
            border: '1px dashed',
            borderColor: alpha('#000', 0.12),
            bgcolor: alpha('#fff', 0.8)
          }}
        >
          <SchoolIcon sx={{ fontSize: 48, color: alpha('#000', 0.2), mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No certifications found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {activeTab === 'all'
              ? "You haven't submitted any certifications yet" 
              : `You don't have any ${activeTab} certifications`
            }
          </Typography>
          <Button 
            variant="contained"
            onClick={handleGoBack}
            sx={{ 
              ...primaryButtonStyles,
              bgcolor: ACCENTURE_COLORS.corePurple1,
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: 8,
              boxShadow: 'none'
            }}
          >
            Browse Certifications
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default MyCertifications;