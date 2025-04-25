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
import { supabase } from "../supabase/supabaseClient"; 

const EditProfile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
    const [formData, setFormData] = useState({
      fullName: "",
      email: "",
      phone: "",
      about: "",
      position: "",
      userId: null, 
    });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [goals, setGoals] = useState(["", "", ""]);


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
  
        if (userError) throw error;

        console.log("Profile pic from DB:", userInfo.profile_pic);

        const { data: roleInfo, error: roleError } = await supabase
        .from("UserRole")
        .select("role_name")
        .eq("user_id", user.id)
        .single();
        
        if (roleError) throw roleError;

        const [short = "", mid = "", long = ""] = Array.isArray(userInfo.goals)
        ? userInfo.goals
        : ["", "", ""];

        setGoals([short, mid, long]);
  
        setFormData((prev) => ({
          ...prev,
          fullName: `${userInfo.name} ${userInfo.last_name}`,
          phone: userInfo.phone || "",
          email: userInfo.mail || "",
          about: userInfo.about || "",
          userId: userInfo.user_id,
          avatar: userInfo.profile_pic || null,
          position: roleInfo?.role_name || "",
        }));

        setAvatarPreview(userInfo.profile_pic || "/default-avatar.jpg");
        
      } catch (err) {
        console.error("Error loading user data:", err.message);
        
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

      // Create temporal avatar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const updatedData = { ...formData };
    let uploadedImageUrl = formData.avatar;
  
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${formData.userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
    
      //Subir al bucket profile-user
      const { error: uploadError } = await supabase.storage
      .from("profile-user")
      .upload(filePath, avatarFile, {
        upsert: true,
      });
    
      if (uploadError) {
        console.error("Error uploading image:", uploadError.message);
      } else {
        const { data: publicUrlData } = supabase
          .storage
          .from("profile-user")
          .getPublicUrl(filePath);
    
        uploadedImageUrl = publicUrlData.publicUrl;
        
      }
    }
  
    try {
        console.log("Form userId:", updatedData.userId);

        const { data: authUser } = await supabase.auth.getUser();
        console.log("Auth UID:", authUser?.user?.id);

      const { error } = await supabase
        .from("User")
        .update({
          mail: updatedData.email,
          phone: updatedData.phone,
          about: updatedData.about,
          goals: goals,
          profile_pic: uploadedImageUrl,
        })
        .eq("user_id", updatedData.userId);
  
      if (error) throw error;
  
      setAvatarPreview(uploadedImageUrl);
      console.log("User updated successfully.");
      navigate("/user");
    } catch (err) {
      console.error("Error saving user data:", err.message);
    }
  };

  const handleCancel = () => {
    navigate("/user");
  };
  
  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: "calc(100vh - 60px)",
        width: "100%",
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
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "flex-end",
            justifyContent: { xs: "flex-end", sm: "flex-end" },
            gap: 1,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={handleCancel}
            fullWidth
            sx={{
              borderColor: theme.palette.grey[300],
              color: theme.palette.text.secondary,
              minWidth: "180px",
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
            fullWidth
            sx={{
              minWidth: "180px",
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
          <Box sx={{ position: "relative" }}>
            {/* Banner */}
            <Box
              sx={{
                borderRadius: "8px 8px 0 0",
                overflow: "hidden",
                height: "170px",
                width: "100%",
                backgroundColor: "#6699cc",
              }}
            >
              <EditBannerProfile
                initialBanner={formData.banner}
                onBannerChange={(preview, file) => {
                  setFormData({
                    ...formData,
                    banner: preview,
                    bannerFile: file,
                  });
                }}
              />
            </Box>

            {/* White section below banner */}
            <Box
              sx={{
                py: 2,
                px: 3,
                backgroundColor: "white",
                borderRadius: "0 0 8px 8px",
                height: "60px",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                borderTop: "none",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <Box
                sx={{
                  border: "1px solid #4caf50",
                  borderRadius: "16px",
                  padding: "4px 12px",
                  color: "#4caf50",
                  fontSize: "13px",
                  fontWeight: "500",
                  backgroundColor: "rgba(76, 175, 80, 0.08)",
                }}
              >
                Available for projects
              </Box>
            </Box>

            {/* Avatar positioned over the join between banner and white section */}
            <Box
              sx={{
                position: "absolute",
                bottom: "20px", // Positioned to overlap the border between sections
                left: "40px", // Aligned left as in the reference image
                zIndex: 10,
              }}
            >
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={avatarPreview || "/default-avatar.jpg"}
                  sx={{
                    width: 90,
                    height: 90,
                    border: "4px solid white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <label htmlFor="avatar-upload">
                  <IconButton
                    component="span"
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      backgroundColor: theme.palette.primary.main,
                      color: "white",
                      "&:hover": {
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
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography
                variant="h6"
                fontWeight="600"
                color="primary.main"
                sx={{ display: "flex", alignItems: "center" }}
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
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: "#973EBC",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1,
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  i
                </Typography>
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
        {formData.userId && (
        <AddSkillsCard userId={formData.userId} />
        )}
        </Grid>

        {/* Goals */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
          >
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
              {["Short-Term", "Mid-Term", "Long-Term"].map(
                (goalType, index) => (
                  <Grid item xs={12} md={4} key={goalType}>
                    <Typography variant="subtitle2" fontWeight="500" mb={1}>
                      {goalType} Goal
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder={`What do you want to achieve ${
                        goalType === "Short-Term"
                          ? "in the next 3-6 months"
                          : goalType === "Mid-Term"
                          ? "in 1-2 years"
                          : "in 3-5 years"
                      }?`}
                      value={goals[index] || ""}
                      onChange={(e) => {
                        const updatedGoals = [...goals];
                        updatedGoals[index] = e.target.value;
                        setGoals(updatedGoals);
                      }}
                      variant="outlined"
                    />
                  </Grid>
                )
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Floating save button (mobile version) */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
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
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
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