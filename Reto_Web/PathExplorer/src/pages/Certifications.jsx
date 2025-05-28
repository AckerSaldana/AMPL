import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  TextField, 
  InputAdornment,
  Chip,
  Button,
  Paper,
  useTheme,
  alpha,
  CircularProgress,
  IconButton,
  Tooltip,
  ClickAwayListener,
  Skeleton,
  Fade,
  Grow
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import SchoolIcon from '@mui/icons-material/School';
import CategoryIcon from '@mui/icons-material/Category';
import TagIcon from '@mui/icons-material/Tag';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import BadgeIcon from '@mui/icons-material/Badge';

import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import { CertificationCard } from '../components/CertificationCard';
import { ACCENTURE_COLORS, primaryButtonStyles, outlineButtonStyles } from '../styles/styles';

// Cache for certifications data
const certificationsCache = {
  data: null,
  timestamp: null,
  CACHE_DURATION: 10 * 60 * 1000 // 10 minutes
};

// Fallback data - reduced version
const fallbackCertifications = [
  {
    id: "011d0850-533f-44cf-8e1a-3581916b24c",
    title: "Project Management Professional (PMP)",
    issuer: "Project Management Institute (PMI)",
    url: "https://www.pmi.org/certifications/project-management-pmp",
    type: "Project Management",
    skills: ["Project Management", "Leadership", "Risk Management"],
    backgroundImage: "https://img-c.udemycdn.com/course/750x422/2806490_5db0.jpg",
  },
  {
    id: "338cce1c-eef2-4391-9ff8-fb9fa20820a3",
    title: "AWS Certified Solutions Architect – Associate",
    issuer: "Amazon Web Services (AWS)",
    type: "Cloud Computing",
    skills: ["AWS", "Cloud Architecture", "Networking"],
    backgroundImage: "https://d1.awsstatic.com/training-and-certification/certification-badges/AWS-Certified-Solutions-Architect-Associate_badge.3419559c4ef4d0693bff300b6e5fb80f4f8e7c48.png",
  },
  {
    id: "4cdad98b-6466-4691-bc90-b5e346636e8",
    title: "Leading People and Teams Specialization",
    issuer: "Coursera (University of Michigan)",
    url: "https://www.coursera.org/specializations/leading-people-teams",
    type: "Leadership",
    skills: ["Leadership", "Team Management", "Communication"],
    backgroundImage: "https://d3njjcbhbojbot.cloudfront.net/adobe/dynamicmedia/deliver/dm-aid--f30d95fb-cf54-463f-8557-eb68a1b0065a/shrm-cp-badge.png",
  },
  {
    id: "c9a9f05e-2bce-4705-9eaf-72502c508457",
    title: "Certified in Cybersecurity (CC)",
    issuer: "ISC2",
    url: "https://www.isc2.org/Certifications/CC",
    type: "Cybersecurity",
    skills: ["Cybersecurity", "Security Principles", "Network Security"],
    backgroundImage: "https://img-c.udemycdn.com/course/750x422/614772_233b_9.jpg",
  }
];

// Type to image mapping
const typeImageMap = {
  'Project Management': 'https://img-c.udemycdn.com/course/750x422/2806490_5db0.jpg',
  'Cloud Computing': 'https://d1.awsstatic.com/training-and-certification/certification-badges/AWS-Certified-Cloud-Practitioner_badge.634f8a21af2e0e956ed8905a72366146ba22b74c.png',
  'Leadership': 'https://media.licdn.com/dms/image/D5612AQEZ9MmzDX0Quw/article-cover_image-shrink_600_2000/0/1655660612362?e=2147483647&v=beta&t=HANgb1jU-vKOK4L_fUDFPqz_FVjNg-8XKY3BONvObs4',
  'Cybersecurity': 'https://img-c.udemycdn.com/course/750x422/614772_233b_9.jpg',
  'Human Resources': 'https://www.shrm.org/adobe/dynamicmedia/deliver/dm-aid--f30d95fb-cf54-463f-8557-eb68a1b0065a/shrm-cp-badge.png'
};

