import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Autocomplete,
  LinearProgress
} from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";

// Icons
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import StarIcon from "@mui/icons-material/Star";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DescriptionIcon from "@mui/icons-material/Description";
import InfoIcon from "@mui/icons-material/Info";
import SchoolIcon from "@mui/icons-material/School";
import TranslateIcon from "@mui/icons-material/Translate";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PsychologyIcon from "@mui/icons-material/Psychology";
import AddIcon from "@mui/icons-material/Add";

import { supabase } from "../supabase/supabaseClient";

// Base URL para API (ajustar según entorno)
const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 
                   (import.meta.env.MODE === 'development' ? 
                   'http://localhost:3001' : 
                   'https://ampl-fdb59.web.app');

// Core Accenture Colors from the guidelines
const ACCENTURE_COLORS = {
  corePurple1: "#a100ff", // Primary Purple
  corePurple2: "#7500c0", // Secondary Purple
  corePurple3: "#460073", // Dark Purple
  accentPurple1: "#b455aa", // Accent Purple 1
  accentPurple2: "#a055f5", // Accent Purple 2
  accentPurple3: "#be82ff", // Accent Purple 3
  accentPurple4: "#dcafff", // Accent Purple 4
  accentPurple5: "#e6dcff", // Accent Purple 5
  black: "#000000",
  darkGray: "#96968c",
  lightGray: "#e6e6dc",
  white: "#ffffff"
};

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

// Step titles for the registration process
const steps = [
  'Upload & Parse CV',
  'Review Information',
  'Set Credentials',
  'Confirm & Submit'
];

/**
 * Main component for employee registration with CV parsing using AI
 */
