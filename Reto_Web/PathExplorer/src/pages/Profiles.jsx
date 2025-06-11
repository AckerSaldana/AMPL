import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Grid,
  Typography,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Paper,
  useTheme,
  Button,
  useMediaQuery,
  Fade,
  Zoom,
  Grow,
  Skeleton
} from "@mui/material";
import {
  PersonOutline as PersonOutlineIcon,
  Group as GroupIcon,
  Work as WorkIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import { supabase } from "../supabase/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { useDarkMode } from "../contexts/DarkModeContext";
import { getDarkModeStyles } from "../styles/darkModeStyles";

// Componentes modulares importados
import StatCard from "../components/StatCard";
import EmployeeCardAnimated from "../components/EmployeeCardAnimated";
import SearchFilter from "../components/SearchFilter";
import ReviewCertifications from "../components/ReviewCertifications";
import UserProfileDetail from "./UserProfileDetail";
import useUserProfileCache from "../hooks/useUserProfileCache";

// Animated container component
const MotionGrid = motion(Grid);
const MotionBox = motion(Box);

// Cache for employee data
const employeeCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes


// Skeleton components for loading states
const StatCardSkeleton = ({ darkMode }) => (
  <Paper sx={{ 
    p: 3, 
    borderRadius: 4, 
    height: 120,
    backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
    border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Skeleton variant="circular" width={50} height={50} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" height={32} />
      </Box>
    </Box>
  </Paper>
);

const EmployeeCardSkeleton = ({ darkMode }) => (
  <Paper sx={{ 
    p: 3, 
    borderRadius: 4, 
    height: 280,
    backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
    border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Skeleton variant="circular" width={56} height={56} />
      <Box sx={{ ml: 2, flex: 1 }}>
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="50%" />
      </Box>
    </Box>
    <Skeleton variant="text" width="100%" height={60} />
    <Box sx={{ mt: 2 }}>
      <Skeleton variant="rectangular" width="100%" height={40} />
    </Box>
  </Paper>
);

const Profiles = () => {
  const theme = useTheme();
  const { darkMode } = useDarkMode();
  const darkModeStyles = getDarkModeStyles(darkMode);
  const { preloadUserProfile, getUserProfile } = useUserProfileCache();
  
  // Media query hooks para responsividad
  const isSmallScreen = useMediaQuery('(max-width:599px)');
  const isExtraSmallScreen = useMediaQuery('(max-width:320px)');
  
  // Colores de Accenture definidos según las guías de marca
  const accentureColors = {
    corePurple1: "#a100ff",
    corePurple2: "#7500c0",
    corePurple3: "#460073"
  };
  
  // Estados
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    availableEmployees: 0,
    activeProjects: 0
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [reviewCertificationsOpen, setReviewCertificationsOpen] = useState(false);
  const [isReviewer, setIsReviewer] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Optimized data fetching with parallel requests
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Check cache first
        const cacheKey = 'profiles-data';
        const cachedData = employeeCache.get(cacheKey);
        
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
          setEmployees(cachedData.employees);
          setFilteredEmployees(cachedData.employees);
          setStats(cachedData.stats);
          setIsReviewer(cachedData.isReviewer);
          setLoading(false);
          setStatsLoading(false);
          setAnimateIn(true);
          return;
        }

        // Parallel data fetching
        const [userSession, employeeData, statsData] = await Promise.all([
          supabase.auth.getUser(),
          fetchEmployeeData(),
          fetchStats()
        ]);

        // Check if user is reviewer
        let isUserReviewer = false;
        if (userSession.data?.user) {
          const { data: userData } = await supabase
            .from("User")
            .select("permission")
            .eq("user_id", userSession.data.user.id)
            .single();
          
          isUserReviewer = userData?.permission === "TFS" || userData?.permission === "Manager";
        }

        // Update cache
        employeeCache.set(cacheKey, {
          employees: employeeData,
          stats: statsData,
          isReviewer: isUserReviewer,
          timestamp: Date.now()
        });

        // Update state
        setEmployees(employeeData);
        setFilteredEmployees(employeeData);
        setStats(statsData);
        setIsReviewer(isUserReviewer);
        setStatsLoading(false);
        
        // Trigger animations after a small delay
        setTimeout(() => setAnimateIn(true), 100);
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackbar({
          open: true,
          message: `Error loading data: ${error.message}`,
          severity: "error"
        });
        generateMockData();
      } finally {
        setLoading(false);
        setStatsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Optimized employee data fetching
  const fetchEmployeeData = async () => {
    // Single query with joins
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select(`
        user_id, 
        name, 
        last_name, 
        mail, 
        profile_pic, 
        permission,
        UserRole(
          role_name, 
          project_id, 
          Project:project_id(status)
        ),
        UserSkill(
          skill_ID,
          Skill(name)
        )
      `)
      .eq("permission", "Employee");
    
    if (userError) throw userError;

    // Process employees
    return userData.map(user => {
      const hasActiveProject = user.UserRole?.some(role => 
        role.Project?.status !== "Completed"
      );
      
      const currentRole = user.UserRole?.[0]?.role_name || "Employee";
      
      const skills = user.UserSkill?.map(s => ({
        id: s.skill_ID,
        name: s.Skill?.name || `Skill #${s.skill_ID}`
      })) || [];
      
      return {
        user_id: user.user_id,
        name: user.name,
        last_name: user.last_name,
        profile_pic: user.profile_pic,
        email: user.mail,
        role: currentRole,
        skills,
        assignment: hasActiveProject ? 100 : 0,
        isAssigned: hasActiveProject,
        activeProjects: hasActiveProject ? 1 : 0
      };
    });
  };

  // Fetch statistics separately
  const fetchStats = async () => {
    const { count: employeeCount, error: employeeError } = await supabase
      .from("User")
      .select("*", { count: "exact", head: true })
      .eq("permission", "Employee");
    
    const { count: projectCount, error: projectError } = await supabase
      .from("Project")
      .select("*", { count: "exact", head: true })
      .neq("status", "Completed");
    
    if (employeeError) console.error("Error fetching employee count:", employeeError);
    if (projectError) console.error("Error fetching project count:", projectError);
    
    return {
      totalEmployees: employeeCount || 0,
      availableEmployees: 0, // Will be calculated from employee data
      activeProjects: projectCount || 0
    };
  };

  // Generate mock data
  const generateMockData = () => {
    const mockEmployees = [
      {
        user_id: "1",
        name: "Ana Fernanda",
        last_name: "Mendoza Mendiola", 
        role: "Gamification Designer",
        skills: [{ id: 1, name: "UX/UI" }, { id: 2, name: "HTML/CSS" }, { id: 3, name: "JavaScript" }],
        isAssigned: true,
        assignment: 100,
        activeProjects: 1
      },
      {
        user_id: "2",
        name: "Carlos",
        last_name: "Vega Noroña",
        role: "Behavioral Health Expert",
        skills: [{ id: 4, name: "Psychology" }, { id: 5, name: "Research" }],
        isAssigned: true,
        assignment: 100,
        activeProjects: 1
      },
      {
        user_id: "3",
        name: "Daniela",
        last_name: "Morales Quintero",
        role: "Front End Developer",
        skills: [{ id: 1, name: "React" }, { id: 2, name: "JavaScript" }, { id: 3, name: "CSS" }],
        isAssigned: false,
        assignment: 0,
        activeProjects: 0
      }
    ];
    
    setEmployees(mockEmployees);
    setFilteredEmployees(mockEmployees);
    setStats({
      totalEmployees: 18,
      availableEmployees: 5,
      activeProjects: 6
    });
    setIsReviewer(true);
    setAnimateIn(true);
  };

  // Memoized filter function
  const filterEmployees = useMemo(() => {
    let filtered = [...employees];
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(emp => 
        `${emp.name} ${emp.last_name}`.toLowerCase().includes(search) ||
        emp.role?.toLowerCase().includes(search) ||
        emp.skills?.some(s => s.name.toLowerCase().includes(search))
      );
    }
    
    if (activeTab === "available") {
      filtered = filtered.filter(emp => !emp.isAssigned);
    } else if (activeTab === "assigned") {
      filtered = filtered.filter(emp => emp.isAssigned);
    }
    
    return filtered;
  }, [employees, searchTerm, activeTab]);

  // Update filtered employees when filter changes
  useEffect(() => {
    setFilteredEmployees(filterEmployees);
  }, [filterEmployees]);

  // Update available count when employees change
  useEffect(() => {
    const availableCount = employees.filter(e => !e.isAssigned).length;
    setStats(prev => ({ ...prev, availableEmployees: availableCount }));
  }, [employees]);

  // Callbacks
  const handleViewDetails = useCallback((userId) => {
    setSelectedUserId(userId);
    setProfileModalOpen(true);
  }, []);

  // Preload user profile on hover
  const handleEmployeeHover = useCallback((userId) => {
    if (userId) {
      preloadUserProfile(userId);
    }
  }, [preloadUserProfile]);

  const handleSort = useCallback((type) => {
    let sorted = [...filteredEmployees];
    
    switch (type) {
      case "nameAsc":
        sorted.sort((a, b) => `${a.name} ${a.last_name}`.localeCompare(`${b.name} ${b.last_name}`));
        break;
      case "nameDesc":
        sorted.sort((a, b) => `${b.name} ${b.last_name}`.localeCompare(`${a.name} ${a.last_name}`));
        break;
      case "assignmentAsc":
        sorted.sort((a, b) => a.assignment - b.assignment);
        break;
      case "assignmentDesc":
        sorted.sort((a, b) => b.assignment - a.assignment);
        break;
      default:
        break;
    }
    
    setFilteredEmployees(sorted);
    setSortAnchorEl(null);
  }, [filteredEmployees]);

  const handleEmployeeAdded = useCallback(async () => {
    setSnackbar({
      open: true,
      message: "Employee added successfully! Refreshing data...",
      severity: "success"
    });
    
    // Invalidate cache
    employeeCache.delete('profiles-data');
    
    // Refresh data
    setLoading(true);
    const newEmployeeData = await fetchEmployeeData();
    setEmployees(newEmployeeData);
    setLoading(false);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
        stiffness: 100
      }
    }
  };

  return (
    <Box sx={{ 
      p: 2, 
      width: "100%",
      boxSizing: "border-box",
      maxWidth: "100vw",
      minHeight: '100vh'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3 
      }}>
        <Typography variant="h4" fontWeight={600} sx={{ color: darkMode ? '#ffffff' : 'inherit' }}>
          Employee Profiles
        </Typography>
        
        {isReviewer && (
          <Zoom in={animateIn} timeout={600}>
            <Button
                variant="contained"
                startIcon={isSmallScreen ? null : <AssessmentIcon />}
                onClick={() => setReviewCertificationsOpen(true)}
                sx={{ 
                  borderRadius: 6,
                  textTransform: "none",
                  fontWeight: 500,
                  py: 1,
                  px: isSmallScreen ? 1.5 : 2,
                  minWidth: isSmallScreen ? (isExtraSmallScreen ? "40px" : "auto") : "160px",
                  backgroundColor: accentureColors.corePurple1,
                  "&:hover": {
                    backgroundColor: accentureColors.corePurple2,
                  },
                  "&:active": {
                    backgroundColor: accentureColors.corePurple3,
                  },
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                {isSmallScreen ? <AssessmentIcon /> : "Review Certifications"}
              </Button>
            </Zoom>
          )}
        </Box>
      
      {/* Animated Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Grow in={animateIn} timeout={600}>
            <Box>
              {statsLoading ? (
                <StatCardSkeleton darkMode={darkMode} />
              ) : (
                <StatCard 
                  icon={PersonOutlineIcon} 
                  title="Total Employees" 
                  value={stats.totalEmployees || 0} 
                  bgColor={darkMode ? accentureColors.corePurple1 + "30" : accentureColors.corePurple1 + "20"} 
                  darkMode={darkMode}
                />
              )}
            </Box>
          </Grow>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Grow in={animateIn} timeout={800}>
            <Box>
              {statsLoading ? (
                <StatCardSkeleton darkMode={darkMode} />
              ) : (
                <StatCard 
                  icon={GroupIcon} 
                  title="Available Employees" 
                  value={stats.availableEmployees || 0} 
                  bgColor={darkMode ? "#2196f330" : "#2196f320"} 
                  darkMode={darkMode}
                />
              )}
            </Box>
          </Grow>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Grow in={animateIn} timeout={1000}>
            <Box>
              {statsLoading ? (
                <StatCardSkeleton darkMode={darkMode} />
              ) : (
                <StatCard 
                  icon={WorkIcon} 
                  title="Active Projects" 
                  value={stats.activeProjects || 0} 
                  bgColor={darkMode ? "#4caf5030" : "#4caf5020"} 
                  darkMode={darkMode}
                />
              )}
            </Box>
          </Grow>
        </Grid>
      </Grid>
      
      {/* Search Filter with animation */}
      <Fade in={animateIn} timeout={1200}>
        <Box>
          <SearchFilter 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onFilterClick={(e) => setFilterAnchorEl(e.currentTarget)}
            onSortClick={(e) => setSortAnchorEl(e.currentTarget)}
            onClearFilters={() => {
              setSearchTerm("");
              setActiveTab("all");
            }}
            availableCount={stats.availableEmployees}
            onAddEmployee={handleEmployeeAdded}
            darkMode={darkMode}
          />
        </Box>
      </Fade>
      
      {/* Results count */}
      <Fade in={!loading} timeout={600}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary' }}>
            Showing {filteredEmployees.length} of {stats.totalEmployees || 0} employees
          </Typography>
        </Box>
      </Fade>
      
      {/* Animated Employee List */}
      {loading ? (
        <Grid container spacing={2}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Fade in={true} timeout={300 * (index + 1)}>
                <Box>
                  <EmployeeCardSkeleton darkMode={darkMode} />
                </Box>
              </Fade>
            </Grid>
          ))}
        </Grid>
      ) : filteredEmployees.length > 0 ? (
        <AnimatePresence>
          <MotionBox
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={2}>
              {filteredEmployees.map((employee, index) => (
                <MotionGrid
                  item 
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={employee.user_id}
                  variants={itemVariants}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  <Box 
                    sx={{ 
                      transform: 'scale(1)',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.01)',
                      }
                    }}
                    onMouseEnter={() => handleEmployeeHover(employee.user_id)}
                  >
                    <EmployeeCardAnimated 
                      employee={employee} 
                      onViewDetails={() => handleViewDetails(employee.user_id)}
                      onHover={() => handleEmployeeHover(employee.user_id)}
                      darkMode={darkMode}
                    />
                  </Box>
                </MotionGrid>
              ))}
            </Grid>
          </MotionBox>
        </AnimatePresence>
      ) : (
        <Fade in={true} timeout={600}>
          <Paper 
            sx={{ 
              p: 5, 
              textAlign: 'center', 
              borderRadius: 2,
              borderStyle: 'dashed',
              borderWidth: 1,
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'divider',
              backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
              border: darkMode ? '1px dashed rgba(255, 255, 255, 0.2)' : '1px dashed rgba(0, 0, 0, 0.12)'
            }}
          >
            <Typography variant="h6" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary' }} gutterBottom>
              No employees found
            </Typography>
            <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'text.secondary' }}>
              Try adjusting your search criteria or clear the filters
            </Typography>
          </Paper>
        </Fade>
      )}
      
      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
        PaperProps={{
          sx: {
            backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
          }
        }}
      >
        <MenuItem onClick={() => handleSort("nameAsc")}>Name (A-Z)</MenuItem>
        <MenuItem onClick={() => handleSort("nameDesc")}>Name (Z-A)</MenuItem>
        <MenuItem onClick={() => handleSort("assignmentAsc")}>Assignment (Low-High)</MenuItem>
        <MenuItem onClick={() => handleSort("assignmentDesc")}>Assignment (High-Low)</MenuItem>
      </Menu>
      
      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
        PaperProps={{
          sx: {
            backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
          }
        }}
      >
        <MenuItem onClick={() => setFilterAnchorEl(null)}>All Roles</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Developers</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Designers</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Other Roles</MenuItem>
      </Menu>
      
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Review Certifications Modal */}
      <ReviewCertifications 
        open={reviewCertificationsOpen} 
        onClose={() => setReviewCertificationsOpen(false)} 
        darkMode={darkMode}
      />
      
      {/* User Profile Modal */}
      {profileModalOpen && (
        <UserProfileDetail 
          userId={selectedUserId}
          isModal={true}
          cachedData={getUserProfile(selectedUserId)}
          onClose={() => {
            setProfileModalOpen(false);
            setSelectedUserId(null);
          }}
          darkMode={darkMode}
        />
      )}
    </Box>
  );
};

export default Profiles;
