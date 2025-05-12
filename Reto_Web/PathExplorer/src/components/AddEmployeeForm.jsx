import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert
} from "@mui/material";
import { alpha } from "@mui/material/styles";

// Icons
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

// Supabase client
import { supabase } from "../supabase/supabaseClient";
import { createEmployeeWithoutSessionChange, uploadProfilePicture } from "../hooks/employeeService";

// CV parser service
import { parseCV, simulateParseCV } from "../hooks/cvParserService";

// Step components
import UploadStep from "./UploadStep";
import ReviewStep from "./ReviewStep";
import CredentialsStep from "./CredentialsStep";
import ConfirmationStep from "./ConfirmationStep";

// Styles
import { ACCENTURE_COLORS, primaryButtonStyles } from "../styles/styles";

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
    about: "",
    profilePicture: null,
    profilePictureUrl: null,
    skills: [],
    password: "",
    confirmPassword: "",
    permission: "Employee",
    // Initialize empty arrays for optional sections
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
    severity: "info",
    action: null
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

  
  // Handle CV parsing with our service
  const handleParseCV = async () => {
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
      
      // Call our parser service with progress updates
      const result = await parseCV(
        file, 
        availableSkills, 
        availableRoles,
        (progress) => setParseProgress(progress)
      );
      
      // Update user data with parsed information
      setUserData(prev => ({
        ...prev,
        ...result.parsedData
      }));
      
      // Update AI analysis details
      setAiAnalysisDetails({
        confidence: result.meta.confidence,
        detectedFields: result.meta.detectedFields,
        processingTime: result.meta.processingTime,
        showDetails: true
      });
      
      setSnackbar({
        open: true,
        message: "CV successfully analyzed with AI!",
        severity: "success"
      });
      
      setTimeout(() => {
        setParsing(false);
        setActiveStep(1);
      }, 500);
      
    } catch (error) {
      console.error("Error parsing CV:", error);
      setParsing(false);
      setParseProgress(0);
      
      // If parsing fails, offer simulation mode
      setSnackbar({
        open: true,
        message: `Error parsing CV: ${error.message}. Would you like to use simulation mode instead?`,
        severity: "error",
        action: (
          <Button 
            color="inherit" 
            size="small" 
            onClick={handleSimulateParseCV}
          >
            Use Simulation
          </Button>
        )
      });
    }
  };
  
  // Handle simulation mode
  const handleSimulateParseCV = async () => {
    setParsing(true);
    setParseProgress(0);
    
    try {
      // Call our simulation function
      const result = await simulateParseCV(
        (progress) => setParseProgress(progress)
      );
      
      // Update user data with simulated information
      setUserData(prev => ({
        ...prev,
        ...result.parsedData
      }));
      
      // Update AI analysis details
      setAiAnalysisDetails({
        confidence: result.meta.confidence,
        detectedFields: result.meta.detectedFields,
        processingTime: result.meta.processingTime,
        showDetails: true
      });
      
      setSnackbar({
        open: true,
        message: "CV successfully analyzed (Simulation Mode)",
        severity: "success"
      });
      
      setTimeout(() => {
        setParsing(false);
        setActiveStep(1);
      }, 500);
      
    } catch (error) {
      console.error("Error in simulation:", error);
      setParsing(false);
      setParseProgress(0);
      
      setSnackbar({
        open: true,
        message: "Error in simulation mode. Please try again.",
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
  
  // Handle field changes in the form with auto-email generation
const handleInputChange = (field, value) => {
  setUserData(prev => ({
    ...prev,
    [field]: value
  }));
  
  // Si cambia el nombre o apellido, actualizar automáticamente el email
  if (field === 'firstName' || field === 'lastName') {
    const firstName = field === 'firstName' ? value : userData.firstName;
    const lastName = field === 'lastName' ? value : userData.lastName;
    
    if (firstName && lastName) {
      // Normalizar nombres: eliminar espacios extra, convertir a minúsculas
      let normalizedFirstName = firstName.trim().toLowerCase();
      let normalizedLastName = lastName.trim().toLowerCase();
      
      // Eliminar caracteres especiales y acentos
      normalizedFirstName = normalizedFirstName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
        .replace(/[^a-z0-9]/g, "");      // Solo permitir letras y números
        
      normalizedLastName = normalizedLastName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
      
      // Generar y establecer el email sin importar su valor actual
      const corporateEmail = `${normalizedFirstName}.${normalizedLastName}@accenture.com`;
      
      setUserData(prev => ({
        ...prev,
        email: corporateEmail
      }));
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
  

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // 1. Validar datos obligatorios
      if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
        setSnackbar({
          open: true,
          message: "Por favor completa todos los campos obligatorios",
          severity: "warning"
        });
        setLoading(false);
        return;
      }
      
      // 2. Validar contraseñas coincidentes
      if (userData.password !== userData.confirmPassword) {
        setSnackbar({
          open: true,
          message: "Las contraseñas no coinciden",
          severity: "warning"
        });
        setLoading(false);
        return;
      }
      
      // 3. Subir foto de perfil si existe
      let profilePicUrl = null;
      if (userData.profilePicture) {
        try {
          profilePicUrl = await uploadProfilePicture(userData.profilePicture);
          console.log("Foto de perfil subida:", profilePicUrl);
        } catch (uploadError) {
          console.warn("Error al subir foto de perfil:", uploadError);
          // Continuamos sin la foto
        }
      }
      
      // 4. Crear empleado usando el servicio que llama al endpoint
      const result = await createEmployeeWithoutSessionChange({
        ...userData,
        profilePicUrl
      });
      
      // 5. Mostrar mensaje de éxito
      setSuccess(true);
      setSnackbar({
        open: true,
        message: `Empleado añadido exitosamente: ${result.email || userData.email}`,
        severity: "success"
      });
      
      // 6. Cerrar el modal después de un tiempo
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error) {
      console.error("Error al crear empleado:", error);
      
      // Error específico para Auth error: User not allowed
      if (error.message && error.message.includes("Auth error: User not allowed")) {
        setError("No tienes permisos suficientes para crear usuarios. Contacta al administrador del sistema.");
      } else {
        setError(error.message);
      }
      
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

// Función auxiliar para limpiar datos
const cleanupUser = async (userId) => {
  try {
    console.log("Limpiando datos de usuario:", userId);
    
    try {
      await supabase.from("UserSkill").delete().eq("user_ID", userId);
    } catch (e) {
      console.warn("Error limpiando UserSkill:", e);
    }
    
    try {
      await supabase.from("User").delete().eq("user_id", userId);
    } catch (e) {
      console.warn("Error limpiando User:", e);
    }
    
  } catch (cleanupError) {
    console.error("Error al limpiar datos de usuario:", cleanupError);
  }
};
  
  // Render the appropriate step component based on active step
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <UploadStep
            file={file}
            filePreviewUrl={filePreviewUrl}
            fileInputRef={fileInputRef}
            parsing={parsing}
            parseProgress={parseProgress}
            aiAnalysisDetails={aiAnalysisDetails}
            handleFileChange={handleFileChange}
            handleParseCV={handleParseCV}
            setFile={setFile}
            setFilePreviewUrl={setFilePreviewUrl}
          />
        );
      case 1:
        return (
          <ReviewStep
            userData={userData}
            availableSkills={availableSkills}
            availableRoles={availableRoles}
            handleInputChange={handleInputChange}
            handleProfilePictureChange={handleProfilePictureChange}
            handleAddEducation={handleAddEducation}
            handleEducationChange={handleEducationChange}
            handleRemoveEducation={handleRemoveEducation}
            handleAddWorkExperience={handleAddWorkExperience}
            handleWorkExperienceChange={handleWorkExperienceChange}
            handleRemoveWorkExperience={handleRemoveWorkExperience}
            handleAddLanguage={handleAddLanguage}
            handleLanguageChange={handleLanguageChange}
            handleRemoveLanguage={handleRemoveLanguage}
          />
        );
      case 2:
        return (
          <CredentialsStep
            userData={userData}
            handleInputChange={handleInputChange}
          />
        );
      case 3:
        return (
          <ConfirmationStep
            userData={userData}
            error={error}
            success={success}
          />
        );
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
              ...primaryButtonStyles,
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
              ...primaryButtonStyles,
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
          action={snackbar.action}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default AddEmployeeForm;