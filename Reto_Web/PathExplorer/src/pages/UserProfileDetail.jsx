import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useTheme,
  alpha,
  Skeleton,
  AvatarGroup,
} from "@mui/material";
import {
  Person,
  Phone,
  Email,
  Star,
  CalendarToday,
  Work,
  School,
  ArrowBack,
  Close,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useDarkMode } from "../contexts/DarkModeContext";

const UserProfileDetail = ({ userId, isModal = false, onClose, cachedData = null }) => {
  const theme = useTheme();
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();
  const params = useParams();
  const { role } = useAuth();
  
  // Use userId from props or from URL params
  const profileUserId = userId || params.id;
  
  // Initialize with cached data if available
  const [data, setData] = useState(cachedData || {
    userData: null,
    projects: [],
    certifications: [],
    skills: [],
    teamMembers: {}
  });
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we have cached data, use it
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    // Otherwise fetch data (fallback for direct navigation)
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // This would be the same fetching logic from the original component
        // But ideally this path should rarely be hit if caching is working
        console.warn("Fetching user data without cache - this should be preloaded");
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (profileUserId && !cachedData) {
      fetchUserData();
    }
  }, [profileUserId, cachedData]);
  
  const handleBack = () => {
    if (isModal) {
      onClose();
    } else {
      navigate(-1);
    }
  };
  
  // Get initials for avatar
  const getInitials = () => {
    if (data.userData?.firstName && data.userData?.lastName) {
      return `${data.userData.firstName.charAt(0)}${data.userData.lastName.charAt(0)}`.toUpperCase();
    } else if (data.userData?.firstName) {
      return data.userData.firstName.charAt(0).toUpperCase();
    }
    return "U";
  };
  
  // Render the profile content with animations
  const renderProfileContent = () => (
    <UserDataContext.Provider value={{ ...data, loading, formatDate, darkMode }}>
      <Box
        sx={{
          p: isModal ? 1 : { xs: 2, md: 3 },
          minHeight: isModal ? "auto" : "calc(100vh - 60px)",
          width: "100%",
          backgroundColor: darkMode ? '#121212' : "#f8f9fa",
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <BannerProfile />
            </Grid>

            {/* Left Section */}
            <Grid item xs={12} md={4} lg={3}>
              <Information />
              <AssignmentPercentage />
            </Grid>

            {/* Right Section */}
            <Grid item xs={12} md={8} lg={9}>
              <About />
              <SkillsCard />
              <CertificationsCard />
              <PastProjectsCard />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </UserDataContext.Provider>
  );
  
  // If rendering as a modal
  if (isModal) {
    return (
      <Dialog 
        open={true} 
        onClose={onClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh',
            bgcolor: darkMode ? '#1e1e1e' : 'background.paper',
            backgroundImage: 'none',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
          }
        }}
      >
        <DialogTitle sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Typography variant="h6" sx={{ color: darkMode ? '#ffffff' : 'inherit' }}>Employee Profile</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : (
            renderProfileContent()
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }
  
  // If rendering as a standalone page
  return (
    <Box sx={{ maxWidth: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", p: 2 }}>
        <Button
          variant="text"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : "text.secondary" }}
        >
          Back
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography color="error">{error}</Typography>
          <Button variant="outlined" onClick={handleBack} sx={{ mt: 2 }}>
            Go Back
          </Button>
        </Box>
      ) : (
        renderProfileContent()
      )}
    </Box>
  );
};

// Context for sharing user data
const UserDataContext = React.createContext();
const useUserData = () => React.useContext(UserDataContext);

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return "Not set";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch (error) {
    return dateString;
  }
};