// Motion components
const MotionGrid = motion(Grid);
const MotionBox = motion(Box);

// Skeleton component for loading state with animation
const CertificationSkeleton = ({ index }) => (
  <Fade in={true} timeout={300 + index * 50}>
    <Paper 
      elevation={0}
      sx={{ 
        p: 0, 
        borderRadius: 2, 
        overflow: 'hidden',
        height: 280
      }}
    >
      <Skeleton 
        variant="rectangular" 
        height={160} 
        animation="wave"
        sx={{ animationDelay: `${index * 0.1}s` }}
      />
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" width="80%" height={28} animation="wave" />
        <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} animation="wave" />
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Skeleton variant="rounded" width={60} height={24} animation="wave" />
          <Skeleton variant="rounded" width={80} height={24} animation="wave" />
          <Skeleton variant="rounded" width={50} height={24} animation="wave" />
        </Box>
      </Box>
    </Paper>
  </Fade>
);

const Certifications = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [certifications, setCertifications] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [allSkills, setAllSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [skillSearchTerm, setSkillSearchTerm] = useState('');
  const [animationReady, setAnimationReady] = useState(false);

  // Navigate to My Certifications
  const handleGoToMyCertifications = useCallback(() => {
    navigate('/my-certifications');
  }, [navigate]);

  // Optimized data fetching with caching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Check cache first
        if (certificationsCache.data && 
            certificationsCache.timestamp && 
            Date.now() - certificationsCache.timestamp < certificationsCache.CACHE_DURATION) {
          
          const { processedCerts, skillNames, uniqueTypes } = certificationsCache.data;
          setCertifications(processedCerts);
          setCategories(uniqueTypes);
          setAllSkills(skillNames);
          setIsLoading(false);
          return;
        }

        // Parallel fetching of skills and certifications
        const [skillsResponse, certsResponse] = await Promise.all([
          supabase.from('Skill').select('skill_ID, name'),
          supabase.from('Certifications').select('*')
        ]);

        if (skillsResponse.error) throw new Error(`Error loading skills: ${skillsResponse.error.message}`);
        if (certsResponse.error) throw new Error(`Error loading certifications: ${certsResponse.error.message}`);

        const skillsData = skillsResponse.data || [];
        const certData = certsResponse.data || [];

        // Process skills
        const skillIdToName = {};
        const skillNames = [];
        
        if (skillsData.length > 0) {
          skillsData.forEach(skill => {
            skillIdToName[skill.skill_ID] = skill.name;
            skillNames.push(skill.name);
          });
          skillNames.sort();
        }

        // Process certifications
        if (!certData.length) {
          console.log("No certification data found, using fallback");
          setupFallbackData();
          return;
        }

        const processedCerts = certData.map(cert => {
          let skills = [];
          
          if (cert.skill_acquired) {
            if (typeof cert.skill_acquired === 'number') {
              const skillName = skillIdToName[cert.skill_acquired];
              if (skillName) skills = [skillName];
            } else if (Array.isArray(cert.skill_acquired)) {
              skills = cert.skill_acquired
                .map(id => skillIdToName[id])
                .filter(Boolean);
            }
          }
          
          const backgroundImage = cert.certification_Image || 
            typeImageMap[cert.type] || 
            'https://img-c.udemycdn.com/course/750x422/1650610_2673_6.jpg';
          
          return {
            id: cert.certification_id,
            title: cert.title,
            issuer: cert.issuer,
            url: cert.url,
            type: cert.type,
            skills,
            backgroundImage
          };
        });
        
        const uniqueTypes = ['all', ...new Set(
          processedCerts.map(cert => cert.type).filter(Boolean)
        )];
        
        // If no skills from DB, extract from certifications
        if (!skillNames.length) {
          const allSkillsSet = new Set();
          processedCerts.forEach(cert => {
            cert.skills?.forEach(skill => {
              if (skill) allSkillsSet.add(skill);
            });
          });
          skillNames.push(...[...allSkillsSet].sort());
        }

        // Cache the processed data
        certificationsCache.data = {
          processedCerts,
          skillNames,
          uniqueTypes
        };
        certificationsCache.timestamp = Date.now();

        setCertifications(processedCerts);
        setCategories(uniqueTypes);
        setAllSkills(skillNames);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setupFallbackData();
      } finally {
        setIsLoading(false);
        // Trigger animations after data is ready
        requestAnimationFrame(() => {
          setAnimationReady(true);
        });
      }
    };

    const setupFallbackData = () => {
      console.log("Using fallback certification data");
      setCertifications(fallbackCertifications);
      
      const uniqueTypes = ['all', ...new Set(fallbackCertifications.map(cert => cert.type))];
      setCategories(uniqueTypes);
      
      const allSkillsSet = new Set();
      fallbackCertifications.forEach(cert => {
        cert.skills?.forEach(skill => { 
          if (skill) allSkillsSet.add(skill); 
        });
      });
      setAllSkills([...allSkillsSet].sort());
    };

    fetchData();
  }, []);

  // Memoized filtered skills
  const filteredSkills = useMemo(() => {
    if (!allSkills.length) return [];
    
    if (!skillSearchTerm) return allSkills;
    
    const search = skillSearchTerm.toLowerCase().trim();
    return allSkills.filter(skill => 
      skill.toLowerCase().includes(search)
    );
  }, [skillSearchTerm, allSkills]);

  // Memoized filtered certifications
  const filteredCerts = useMemo(() => {
    if (!certifications.length) return [];
    
    let filtered = [...certifications];
    
    // Filter by search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(cert => 
        cert.title.toLowerCase().includes(search) ||
        cert.issuer?.toLowerCase().includes(search) ||
        cert.skills?.some(skill => skill.toLowerCase().includes(search))
      );
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(cert => cert.type === categoryFilter);
    }
    
    // Filter by skills
    if (skillFilter.length) {
      filtered = filtered.filter(cert => 
        cert.skills?.some(skill => skillFilter.includes(skill))
      );
    }
    
    return filtered;
  }, [searchTerm, categoryFilter, skillFilter, certifications]);

  // Memoized skill groups
  const skillGroups = useMemo(() => {
    if (filteredSkills.length === 0) return [];
    
    const groups = {};
    
    filteredSkills.forEach(skill => {
      const firstLetter = skill.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(skill);
    });
    
    return Object.entries(groups)
      .map(([letter, skills]) => ({ letter, skills }))
      .sort((a, b) => a.letter.localeCompare(b.letter));
  }, [filteredSkills]);

  // Callbacks
  const handleSkillToggle = useCallback((skill) => {
    setSkillFilter(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setCategoryFilter('all');
    setSkillFilter([]);
    setSkillSearchTerm('');
  }, []);

  const toggleFilters = useCallback(() => setShowFilters(!showFilters), [showFilters]);
  const closeFilters = useCallback(() => setShowFilters(false), []);

  // Count of active filters
  const activeFilterCount = useMemo(() => 
    [
      searchTerm ? 1 : 0,
      categoryFilter !== 'all' ? 1 : 0,
      skillFilter.length
    ].reduce((a, b) => a + b, 0),
    [searchTerm, categoryFilter, skillFilter]
  );

  // Loading state with animated skeletons
  if (isLoading) {
    return (
      <Box sx={{ width: "100%", p: { xs: 2, md: 3 } }}>
        {/* Header skeleton */}
        <Fade in={true} timeout={400}>
          <Box sx={{ mb: 4 }}>
            <Skeleton variant="text" width={200} height={40} animation="wave" />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Skeleton variant="rounded" width={240} height={40} animation="wave" />
              <Skeleton variant="rounded" width={150} height={40} animation="wave" />
              <Skeleton variant="rounded" width={100} height={40} animation="wave" />
            </Box>
          </Box>
        </Fade>
        
        {/* Certification cards skeleton */}
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <CertificationSkeleton index={index} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Error view with animation
  if (error && !certifications.length) {
    return (
      <Fade in={true} timeout={600}>
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
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 0.5 }}
            >
              <SchoolIcon sx={{ fontSize: 48, color: theme.palette.error.main, mb: 2 }} />
            </motion.div>
            <Typography variant="h6" color="error" gutterBottom>
              Error Loading Certifications
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
      </Fade>
    );
  }

  // Animation variants for optimized performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          mb: 4,
          gap: { xs: 2, md: 0 }
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: '#333333',
            mb: 1,
            fontSize: { xs: '1.75rem', md: '2.25rem' }
          }}
        >
          Certifications
        </Typography>

        {/* Search and actions */}
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 2,
            alignSelf: { xs: 'stretch', md: 'auto' },
            width: { xs: '100%', md: 'auto' }
          }}
        >
          <TextField
            placeholder="Search certifications..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: alpha('#000', 0.4) }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm('')}
                    sx={{ color: alpha('#000', 0.4) }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ 
              flex: 1,
              minWidth: { md: '240px' },
              '& .MuiOutlinedInput-root': {
                borderRadius: 8,
                bgcolor: 'white',
                transition: 'all 0.2s',
                border: '1px solid',
                borderColor: alpha('#000', 0.1),
                '&:hover': {
                  borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.5),
                  boxShadow: `0 0 0 1px ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`
                },
                '&.Mui-focused': {
                  borderColor: ACCENTURE_COLORS.corePurple1,
                  boxShadow: `0 0 0 1px ${alpha(ACCENTURE_COLORS.corePurple1, 0.2)}`,
                  '& fieldset': { border: 'none' }
                },
                '& fieldset': { border: 'none' }
              }
            }}
          />

          <Button
            variant="contained"
            startIcon={<BadgeIcon />}
            onClick={handleGoToMyCertifications}
            sx={{
              ...primaryButtonStyles,
              borderRadius: 8,
              bgcolor: ACCENTURE_COLORS.corePurple1,
              height: 40,
              px: { xs: 2, md: 3 }
            }}
          >
            My Certifications
          </Button>

          <Button
            variant={activeFilterCount > 0 ? "contained" : "outlined"}
            startIcon={<FilterAltOutlinedIcon />}
            onClick={toggleFilters}
            sx={{
              borderRadius: 8,
              borderColor: alpha('#000', 0.1),
              bgcolor: activeFilterCount > 0 ? ACCENTURE_COLORS.corePurple1 : 'white',
              color: activeFilterCount > 0 ? 'white' : alpha('#000', 0.7),
              '&:hover': {
                borderColor: activeFilterCount > 0 ? 'transparent' : ACCENTURE_COLORS.corePurple1,
                bgcolor: activeFilterCount > 0 ? ACCENTURE_COLORS.corePurple2 : alpha(ACCENTURE_COLORS.corePurple1, 0.05)
              },
              transition: 'all 0.2s',
              px: 2,
              height: 40,
              textTransform: 'none',
              fontWeight: 500,
              minWidth: { xs: 'auto', md: '100px' }
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
              Filters
            </Box>
            {activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size="small"
                sx={{
                  ml: 1,
                  height: 20,
                  minWidth: 20,
                  fontSize: '0.75rem',
                  bgcolor: activeFilterCount > 0 ? 'white' : ACCENTURE_COLORS.corePurple1,
                  color: activeFilterCount > 0 ? ACCENTURE_COLORS.corePurple1 : 'white',
                  fontWeight: 600
                }}
              />
            )}
          </Button>
        </Box>
      </Box>

      {/* Floating filter panel with animation */}
      <AnimatePresence>
        {showFilters && (
          <ClickAwayListener onClickAway={closeFilters}>
            <MotionBox
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25,
                duration: 0.3
              }}
              component={Paper}
              elevation={10}
              sx={{
                position: 'absolute',
                top: { xs: '120px', md: '70px' },
                right: { xs: '16px', md: '24px' },
                width: { xs: 'calc(100% - 32px)', sm: '450px', md: '400px' },
                maxWidth: '100%',
                borderRadius: 3,
                zIndex: 100,
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 2px rgba(0, 0, 0, 0.08)',
                border: '1px solid',
                borderColor: alpha('#000', 0.06),
                backdropFilter: 'blur(2px)'
              }}
            >
            {/* Filter panel header */}
            <Box
              sx={{
                px: 3,
                py: 2.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: alpha('#000', 0.06),
                background: `linear-gradient(145deg, ${alpha(ACCENTURE_COLORS.corePurple1, 0.05)} 0%, ${alpha(ACCENTURE_COLORS.corePurple2, 0.08)} 100%)`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FilterAltOutlinedIcon sx={{ color: ACCENTURE_COLORS.corePurple1, fontSize: 22 }} />
                <Typography variant="subtitle1" fontWeight={700} color={alpha('#000', 0.8)}>
                  Filter Certifications
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                {activeFilterCount > 0 && (
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<ClearIcon />}
                    onClick={handleClearFilters}
                    sx={{
                      color: alpha('#000', 0.6),
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: alpha('#000', 0.05),
                      }
                    }}
                  >
                    Clear filters
                  </Button>
                )}
                
                <IconButton
                  size="small"
                  onClick={closeFilters}
                  sx={{ 
                    color: alpha('#000', 0.6),
                    '&:hover': {
                      backgroundColor: alpha('#000', 0.05),
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Filter content */}
            <Box 
              sx={{ 
                p: 3, 
                maxHeight: '70vh', 
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: alpha(ACCENTURE_COLORS.corePurple1, 0.15),
                  borderRadius: '6px',
                  '&:hover': {
                    background: alpha(ACCENTURE_COLORS.corePurple1, 0.25),
                  }
                },
                bgcolor: '#ffffff',
              }}
            >
              {/* Categories */}
              <Box 
                sx={{ 
                  mb: 4,
                  pb: 3,
                  borderBottom: '1px solid',
                  borderColor: alpha('#000', 0.05),
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <CategoryIcon sx={{ color: ACCENTURE_COLORS.corePurple1, fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={600} color={alpha('#000', 0.8)}>
                    Category
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {categories.map((category) => (
                    <Chip
                      key={category}
                      label={category === 'all' ? 'All Categories' : category}
                      onClick={() => setCategoryFilter(category)}
                      sx={{
                        borderRadius: 6,
                        bgcolor: categoryFilter === category 
                          ? ACCENTURE_COLORS.corePurple1 
                          : alpha('#f5f5f5', 0.8),
                        color: categoryFilter === category 
                          ? 'white' 
                          : alpha('#000', 0.75),
                        border: '1px solid',
                        borderColor: categoryFilter === category 
                          ? ACCENTURE_COLORS.corePurple1 
                          : alpha('#000', 0.08),
                        '&:hover': {
                          bgcolor: categoryFilter === category 
                            ? ACCENTURE_COLORS.corePurple2 
                            : alpha(ACCENTURE_COLORS.corePurple1, 0.08),
                          borderColor: categoryFilter === category 
                            ? ACCENTURE_COLORS.corePurple2 
                            : alpha(ACCENTURE_COLORS.corePurple1, 0.3),
                          boxShadow: categoryFilter !== category 
                            ? '0 2px 4px rgba(0,0,0,0.05)' 
                            : 'none',
                        },
                        fontWeight: 500,
                        px: 1.5,
                        py: 0.6,
                        height: 32,
                        transition: 'all 0.2s',
                        mb: 0.5,
                        boxShadow: categoryFilter === category 
                          ? '0 2px 5px rgba(0,0,0,0.1)' 
                          : 'none',
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Skills */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TagIcon sx={{ color: ACCENTURE_COLORS.corePurple1, fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={600} color={alpha('#000', 0.8)}>
                      Skills
                    </Typography>
                  </Box>
                  
                  {skillFilter.length > 0 && (
                    <Chip
                      label={`${skillFilter.length} selected`}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.1),
                        color: ACCENTURE_COLORS.corePurple1,
                        border: '1px solid',
                        borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.2),
                      }}
                    />
                  )}
                </Box>

                {/* Skills search */}
                <TextField
                  placeholder="Search skills..."
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={skillSearchTerm}
                  onChange={(e) => setSkillSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: alpha('#000', 0.4) }} />
                      </InputAdornment>
                    ),
                    endAdornment: skillSearchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSkillSearchTerm('')}
                          sx={{ color: alpha('#000', 0.4) }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: alpha('#f5f5f5', 0.5),
                      border: '1px solid',
                      borderColor: alpha('#000', 0.08),
                      '&:hover': {
                        borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.5),
                        bgcolor: 'white',
                      },
                      '&.Mui-focused': {
                        borderColor: ACCENTURE_COLORS.corePurple1,
                        boxShadow: `0 0 0 2px ${alpha(ACCENTURE_COLORS.corePurple1, 0.15)}`,
                        bgcolor: 'white',
                        '& fieldset': { border: 'none' }
                      },
                      '& fieldset': { border: 'none' }
                    }
                  }}
                />

                {/* Selected skills */}
                {skillFilter.length > 0 && (
                  <Box 
                    sx={{ 
                      mb: 2,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.04),
                      border: '1px solid',
                      borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.1),
                    }}
                  >
                    <Typography variant="caption" fontWeight={600} color={alpha('#000', 0.7)} sx={{ display: 'block', mb: 1 }}>
                      Selected Skills
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {skillFilter.map(skill => (
                        <Chip
                          key={`selected-${skill}`}
                          label={skill}
                          onDelete={() => handleSkillToggle(skill)}
                          size="small"
                          sx={{
                            borderRadius: 6,
                            bgcolor: ACCENTURE_COLORS.corePurple1,
                            color: 'white',
                            fontWeight: 500,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            '& .MuiChip-deleteIcon': {
                              color: 'white'
                            },
                            '&:hover': {
                              bgcolor: ACCENTURE_COLORS.corePurple2,
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Skills list */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    maxHeight: '250px',
                    overflowY: 'auto',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: alpha('#000', 0.08),
                    bgcolor: alpha('#f9f9f9', 0.5),
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: alpha(ACCENTURE_COLORS.corePurple1, 0.2),
                      borderRadius: '4px',
                      '&:hover': {
                        background: alpha(ACCENTURE_COLORS.corePurple1, 0.3),
                      }
                    },
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  {filteredSkills.length > 0 ? (
                    skillGroups.map(group => (
                      <Box key={group.letter} sx={{ mb: 2.5 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block', 
                            fontWeight: 700, 
                            color: ACCENTURE_COLORS.corePurple1,
                            mb: 0.8,
                            px: 1,
                            borderBottom: '1px dashed',
                            borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.1),
                            pb: 0.3
                          }}
                        >
                          {group.letter}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, px: 0.5 }}>
                          {group.skills.map(skill => (
                            <Chip
                              key={skill}
                              label={skill}
                              onClick={() => handleSkillToggle(skill)}
                              size="small"
                              sx={{
                                borderRadius: 6,
                                height: 28,
                                bgcolor: skillFilter.includes(skill) 
                                  ? alpha(ACCENTURE_COLORS.corePurple1, 0.1) 
                                  : 'white',
                                color: skillFilter.includes(skill) 
                                  ? ACCENTURE_COLORS.corePurple1 
                                  : alpha('#000', 0.7),
                                border: '1px solid',
                                borderColor: skillFilter.includes(skill) 
                                  ? alpha(ACCENTURE_COLORS.corePurple1, 0.3) 
                                  : alpha('#000', 0.08),
                                '&:hover': {
                                  bgcolor: skillFilter.includes(skill) 
                                    ? alpha(ACCENTURE_COLORS.corePurple1, 0.15) 
                                    : alpha(ACCENTURE_COLORS.corePurple1, 0.05),
                                  borderColor: ACCENTURE_COLORS.corePurple1,
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                },
                                fontWeight: 500,
                                transition: 'all 0.15s',
                                boxShadow: skillFilter.includes(skill) 
                                  ? '0 1px 3px rgba(0,0,0,0.05)' 
                                  : 'none',
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Box
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      <SearchIcon sx={{ color: alpha('#000', 0.2), fontSize: 32 }} />
                      <Typography variant="body2" color="text.secondary">
                        {allSkills.length === 0 ? 'No skills available' : 'No skills match your search'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <Box 
                  sx={{ 
                    pt: 3,
                    mt: 1,
                    borderTop: `1px solid ${alpha('#000', 0.05)}`,
                    bgcolor: alpha('#f5f5f5', 0.5),
                    mx: -3,
                    px: 3,
                    pb: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={600} color={alpha('#000', 0.7)}>
                      Active filters
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {searchTerm && (
                      <Chip
                        label={`Search: ${searchTerm}`}
                        size="small"
                        onDelete={() => setSearchTerm('')}
                        sx={{
                          borderRadius: 6,
                          bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.05),
                          color: ACCENTURE_COLORS.corePurple3,
                          border: '1px solid',
                          borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.2),
                          '& .MuiChip-deleteIcon': {
                            color: ACCENTURE_COLORS.corePurple3
                          },
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}
                      />
                    )}

                    {categoryFilter !== 'all' && (
                      <Chip
                        label={`Category: ${categoryFilter}`}
                        size="small"
                        onDelete={() => setCategoryFilter('all')}
                        sx={{
                          borderRadius: 6,
                          bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.05),
                          color: ACCENTURE_COLORS.corePurple3,
                          border: '1px solid',
                          borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.2),
                          '& .MuiChip-deleteIcon': {
                            color: ACCENTURE_COLORS.corePurple3
                          },
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}
                      />
                    )}

                    {skillFilter.length > 0 && (
                      <Chip
                        label={`Skills: ${skillFilter.length === 1 ? skillFilter[0] : `${skillFilter.length} selected`}`}
                        size="small"
                        onDelete={() => setSkillFilter([])}
                        sx={{
                          borderRadius: 6,
                          bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.05),
                          color: ACCENTURE_COLORS.corePurple3,
                          border: '1px solid',
                          borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.2),
                          '& .MuiChip-deleteIcon': {
                            color: ACCENTURE_COLORS.corePurple3
                          },
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}
                      />
                    )}
                  </Box>
                </Box>
              )}
            </Box>
            </MotionBox>
          </ClickAwayListener>
        )}
      </AnimatePresence>

      {/* Results with optimized animations */}
      <AnimatePresence mode="wait">
        {filteredCerts.length > 0 ? (
          <MotionBox
            key="results"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Grid container spacing={3}>
              {filteredCerts.map((cert, index) => (
                <MotionGrid
                  item 
                  xs={12} 
                  sm={6} 
                  md={4} 
                  lg={3} 
                  key={cert.id}
                  variants={itemVariants}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      delay: Math.min(index * 0.05, 0.3), // Cap the delay to prevent long waits
                      type: "spring",
                      stiffness: 100,
                      damping: 15
                    }
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.2 }
                  }}
                >
                  <CertificationCard
                    id={cert.id}  
                    title={cert.title}
                    url={cert.url}
                    skills={cert.skills || []}
                    backgroundImage={cert.backgroundImage}
                    duration={cert.issuer}
                  />
                </MotionGrid>
              ))}
            </Grid>
          </MotionBox>
        ) : (
          <Fade in={animationReady} timeout={600}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
                textAlign: 'center', 
                borderRadius: 2,
                border: '1px dashed',
                borderColor: alpha('#000', 0.12),
                bgcolor: '#fff',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.3),
                  boxShadow: `0 4px 20px ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`
                }
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <SchoolIcon sx={{ fontSize: 48, color: alpha('#000', 0.2), mb: 2 }} />
              </motion.div>
              <Box>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No certifications found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Try adjusting your filters or search criteria
                </Typography>
              </Box>
              <Button 
                variant="contained"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                sx={{ 
                  ...primaryButtonStyles,
                  bgcolor: ACCENTURE_COLORS.corePurple1,
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: 8,
                  boxShadow: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 20px rgba(161, 0, 255, 0.3)'
                  }
                }}
              >
                Clear all filters
              </Button>
            </Paper>
          </Fade>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Certifications;