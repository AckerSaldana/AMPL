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
  AvatarGroup
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
  Edit,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import useAuth from "../hooks/useAuth";

// Import the UserSkillsDisplay component
import UserSkillsDisplay from "../components/UserSkillsDisplay";

const UserProfileDetail = ({ userId, isModal = false, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams();
  const { role } = useAuth();
  
  // Use userId from props or from URL params
  const profileUserId = userId || params.id;
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [skills, setSkills] = useState([]);
  const [teamMembers, setTeamMembers] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch basic user data
        const { data: user, error: userError } = await supabase
          .from("User")
          .select("*")
          .eq("user_id", profileUserId)
          .single();
          
        if (userError) throw userError;
        
        // Fetch user projects
        const { data: userRoles, error: rolesError } = await supabase
          .from("UserRole")
          .select("role_name, project_id, Project(title, status, start_date, end_date)")
          .eq("user_id", profileUserId);
          
        if (rolesError) throw rolesError;
        
        // Fetch user certifications
        const { data: userCerts, error: certsError } = await supabase
          .from("UserCertifications")
          .select("certification_ID, completed_Date, valid_Until, score, Certifications(title, issuer, type)")
          .eq("user_ID", profileUserId);
          
        if (certsError) throw certsError;
        
        // Fetch user skills
        const { data: userSkills, error: skillsError } = await supabase
          .from("UserSkill")
          .select("skill_ID(skill_ID, name)")
          .eq("user_ID", profileUserId);
        
        if (skillsError) throw skillsError;
        
        // Extract project IDs to fetch team members
        const projectIds = userRoles.map(role => role.project_id).filter(Boolean);
        
        // Fetch team members for each project
        if (projectIds.length > 0) {
          const { data: allTeamMembers, error: teamError } = await supabase
            .from("UserRole")
            .select("project_id, User:user_id(user_id, name, profile_pic)")
            .in("project_id", projectIds);
            
          if (!teamError && allTeamMembers) {
            // Group team members by project
            const teamByProject = {};
            allTeamMembers.forEach(({ project_id, User }) => {
              if (!teamByProject[project_id]) teamByProject[project_id] = [];
              if (User) {
                teamByProject[project_id].push({
                  name: User.name || "User",
                  avatar: User.profile_pic || "",
                });
              }
            });
            setTeamMembers(teamByProject);
          }
        }
        
        // Process and set data
        setUserData({
          id: user.user_id,
          fullName: `${user.name || ''} ${user.last_name || ''}`.trim(),
          firstName: user.name || '',
          lastName: user.last_name || '',
          phone: user.phone || "Not provided",
          email: user.mail || "Not provided",
          level: user.level || 1,
          joinDate: formatDate(user.enter_date) || "Not provided",
          lastProjectDate: formatDate(user.last_project_date) || "Not provided",
          about: user.about || "No information provided.",
          profilePic: user.profile_pic,
          position: user.position || "Employee",
          availability: user.availability || "Available",
          assignment: user.percentage || calculateAssignment(userRoles) || 0
        });
        
        // Process projects
        setProjects(userRoles.map(role => ({
          role: role.role_name,
          title: role.Project?.title || "Unknown Project",
          status: role.Project?.status || "Unknown",
          startDate: formatDate(role.Project?.start_date),
          endDate: formatDate(role.Project?.end_date),
          project_id: role.project_id
        })));
        
        // Process certifications
        setCertifications(userCerts.map(cert => ({
          title: cert.Certifications?.title || "Unknown Certification",
          issuer: cert.Certifications?.issuer || "Unknown",
          completedDate: formatDate(cert.completed_Date),
          validUntil: formatDate(cert.valid_Until),
          score: cert.score || 0,
          type: cert.Certifications?.type || "General"
        })));
        
        // Process skills
        setSkills(userSkills.map(item => item.skill_ID?.name).filter(Boolean));
        
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user profile. Please try again later.");
        // Set some fallback data
        setUserData({
          fullName: "User Not Found",
          firstName: "",
          lastName: "",
          phone: "-",
          email: "-",
          level: 1,
          joinDate: "-",
          lastProjectDate: "-",
          about: "Failed to load user profile.",
          profilePic: null,
          position: "Unknown",
          availability: "Unknown",
          assignment: 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (profileUserId) {
      fetchUserData();
    }
  }, [profileUserId]);
  
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
  
  // Helper function to calculate assignment percentage from projects
  const calculateAssignment = (userRoles) => {
    if (!userRoles || userRoles.length === 0) return 0;
    
    const activeProjects = userRoles.filter(role => 
      role.Project?.status === "In Progress" || 
      role.Project?.status === "New"
    );
    
    return activeProjects.length > 0 ? 100 : 0;
  };
  
  const handleBack = () => {
    if (isModal) {
      onClose();
    } else {
      navigate(-1);
    }
  };
  
  // Removing the edit profile functionality since this component is for viewing other profiles
  
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: isModal ? 400 : "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
        <Button variant="outlined" onClick={handleBack} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }
  
  // Get initials for avatar
  const getInitials = () => {
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase();
    } else if (userData?.firstName) {
      return userData.firstName.charAt(0).toUpperCase();
    }
    return "U";
  };
  
  // Render the profile content in ProfilePage style
  const renderProfileContent = () => (
    <UserDataContext.Provider value={{ userData, loading, projects, certifications, skills, teamMembers, formatDate }}>
      <Box
        sx={{
          p: isModal ? 1 : { xs: 2, md: 3 },
          minHeight: isModal ? "auto" : "calc(100vh - 60px)",
          width: "100%",
          backgroundColor: "#f8f9fa", // Light background from Accenture guidelines
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
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">User Profile</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {renderProfileContent()}
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
          sx={{ color: "text.secondary" }}
        >
          Back
        </Button>
      </Box>
      
      {renderProfileContent()}
    </Box>
  );
};

// Context for sharing user data
const UserDataContext = React.createContext();
const useUserData = () => React.useContext(UserDataContext);

// Banner component styled like ProfilePage
const BannerProfile = ({ onEdit }) => {
  const theme = useTheme();
  const { userData, loading } = useUserData();

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
          bgcolor: "#FFF",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
        }}
      >
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Paper>
    );
  }

  // Soft banner gradient background with Accenture's purple influence
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
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      {/* Profile Info */}
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
            border: "3px solid white",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            bgcolor: "#460073", // Core Purple 3 from Accenture guidelines
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

      {/* Availability Badge */}
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

      {/* Removed Edit Profile Button since this is for viewing other profiles */}
    </Paper>
  );
};

