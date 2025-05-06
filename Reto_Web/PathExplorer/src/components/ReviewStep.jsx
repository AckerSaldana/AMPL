import React from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Avatar,
  Autocomplete,
  Chip
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";

import { 
  ACCENTURE_COLORS, 
  formFieldStyles, 
  contentPaperStyles, 
  sectionHeaderStyles, 
  outlineButtonStyles 
} from "../styles/styles";

// Styled file input component
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

/**
 * Review Step Component - Second step in the form wizard (Simplified version)
 */
const ReviewStep = ({
  userData,
  availableSkills,
  availableRoles,
  handleInputChange,
  handleProfilePictureChange
}) => {
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
        Review & Edit Extracted Information
      </Typography>
      
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={contentPaperStyles}
          >
            <Typography 
              variant="subtitle1" 
              sx={sectionHeaderStyles}
            >
              <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
              Personal Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  required
                  value={userData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  sx={formFieldStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  required
                  value={userData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  sx={formFieldStyles}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  required
                  type="email"
                  value={userData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  sx={formFieldStyles}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={userData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  sx={formFieldStyles}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="permission-label" sx={{ '&.Mui-focused': { color: ACCENTURE_COLORS.corePurple1 } }}>
                    Permission Level
                  </InputLabel>
                  <Select
                    labelId="permission-label"
                    value={userData.permission}
                    label="Permission Level"
                    onChange={(e) => handleInputChange('permission', e.target.value)}
                    sx={formFieldStyles}
                  >
                    <MenuItem value="Employee">Employee</MenuItem>
                    <MenuItem value="TFS">TFS</MenuItem>
                    <MenuItem value="Manager">Manager</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Professional Information */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={contentPaperStyles}
          >
            <Typography 
              variant="subtitle1" 
              sx={sectionHeaderStyles}
            >
              <WorkIcon sx={{ mr: 1, fontSize: 20 }} />
              Professional Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  value={userData.role ? {title: userData.role} : null}
                  onChange={(event, newValue) => {
                    handleInputChange('role', newValue?.title || "");
                  }}
                  options={availableRoles.map(role => ({ title: role }))}
                  getOptionLabel={(option) => option.title || ""}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Role/Position" 
                      sx={formFieldStyles}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  value={userData.skills}
                  onChange={(event, newValue) => {
                    handleInputChange('skills', newValue);
                  }}
                  options={availableSkills}
                  getOptionLabel={(option) => option.name || ""}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Skills" 
                      placeholder="Add skills"
                      sx={formFieldStyles}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option.name}
                        {...getTagProps({ index })}
                        sx={{ 
                          backgroundColor: option.type === "Soft" 
                            ? alpha(ACCENTURE_COLORS.accentPurple1, 0.1)
                            : alpha(ACCENTURE_COLORS.corePurple1, 0.1),
                          borderColor: option.type === "Soft"
                            ? ACCENTURE_COLORS.accentPurple1
                            : ACCENTURE_COLORS.corePurple1,
                          color: option.type === "Soft"
                            ? ACCENTURE_COLORS.accentPurple1
                            : ACCENTURE_COLORS.corePurple1
                        }}
                      />
                    ))
                  }
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="About"
                  multiline
                  rows={4}
                  value={userData.about}
                  onChange={(e) => handleInputChange('about', e.target.value)}
                  sx={formFieldStyles}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Profile Picture */}
        <Grid item xs={12}>
          <Paper 
            elevation={0}
            sx={contentPaperStyles}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ ...sectionHeaderStyles, mb: 3 }}
            >
              <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
              Profile Picture
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                src={userData.profilePictureUrl}
                sx={{ 
                  width: 80, 
                  height: 80,
                  bgcolor: ACCENTURE_COLORS.corePurple2,
                  border: `2px solid ${ACCENTURE_COLORS.white}`,
                  boxShadow: `0 0 0 2px ${alpha(ACCENTURE_COLORS.corePurple1, 0.3)}`
                }}
              >
                {userData.firstName && userData.lastName
                  ? `${userData.firstName[0]}${userData.lastName[0]}`
                  : <PersonIcon fontSize="large" />
                }
              </Avatar>
              
              <Box>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={outlineButtonStyles}
                >
                  Upload Photo
                  <VisuallyHiddenInput 
                    type="file" 
                    onChange={handleProfilePictureChange} 
                    accept="image/*"
                  />
                </Button>
                
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Recommended: 300x300px. Max 2MB.
                </Typography>
              </Box>
              
              {userData.profilePictureUrl && (
                <IconButton 
                  color="error" 
                  onClick={() => {
                    handleInputChange('profilePicture', null);
                    handleInputChange('profilePictureUrl', null);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReviewStep;