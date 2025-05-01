import React from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Chip,
  Divider,
  Alert
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import StarIcon from "@mui/icons-material/Star";
import SchoolIcon from "@mui/icons-material/School";
import TranslateIcon from "@mui/icons-material/Translate";
import InfoIcon from "@mui/icons-material/Info";
import { ACCENTURE_COLORS, sectionHeaderStyles } from "../styles/styles";

/**
 * Confirmation Step Component - Final step in the form wizard
 */
const ConfirmationStep = ({
  userData,
  error,
  success
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, width: '100%' }}>
      <Typography variant="h6" align="center" sx={{ mb: 3, fontWeight: 500 }}>
        Review & Confirm
      </Typography>
      
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.2)}`,
          maxWidth: 600,
          width: '100%',
          mx: 'auto'
        }}
      >
        {/* User summary with avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={userData.profilePictureUrl}
            sx={{ 
              width: 80, 
              height: 80,
              bgcolor: ACCENTURE_COLORS.corePurple2,
              border: `2px solid ${ACCENTURE_COLORS.white}`,
              boxShadow: `0 0 0 2px ${alpha(ACCENTURE_COLORS.corePurple1, 0.3)}`,
              mr: 3
            }}
          >
            {userData.firstName && userData.lastName
              ? `${userData.firstName[0]}${userData.lastName[0]}`
              : <PersonIcon fontSize="large" />
            }
          </Avatar>
          
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              {userData.firstName} {userData.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userData.role || "Employee"}
            </Typography>
            <Chip 
              label={userData.permission} 
              size="small" 
              sx={{ 
                mt: 1,
                bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.1),
                color: ACCENTURE_COLORS.corePurple1,
                fontWeight: 500
              }}
            />
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Contact information */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="subtitle1" 
            sx={sectionHeaderStyles}
          >
            <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
            Contact Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {userData.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {userData.phone || "Not provided"}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        
        {/* Skills */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="subtitle1" 
            sx={sectionHeaderStyles}
          >
            <StarIcon sx={{ mr: 1, fontSize: 20 }} />
            Skills
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {userData.skills.length > 0 ? (
              userData.skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill.name}
                  size="small"
                  sx={{ 
                    backgroundColor: skill.type === "Soft" 
                      ? alpha(ACCENTURE_COLORS.accentPurple1, 0.1)
                      : alpha(ACCENTURE_COLORS.corePurple1, 0.1),
                    borderColor: skill.type === "Soft"
                      ? ACCENTURE_COLORS.accentPurple1
                      : ACCENTURE_COLORS.corePurple1,
                    color: skill.type === "Soft"
                      ? ACCENTURE_COLORS.accentPurple1
                      : ACCENTURE_COLORS.corePurple1
                  }}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No skills specified
              </Typography>
            )}
          </Box>
        </Box>
        
        {/* Education */}
        {userData.education.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="subtitle1" 
              sx={sectionHeaderStyles}
            >
              <SchoolIcon sx={{ mr: 1, fontSize: 20 }} />
              Education
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {userData.education.map((edu, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {edu.degree}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {edu.institution} {edu.year ? `• ${edu.year}` : ''}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
        
        {/* Work Experience */}
        {userData.workExperience.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="subtitle1" 
              sx={sectionHeaderStyles}
            >
              <WorkIcon sx={{ mr: 1, fontSize: 20 }} />
              Work Experience
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {userData.workExperience.map((work, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {work.position}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {work.company} {work.duration ? `• ${work.duration}` : ''}
                  </Typography>
                  {work.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {work.description}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}
        
        {/* Languages */}
        {userData.languages.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="subtitle1" 
              sx={sectionHeaderStyles}
            >
              <TranslateIcon sx={{ mr: 1, fontSize: 20 }} />
              Languages
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {userData.languages.map((lang, index) => (
                <Chip
                  key={index}
                  label={`${lang.name} - ${lang.level || "Basic"}`}
                  size="small"
                  sx={{ 
                    backgroundColor: alpha(ACCENTURE_COLORS.corePurple2, 0.1),
                    color: ACCENTURE_COLORS.corePurple2
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
        
        {/* About */}
        <Box>
          <Typography 
            variant="subtitle1" 
            sx={sectionHeaderStyles}
          >
            <InfoIcon sx={{ mr: 1, fontSize: 20 }} />
            About
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            {userData.about || "No information provided."}
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 3 }}>
            Employee added successfully!
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default ConfirmationStep;