// Banner component
const BannerProfile = () => {
  const theme = useTheme();
  const { userData, loading, darkMode } = useUserData();

  if (loading) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          position: "relative", 
          height: { xs: 180, sm: 220 }, 
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: darkMode ? '#1e1e1e' : "#FFF",
          boxShadow: darkMode ? "0 1px 2px rgba(255,255,255,0.04)" : "0 1px 2px rgba(0,0,0,0.04)",
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
        }}
      >
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Paper>
    );
  }

  const bannerGradient = `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha("#7500c0", 0.9)} 100%)`;

  return (
    <Paper
      elevation={0}
      sx={{
        position: "relative",
        height: { xs: 180, sm: 220 },
        width: "100%",
        background: bannerGradient,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        p: 3,
        overflow: "hidden",
        borderRadius: 2,
        boxShadow: darkMode ? "0 4px 12px rgba(255,255,255,0.05)" : "0 4px 12px rgba(0,0,0,0.05)",
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
      }}
    >
      <Box
        sx={{
          position: "absolute",
          bottom: 24,
          left: 24,
          display: "flex",
          alignItems: "center",
          zIndex: 3,
        }}
      >
        <Avatar
          src={userData?.profilePic}
          sx={{ 
            width: { xs: 72, sm: 84 }, 
            height: { xs: 72, sm: 84 }, 
            border: darkMode ? "3px solid #1e1e1e" : "3px solid white",
            boxShadow: darkMode ? "0 2px 10px rgba(255,255,255,0.1)" : "0 2px 10px rgba(0,0,0,0.1)",
            bgcolor: "#460073",
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
            fontWeight: 500,
          }}
        >
          {getInitials()}
        </Avatar>
        <Box sx={{ ml: 2, color: "white" }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 500,
              fontSize: { xs: '1.25rem', sm: '1.4rem' }
            }}
          >
            {userData?.fullName}
          </Typography>
          <Typography 
            variant="body1"
            sx={{
              opacity: 0.9,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            {userData?.position}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 3,
          backgroundColor: userData?.availability === "Available" ? "#4caf50" : "#ff9800",
          color: "white",
          px: 1.5,
          py: 0.5,
          borderRadius: "16px",
          fontSize: "0.75rem",
          fontWeight: 500,
          letterSpacing: "0.2px",
          border: `1px solid ${userData?.availability === "Available" ? "#4caf50" : "#ff9800"}`,
        }}
      >
        {userData?.availability}
      </Box>
    </Paper>
  );
};

// Information component
const Information = () => {
  const theme = useTheme();
  const { userData, loading, darkMode } = useUserData();

  if (loading) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 2.5, 
          mb: 2, 
          display: "flex", 
          flexDirection: "column", 
          gap: 1.5,
          borderRadius: 2,
          boxShadow: darkMode ? "0 2px 10px rgba(255,255,255,0.04)" : "0 2px 10px rgba(0,0,0,0.04)",
          bgcolor: darkMode ? '#1e1e1e' : "#FFF",
          width: "100%",
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
        }}
      >
        <Skeleton variant="text" width="40%" height={24} />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="50%" />
        <Skeleton variant="text" width="65%" />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{ 
        p: 2.5, 
        mb: 2, 
        display: "flex", 
        flexDirection: "column", 
        gap: 1.5,
        borderRadius: 2,
        boxShadow: darkMode ? "0 2px 10px rgba(255,255,255,0.04)" : "0 2px 10px rgba(0,0,0,0.04)",
        bgcolor: darkMode ? '#1e1e1e' : "#FFF",
        width: "100%",
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          fontSize: "1rem", 
          fontWeight: 600, 
          mb: 0.5, 
          color: darkMode ? '#ffffff' : theme.palette.primary.main
        }}
      >
        Information
      </Typography>

      <Divider sx={{ my: 0.5 }} />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Person 
          sx={{ 
            color: alpha(theme.palette.primary.main, 0.7),
            fontSize: "1.1rem"
          }} 
        />
        <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'inherit' }}>{userData?.fullName}</Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Phone 
          sx={{ 
            color: alpha(theme.palette.primary.main, 0.7),
            fontSize: "1.1rem"
          }} 
        />
        <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'inherit' }}>{userData?.phone}</Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Email 
          sx={{ 
            color: alpha(theme.palette.primary.main, 0.7),
            fontSize: "1.1rem"
          }} 
        />
        <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'inherit' }}>{userData?.email}</Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Star 
          sx={{ 
            color: alpha(theme.palette.primary.main, 0.7),
            fontSize: "1.1rem"
          }} 
        />
        <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'inherit' }}>
          Level: {userData?.level}/12
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <CalendarToday 
          sx={{ 
            color: alpha(theme.palette.primary.main, 0.7),
            fontSize: "1.1rem"
          }} 
        />
        <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'inherit' }}>
          Joined: {userData?.joinDate}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Work 
          sx={{ 
            color: alpha(theme.palette.primary.main, 0.7),
            fontSize: "1.1rem"
          }} 
        />
        <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'inherit' }}>
          Last Project: {userData?.lastProjectDate}
        </Typography>
      </Box>
    </Paper>
  );
};

