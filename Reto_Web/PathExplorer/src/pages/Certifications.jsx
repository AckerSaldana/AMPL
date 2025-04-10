// src/pages/Certifications.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  TextField, 
  InputAdornment,
  MenuItem,
  Chip,
  Button,
  Paper,
  useTheme,
  alpha,
  CircularProgress,
  Divider,
  Fade,
  Tooltip,
  Badge,
  Container
} from '@mui/material';

// Iconos
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SchoolIcon from '@mui/icons-material/School';
import TuneIcon from '@mui/icons-material/Tune';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CategoryIcon from '@mui/icons-material/Category';
import SkillsIcon from '@mui/icons-material/Psychology';
import IconButton from '@mui/material/IconButton';

// Importar supabase
import { supabase } from '../supabase/supabaseClient';
import { CertificationCard } from '../components/CertificationCard';

// Datos fallback - versión reducida
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
    backgroundImage: "https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://d15cw65ipctsrr.cloudfront.net/4b/328070fe8e11e6b11a7fc5f0e298c9/Leading-People-and-Teams_Logo_Black.png?auto=format%2Ccompress&dpr=1&w=330&h=330&fit=fill&q=25",
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

  // useEffect para cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const { data: skillsData, error: skillsError } = await supabase
          .from('Skill')
          .select('skill_ID, name');
        
        if (skillsError) {
          console.error("Error fetching skills:", skillsError);
          throw new Error(`Error al cargar skills: ${skillsError.message}`);
        }
        
        const skillIdToName = {};
        let skillNames = [];
        
        if (skillsData?.length > 0) {
          skillsData.forEach(skill => skillIdToName[skill.skill_ID] = skill.name);
          skillNames = skillsData.map(skill => skill.name).sort();
          setAllSkills(skillNames);
        }

        const { data: certData, error: certError } = await supabase
          .from('Certifications')
          .select('*');

        if (certError) {
          console.error("Error fetching certifications:", certError);
          throw new Error(`Error al cargar certificaciones: ${certError.message}`);
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
          
          // Obtener imagen
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
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setupFallbackData();
      } finally {
        setIsLoading(false);
      }
    };

    // Función para obtener una imagen por defecto según el tipo
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

    // Función para usar datos de fallback
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
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!certifications.length) return;
    
    let filtered = [...certifications];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(cert => 
        cert.title.toLowerCase().includes(searchLower) ||
        cert.issuer.toLowerCase().includes(searchLower) ||
        cert.skills?.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }
    
    // Filtrar por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(cert => cert.type === categoryFilter);
    }
    
    if (skillFilter.length) {
      filtered = filtered.filter(cert => 
        cert.skills?.some(skill => skillFilter.includes(skill))
      );
    }
    
    setFilteredCerts(filtered);
  }, [searchTerm, categoryFilter, skillFilter, certifications]);

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
  };

  const toggleFilters = () => setShowFilters(!showFilters);

  const activeFilterCount = [
    searchTerm ? 1 : 0,
    categoryFilter !== 'all' ? 1 : 0,
    skillFilter.length
  ].reduce((a, b) => a + b, 0);

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
          gap: 3
        }}
      >
        <CircularProgress 
          size={48} 
          thickness={4} 
          color="primary" 
        />
        <Typography variant="subtitle1" color="text.secondary">
          Loading Certifications...
        </Typography>
      </Box>
    );
  }

  // Renderizado de error
  if (error && !certifications.length) {
    return (
      <Box sx={{ py: 3 }}>
        <Paper 
          elevation={2}
          sx={{ 
            p: 3, 
            maxWidth: 600, 
            textAlign: 'center',
            borderRadius: 2,
            mx: 'auto'
          }}
        >
          <SchoolIcon sx={{ fontSize: 48, color: theme.palette.error.main, mb: 2 }} />
          <Typography variant="h6" color="error" gutterBottom>
            Error Loading Certifications
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
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
        p: 3,
        width: "100%",
        maxWidth: "calc(100vw - 150px)",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Encabezado y controles */}
      <Box sx={{ mb: 3 }}>
        {/* Header con título y contador de certificaciones */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            mb: 2,
            gap: { xs: 2, sm: 0 }
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#222', mb: 1 }}>
              All Certifications
            </Typography>
            <Box
              sx={{ 
                bgcolor: '#973EBC', 
                borderRadius: '20px', 
                px: 2, 
                py: 0.5, 
                display: 'inline-flex', 
                alignItems: 'center',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'white',
                boxShadow: '0 2px 8px rgba(151, 62, 188, 0.25)'
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: 16, mr: 0.8 }} />
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                {certifications.length} Certifications
              </Typography>
            </Box>
          </Box>
          
          {/* Búsqueda y filtros */}
          <Box sx={{ display: 'flex', gap: 2, alignSelf: { xs: 'stretch', sm: 'auto' } }}>
            <TextField
              placeholder="Search certifications..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ 
                flex: { xs: 1, sm: 'auto' },
                width: { sm: '260px' },
                bgcolor: '#fff',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  '&:hover': {
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                  }
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm('')}
                      edge="end"
                    >
                      <ClearAllIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Badge 
              badgeContent={activeFilterCount} 
              color="primary"
              invisible={activeFilterCount === 0}
            >
              <Button
                variant="contained"
                startIcon={<TuneIcon />}
                onClick={toggleFilters}
                sx={{
                  borderRadius: 1.5,
                  bgcolor: theme.palette.primary.main,
                  fontWeight: 600,
                  boxShadow: '0 2px 5px rgba(151, 62, 188, 0.25)',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                  }
                }}
              >
                Filters
              </Button>
            </Badge>
          </Box>
        </Box>

        {/* Panel de filtros */}
        {showFilters && (
          <Paper sx={{ 
            p: 2, 
            mb: 3,
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="subtitle1" fontWeight={600} color="primary">
                <FilterListIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Filter Certifications
              </Typography>
              
              <Button 
                variant="text" 
                startIcon={<ClearAllIcon />}
                onClick={handleClearFilters}
                sx={{ 
                  color: theme.palette.primary.main,
                }}
                disabled={!searchTerm && categoryFilter === 'all' && !skillFilter.length}
              >
                Clear all
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {/* Filtros de categoría y skills */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2
            }}>
              {/* Categoría */}
              <Box sx={{ minWidth: 200, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CategoryIcon sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 18 }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Category
                  </Typography>
                </Box>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                    }
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              
              {/* Skills */}
              <Box sx={{ flex: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SkillsIcon sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 18 }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Skills
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 1,
                    p: 1.5,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    minHeight: '56px',
                    maxHeight: '100px',
                    overflowY: 'auto'
                  }}
                >
                  {allSkills.length ? (
                    allSkills.map(skill => (
                      <Chip
                        key={skill}
                        label={skill}
                        clickable
                        size="small"
                        onClick={() => handleSkillToggle(skill)}
                        color={skillFilter.includes(skill) ? "primary" : "default"}
                        variant={skillFilter.includes(skill) ? "filled" : "outlined"}
                        sx={{ 
                          bgcolor: skillFilter.includes(skill) 
                            ? alpha(theme.palette.primary.main, 0.15) 
                            : 'transparent',
                          border: skillFilter.includes(skill) 
                            ? `1px solid ${theme.palette.primary.main}` 
                            : '1px solid #e0e0e0',
                          color: skillFilter.includes(skill) 
                            ? theme.palette.primary.main 
                            : 'text.secondary',
                          fontWeight: skillFilter.includes(skill) ? 500 : 400
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                      No skills available
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
            
            {/* Filtros activos */}
            {(searchTerm || categoryFilter !== 'all' || skillFilter.length > 0) && (
              <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: 1
              }}>
                <Typography variant="body2" color="text.secondary">
                  Active filters:
                </Typography>
                {searchTerm && (
                  <Chip
                    label={`Search: ${searchTerm}`}
                    size="small"
                    onDelete={() => setSearchTerm('')}
                    sx={{ bgcolor: '#f5f5f5' }}
                  />
                )}
                {categoryFilter !== 'all' && (
                  <Chip
                    label={`Category: ${categoryFilter}`}
                    size="small"
                    onDelete={() => setCategoryFilter('all')}
                    sx={{ bgcolor: '#f5f5f5' }}
                  />
                )}
                {skillFilter.length > 0 && (
                  <Chip
                    label={`Skills: ${skillFilter.length}`}
                    size="small"
                    onDelete={() => setSkillFilter([])}
                    sx={{ bgcolor: '#f5f5f5' }}
                  />
                )}
              </Box>
            )}
          </Paper>
        )}
      </Box>

      {/* Resultados - Grid de certificaciones */}
      {filteredCerts.length > 0 ? (
        <Grid container spacing={2}>
          {filteredCerts.map((cert) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={cert.id}>
              <CertificationCard
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
          sx={{ 
            p: 3, 
            textAlign: 'center', 
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'divider',
            mt: 2
          }}
        >
          <SchoolIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No certifications found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Try adjusting your filters or search criteria
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<ClearAllIcon />}
            onClick={handleClearFilters}
          >
            Clear all filters
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default Certifications;