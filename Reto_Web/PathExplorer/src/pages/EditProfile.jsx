import React, { useState } from "react";
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
} from "@mui/material";
import {
  Person,
  Phone,
  Email,
  Info,
  Flag,
  Save,
  Cancel,
  PhotoCamera,
} from "@mui/icons-material";
import { AddSkillsCard } from "../components/AddSkillsCard";
import { EditBannerProfile } from "../components/EditBannerProfile";

const EditProfile = ({ userData, onSave, onCancel }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    ...userData,
    position: userData?.position || "Frontend Developer", // Default title if not provided
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(userData?.avatar || null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create avatar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Combine form data with all uploaded files
    const updatedData = { ...formData };
    
    // Add avatar if changed
    if (avatarFile) {
      updatedData.avatarFile = avatarFile;
      updatedData.avatar = avatarPreview;
    }
    
    // Banner is already in formData from the onBannerChange callback
    onSave(updatedData);
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: "calc(100vh - 60px)",
        width: "100%",
        maxWidth: "calc(100vw - 150px)",
        backgroundColor: alpha(theme.palette.background.default, 0.5),
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <Typography variant="h5" fontWeight="600" color="primary.main">
          Edit Profile
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={onCancel}
            sx={{
              mr: 2,
              borderColor: theme.palette.grey[300],
              color: theme.palette.text.secondary,
              "&:hover": {
                borderColor: theme.palette.grey[400],
                backgroundColor: theme.palette.grey[100],
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            sx={{
              bgcolor: theme.palette.primary.main,
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
              },
              boxShadow: "0 4px 10px rgba(151, 62, 188, 0.2)",
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Profile section with banner and avatar */}
        <Grid item xs={12}>
          <Box sx={{ position: "relative", mb: 3 }}>
            {/* Banner */}
            <Box sx={{ 
              borderRadius: '8px 8px 0 0',
              overflow: 'hidden',
              height: '170px',
              width: '100%',
              backgroundColor: '#6699cc'
            }}>
              <EditBannerProfile 
                initialBanner={formData.banner}
                onBannerChange={(preview, file) => {
                  setFormData({
                    ...formData,
                    banner: preview,
                    bannerFile: file
                  });
                }}
              />
            </Box>
            
            {/* White section below banner */}
            <Box sx={{ 
              py: 2, 
              px: 3, 
              backgroundColor: 'white',
              borderRadius: '0 0 8px 8px',
              height: '60px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              borderTop: 'none',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ 
                border: '1px solid #4caf50',
                borderRadius: '16px',
                padding: '4px 12px',
                color: '#4caf50',
                fontSize: '13px',
                fontWeight: '500',
                backgroundColor: 'rgba(76, 175, 80, 0.08)'
              }}>
                Available for projects
              </Box>
            </Box>
            
            {/* Avatar positioned over the join between banner and white section */}
            <Box sx={{ 
              position: 'absolute', 
              bottom: '20px',  // Positioned to overlap the border between sections
              left: '40px',    // Aligned left as in the reference image
              zIndex: 10
            }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={avatarPreview}
                  sx={{
                    width: 90,
                    height: 90,
                    border: '4px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                />
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <label htmlFor="avatar-upload">
                  <IconButton
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                      width: 28,
                      height: 28,
                    }}
                  >
                    <PhotoCamera sx={{ fontSize: 16 }} />
                  </IconButton>
                </label>
              </Box>
              
              {/* Removed name and title as requested */}
            </Box>
          </Box>
        </Grid>

        {/* First section: Edit Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            display: "flex", 
            flexDirection: "column",
            borderRadius: 2, 
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)" 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography 
                variant="h6" 
                fontWeight="600" 
                color="primary.main" 
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Person color="primary" sx={{ mr: 1 }} />
                Edit Information
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName || ""}
              onChange={handleChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Position/Title"
              name="position"
              value={formData.position || ""}
              onChange={handleChange}
              variant="outlined"
              sx={{ mb: 2 }}
              placeholder="E.g: Frontend Developer"
            />
            
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleChange}
              variant="outlined"
            />
          </Paper>
        </Grid>

        {/* Second section: Edit About */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            display: "flex", 
            flexDirection: "column",
            height: "100%", 
            borderRadius: 2, 
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)" 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                width: 28, 
                height: 28, 
                borderRadius: '50%',
                bgcolor: '#973EBC', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1
              }}>
                <Typography variant="subtitle2" fontWeight="bold">i</Typography>
              </Box>
              <Typography variant="h6" fontWeight="600" color="primary.main">
                Edit About
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <TextField
              fullWidth
              multiline
              rows={7}
              name="about"
              placeholder="Who are you?"
              value={formData.about || ""}
              onChange={handleChange}
              variant="outlined"
              sx={{ flexGrow: 1 }}
            />
          </Paper>
        </Grid>

        {/* Skills Card */}
        <Grid item xs={12}>
          <AddSkillsCard 
            initialSkills={userData?.skills || []}
          />
        </Grid>

        {/* Goals */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              display="flex"
              alignItems="center"
              color="primary.main"
              mb={2}
            >
              <Flag sx={{ mr: 1 }} /> Edit Goals
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              {["Short-Term", "Mid-Term", "Long-Term"].map((goalType, index) => (
                <Grid item xs={12} md={4} key={goalType}>
                  <Typography variant="subtitle2" fontWeight="500" mb={1}>
                    {goalType} Goal
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder={`What do you want to achieve ${goalType === "Short-Term" ? "in the next 3-6 months" : goalType === "Mid-Term" ? "in 1-2 years" : "in 3-5 years"}?`}
                    name={`goal${index + 1}`}
                    value={formData[`goal${index + 1}`] || ""}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Floating save button (mobile version) */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          sx={{
            borderRadius: 28,
            px: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
          startIcon={<Save />}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default EditProfile;