// Assignment percentage component
const AssignmentPercentage = () => {
  const theme = useTheme();
  const { userData, loading, darkMode } = useUserData();
  const [progress, setProgress] = useState(0);

  React.useEffect(() => {
    if (!loading && userData?.assignment !== undefined) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= userData.assignment) {
            clearInterval(interval);
            return userData.assignment;
          }
          return prev + 2;
        });
      }, 20);

      return () => clearInterval(interval);
    }
  }, [userData?.assignment, loading]);

  if (loading) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 2.5, 
          mb: 2, 
          display: "flex", 
          flexDirection: "column", 
          gap: 1.5,
          borderRadius: 2,
          boxShadow: darkMode ? "0 2px 10px rgba(255,255,255,0.04)" : "0 2px 10px rgba(0,0,0,0.04)",
          bgcolor: darkMode ? '#1e1e1e' : "#FFF",
          width: "100%",
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
        }}
      >
        <Skeleton variant="text" width="60%" height={24} />
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Skeleton variant="circular" width={80} height={80} />
        </Box>
      </Paper>
    );
  }

  const progressColor = theme.palette.primary.main;

  return (
    <Paper
      elevation={0}
      sx={{ 
        p: 2.5, 
        mb: 2, 
        display: "flex", 
        flexDirection: "column", 
        gap: 1.5,
        borderRadius: 2,
        boxShadow: darkMode ? "0 2px 10px rgba(255,255,255,0.04)" : "0 2px 10px rgba(0,0,0,0.04)",
        bgcolor: darkMode ? '#1e1e1e' : "#FFF",
        width: "100%",
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          fontSize: "1rem", 
          fontWeight: 600, 
          mb: 0.5,
          color: darkMode ? '#ffffff' : theme.palette.primary.main
        }}
      >
        Assignment Percentage
      </Typography>

      <Divider sx={{ my: 0.5 }} />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          my: 1.5
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "inline-flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress
            variant="determinate"
            value={100}
            size={90}
            sx={{ 
              color: alpha(theme.palette.primary.main, 0.1),
              position: "absolute"
            }}
          />

          <CircularProgress 
            variant="determinate" 
            value={progress} 
            size={90} 
            sx={{ 
              color: progressColor
            }}
          />

          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography 
              variant="h5" 
              fontWeight="500"
              sx={{ color: progressColor }}
            >
              {`${progress}%`}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

// About component
const About = () => {
  const theme = useTheme();
  const { userData, loading, darkMode } = useUserData();

  if (loading) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 2.5, 
          mb: 2,
          display: "flex", 
          flexDirection: "column", 
          gap: 1.5,
          borderRadius: 2,
          boxShadow: darkMode ? "0 2px 10px rgba(255,255,255,0.04)" : "0 2px 10px rgba(0,0,0,0.04)",
          bgcolor: darkMode ? '#1e1e1e' : "#FFF",
          width: "100%",
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
        }}
      >
        <Skeleton variant="text" width="30%" height={24} />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{ 
        p: 2.5, 
        mb: 2, 
        display: "flex", 
        flexDirection: "column", 
        gap: 1.5, 
        borderRadius: 2,
        boxShadow: darkMode ? "0 2px 10px rgba(255,255,255,0.04)" : "0 2px 10px rgba(0,0,0,0.04)",
        bgcolor: darkMode ? '#1e1e1e' : "#FFF",
        width: "100%",
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          fontSize: "1rem", 
          fontWeight: 600, 
          mb: 0.5,
          color: darkMode ? '#ffffff' : theme.palette.primary.main
        }}
      >
        About
      </Typography>

      <Divider sx={{ my: 0.5 }} />

      <Box
        sx={{
          maxHeight: "250px",
          overflowY: "auto",
          pr: 1,
          pt: 0.5,
          '&::-webkit-scrollbar': { 
            width: '4px',
            borderRadius: '2px'
          },
          '&::-webkit-scrollbar-track': { 
            background: darkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F5',
            borderRadius: '2px'
          },
          '&::-webkit-scrollbar-thumb': { 
            background: darkMode ? 'rgba(255,255,255,0.2)' : alpha(theme.palette.primary.main, 0.3),
            borderRadius: '2px',
          },
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            lineHeight: 1.6,
            color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
          }}
        >
          {userData?.about || "No information available."}
        </Typography>
      </Box>
    </Paper>
  );
};

