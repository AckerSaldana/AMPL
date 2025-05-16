import React, { useState, useEffect } from 'react';
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
  Modal,
  ClickAwayListener
} from '@mui/material';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import SchoolIcon from '@mui/icons-material/School';
import CategoryIcon from '@mui/icons-material/Category';
import TagIcon from '@mui/icons-material/Tag';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

import SubmitCertification from './SubmitCertification';
import { supabase } from '../supabase/supabaseClient';
import { CertificationCard } from '../components/CertificationCard';
import { ACCENTURE_COLORS, primaryButtonStyles, outlineButtonStyles } from '../styles/styles';

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

const Certifications = () => {
  const theme = useTheme();

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [certifications, setCertifications] = useState([]);
  const [filteredCerts, setFilteredCerts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [allSkills, setAllSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  
  // Nuevos estados para la mejora de filtros
  const [skillSearchTerm, setSkillSearchTerm] = useState('');
  const [filteredSkills, setFilteredSkills] = useState([]);

  // Handlers
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  // Effect to load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const { data: skillsData, error: skillsError } = await supabase
          .from('Skill')
          .select('skill_ID, name');
        
        if (skillsError) {
          throw new Error(`Error loading skills: ${skillsError.message}`);
        }
        
        const skillIdToName = {};
        let skillNames = [];
        
        if (skillsData?.length > 0) {
          skillsData.forEach(skill => skillIdToName[skill.skill_ID] = skill.name);
          skillNames = skillsData.map(skill => skill.name).sort();
          setAllSkills(skillNames);
          setFilteredSkills(skillNames); // Inicializa filteredSkills con todas las skills
        }

        const { data: certData, error: certError } = await supabase
          .from('Certifications')
          .select('*');

        if (certError) {
          throw new Error(`Error loading certifications: ${certError.message}`);
        }

        if (!certData?.length) {
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
          
          // Get image
          const backgroundImage = cert.certification_Image || 
            getDefaultImageByType(cert.type);
          
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
        
        setCertifications(processedCerts);
        setFilteredCerts(processedCerts);
        
        const uniqueTypes = ['all', ...new Set(
          processedCerts.map(cert => cert.type).filter(Boolean)
        )];
        setCategories(uniqueTypes);
        
        if (!skillNames.length) {
          const allSkillsSet = new Set();
          processedCerts.forEach(cert => {
            cert.skills?.forEach(skill => {
              if (skill) allSkillsSet.add(skill);
            });
          });
          setAllSkills([...allSkillsSet].sort());
          setFilteredSkills([...allSkillsSet].sort()); // Inicializa filteredSkills
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setupFallbackData();
      } finally {
        setIsLoading(false);
      }
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

    // Function to use fallback data
    const setupFallbackData = () => {
      console.log("Using fallback certification data");
      setCertifications(fallbackCertifications);
      setFilteredCerts(fallbackCertifications);
      
      const uniqueTypes = ['all', ...new Set(fallbackCertifications.map(cert => cert.type))];
      setCategories(uniqueTypes);
      
      const allSkillsSet = new Set();
      fallbackCertifications.forEach(cert => {
        cert.skills?.forEach(skill => { 
          if (skill) allSkillsSet.add(skill); 
        });
      });
      setAllSkills([...allSkillsSet].sort());
      setFilteredSkills([...allSkillsSet].sort()); // Inicializa filteredSkills
    };

    fetchData();
  }, []);

  // Effect para filtrar las skills basado en el término de búsqueda
  useEffect(() => {
    if (!allSkills.length) return;
    
    if (!skillSearchTerm) {
      setFilteredSkills(allSkills);
      return;
    }
    
    const search = skillSearchTerm.toLowerCase().trim();
    const filtered = allSkills.filter(skill => 
      skill.toLowerCase().includes(search)
    );
    
    setFilteredSkills(filtered);
  }, [skillSearchTerm, allSkills]);

  // Effect to apply filters
  useEffect(() => {
    if (!certifications.length) return;
    
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
    
    setFilteredCerts(filtered);
  }, [searchTerm, categoryFilter, skillFilter, certifications]);

  // Functions to handle filters
  const handleSkillToggle = (skill) => {
    setSkillFilter(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setSkillFilter([]);
    setSkillSearchTerm('');
  };

  const toggleFilters = () => setShowFilters(!showFilters);
  const closeFilters = () => setShowFilters(false);

  // Función para agrupar skills alfabéticamente
  const getSkillGroups = () => {
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
  };

  // Count of active filters
  const activeFilterCount = [
    searchTerm ? 1 : 0,
    categoryFilter !== 'all' ? 1 : 0,
    skillFilter.length
  ].reduce((a, b) => a + b, 0);

  // Loading states
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '200px',
          height: '30vh',
          gap: 3,
          p: 4,
          width: '100%'
        }}
      >
        <CircularProgress 
          size={48} 
          thickness={4} 
          sx={{ color: ACCENTURE_COLORS.corePurple1 }} 
        />
        <Typography variant="subtitle1" color="text.secondary">
          Loading Certifications...
        </Typography>
      </Box>
    );
  }

  // Error view
  if (error && !certifications.length) {
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
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        p: { xs: 2, md: 3 },
        position: 'relative'
      }}
    >
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
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={{
              ...primaryButtonStyles,
              borderRadius: 8,
              bgcolor: ACCENTURE_COLORS.corePurple1,
              height: 40,
              px: { xs: 2, md: 3 }
            }}
          >
            Submit
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

      {/* Floating filter panel MEJORADO */}
      {showFilters && (
        <ClickAwayListener onClickAway={closeFilters}>
          <Paper
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
              animation: 'slideIn 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards',
              '@keyframes slideIn': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(-20px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              },
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

              {/* Skills - Mejorado con búsqueda y agrupamiento */}
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

                {/* Búsqueda de Skills */}
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

                {/* Skills seleccionadas */}
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

                {/* Lista de skills filtrada */}
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
                    getSkillGroups().map(group => (
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
          </Paper>
        </ClickAwayListener>
      )}

      {/* Results */}
      {filteredCerts.length > 0 ? (
        <Grid container spacing={3}>
          {filteredCerts.map((cert) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={cert.id}>
              <CertificationCard
                id={cert.id}  
                title={cert.title}
                url={cert.url}
                skills={cert.skills || []}
                backgroundImage={cert.backgroundImage}
                duration={cert.issuer}
              />
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
            bgcolor: '#fff'
          }}
        >
          <SchoolIcon sx={{ fontSize: 48, color: alpha('#000', 0.2), mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No certifications found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your filters or search criteria
          </Typography>
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
              boxShadow: 'none'
            }}
          >
            Clear all filters
          </Button>
        </Paper>
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
    </Box>
  );
};

export default Certifications;