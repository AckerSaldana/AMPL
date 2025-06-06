import React, { useState, useEffect, useMemo } from "react";
import { 
  Box, 
  Grid, 
  Skeleton,
  Paper, 
  Typography, 
  Avatar, 
  Chip, 
  CircularProgress,
  Button,
  AvatarGroup,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  alpha
} from "@mui/material";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";
import { useDarkMode } from "../contexts/DarkModeContext";
import { getDarkModeStyles } from "../styles/darkModeStyles";

// Icons
import {
  Person,
  Phone,
  Email,
  Star,
  CalendarToday,
  Work,
  Edit,
  School,
  ArrowForward
} from "@mui/icons-material";

// Context for sharing user data
const UserDataContext = React.createContext();
const useUserData = () => React.useContext(UserDataContext);

// Main component
const ProfilePage = () => {
  const theme = useTheme();
  const { darkMode } = useDarkMode();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    userInfo: {
      firstName: "",
      lastName: "",
      role: "",
      profilePic: "",
      fullName: "",
      phone: "",
      email: "",
      level: 0,
      joinDate: "",
      lastProjectDate: "",
      about: "",
      goals: ["", "", ""],
      percentage: 0,
      skills: [],
    },
    projects: []
  });
  const [certifications, setCertifications] = useState([]);
  const [certificationsLoading, setCertificationsLoading] = useState(true);

  useEffect(() => {
    const fetchAllUserData = async () => {
      try {
        setIsLoading(true);
        
        // 1. Get current user ID
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("Auth error:", userError?.message);
          return;
        }
        
        const userId = user.id;
        
        // 2. Fetch all needed data in parallel
        const [
          userInfoResponse,
          userRolesResponse,
          userSkillsResponse,
          userCertsResponse
        ] = await Promise.all([
          // Basic user info
          supabase
            .from("User")
            .select("user_id, name, last_name, mail, phone, level, enter_date, about, goals, percentage, profile_pic")
            .eq("user_id", userId)
            .single(),
            
          // Roles and projects
          supabase
            .from("UserRole")
            .select(`
              project_id, 
              role_name, 
              Project:project_id(projectID, title, start_date)
            `)
            .eq("user_id", userId),
            
          // Skills
          supabase
            .from("UserSkill")
            .select("skill_ID(skill_ID, name)")
            .eq("user_ID", userId),
            
          // Certifications
          supabase
            .from("UserCertifications")
            .select("certification_ID, completed_Date, valid_Until, score, Certifications(title, issuer, type)")
            .eq("user_ID", userId)
        ]);

        // Check for errors
        if (userInfoResponse.error) throw userInfoResponse.error;
        if (userRolesResponse.error) throw userRolesResponse.error;
        if (userSkillsResponse.error) throw userSkillsResponse.error;
        // Certification errors are handled separately

        // Process user data
        const userInfo = userInfoResponse.data;
        const userRoles = userRolesResponse.data || [];
        const userSkills = userSkillsResponse.data || [];
        
        // Process certifications
        if (!userCertsResponse.error && userCertsResponse.data) {
          const userCerts = userCertsResponse.data;
          const processedCerts = userCerts.map(cert => ({
            title: cert.Certifications?.title || "Unknown Certification",
            issuer: cert.Certifications?.issuer || "Unknown",
            completedDate: formatDate(cert.completed_Date),
            validUntil: formatDate(cert.valid_Until),
            score: cert.score || 0,
            type: cert.Certifications?.type || "General"
          }));
          setCertifications(processedCerts);
        } else {
          console.warn("Error fetching certifications:", userCertsResponse?.error);
          setCertifications([]);
        }
        setCertificationsLoading(false);
        
        // Extract skills
        const skills = userSkills.map(item => item.skill_ID.name).filter(Boolean);
        
        // Find primary role (first one in the list)
        const primaryRole = userRoles[0]?.role_name || "No role assigned";
        
        // Format join date
        const joinDate = userInfo.enter_date
          ? new Date(userInfo.enter_date).toLocaleDateString("en-US", {
              year: "numeric", month: "short", day: "numeric"
            })
          : "Unknown";
          
        // Find most recent project
        const projectsWithDates = userRoles
          .filter(role => role.Project?.start_date)
          .sort((a, b) => 
            new Date(b.Project.start_date).getTime() - new Date(a.Project.start_date).getTime()
          );
          
        const lastProjectDate = projectsWithDates[0]?.Project?.start_date
          ? new Date(projectsWithDates[0].Project.start_date).toLocaleDateString("en-US", {
              year: "numeric", month: "short", day: "numeric"
            })
          : "No recent project";
          
        // 3. Get team info and skills for past projects
        const projectIds = userRoles.map(r => r.project_id).filter(Boolean);
        
        let projects = [];
        
        if (projectIds.length > 0) {
          // Get all team members for these projects
          const { data: allTeamMembers } = await supabase
            .from("UserRole")
            .select("project_id, User:user_id(user_id, name, profile_pic)")
            .in("project_id", projectIds);
            
          // Get all skills for user's roles
          const roleNames = userRoles.map(r => r.role_name).filter(Boolean);
          
          // Only execute if there are roles
          let roleSkillsData = [];
          if (roleNames.length > 0) {
            const { data: roleSkills } = await supabase
              .from("RoleSkill")
              .select("role_name, skill_id, Skill:skill_id(name)")
              .in("role_name", roleNames);
              
            roleSkillsData = roleSkills || [];
          }
          
          // Group members by project
          const teamByProject = {};
          allTeamMembers?.forEach(({ project_id, User }) => {
            if (!teamByProject[project_id]) teamByProject[project_id] = [];
            if (User) {
              teamByProject[project_id].push({
                name: User.name || "User",
                avatar: User.profile_pic || "",
              });
            }
          });
          
          // Group skills by role
          const skillsByRole = {};
          roleSkillsData.forEach(({ role_name, Skill }) => {
            if (!skillsByRole[role_name]) skillsByRole[role_name] = [];
            if (Skill?.name) {
              skillsByRole[role_name].push(Skill.name);
            }
          });
          
          // Create project data
          projects = userRoles.map(({ project_id, role_name }) => {
            const projectInfo = userRoles.find(r => r.project_id === project_id)?.Project;
            return {
              title: projectInfo?.title || "Unnamed Project",
              team: teamByProject[project_id] || [],
              role: role_name || "Unknown Role",
              skills: skillsByRole[role_name] || [],
            };
          });
        }
        
        // Format first and last name
        const rawName = userInfo.name?.trim() || "";
        const rawLastName = userInfo.last_name?.trim() || "";
        const nameParts = rawName.split(" ");
        const lastNameParts = rawLastName.split(" ");
        const firstName = nameParts[0] || rawName || "User";
        const lastName = lastNameParts[0] || "";
        
        // 4. Update state with all data
        setUserData({
          userInfo: {
            firstName,
            lastName,
            role: primaryRole,
            profilePic: userInfo.profile_pic || null,
            fullName: `${userInfo.name || ""} ${userInfo.last_name || ""}`.trim(),
            phone: userInfo.phone || "",
            email: userInfo.mail || "",
            level: userInfo.level || 0,
            joinDate,
            lastProjectDate,
            about: userInfo.about || "",
            goals: Array.isArray(userInfo.goals) ? userInfo.goals : ["", "", ""],
            percentage: userInfo.percentage || 0,
            skills,
          },
          projects
        });
      } catch (error) {
        console.error("Error loading user data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllUserData();
  }, []);

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

  // Data context for secondary components
  const contextValue = useMemo(() => ({
    ...userData,
    isLoading,
    certifications,
    certificationsLoading,
    formatDate
  }), [userData, isLoading, certifications, certificationsLoading]);

  return (
    <UserDataContext.Provider value={contextValue}>
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          minHeight: "calc(100vh - 60px)",
          width: "100%",
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
              <GoalsCard />
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
};

// Banner component
const BannerProfile = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { darkMode } = useDarkMode();
  const darkModeStyles = getDarkModeStyles(darkMode);
  const { userInfo, isLoading } = useUserData();
  const { firstName, lastName, role, profilePic } = userInfo;

  if (isLoading) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          position: "relative", 
          height: { xs: 180, sm: 220 }, 
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: darkMode ? theme.palette.background.paper : "#FFF",
          boxShadow: darkMode ? "0 1px 2px rgba(0,0,0,0.3)" : "0 1px 2px rgba(0,0,0,0.04)"
        }}
      >
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Paper>
    );
  }

  // Get initials for avatar
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    return "U";
  };

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
          src={profilePic}
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
            {firstName} {lastName}
          </Typography>
          <Typography 
            variant="body1"
            sx={{
              opacity: 0.9,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            {role}
          </Typography>
        </Box>
      </Box>

      {/* Available Badge */}
      <Box
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 3,
          backgroundColor: "#4caf50",
          color: "white",
          px: 1.5,
          py: 0.5,
          borderRadius: "16px",
          fontSize: "0.75rem",
          fontWeight: 500,
          letterSpacing: "0.2px",
          border: "1px solid #4caf50",
        }}
      >
        Available for projects
      </Box>

      {/* Edit Profile Button */}
      <Button
        variant="contained"
        startIcon={<Edit fontSize="small" />}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 3,
          textTransform: "none",
          fontWeight: 500,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          color: theme.palette.primary.main,
          '&:hover': {
            bgcolor: '#fff',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          },
          borderRadius: "4px",
          px: 2,
        }}
        onClick={() => navigate("/edit-profile")}
      >
        Edit Profile
      </Button>
    </Paper>
  );
};