const AddEmployeeForm = ({ open, onClose }) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  
  // Active step state for the stepper
  const [activeStep, setActiveStep] = useState(0);
  
  // File upload states
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  
  // AI analysis details
  const [aiAnalysisDetails, setAiAnalysisDetails] = useState({
    confidence: 0,
    detectedFields: [],
    processingTime: 0,
    showDetails: false
  });
  
  // User information states
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    about: "",
    profilePicture: null,
    profilePictureUrl: null,
    skills: [],
    password: "",
    confirmPassword: "",
    permission: "Employee",
    // Additional fields that may be extracted by AI
    education: [],
    workExperience: [],
    languages: []
  });
  
  // Skills and roles from database
  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });
  
  // Fetch available skills and roles on component mount
  useEffect(() => {
    const fetchSkillsAndRoles = async () => {
      try {
        // Fetch skills from Supabase
        const { data: skillsData, error: skillsError } = await supabase
          .from('Skill')
          .select('skill_ID, name, type');
        
        if (skillsError) throw skillsError;
        
        // Transform skills data for Autocomplete component
        const formattedSkills = skillsData.map(skill => ({
          id: skill.skill_ID,
          name: skill.name,
          type: skill.type || "Technical"
        }));
        
        setAvailableSkills(formattedSkills);
        
        // Fetch role names from the database
        const { data: roleData, error: roleError } = await supabase
          .from('Roles')
          .select('name')
          .limit(20);
        
        if (!roleError && roleData && roleData.length > 0) {
          setAvailableRoles(roleData.map(r => r.name));
        } else {
          // Fallback to predefined roles
          setAvailableRoles([
            "Frontend Developer",
            "Backend Developer",
            "Full Stack Developer",
            "DevOps Engineer",
            "UI/UX Designer",
            "Project Manager",
            "Quality Assurance",
            "Data Scientist",
            "Business Analyst"
          ]);
        }
      } catch (error) {
        console.error("Error fetching skills and roles:", error);
        setSnackbar({
          open: true,
          message: "Error loading skills data. Using default values.",
          severity: "warning"
        });
        
        // Fallback to some predefined skills
        setAvailableSkills([
          { id: 1, name: "JavaScript", type: "Technical" },
          { id: 2, name: "React", type: "Technical" },
          { id: 3, name: "Node.js", type: "Technical" },
          { id: 4, name: "HTML/CSS", type: "Technical" },
          { id: 5, name: "Python", type: "Technical" },
          { id: 6, name: "Communication", type: "Soft" },
          { id: 7, name: "Leadership", type: "Soft" },
          { id: 8, name: "Teamwork", type: "Soft" }
        ]);
      }
    };
    
    if (open) {
      fetchSkillsAndRoles();
    }
  }, [open]);
  
  // Reset all states when dialog closes
  const handleClose = () => {
    setActiveStep(0);
    setFile(null);
    setFilePreviewUrl(null);
    setParsing(false);
    setParseProgress(0);
    setUserData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      about: "",
      profilePicture: null,
      profilePictureUrl: null,
      skills: [],
      password: "",
      confirmPassword: "",
      permission: "Employee",
      education: [],
      workExperience: [],
      languages: []
    });
    setAiAnalysisDetails({
      confidence: 0,
      detectedFields: [],
      processingTime: 0,
      showDetails: false
    });
    setError("");
    setSuccess(false);
    onClose();
  };
  
  // Handle file selection for CV upload
  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    
    // Check if file is PDF or Word document
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      setSnackbar({
        open: true,
        message: "Please upload a PDF or Word document.",
        severity: "error"
      });
      return;
    }
    
    setFile(selectedFile);
    
    // Create file preview URL
    if (selectedFile.type === 'application/pdf') {
      const fileURL = URL.createObjectURL(selectedFile);
      setFilePreviewUrl(fileURL);
    } else {
      // For Word docs, we don't have a preview
      setFilePreviewUrl(null);
    }
  };
  
  // Parse CV file using the AI backend service
  const parseCV = async () => {
    if (!file) {
      setSnackbar({
        open: true,
        message: "Please upload a file first.",
        severity: "error"
      });
      return;
    }
    
    try {
      setParsing(true);
      setParseProgress(0);
      
      // Simulating progress updates (the actual parsing happens on the server)
      const progressInterval = setInterval(() => {
        setParseProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 300);
      
      // Prepare data to send to the backend
      const formData = new FormData();
      formData.append('file', file);
      formData.append('availableSkills', JSON.stringify(availableSkills));
      formData.append('availableRoles', JSON.stringify(availableRoles));
      
      // Call the backend AI parser service
      const startTime = Date.now();
      const response = await fetch(`${API_BASE_URL}/api/cv/parse`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000; // in seconds
      
      // Clear progress interval and set to 100%
      clearInterval(progressInterval);
      setParseProgress(100);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to parse CV");
      }
      
      const parsedData = result.data;
      
      // Update user data with parsed information
      setUserData(prev => ({
        ...prev,
        firstName: parsedData.firstName || "",
        lastName: parsedData.lastName || "",
        email: parsedData.email || "",
        phone: parsedData.phone || "",
        role: parsedData.role || "",
        about: parsedData.about || "Experienced professional with a background in technology and business solutions.",
        skills: parsedData.skills || [],
        education: parsedData.education || [],
        workExperience: parsedData.workExperience || [],
        languages: parsedData.languages || [],
      }));
      
      // Set AI analysis details for display
      setAiAnalysisDetails({
        confidence: 0.92, // In a real implementation, this would come from the API
        detectedFields: Object.keys(parsedData).filter(key => 
          parsedData[key] && 
          (typeof parsedData[key] === 'string' ? parsedData[key].trim() !== '' : 
           Array.isArray(parsedData[key]) ? parsedData[key].length > 0 : true)
        ),
        processingTime: result.meta?.processingTime || processingTime,
        showDetails: true
      });
      
      setSnackbar({
        open: true,
        message: "CV successfully analyzed with AI!",
        severity: "success"
      });
      
      // Move to the next step after a short delay
      setTimeout(() => {
        setParsing(false);
        setActiveStep(1);
      }, 500);
      
    } catch (error) {
      console.error("Error parsing CV:", error);
      setParsing(false);
      setParseProgress(0);
      
      setSnackbar({
        open: true,
        message: `Error parsing CV: ${error.message}. Please try again or enter information manually.`,
        severity: "error"
      });
    }
  };
  
  // Handle next button click in stepper
  const handleNext = () => {
    // Validation for each step
    if (activeStep === 0 && !file) {
      setSnackbar({
        open: true,
        message: "Please upload a CV file first.",
        severity: "warning"
      });
      return;
    }
    
    if (activeStep === 1) {
      // Validate required fields in review step
      if (!userData.firstName || !userData.lastName || !userData.email) {
        setSnackbar({
          open: true,
          message: "Please fill in all required fields.",
          severity: "warning"
        });
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        setSnackbar({
          open: true,
          message: "Please enter a valid email address.",
          severity: "warning"
        });
        return;
      }
    }
    
    if (activeStep === 2) {
      // Validate password fields
      if (!userData.password) {
        setSnackbar({
          open: true,
          message: "Please enter a password.",
          severity: "warning"
        });
        return;
      }
      
      if (userData.password !== userData.confirmPassword) {
        setSnackbar({
          open: true,
          message: "Passwords do not match.",
          severity: "warning"
        });
        return;
      }
      
      if (userData.password.length < 8) {
        setSnackbar({
          open: true,
          message: "Password must be at least 8 characters long.",
          severity: "warning"
        });
        return;
      }
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  // Handle back button click in stepper
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Handle field changes in the form
  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Special handling for first name and last name to update email
    if (field === 'firstName' || field === 'lastName') {
      const firstName = field === 'firstName' ? value : userData.firstName;
      const lastName = field === 'lastName' ? value : userData.lastName;
      
      if (firstName && lastName) {
        // Only update email if it follows the pattern or is empty
        const currentEmail = userData.email;
        const emailPattern = /^[^@]+@accenture\.com$/;
        
        if (!currentEmail || emailPattern.test(currentEmail)) {
          setUserData(prev => ({
            ...prev,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@accenture.com`
          }));
        }
      }
    }
  };
  
  // Handle profile picture upload
  const handleProfilePictureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setSnackbar({
        open: true,
        message: "Please upload an image file.",
        severity: "error"
      });
      return;
    }
    
    // Create a preview URL for the image
    const imageUrl = URL.createObjectURL(file);
    
    setUserData(prev => ({
      ...prev,
      profilePicture: file,
      profilePictureUrl: imageUrl
    }));
  };
  
  // Add a new education entry
  const handleAddEducation = () => {
    setUserData(prev => ({
      ...prev,
      education: [...prev.education, { institution: "", degree: "", year: "" }]
    }));
  };
  
  // Update education entry
  const handleEducationChange = (index, field, value) => {
    setUserData(prev => {
      const newEducation = [...prev.education];
      newEducation[index] = { ...newEducation[index], [field]: value };
      return { ...prev, education: newEducation };
    });
  };
  
  // Remove education entry
  const handleRemoveEducation = (index) => {
    setUserData(prev => {
      const newEducation = [...prev.education];
      newEducation.splice(index, 1);
      return { ...prev, education: newEducation };
    });
  };
  
  // Add a new work experience entry
  const handleAddWorkExperience = () => {
    setUserData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { company: "", position: "", duration: "", description: "" }]
    }));
  };
  
  // Update work experience entry
  const handleWorkExperienceChange = (index, field, value) => {
    setUserData(prev => {
      const newWorkExperience = [...prev.workExperience];
      newWorkExperience[index] = { ...newWorkExperience[index], [field]: value };
      return { ...prev, workExperience: newWorkExperience };
    });
  };
  
  // Remove work experience entry
  const handleRemoveWorkExperience = (index) => {
    setUserData(prev => {
      const newWorkExperience = [...prev.workExperience];
      newWorkExperience.splice(index, 1);
      return { ...prev, workExperience: newWorkExperience };
    });
  };
  
  // Add a new language
  const handleAddLanguage = () => {
    setUserData(prev => ({
      ...prev,
      languages: [...prev.languages, { name: "", level: "Basic" }]
    }));
  };
  
  // Update language entry
  const handleLanguageChange = (index, field, value) => {
    setUserData(prev => {
      const newLanguages = [...prev.languages];
      newLanguages[index] = { ...newLanguages[index], [field]: value };
      return { ...prev, languages: newLanguages };
    });
  };
  
  // Remove language entry
  const handleRemoveLanguage = (index) => {
    setUserData(prev => {
      const newLanguages = [...prev.languages];
      newLanguages.splice(index, 1);
      return { ...prev, languages: newLanguages };
    });
  };
  
  // Submit the form to create a new user
  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // 1. Create auth user with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });
      
      if (authError) throw new Error(`Auth error: ${authError.message}`);
      if (!authData.user) throw new Error("Failed to create user account");
      
      const userId = authData.user.id;
      
      // 2. Upload profile picture if exists
      let profilePicUrl = null;
      if (userData.profilePicture) {
        const fileExt = userData.profilePicture.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `profile-pics/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from("profile-user")
          .upload(filePath, userData.profilePicture);
          
        if (uploadError) throw new Error(`Profile picture upload error: ${uploadError.message}`);
        
        const { data: urlData } = supabase.storage
          .from("profile-user")
          .getPublicUrl(filePath);
          
        profilePicUrl = urlData.publicUrl;
      }
      
      // 3. Insert user data into User table
      const { error: userError } = await supabase
        .from("User")
        .insert({
          user_id: userId,
          name: userData.firstName,
          last_name: userData.lastName,
          mail: userData.email,
          phone: userData.phone,
          about: userData.about,
          profile_pic: profilePicUrl,
          permission: userData.permission,
          enter_date: new Date().toISOString(),
          level: 1,
          percentage: 0
        });
        
      if (userError) throw new Error(`User data error: ${userError.message}`);
      
      // 4. Insert skills for the user
      if (userData.skills.length > 0) {
        const skillEntries = userData.skills.map(skill => ({
          user_ID: userId,
          skill_ID: skill.id,
          proficiency: "Basic",
          year_Exp: 1
        }));
        
        const { error: skillsError } = await supabase
          .from("UserSkill")
          .insert(skillEntries);
          
        if (skillsError) throw new Error(`Skills error: ${skillsError.message}`);
      }
      
      // 5. Set user role if specified
      if (userData.role) {
        const { error: roleError } = await supabase
          .from("UserRole")
          .insert({
            user_id: userId,
            role_name: userData.role
          });
          
        if (roleError) throw new Error(`Role error: ${roleError.message}`);
      }
      
      // 6. Insert education if available (create this table if it doesn't exist yet)
      if (userData.education && userData.education.length > 0) {
        try {
          const educationEntries = userData.education
            .filter(edu => edu.institution || edu.degree) // Only include entries with some data
            .map(edu => ({
              user_id: userId,
              institution: edu.institution,
              degree: edu.degree,
              year: edu.year
            }));
          
          if (educationEntries.length > 0) {
            const { error: eduError } = await supabase
              .from("UserEducation")
              .insert(educationEntries);
              
            if (eduError) console.warn("Could not add education:", eduError);
          }
        } catch (error) {
          console.warn("Error adding education (table might not exist):", error);
        }
      }
      
      // 7. Insert work experience if available (create this table if it doesn't exist yet)
      if (userData.workExperience && userData.workExperience.length > 0) {
        try {
          const workEntries = userData.workExperience
            .filter(work => work.company || work.position) // Only include entries with some data
            .map(work => ({
              user_id: userId,
              company: work.company,
              position: work.position,
              duration: work.duration,
              description: work.description
            }));
          
          if (workEntries.length > 0) {
            const { error: workError } = await supabase
              .from("UserWorkExperience")
              .insert(workEntries);
              
            if (workError) console.warn("Could not add work experience:", workError);
          }
        } catch (error) {
          console.warn("Error adding work experience (table might not exist):", error);
        }
      }
      
      // 8. Insert languages if available (create this table if it doesn't exist yet)
      if (userData.languages && userData.languages.length > 0) {
        try {
          const langEntries = userData.languages
            .filter(lang => lang.name) // Only include entries with a language name
            .map(lang => ({
              user_id: userId,
              language: lang.name,
              level: lang.level || "Basic"
            }));
          
          if (langEntries.length > 0) {
            const { error: langError } = await supabase
              .from("UserLanguages")
              .insert(langEntries);
              
            if (langError) console.warn("Could not add languages:", langError);
          }
        } catch (error) {
          console.warn("Error adding languages (table might not exist):", error);
        }
      }
      
      // All operations successful
      setSuccess(true);
      setSnackbar({
        open: true,
        message: "Employee added successfully!",
        severity: "success"
      });
      
      // Close dialog after short delay
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error) {
      console.error("Error creating user:", error);
      setError(error.message);
      setSnackbar({
        open: true,
        message: `Error creating user: ${error.message}`,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Render CV Upload Step
  const renderUploadStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', p: 2 }}>
      <Typography variant="h6" align="center" sx={{ fontWeight: 500, mb: 1 }}>
        Upload a Resume/CV to Extract Information
      </Typography>
      
      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
        Upload a PDF or Word Document. Our AI will analyze it to extract contact information, skills, and experience.
      </Typography>
      
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          p: 3,
          border: '2px dashed',
          borderColor: file ? ACCENTURE_COLORS.corePurple2 : ACCENTURE_COLORS.lightGray,
          borderRadius: 2,
          textAlign: 'center',
          backgroundColor: file ? alpha(ACCENTURE_COLORS.corePurple1, 0.03) : 'transparent',
          transition: 'all 0.3s ease'
        }}
      >
        {file ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <DescriptionIcon sx={{ fontSize: 48, color: ACCENTURE_COLORS.corePurple1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{file.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {(file.size / 1024).toFixed(2)} KB • {file.type.split('/')[1].toUpperCase()}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  setFile(null);
                  setFilePreviewUrl(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                sx={{ textTransform: 'none' }}
              >
                Remove
              </Button>
              
              <Button
                component="label"
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{ textTransform: 'none' }}
              >
                Change File
                <VisuallyHiddenInput 
                  type="file" 
                  onChange={handleFileChange} 
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CloudUploadIcon sx={{ fontSize: 60, color: ACCENTURE_COLORS.corePurple1 }} />
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Drag & Drop your CV here
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or
            </Typography>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{ 
                bgcolor: ACCENTURE_COLORS.corePurple1,
                '&:hover': {
                  bgcolor: ACCENTURE_COLORS.corePurple2
                },
                textTransform: 'none'
              }}
            >
              Browse Files
              <VisuallyHiddenInput 
                type="file" 
                onChange={handleFileChange} 
                ref={fileInputRef}
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              />
            </Button>
            <Typography variant="caption" color="text.secondary">
              Supported formats: PDF, DOC, DOCX
            </Typography>
          </Box>
        )}
      </Paper>
      
      {filePreviewUrl && file.type === 'application/pdf' && (
        <Paper 
          elevation={1} 
          sx={{ 
            width: '100%', 
            mt: 2, 
            height: '300px', 
            overflow: 'hidden',
            borderRadius: 1
          }}
        >
          <iframe
            src={filePreviewUrl}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="CV Preview"
          ></iframe>
        </Paper>
      )}
      
      <Button 
        variant="contained"
        color="primary"
        disabled={!file || parsing}
        onClick={parseCV}
        startIcon={parsing ? <CircularProgress size={20} color="inherit" /> : <PsychologyIcon />}
        sx={{ 
          mt: 2,
          width: 200,
          bgcolor: ACCENTURE_COLORS.corePurple1,
          '&:hover': {
            bgcolor: ACCENTURE_COLORS.corePurple2
          },
          '&.Mui-disabled': {
            bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.3)
          },
          textTransform: 'none'
        }}
      >
        {parsing ? "Analyzing with AI..." : "Analyze with AI"}
      </Button>
      
      {parsing && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={parseProgress} 
            sx={{
              height: 8,
              borderRadius: 5,
              backgroundColor: alpha(ACCENTURE_COLORS.corePurple1, 0.1),
              '& .MuiLinearProgress-bar': {
                backgroundColor: ACCENTURE_COLORS.corePurple1,
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              {parseProgress < 30 ? "Extracting text..." : 
               parseProgress < 60 ? "Analyzing content..." : 
               parseProgress < 90 ? "Identifying skills & experience..." : 
               "Finalizing results..."}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {parseProgress}%
            </Typography>
          </Box>
        </Box>
      )}
      
      {aiAnalysisDetails.showDetails && (
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            p: 2,
            border: '1px solid',
            borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.2),
            borderRadius: 2,
            mt: 2
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: ACCENTURE_COLORS.corePurple1 }}>
            AI Analysis Results
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">AI Confidence</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={aiAnalysisDetails.confidence * 100} 
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: alpha(ACCENTURE_COLORS.corePurple1, 0.1),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: aiAnalysisDetails.confidence > 0.8 ? '#4caf50' : 
                                        aiAnalysisDetails.confidence > 0.6 ? '#ff9800' : '#f44336',
                      }
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(aiAnalysisDetails.confidence * 100)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Processing Time</Typography>
              <Typography variant="body2">
                {aiAnalysisDetails.processingTime.toFixed(2)} seconds
              </Typography>
            </Grid>
          </Grid>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, mb: 0.5 }}>
            Detected Fields
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {aiAnalysisDetails.detectedFields.map((field, index) => (
              <Chip 
                key={index} 
                label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} 
                size="small" 
                variant="outlined"
                sx={{ 
                  color: ACCENTURE_COLORS.corePurple1,
                  borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.5),
                  backgroundColor: alpha(ACCENTURE_COLORS.corePurple1, 0.05),
                }}
              />
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
  
  // Render Review Information Step
  const renderReviewStep = () => (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
        Review & Edit Extracted Information
      </Typography>
      
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.2)}`,
              height: '100%'
            }}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 2, 
                fontWeight: 600,
                color: ACCENTURE_COLORS.corePurple1,
                display: 'flex',
                alignItems: 'center'
              }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: ACCENTURE_COLORS.corePurple1,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: ACCENTURE_COLORS.corePurple1,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  required
                  value={userData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: ACCENTURE_COLORS.corePurple1,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: ACCENTURE_COLORS.corePurple1,
                    },
                  }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: ACCENTURE_COLORS.corePurple1,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: ACCENTURE_COLORS.corePurple1,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={userData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: ACCENTURE_COLORS.corePurple1,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: ACCENTURE_COLORS.corePurple1,
                    },
                  }}
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: ACCENTURE_COLORS.corePurple1,
                        },
                      },
                    }}
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
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.2)}`,
              height: '100%'
            }}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 2, 
                fontWeight: 600,
                color: ACCENTURE_COLORS.corePurple1,
                display: 'flex',
                alignItems: 'center'
              }}
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
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: ACCENTURE_COLORS.corePurple1,
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: ACCENTURE_COLORS.corePurple1,
                        },
                      }}
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
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: ACCENTURE_COLORS.corePurple1,
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: ACCENTURE_COLORS.corePurple1,
                        },
                      }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: ACCENTURE_COLORS.corePurple1,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: ACCENTURE_COLORS.corePurple1,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Profile Picture */}
        <Grid item xs={12}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.2)}`
            }}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 3, 
                fontWeight: 600,
                color: ACCENTURE_COLORS.corePurple1,
                display: 'flex',
                alignItems: 'center'
              }}
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
                  sx={{ 
                    textTransform: 'none',
                    borderColor: ACCENTURE_COLORS.corePurple1,
                    color: ACCENTURE_COLORS.corePurple1,
                    '&:hover': {
                      borderColor: ACCENTURE_COLORS.corePurple2,
                      bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.05)
                    }
                  }}
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
                    setUserData(prev => ({
                      ...prev,
                      profilePicture: null,
                      profilePictureUrl: null
                    }));
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Education (Only show if there's education data or user might want to add it) */}
        <Grid item xs={12}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.2)}`
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600,
                  color: ACCENTURE_COLORS.corePurple1,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <SchoolIcon sx={{ mr: 1, fontSize: 20 }} />
                Education
              </Typography>
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddEducation}
                sx={{ 
                  textTransform: 'none',
                  borderColor: ACCENTURE_COLORS.corePurple1,
                  color: ACCENTURE_COLORS.corePurple1,
                  '&:hover': {
                    borderColor: ACCENTURE_COLORS.corePurple2,
                    bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.05)
                  }
                }}
              >
                Add Education
              </Button>
            </Box>
            
            {userData.education.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No education information added yet.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {userData.education.map((edu, index) => (
                  <Paper 
                    key={index}
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      border: `1px solid ${alpha(ACCENTURE_COLORS.lightGray, 0.5)}`,
                      position: 'relative'
                    }}
                  >
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleRemoveEducation(index)}
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Institution"
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-focused fieldset': {
                                borderColor: ACCENTURE_COLORS.corePurple1,
                              },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: ACCENTURE_COLORS.corePurple1,
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel id={`language-level-label-${index}`} sx={{ '&.Mui-focused': { color: ACCENTURE_COLORS.corePurple1 } }}>
                            Proficiency
                          </InputLabel>
                          <Select
                            labelId={`language-level-label-${index}`}
                            value={lang.level || "Basic"}
                            label="Proficiency"
                            onChange={(e) => handleLanguageChange(index, 'level', e.target.value)}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: ACCENTURE_COLORS.corePurple1,
                                },
                              },
                            }}
                          >
                            <MenuItem value="Basic">Basic</MenuItem>
                            <MenuItem value="Intermediate">Intermediate</MenuItem>
                            <MenuItem value="Advanced">Advanced</MenuItem>
                            <MenuItem value="Fluent">Fluent</MenuItem>
                            <MenuItem value="Native">Native</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
  
  // Render Credentials Step
  const renderCredentialsStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, width: '100%' }}>
      <Typography variant="h6" align="center" sx={{ mb: 3, fontWeight: 500 }}>
        Set Account Credentials
      </Typography>
      
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 2,
          border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.2)}`,
          maxWidth: 500,
          width: '100%',
          mx: 'auto'
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            Email Address
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            disabled
            value={userData.email}
            InputProps={{
              readOnly: true,
              sx: { bgcolor: alpha(ACCENTURE_COLORS.lightGray, 0.2) }
            }}
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            Password
          </Typography>
          <TextField
            fullWidth
            type="password"
            variant="outlined"
            required
            placeholder="Create password"
            value={userData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: ACCENTURE_COLORS.corePurple1,
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: ACCENTURE_COLORS.corePurple1,
              },
            }}
            helperText="Password must be at least 8 characters"
          />
        </Box>
        
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            Confirm Password
          </Typography>
          <TextField
            fullWidth
            type="password"
            variant="outlined"
            required
            placeholder="Confirm password"
            value={userData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: ACCENTURE_COLORS.corePurple1,
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: ACCENTURE_COLORS.corePurple1,
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
  
  // Render Confirmation Step
  const renderConfirmationStep = () => (
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
            sx={{ 
              mb: 1.5, 
              fontWeight: 600,
              color: ACCENTURE_COLORS.corePurple1,
              display: 'flex',
              alignItems: 'center'
            }}
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
            sx={{ 
              mb: 1.5, 
              fontWeight: 600,
              color: ACCENTURE_COLORS.corePurple1,
              display: 'flex',
              alignItems: 'center'
            }}
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
              sx={{ 
                mb: 1.5, 
                fontWeight: 600,
                color: ACCENTURE_COLORS.corePurple1,
                display: 'flex',
                alignItems: 'center'
              }}
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
              sx={{ 
                mb: 1.5, 
                fontWeight: 600,
                color: ACCENTURE_COLORS.corePurple1,
                display: 'flex',
                alignItems: 'center'
              }}
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
              sx={{ 
                mb: 1.5, 
                fontWeight: 600,
                color: ACCENTURE_COLORS.corePurple1,
                display: 'flex',
                alignItems: 'center'
              }}
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
            sx={{ 
              mb: 1.5, 
              fontWeight: 600,
              color: ACCENTURE_COLORS.corePurple1,
              display: 'flex',
              alignItems: 'center'
            }}
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
  
  // Render the current step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderUploadStep();
      case 1:
        return renderReviewStep();
      case 2:
        return renderCredentialsStep();
      case 3:
        return renderConfirmationStep();
      default:
        return "Unknown step";
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        }
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonAddIcon 
            sx={{ 
              mr: 1.5, 
              color: ACCENTURE_COLORS.corePurple1,
              fontSize: 28
            }} 
          />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Add New Employee
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <Box sx={{ px: 3, pt: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel StepIconProps={{
                sx: {
                  color: activeStep >= index ? ACCENTURE_COLORS.corePurple1 : undefined,
                  '&.Mui-completed': {
                    color: ACCENTURE_COLORS.corePurple2,
                  }
                }
              }}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      <DialogContent 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          p: 3,
          minHeight: 400
        }}
      >
        {renderStepContent(activeStep)}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          onClick={handleClose}
          sx={{ 
            color: ACCENTURE_COLORS.darkGray,
            textTransform: 'none'
          }}
        >
          Cancel
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            sx={{ textTransform: 'none' }}
            startIcon={<KeyboardArrowLeftIcon />}
          >
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button 
            variant="contained"
            onClick={handleNext}
            sx={{ 
              bgcolor: ACCENTURE_COLORS.corePurple1,
              '&:hover': {
                bgcolor: ACCENTURE_COLORS.corePurple2
              },
              textTransform: 'none'
            }}
            endIcon={<KeyboardArrowRightIcon />}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || success}
            sx={{ 
              bgcolor: ACCENTURE_COLORS.corePurple1,
              '&:hover': {
                bgcolor: ACCENTURE_COLORS.corePurple2
              },
              textTransform: 'none'
            }}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          >
            {loading ? "Creating..." : "Create Employee"}
          </Button>
        )}
      </DialogActions>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default AddEmployeeForm;