// Information component styled like ProfilePage
const Information = () => {
  const theme = useTheme();
  const { userData, loading } = useUserData();

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
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          bgcolor: "#FFF",
          width: "100%"
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
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        bgcolor: "#FFF",
        width: "100%"
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          fontSize: "1rem", 
          fontWeight: 600, 
          mb: 0.5, 
          color: theme.palette.primary.main // Accenture's purple for headings
        }}
      >
        Information
      </Typography>

      <Divider sx={{ my: 0.5 }} />

      {/* Full Name */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Person 
          sx={{ 
            color: alpha(theme.palette.primary.main, 0.7),
            fontSize: "1.1rem"
          }} 
        />
        <Typography variant="body2">{userData?.fullName}</Typography>
      </Box>

      {/* Phone */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Phone 
          sx={{ 
            color: alpha(theme.palette.primary.main, 0.7),
            fontSize: "1.1rem"
          }} 
        />
        <Typography variant="body2">{userData?.phone}</Typography>
      </Box>

      {/* Email */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Email 
          sx={{ 
            color: alpha(theme.palette.primary.main, 0.7),
            fontSize: "1.1rem"
          }} 
        />
        <Typography variant="body2">{userData?.email}</Typography>
      </Box>

      {/* Level */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Star 
          sx={{ 
            color: alpha(theme.palette.primary.main, 0.7),
            fontSize: "1.1rem"
          }} 
        />
        <Typography variant="body2">
          Level: {userData?.level}/12
        </Typography>
      </Box>

      {/* Join Date */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <CalendarToday 
          sx={{ 
            color: alpha(theme.palette.primary.main, 0.7),
            fontSize: "1.1rem"
          }} 
        />
        <Typography variant="body2">
          Joined: {userData?.joinDate}
        </Typography>
      </Box>

      {/* Last Project Date */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Work 
          sx={{ 
            color: alpha(theme.palette.primary.main, 0.7),
            fontSize: "1.1rem"
          }} 
        />
        <Typography variant="body2">
          Last Project: {userData?.lastProjectDate}
        </Typography>
      </Box>
    </Paper>
  );
};

// Assignment percentage component styled like ProfilePage
const AssignmentPercentage = () => {
  const theme = useTheme();
  const { userData, loading } = useUserData();
  const [progress, setProgress] = useState(0);

  React.useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= (userData?.assignment || 0)) {
            clearInterval(interval);
            return (userData?.assignment || 0);
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
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          bgcolor: "#FFF",
          width: "100%"
        }}
      >
        <Skeleton variant="text" width="60%" height={24} />
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Skeleton variant="circular" width={80} height={80} />
        </Box>
      </Paper>
    );
  }

  // Core Accenture purple color
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
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        bgcolor: "#FFF",
        width: "100%"
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          fontSize: "1rem", 
          fontWeight: 600, 
          mb: 0.5,
          color: theme.palette.primary.main
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
          {/* Outer Ring */}
          <CircularProgress
            variant="determinate"
            value={100}
            size={90}
            sx={{ 
              color: alpha(theme.palette.primary.main, 0.1),
              position: "absolute"
            }}
          />

          {/* Animated Progress */}
          <CircularProgress 
            variant="determinate" 
            value={progress} 
            size={90} 
            sx={{ 
              color: progressColor
            }}
          />

          {/* Percentage Text */}
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

// About component styled like ProfilePage
const About = () => {
  const theme = useTheme();
  const { userData, loading } = useUserData();

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
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          bgcolor: "#FFF",
          width: "100%"
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
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        bgcolor: "#FFF",
        width: "100%"
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          fontSize: "1rem", 
          fontWeight: 600, 
          mb: 0.5,
          color: theme.palette.primary.main
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
            background: '#F5F5F5',
            borderRadius: '2px'
          },
          '&::-webkit-scrollbar-thumb': { 
            background: alpha(theme.palette.primary.main, 0.3),
            borderRadius: '2px',
          },
        }}
      >
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            lineHeight: 1.6
          }}
        >
          {userData?.about || "No information available."}
        </Typography>
      </Box>
    </Paper>
  );
};