// Skills component
const SkillsCard = () => {
  const theme = useTheme();
  const { skills, loading, darkMode } = useUserData();

  if (loading) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 2.5, 
          mb: 2, 
          display: "flex", 
          flexDirection: "column", 
          gap: 1.5,
          borderRadius: 2,
          boxShadow: darkMode ? "0 2px 10px rgba(255,255,255,0.04)" : "0 2px 10px rgba(0,0,0,0.04)",
          bgcolor: darkMode ? '#1e1e1e' : "#FFF",
          width: "100%",
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
        }}
      >
        <Skeleton variant="text" width="40%" height={24} />
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Skeleton variant="rounded" width={80} height={28} />
          <Skeleton variant="rounded" width={100} height={28} />
          <Skeleton variant="rounded" width={60} height={28} />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{ 
        p: 2.5, 
        mb: 2, 
        display: "flex", 
        flexDirection: "column", 
        gap: 1.5,
        borderRadius: 2,
        boxShadow: darkMode ? "0 2px 10px rgba(255,255,255,0.04)" : "0 2px 10px rgba(0,0,0,0.04)",
        bgcolor: darkMode ? '#1e1e1e' : "#FFF",
        width: "100%",
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          fontSize: "1rem", 
          fontWeight: 600, 
          mb: 0.5,
          color: darkMode ? '#ffffff' : theme.palette.primary.main
        }}
      >
        Skills
      </Typography>

      <Divider sx={{ my: 0.5 }} />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, pt: 0.5 }}>
        {skills.length > 0 ? (
          skills.map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              size="small"
              sx={{
                backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.15)' : alpha(theme.palette.primary.light, 0.15),
                color: darkMode ? '#a67aff' : theme.palette.primary.main,
                borderRadius: 10,
                height: 28,
                fontWeight: 500,
                border: darkMode ? '1px solid rgba(161, 0, 255, 0.3)' : `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            />
          ))
        ) : (
          <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary' }}>No skills added yet</Typography>
        )}
      </Box>
    </Paper>
  );
};

// Certifications Card component
const CertificationsCard = () => {
  const theme = useTheme();
  const { certifications, loading, formatDate, darkMode } = useUserData();

  if (loading) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 2.5, 
          mb: 2, 
          display: "flex", 
          flexDirection: "column", 
          gap: 1.5,
          borderRadius: 2,
          boxShadow: darkMode ? "0 2px 10px rgba(255,255,255,0.04)" : "0 2px 10px rgba(0,0,0,0.04)",
          bgcolor: darkMode ? '#1e1e1e' : "#FFF",
          width: "100%",
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
        }}
      >
        <Skeleton variant="text" width="40%" height={24} />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Skeleton variant="rounded" width="100%" height={80} />
          <Skeleton variant="rounded" width="100%" height={80} />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2.5, 
        mb: 2, 
        display: "flex", 
        flexDirection: "column", 
        gap: 1.5,
        borderRadius: 2,
        boxShadow: darkMode ? "0 2px 10px rgba(255,255,255,0.04)" : "0 2px 10px rgba(0,0,0,0.04)",
        bgcolor: darkMode ? '#1e1e1e' : "#FFF",
        width: "100%",
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <School sx={{ color: theme.palette.primary.main, mr: 1.5 }} />
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: "1rem", 
            fontWeight: 600,
            color: darkMode ? '#ffffff' : theme.palette.primary.main
          }}
        >
          Certifications
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {certifications.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {certifications.slice(0, 3).map((cert, index) => (
            <Box 
              key={index} 
              sx={{ 
                p: 2, 
                borderRadius: 1.5, 
                bgcolor: darkMode ? 'rgba(161, 0, 255, 0.08)' : alpha(theme.palette.primary.main, 0.04),
                border: '1px solid',
                borderColor: darkMode ? 'rgba(161, 0, 255, 0.2)' : alpha(theme.palette.primary.main, 0.1)
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: darkMode ? '#ffffff' : theme.palette.text.primary }}>
                {cert.title}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1, color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary' }}>
                Issuer: {cert.issuer}
              </Typography>
              
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                <Box>
                  <Typography variant="caption" sx={{ display: "block", color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary' }}>
                    Completed: {cert.completedDate}
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block", color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary' }}>
                    Valid Until: {cert.validUntil}
                  </Typography>
                </Box>
                
                <Chip 
                  label={`Score: ${cert.score}%`} 
                  size="small"
                  sx={{ 
                    bgcolor: darkMode ? 'rgba(161, 0, 255, 0.15)' : alpha(theme.palette.primary.main, 0.1),
                    color: darkMode ? '#a67aff' : theme.palette.primary.main,
                    fontWeight: 500,
                    fontSize: "0.7rem",
                    height: "24px"
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ py: 3, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary' }}>
            No certifications found
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

// Past projects component
const PastProjectsCard = () => {
  const theme = useTheme();
  const { projects, loading, teamMembers, darkMode } = useUserData();

  if (loading) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 2.5, 
          width: "100%",
          borderRadius: 2,
          boxShadow: darkMode ? "0 2px 10px rgba(255,255,255,0.04)" : "0 2px 10px rgba(0,0,0,0.04)",
          bgcolor: darkMode ? '#1e1e1e' : "#FFF",
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
        }}
      >
        <Skeleton variant="text" width="40%" height={24} />
        <Skeleton variant="rectangular" width="100%" height={150} sx={{ mt: 2, borderRadius: 1 }} />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{ 
        p: 2.5, 
        overflow: "auto", 
        width: "100%",
        borderRadius: 2,
        boxShadow: darkMode ? "0 2px 10px rgba(255,255,255,0.04)" : "0 2px 10px rgba(0,0,0,0.04)",
        bgcolor: darkMode ? '#1e1e1e' : "#FFF",
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          fontSize: "1rem", 
          fontWeight: 600, 
          mb: 1,
          color: darkMode ? '#ffffff' : theme.palette.primary.main
        }}
      >
        Past Projects
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {projects.length > 0 ? (
        <Box 
          sx={{ 
            overflowX: "auto",
            width: "100%",
            '&::-webkit-scrollbar': { 
              height: '4px',
              borderRadius: '2px'
            },
            '&::-webkit-scrollbar-track': { 
              background: darkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F5',
              borderRadius: '2px'
            },
            '&::-webkit-scrollbar-thumb': { 
              background: darkMode ? 'rgba(255,255,255,0.2)' : alpha(theme.palette.primary.main, 0.3),
              borderRadius: '2px',
            },
          }}
        >
          <Table
            sx={{ 
              tableLayout: "fixed", 
              width: "100%",
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
              borderRadius: 1,
              borderCollapse: 'separate',
              borderSpacing: 0,
              overflow: 'hidden',
              '& .MuiTableCell-root': {
                borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                borderRight: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'inherit',
                py: 1.5,
                px: 2,
                '&:last-child': {
                  borderRight: 'none'
                }
              },
              '& tr:last-child .MuiTableCell-root': {
                borderBottom: 'none'
              },
              '& .MuiTableCell-head': {
                fontWeight: 600,
                color: darkMode ? '#ffffff' : theme.palette.primary.main,
                backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.08)' : alpha(theme.palette.primary.main, 0.05)
              }
            }}
            size="small"
          >
            <TableHead>
              <TableRow>
                {["Title", "Team", "Role", "Status"].map(
                  (header, index) => (
                    <TableCell key={index}>
                      {header}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {projects.map((project, index) => (
                <TableRow 
                  key={index}
                  sx={{
                    '&:hover': {
                      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.02)' : alpha(theme.palette.primary.main, 0.02)
                    },
                    '&:last-child td': {
                      borderBottom: 0
                    }
                  }}
                >
                  <TableCell>
                    {project.title}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AvatarGroup
                        max={3}
                        sx={{
                          "& .MuiAvatar-root": {
                            width: 24,
                            height: 24,
                            fontSize: "0.75rem",
                            bgcolor: darkMode ? '#a67aff' : theme.palette.primary.main,
                            border: darkMode ? '1px solid #1e1e1e' : '1px solid white'
                          },
                        }}
                      >
                        {(teamMembers[project.project_id] || []).map((member, i) => (
                          <Avatar
                            key={i}
                            src={member.avatar}
                            alt={member.name}
                            sx={{
                              width: 24,
                              height: 24
                            }}
                          />
                        ))}
                      </AvatarGroup>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {project.role}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={project.status}
                      size="small"
                      sx={{
                        backgroundColor: 
                          project.status === "In Progress" ? alpha("#ff9800", 0.15) :
                          project.status === "Completed" ? alpha("#4caf50", 0.15) : 
                          alpha(theme.palette.primary.light, 0.15),
                        color: 
                          project.status === "In Progress" ? "#e65100" :
                          project.status === "Completed" ? "#2e7d32" : 
                          theme.palette.primary.main,
                        height: 24,
                        fontSize: "0.7rem",
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ) : (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary' }}>
            No past projects found.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

// Helper function to get initials
const getInitials = () => {
  const { userData } = useUserData();
  if (userData?.firstName && userData?.lastName) {
    return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase();
  } else if (userData?.firstName) {
    return userData.firstName.charAt(0).toUpperCase();
  }
  return "U";
};

export default UserProfileDetail;