// Information component
const Information = () => {
  const theme = useTheme();
  const { darkMode } = useDarkMode();
  const darkModeStyles = getDarkModeStyles(darkMode);
  const { userInfo, isLoading } = useUserData();
  const { fullName, phone, email, level, joinDate, lastProjectDate } = userInfo;

  if (isLoading) {
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
          boxShadow: darkMode ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.04)",
          bgcolor: darkMode ? theme.palette.background.paper : "#FFF",
          width: "100%",
          border: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "none"
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
        boxShadow: darkMode ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.04)",
        bgcolor: darkMode ? theme.palette.background.paper : "#FFF",
        width: "100%",
        border: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "none"
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
        <Typography variant="body2">{fullName}</Typography>
      </Box>

      {/* Phone */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Phone 
          sx={{ 
            color: alpha(theme.palette.primary.main, 0.7),
            fontSize: "1.1rem"
          }} 
        />
        <Typography variant="body2">{phone}</Typography>
      </Box>

      {/* Email */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Email 
          sx={{ 
            color: alpha(theme.palette.primary.main, 0.7),
            fontSize: "1.1rem"
          }} 
        />
        <Typography variant="body2">{email}</Typography>
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
          Level: {level}/12
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
          Joined: {joinDate}
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
          Last Project: {lastProjectDate}
        </Typography>
      </Box>
    </Paper>
  );
};