// Skills component styled like ProfilePage
const SkillsCard = () => {
  const theme = useTheme();
  const { skills, loading } = useUserData();

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
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          bgcolor: "#FFF",
          width: "100%"
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
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        bgcolor: "#FFF",
        width: "100%"
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          fontSize: "1rem", 
          fontWeight: 600, 
          mb: 0.5,
          color: theme.palette.primary.main // Accenture's purple
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
                backgroundColor: alpha(theme.palette.primary.light, 0.15),
                color: theme.palette.primary.main,
                borderRadius: 10,
                height: 28,
                fontWeight: 500,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">No skills added yet</Typography>
        )}
      </Box>
    </Paper>
  );
};

// Certifications Card component styled like ProfilePage
const CertificationsCard = () => {
  const theme = useTheme();
  const { certifications, loading, formatDate } = useUserData();

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
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          bgcolor: "#FFF",
          width: "100%"
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
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        bgcolor: "#FFF",
        width: "100%"
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <School sx={{ color: theme.palette.primary.main, mr: 1.5 }} />
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: "1rem", 
            fontWeight: 600,
            color: theme.palette.primary.main
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
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.1)
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: theme.palette.text.primary }}>
                {cert.title}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Issuer: {cert.issuer}
              </Typography>
              
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Completed: {cert.completedDate}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Valid Until: {cert.validUntil}
                  </Typography>
                </Box>
                
                <Chip 
                  label={`Score: ${cert.score}%`} 
                  size="small"
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
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
          <Typography variant="body2" color="text.secondary">
            You don't have any certifications yet
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

// Past projects component styled like ProfilePage
const PastProjectsCard = () => {
  const theme = useTheme();
  const { projects, loading, teamMembers } = useUserData();

  if (loading) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 2.5, 
          width: "100%",
          borderRadius: 2,
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          bgcolor: "#FFF"
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
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        bgcolor: "#FFF"
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          fontSize: "1rem", 
          fontWeight: 600, 
          mb: 1,
          color: theme.palette.primary.main
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
              background: '#F5F5F5',
              borderRadius: '2px'
            },
            '&::-webkit-scrollbar-thumb': { 
              background: alpha(theme.palette.primary.main, 0.3),
              borderRadius: '2px',
            },
          }}
        >
          <Table
            sx={{ 
              tableLayout: "fixed", 
              width: "100%",
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              borderRadius: 1,
              borderCollapse: 'separate',
              borderSpacing: 0,
              overflow: 'hidden',
              '& .MuiTableCell-root': {
                borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
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
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
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
                      backgroundColor: alpha(theme.palette.primary.main, 0.02)
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
                            bgcolor: theme.palette.primary.main,
                            border: '1px solid white'
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
          <Typography variant="body2" color="text.secondary">
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