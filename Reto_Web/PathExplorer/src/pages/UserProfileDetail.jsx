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
  useTheme,
  alpha,
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

// Import the new UserSkillsDisplay component
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
        
        // Process and set data
        setUserData({
          id: user.user_id,
          fullName: `${user.name || ''} ${user.last_name || ''}`.trim(),
          phone: user.phone || "Not provided",
          email: user.mail || "Not provided",
          level: user.level || 1,
          joinDate: formatDate(user.join_date) || "Not provided",
          lastProjectDate: formatDate(user.last_project_date) || "Not provided",
          about: user.about || "No information provided.",
          profilePic: user.profile_pic,
          position: user.position || "Employee",
          availability: user.availability || "Available",
          assignment: calculateAssignment(userRoles) || 0
        });
        
        // Process projects
        setProjects(userRoles.map(role => ({
          role: role.role_name,
          title: role.Project?.title || "Unknown Project",
          status: role.Project?.status || "Unknown",
          startDate: formatDate(role.Project?.start_date),
          endDate: formatDate(role.Project?.end_date)
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
        
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user profile. Please try again later.");
        // Set some fallback data
        setUserData({
          fullName: "User Not Found",
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
  
  const handleEditProfile = () => {
    navigate(`/edit-profile/${profileUserId}`);
  };
  
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
  
  // Render the profile content
  const renderProfileContent = () => (
    <Box sx={{ p: isModal ? 0 : 2 }}>
      {/* Banner and Avatar */}
      <Paper
        sx={{
          position: "relative",
          height: 220,
          width: "100%",
          mb: 3,
          borderRadius: 2,
          overflow: "hidden"
        }}
      >
        {/* Purple Banner Background */}
        <Box 
          sx={{ 
            height: 180, 
            width: "100%",
            background: "linear-gradient(135deg, #973EBC 0%, #7500c0 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Optional: Background pattern for the banner */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')",
              backgroundSize: "300px",
              zIndex: 1,
            }}
          />
        </Box>

        {/* White Bottom Section */}
        <Box
          sx={{
            height: "50px",
            bgcolor: "#ffffff",
            position: "absolute",
            bottom: 0,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: 3,
          }}
        >
          {/* Availability Chip */}
          <Chip 
            label={userData?.availability || "Available"} 
            size="small"
            sx={{ 
              borderRadius: "16px",
              bgcolor: userData?.availability === "Available" ? "#4caf50" : "#ff9800",
              color: "white",
              fontWeight: 500,
              height: "24px",
              fontSize: "0.75rem"
            }} 
          />
        </Box>
        
        {/* Avatar - Positioned to overlap between banner and white section */}
        <Avatar
          src={userData?.profilePic}
          alt={userData?.fullName}
          sx={{
            position: "absolute",
            bottom: 20,
            left: 40,
            width: 100,
            height: 100,
            border: "4px solid #ffffff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            zIndex: 10,
          }}
        >
          {!userData?.profilePic && userData?.fullName?.charAt(0)}
        </Avatar>
        
        {/* Name and Title - Positioned beside the avatar */}
        <Box
          sx={{
            position: "absolute",
            left: 160,
            bottom: 50,
            color: "#ffffff",
            zIndex: 5,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            {userData?.fullName}
          </Typography>
          <Typography variant="subtitle1">
            {userData?.position}
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Left column: Basic info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Information
            </Typography>
            
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Person sx={{ color: "primary.main", mr: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1">{userData?.fullName}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Phone sx={{ color: "primary.main", mr: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{userData?.phone}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Email sx={{ color: "primary.main", mr: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{userData?.email}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Star sx={{ color: "primary.main", mr: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Level</Typography>
                  <Typography variant="body1">Level {userData?.level}/12</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CalendarToday sx={{ color: "primary.main", mr: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Joined</Typography>
                  <Typography variant="body1">{userData?.joinDate}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Work sx={{ color: "primary.main", mr: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Last Project</Typography>
                  <Typography variant="body1">{userData?.lastProjectDate}</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
          
          {/* Assignment percentage */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Assignment
            </Typography>
            
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 2 }}>
              <Box sx={{ position: "relative", display: "inline-flex" }}>
                <CircularProgress
                  variant="determinate"
                  value={userData?.assignment || 0}
                  size={100}
                  thickness={5}
                  sx={{
                    color: userData?.assignment > 0 ? "warning.main" : "success.main",
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    },
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h6" component="div" fontWeight="bold">
                    {`${userData?.assignment}%`}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Typography align="center" variant="body2" color="text.secondary" mt={2}>
              {userData?.assignment > 0 
                ? "Currently assigned to projects" 
                : "Available for new projects"}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Right column: Extended info */}
        <Grid item xs={12} md={8}>
          {/* About section */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              About
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
              {userData?.about}
            </Typography>
          </Paper>
          
          {/* Skills section - Now using the new UserSkillsDisplay component */}
          <Box sx={{ mb: 3 }}>
            <UserSkillsDisplay userId={profileUserId} />
          </Box>
          
          {/* Certifications & Projects */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  mb: 3, 
                  height: '100%',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Typography variant="h6" fontWeight="bold" mb={2} display="flex" alignItems="center">
                  <School sx={{ mr: 1 }} /> Certifications
                </Typography>
                
                {certifications.length > 0 ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {certifications.map((cert, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          p: 2, 
                          borderRadius: 1, 
                          bgcolor: '#f9f9f9'
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight="bold">
                          {cert.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Issuer: {cert.issuer}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Completed: {cert.completedDate}
                        </Typography>
                        <Chip 
                          label={`Score: ${cert.score}%`} 
                          size="small"
                          sx={{ 
                            mt: 1, 
                            bgcolor: alpha('#973EBC', 0.1),
                            color: '#333333',
                            fontWeight: 500
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    No certifications listed
                  </Typography>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  mb: 3, 
                  height: '100%',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Typography variant="h6" fontWeight="bold" mb={2} display="flex" alignItems="center">
                  <Work sx={{ mr: 1 }} /> Projects
                </Typography>
                
                {projects.length > 0 ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {projects.map((project, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          p: 2, 
                          borderRadius: 1, 
                          bgcolor: alpha('#007ACC', 0.04),
                          border: '1px solid',
                          borderColor: alpha('#007ACC', 0.12),
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight="bold">
                          {project.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Role: {project.role}
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Started: {project.startDate}
                          </Typography>
                          <Chip 
                            label={project.status} 
                            size="small"
                            sx={{ 
                              height: 20, 
                              fontSize: '0.6rem',
                              bgcolor: project.status === "Completed" ? alpha('#4caf50', 0.15) : alpha('#007ACC', 0.15),
                              color: project.status === "Completed" ? '#2e7d32' : '#005a9c',
                              border: '1px solid',
                              borderColor: project.status === "Completed" ? alpha('#4caf50', 0.3) : alpha('#007ACC', 0.3),
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    No projects listed
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
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
        <DialogContent dividers sx={{ p: 3 }}>
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
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", mb: 3 }}>
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

export default UserProfileDetail;