// Skills component
const SkillsCard = () => {
  const theme = useTheme();
  const { darkMode } = useDarkMode();
  const darkModeStyles = getDarkModeStyles(darkMode);
  const { userInfo, isLoading } = useUserData();
  const { skills } = userInfo;

  if (isLoading) {
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
          boxShadow: darkMode ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.04)",
          bgcolor: darkMode ? theme.palette.background.paper : "#FFF",
          width: "100%",
          border: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "none"
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
        boxShadow: darkMode ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.04)",
        bgcolor: darkMode ? theme.palette.background.paper : "#FFF",
        width: "100%",
        border: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "none"
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

// Certifications Card component
const CertificationsCard = () => {
  const theme = useTheme();
  const { darkMode } = useDarkMode();
  const darkModeStyles = getDarkModeStyles(darkMode);
  const navigate = useNavigate();
  const { certifications, certificationsLoading, formatDate } = useUserData();

  if (certificationsLoading) {
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
          boxShadow: darkMode ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.04)",
          bgcolor: darkMode ? theme.palette.background.paper : "#FFF",
          width: "100%",
          border: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "none"
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
        boxShadow: darkMode ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.04)",
        bgcolor: darkMode ? theme.palette.background.paper : "#FFF",
        width: "100%",
        border: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "none"
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
          
          {/* No "View All" button as requested */}
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

// Assignment percentage component
const AssignmentPercentage = () => {
  const theme = useTheme();
  const { darkMode } = useDarkMode();
  const darkModeStyles = getDarkModeStyles(darkMode);
  const { userInfo, isLoading } = useUserData();
  const [progress, setProgress] = useState(0);
  const { percentage } = userInfo;

  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= percentage) {
            clearInterval(interval);
            return percentage;
          }
          return prev + 2;
        });
      }, 20);

      return () => clearInterval(interval);
    }
  }, [percentage, isLoading]);

  if (isLoading) {
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
          boxShadow: darkMode ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.04)",
          bgcolor: darkMode ? theme.palette.background.paper : "#FFF",
          width: "100%",
          border: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "none"
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
        boxShadow: darkMode ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.04)",
        bgcolor: darkMode ? theme.palette.background.paper : "#FFF",
        width: "100%",
        border: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "none"
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

