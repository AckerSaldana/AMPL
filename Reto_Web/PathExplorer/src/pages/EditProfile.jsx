import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  TextField,
  Button,
  Paper,
  Typography,
  Avatar,
  Divider,
  IconButton,
  useTheme,
  alpha,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  Fade,
  Tooltip
} from "@mui/material";
import {
  Person,
  Phone,
  Email,
  Info,
  Flag,
  Save,
  Close,
  PhotoCamera,
  ArrowBack,
  EditOutlined
} from "@mui/icons-material";
import { supabase } from "../supabase/supabaseClient";

const EditProfile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    about: "",
    position: "",
    userId: null,
    avatar: null
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [goals, setGoals] = useState(["", "", ""]);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.error("No logged in user");
          return;
        }

        const { data: userInfo, error: userError } = await supabase
          .from("User")
          .select("user_id, name, last_name, mail, phone, about, goals, profile_pic")
          .eq("user_id", user.id)
          .single();

        if (userError) throw userError;

        const { data: roleInfo, error: roleError } = await supabase
          .from("UserRole")
          .select("role_name")
          .eq("user_id", user.id)
          .single();

        if (roleError && roleError.code !== 'PGRST116') throw roleError;

        const [short = "", mid = "", long = ""] = Array.isArray(userInfo.goals)
          ? userInfo.goals
          : ["", "", ""];

        setGoals([short, mid, long]);

        setFormData((prev) => ({
          ...prev,
          fullName: `${userInfo.name || ''} ${userInfo.last_name || ''}`.trim(),
          phone: userInfo.phone || "",
          email: userInfo.mail || "",
          about: userInfo.about || "",
          userId: userInfo.user_id,
          avatar: userInfo.profile_pic || null,
          position: roleInfo?.role_name || "",
        }));

        setAvatarPreview(userInfo.profile_pic || null);
        setInitialLoad(false);

      } catch (err) {
        console.error("Error loading user data:", err.message);
        setSnackbar({
          open: true,
          message: "Error loading profile data. Please try again.",
          severity: "error"
        });
        setInitialLoad(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedData = { ...formData };
      let uploadedImageUrl = formData.avatar;

      // Simulate a bit of delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 600));

      // Upload avatar if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${formData.userId}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-user")
          .upload(filePath, avatarFile, {
            upsert: true,
          });

        if (uploadError) {
          console.error("Error uploading image:", uploadError.message);
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        } else {
          const { data: publicUrlData } = supabase
            .storage
            .from("profile-user")
            .getPublicUrl(filePath);

          uploadedImageUrl = publicUrlData.publicUrl;
        }
      }

      // Split full name into first and last name
      let firstName = "", lastName = "";
      if (formData.fullName) {
        const nameParts = formData.fullName.trim().split(' ');
        if (nameParts.length > 0) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        }
      }

      // Update user data
      const { error } = await supabase
        .from("User")
        .update({
          name: firstName,
          last_name: lastName,
          mail: updatedData.email,
          phone: updatedData.phone,
          about: updatedData.about,
          goals: goals,
          profile_pic: uploadedImageUrl
        })
        .eq("user_id", updatedData.userId);

      if (error) throw error;

      setSnackbar({
        open: true,
        message: "Profile updated successfully!",
        severity: "success"
      });

      // Navigate after short delay to show success message
      setTimeout(() => {
        navigate("/user");
      }, 1500);
    } catch (err) {
      console.error("Error saving user data:", err.message);
      setSnackbar({
        open: true,
        message: `Error updating profile: ${err.message}`,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/user");
  };
  
  // Get initials for avatar
  const getInitials = () => {
    if (formData.fullName) {
      const names = formData.fullName.trim().split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
      } else if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
      }
    }
    return "U";
  };
  
  if (initialLoad) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 60px)' 
      }}>
        <CircularProgress size={40} sx={{ color: '#a100ff' }} />
      </Box>
    );
  }
  
  // Purple gradient background for all employees
  const bannerGradient = `linear-gradient(135deg, ${alpha('#a100ff', 0.9)} 0%, ${alpha('#460073', 1)} 100%)`;
  
  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: "calc(100vh - 60px)",
        width: "100%",
        backgroundColor: alpha('#f8f9fa', 0.6),
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 2,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: { xs: 2, sm: 0 },
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          backgroundColor: "#ffffff",
          backgroundImage: 'linear-gradient(to right, rgba(161, 0, 255, 0.03), rgba(255, 255, 255, 0))',
          backdropFilter: 'blur(8px)',
          position: "relative",
          overflow: "hidden",
          border: '1px solid',
          borderColor: alpha('#a100ff', 0.08),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={handleCancel}
            sx={{ mr: 1.5, color: '#7500c0' }}
          >
            <ArrowBack />
          </IconButton>
          <Typography 
            variant="h5" 
            fontWeight="600" 
            color="#460073"
            sx={{ 
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            Edit Profile
          </Typography>
        </Box>
        
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 1.5,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<Close />}
            onClick={handleCancel}
            disabled={loading}
            sx={{
              borderColor: '#e6e6dc',
              color: '#96968c',
              width: { xs: "100%", sm: "auto" },
              minWidth: { sm: "120px" },
              "&:hover": {
                borderColor: '#96968c',
                backgroundColor: alpha('#96968c', 0.04),
              },
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            onClick={handleSave}
            disabled={loading}
            sx={{
              width: { xs: "100%", sm: "auto" },
              minWidth: { sm: "120px" },
              bgcolor: "#a100ff",
              "&:hover": {
                bgcolor: "#7500c0",
              },
              boxShadow: "0 4px 10px rgba(151, 62, 188, 0.2)",
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        {/* Profile section with banner and avatar */}
        <Grid item xs={12}>
          <Paper sx={{ 
            borderRadius: 2, 
            overflow: "hidden", 
            position: "relative",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}>
            {/* Fixed gradient banner for all employees */}
            <Box
              sx={{
                height: { xs: "140px", sm: "200px" },
                width: "100%",
                background: bannerGradient,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            />

            {/* Profile content area */}
            <Box
              sx={{
                pt: { xs: 5, sm: 6 },
                pb: { xs: 2, sm: 3 },
                px: { xs: 2, sm: 3 },
                backgroundColor: "white",
                position: "relative",
                borderTop: "none",
              }}
            >
              {/* Name and position section */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                mb: 1,
              }}>
                <Box>
                  <Typography variant="h6" color="#460073" fontWeight={600}>
                    {formData.fullName || "Your Name"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formData.position || "Your Position"}
                  </Typography>
                </Box>
                
                <Box sx={{ mt: { xs: 1, sm: 0 }, display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      border: "1px solid #4caf50",
                      borderRadius: "16px",
                      padding: "4px 12px",
                      color: "#4caf50",
                      fontSize: "13px",
                      fontWeight: "500",
                      backgroundColor: alpha('#4caf50', 0.08),
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    Available for projects
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Avatar positioned over the content */}
            <Box
              sx={{
                position: "absolute",
                top: { xs: 100, sm: 150 },
                left: { xs: 24, sm: 32 },
                zIndex: 10,
              }}
            >
              <Box 
                sx={{ 
                  position: "relative",
                  "&:hover .avatar-overlay": {
                    opacity: 1,
                  }
                }}
                onMouseEnter={() => setAvatarHovered(true)}
                onMouseLeave={() => setAvatarHovered(false)}
              >
                <Avatar
                  src={avatarPreview}
                  sx={{
                    width: { xs: 80, sm: 100 },
                    height: { xs: 80, sm: 100 },
                    border: "4px solid white",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    backgroundColor: '#be82ff',
                    color: 'white',
                    fontSize: { xs: '1.75rem', sm: '2.25rem' },
                    fontWeight: 500,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                    }
                  }}
                >
                  {getInitials()}
                </Avatar>
                
                {/* Overlay for editing avatar - similar to banner editing */}
                <Box 
                  className="avatar-overlay"
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    borderRadius: "50%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    opacity: avatarHovered ? 0.8 : 0,
                    transition: "opacity 0.3s ease",
                    cursor: "pointer",
                    border: "4px solid white",
                  }}
                  component="label"
                  htmlFor="avatar-upload"
                >
                  <PhotoCamera sx={{ color: "white", fontSize: 24, mb: 0.5 }} />
                  <Typography
                    variant="caption"
                    sx={{ color: "white", fontWeight: 500, fontSize: '0.65rem', textAlign: 'center' }}
                  >
                    Change Photo
                  </Typography>
                  <input
                    accept="image/*"
                    id="avatar-upload"
                    type="file"
                    onChange={handleAvatarChange}
                    style={{ display: "none" }}
                  />
                </Box>
                
                {/* Small camera button for mobile/touch devices */}
                <Tooltip title="Change profile photo">
                  <Fade in={true}>
                    <IconButton
                      component="label"
                      htmlFor="avatar-upload-mobile"
                      sx={{
                        position: "absolute",
                        bottom: 2,
                        right: 2,
                        backgroundColor: "#a100ff",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "#7500c0",
                        },
                        width: { xs: 28, sm: 32 },
                        height: { xs: 28, sm: 32 },
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <PhotoCamera sx={{ fontSize: { xs: 14, sm: 16 } }} />
                      <input
                        accept="image/*"
                        id="avatar-upload-mobile"
                        type="file"
                        onChange={handleAvatarChange}
                        style={{ display: "none" }}
                      />
                    </IconButton>
                  </Fade>
                </Tooltip>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* First section: Edit Information */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              boxShadow: "0 2px 15px rgba(0,0,0,0.03)",
              backgroundColor: "#ffffff",
              height: '100%',
              border: '1px solid',
              borderColor: alpha('#e6e6dc', 0.5),
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: "0 3px 20px rgba(0,0,0,0.06)",
                borderColor: alpha('#7500c0', 0.08),
              }
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2.5 }}>
              <Box 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: '50%', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${alpha('#a100ff', 0.12)}, ${alpha('#7500c0', 0.08)})`, 
                  color: '#a100ff',
                  mr: 1.5,
                  boxShadow: `0 2px 8px ${alpha('#a100ff', 0.1)}`,
                }}
              >
                <Person fontSize="small" />
              </Box>
              <Typography
                variant="h6"
                fontWeight="600"
                color="#460073"
                sx={{ 
                  background: 'linear-gradient(135deg, #460073, #a100ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.3px'
                }}
              >
                Personal Information
              </Typography>
            </Box>

            <Divider sx={{ mb: 3.5, opacity: 0.6 }} />

            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName || ""}
              onChange={handleChange}
              variant="outlined"
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  '&.Mui-focused fieldset': {
                    borderColor: '#a100ff',
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: alpha('#a100ff', 0.5),
                  },
                  '& fieldset': {
                    borderColor: alpha('#96968c', 0.2),
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#a100ff',
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person fontSize="small" sx={{ color: '#96968c' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Position/Title"
              name="position"
              value={formData.position || ""}
              onChange={handleChange}
              variant="outlined"
              placeholder="E.g: Frontend Developer"
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  '&.Mui-focused fieldset': {
                    borderColor: '#a100ff',
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: alpha('#a100ff', 0.5),
                  },
                  '& fieldset': {
                    borderColor: alpha('#96968c', 0.2),
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#a100ff',
                }
              }}
            />

            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              variant="outlined"
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  '&.Mui-focused fieldset': {
                    borderColor: '#a100ff',
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: alpha('#a100ff', 0.5),
                  },
                  '& fieldset': {
                    borderColor: alpha('#96968c', 0.2),
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#a100ff',
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone fontSize="small" sx={{ color: '#96968c' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleChange}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  '&.Mui-focused fieldset': {
                    borderColor: '#a100ff',
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: alpha('#a100ff', 0.5),
                  },
                  '& fieldset': {
                    borderColor: alpha('#96968c', 0.2),
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#a100ff',
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email fontSize="small" sx={{ color: '#96968c' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Paper>
        </Grid>

        {/* Second section: Edit About */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              display: "flex",
              flexDirection: "column",
              height: "100%",
              borderRadius: 2,
              boxShadow: "0 2px 15px rgba(0,0,0,0.03)",
              backgroundColor: "#ffffff",
              border: '1px solid',
              borderColor: alpha('#e6e6dc', 0.5),
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: "0 3px 20px rgba(0,0,0,0.06)",
                borderColor: alpha('#7500c0', 0.08),
              }
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2.5 }}>
              <Box 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: '50%', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${alpha('#7500c0', 0.12)}, ${alpha('#a100ff', 0.08)})`, 
                  color: '#7500c0',
                  mr: 1.5,
                  boxShadow: `0 2px 8px ${alpha('#7500c0', 0.1)}`,
                }}
              >
                <Info fontSize="small" />
              </Box>
              <Typography 
                variant="h6" 
                fontWeight="600" 
                sx={{ 
                  background: 'linear-gradient(135deg, #7500c0, #a100ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.3px'
                }}
              >
                About Me
              </Typography>
            </Box>

            <Divider sx={{ mb: 3.5, opacity: 0.6 }} />

            <TextField
              fullWidth
              multiline
              rows={9}
              name="about"
              placeholder="Share your professional experience, expertise, and what you're passionate about..."
              value={formData.about || ""}
              onChange={handleChange}
              variant="outlined"
              sx={{ 
                flexGrow: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  '&.Mui-focused fieldset': {
                    borderColor: '#7500c0',
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: alpha('#7500c0', 0.5),
                  },
                  '& fieldset': {
                    borderColor: alpha('#96968c', 0.2),
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#7500c0',
                },
                '& .MuiOutlinedInput-input': {
                  lineHeight: 1.6,
                }
              }}
            />
          </Paper>
        </Grid>

        {/* Goals */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 2,
              boxShadow: "0 2px 15px rgba(0,0,0,0.03)",
              backgroundColor: "#ffffff",
              border: '1px solid',
              borderColor: alpha('#e6e6dc', 0.5),
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: "0 3px 20px rgba(0,0,0,0.06)",
                borderColor: alpha('#7500c0', 0.08),
              }
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2.5 }}>
              <Box 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: '50%', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${alpha('#460073', 0.12)}, ${alpha('#a100ff', 0.08)})`, 
                  color: '#460073',
                  mr: 1.5,
                  boxShadow: `0 2px 8px ${alpha('#460073', 0.1)}`,
                }}
              >
                <Flag fontSize="small" />
              </Box>
              <Typography 
                variant="h6" 
                fontWeight="600"
                sx={{ 
                  background: 'linear-gradient(135deg, #460073, #7500c0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.3px'
                }}
              >
                Career Goals
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3.5, opacity: 0.6 }} />

            <Grid container spacing={3}>
              {[
                { type: "Short-Term", timeframe: "in the next 3-6 months", color: "#a100ff", gradient: "linear-gradient(135deg, #a100ff, #be82ff)", shadow: alpha('#a100ff', 0.2) },
                { type: "Mid-Term", timeframe: "in 1-2 years", color: "#7500c0", gradient: "linear-gradient(135deg, #7500c0, #a100ff)", shadow: alpha('#7500c0', 0.2) },
                { type: "Long-Term", timeframe: "in 3-5 years", color: "#460073", gradient: "linear-gradient(135deg, #460073, #7500c0)", shadow: alpha('#460073', 0.2) }
              ].map(
                (goal, index) => (
                  <Grid item xs={12} md={4} key={goal.type}>
                    <Box 
                      sx={{ 
                        mb: 1.5, 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 1.5
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%', 
                          background: goal.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 2px 6px ${goal.shadow}`,
                          color: 'white',
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }} 
                      >
                        {index + 1}
                      </Box>
                      <Typography 
                        variant="subtitle2" 
                        fontWeight={600}
                        sx={{ 
                          background: goal.gradient,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          letterSpacing: '0.3px'
                        }}
                      >
                        {goal.type} Goal
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder={`What do you want to achieve ${goal.timeframe}?`}
                      value={goals[index] || ""}
                      onChange={(e) => {
                        const updatedGoals = [...goals];
                        updatedGoals[index] = e.target.value;
                        setGoals(updatedGoals);
                      }}
                      variant="outlined"
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          '&.Mui-focused fieldset': {
                            borderColor: goal.color,
                            borderWidth: '1px',
                          },
                          '&:hover fieldset': {
                            borderColor: alpha(goal.color, 0.5),
                          },
                          '& fieldset': {
                            borderColor: alpha('#96968c', 0.2),
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: goal.color,
                        },
                        '& .MuiOutlinedInput-input': {
                          lineHeight: 1.6,
                        }
                      }}
                    />
                  </Grid>
                )
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating save button (mobile version) */}
      <Fade in={true}>
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            sx={{
              borderRadius: 28,
              px: 3.5,
              py: 1.5,
              background: "linear-gradient(135deg, #a100ff 0%, #7500c0 100%)",
              boxShadow: "0 4px 15px rgba(151, 62, 188, 0.4)",
              color: "white",
              textTransform: "none",
              fontWeight: 500,
              minWidth: 140,
              fontSize: "0.95rem",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(151, 62, 188, 0.6)",
                transform: "translateY(-2px)"
              },
              "&:active": {
                boxShadow: "0 2px 10px rgba(151, 62, 188, 0.4)",
                transform: "translateY(1px)"
              }
            }}
            startIcon={loading ? 
              <CircularProgress size={20} color="inherit" /> : 
              <Save sx={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.2))" }} />
            }
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Fade>
    </Box>
  );
};

export default EditProfile;