// Goals component
const GoalsCard = () => {
  const theme = useTheme();
  const { darkMode } = useDarkMode();
  const darkModeStyles = getDarkModeStyles(darkMode); 
  const { userInfo, isLoading } = useUserData();
  const { goals } = userInfo;
  const [shortTerm, midTerm, longTerm] = goals;

  if (isLoading) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 2.5,
          display: "flex", 
          flexDirection: "column", 
          gap: 1.5,
          borderRadius: 2,
          boxShadow: darkMode ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.04)",
          bgcolor: darkMode ? theme.palette.background.paper : "#FFF",
          width: "100%",
          border: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "none"
        }}
      >
        <Skeleton variant="text" width="30%" height={24} />
        <Skeleton variant="text" width="50%" height={20} />
        <Skeleton variant="text" width="100%" height={12} />
        <Skeleton variant="text" width="50%" height={20} />
        <Skeleton variant="text" width="100%" height={12} />
        <Skeleton variant="text" width="50%" height={20} />
        <Skeleton variant="text" width="100%" height={12} />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{ 
        p: 2.5,
        display: "flex", 
        flexDirection: "column", 
        gap: 1.5,
        borderRadius: 2,
        boxShadow: darkMode ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.04)",
        bgcolor: darkMode ? theme.palette.background.paper : "#FFF",
        width: "100%",
        border: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "none"
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
        Goals
      </Typography>

      <Divider sx={{ my: 0.5 }} />

      <Box sx={{ mt: 0.5 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 600, 
            fontSize: "0.875rem",
            color: theme.palette.primary.main
          }}
        >
          Short-Term
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {shortTerm || "No short-term goal set."}
        </Typography>

        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 600, 
            fontSize: "0.875rem",
            color: theme.palette.primary.main
          }}
        >
          Mid-Term
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {midTerm || "No mid-term goal set."}
        </Typography>

        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 600, 
            fontSize: "0.875rem",
            color: theme.palette.primary.main
          }}
        >
          Long-Term
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {longTerm || "No long-term goal set."}
        </Typography>
      </Box>
    </Paper>
  );
};

// About component
const About = () => {
  const theme = useTheme();
  const { darkMode } = useDarkMode();
  const darkModeStyles = getDarkModeStyles(darkMode);
  const { userInfo, isLoading } = useUserData();
  const { about } = userInfo;

  if (isLoading) {
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
          boxShadow: darkMode ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.04)",
          bgcolor: darkMode ? theme.palette.background.paper : "#FFF",
          width: "100%",
          border: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "none"
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
        boxShadow: darkMode ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.04)",
        bgcolor: darkMode ? theme.palette.background.paper : "#FFF",
        width: "100%",
        border: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "none"
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
          {about || "No information available."}
        </Typography>
      </Box>
    </Paper>
  );
};

// Past projects component
const PastProjectsCard = () => {
  const theme = useTheme();
  const { darkMode } = useDarkMode();
  const darkModeStyles = getDarkModeStyles(darkMode);
  const { projects, isLoading } = useUserData();

  if (isLoading) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 2.5, 
          width: "100%",
          borderRadius: 2,
          boxShadow: darkMode ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.04)",
          bgcolor: darkMode ? theme.palette.background.paper : "#FFF",
          border: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "none"
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
        boxShadow: darkMode ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.04)",
        bgcolor: darkMode ? theme.palette.background.paper : "#FFF",
        border: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "none"
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
                {["Title", "Team", "Role", "Skills Used"].map(
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
                        {project.team.map((member, i) => (
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
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5
                      }}
                    >
                      {project.skills.map((skill, i) => (
                        <Chip
                          key={i}
                          label={skill}
                          size="small"
                          sx={{
                            backgroundColor: alpha(theme.palette.primary.light, 0.15),
                            color: theme.palette.primary.main,
                            height: 24,
                            fontSize: "0.7rem",
                            fontWeight: 500
                          }}
                        />
                      ))}
                    </Box>
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

export default ProfilePage;