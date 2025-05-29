import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  TextField,
  MenuItem,
  InputAdornment,
  useTheme,
  alpha,
  Snackbar,
  Alert,
  FormControl,
  Select,
  Checkbox,
  Avatar,
  Fade,
  Grow,
  Slide,
  Zoom,
  Skeleton,
  Card,
  CardContent,
  Divider,
  Badge
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PictureAsPdf as PdfIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  Assignment as AssignmentIcon,
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  CalendarToday as CalendarTodayIcon,
  Score as ScoreIcon,
  PersonAdd as PersonAddIcon,
  Verified as VerifiedIcon,
  HourglassEmpty as HourglassEmptyIcon,
  BlockRounded as BlockIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  EmojiEvents as EmojiEventsIcon,
  AccessTime as AccessTimeIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Star as StarIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { supabase } from '../supabase/supabaseClient';

// Enhanced Accenture Colors with gradient variations
const ACCENTURE_COLORS = {
  corePurple1: "#a873e8",
  corePurple2: "#8a60b0",
  corePurple3: "#6a4b87",
  accentPurple1: "#c99fd1",
  accentPurple2: "#c8a4f2",
  accentPurple3: "#d4b6f7",
  accentPurple4: "#e7d6f9",
  accentPurple5: "#f0e9fa",
  blue: "#6b89e3",
  lightBlue: "#9fe0e0",
  green: "#a3d9a3",
  blueGreen: "#a0e0cc",
  red: "#e88a8a",
  pink: "#f0a0cc",
  orange: "#f2bb80",
  yellow: "#f2eaaa",
  black: "#333333",
  darkGray: "#696964",
  lightGray: "#e6e6dc",
  white: "#ffffff",
  // Gradient definitions
  gradients: {
    purple: 'linear-gradient(135deg, #a873e8 0%, #8a60b0 100%)',
    purpleLight: 'linear-gradient(135deg, #c8a4f2 0%, #d4b6f7 100%)',
    success: 'linear-gradient(135deg, #a3d9a3 0%, #a0e0cc 100%)',
    error: 'linear-gradient(135deg, #e88a8a 0%, #f0a0cc 100%)',
    warning: 'linear-gradient(135deg, #f2bb80 0%, #f2eaaa 100%)',
    info: 'linear-gradient(135deg, #6b89e3 0%, #9fe0e0 100%)',
    neutral: 'linear-gradient(135deg, #696964 0%, #333333 100%)'
  }
};

const PROFICIENCY_LEVELS = [
  { value: "Basic", label: "Basic", color: ACCENTURE_COLORS.lightBlue, icon: <StarIcon /> },
  { value: "Low", label: "Low", color: ACCENTURE_COLORS.green, icon: <StarIcon /> },
  { value: "Medium", label: "Medium", color: ACCENTURE_COLORS.orange, icon: <StarIcon /> },
  { value: "High", label: "High", color: ACCENTURE_COLORS.red, icon: <StarIcon /> }
];

// Styled components for glassmorphism and modern design
const GlassCard = ({ children, sx, ...props }) => (
  <Card
    elevation={0}
    sx={{
      background: alpha(ACCENTURE_COLORS.white, 0.7),
      backdropFilter: 'blur(20px)',
      border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`,
      borderRadius: 2,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      ...sx
    }}
    {...props}
  >
    {children}
  </Card>
);

const AnimatedChip = ({ children, sx, ...props }) => (
  <Chip
    sx={{
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 4px 12px ${alpha(ACCENTURE_COLORS.corePurple1, 0.2)}`,
      },
      ...sx
    }}
    {...props}
  >
    {children}
  </Chip>
);

const StyledButton = ({ children, variant = 'contained', sx, ...props }) => (
  <Button
    variant={variant}
    sx={{
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 500,
      boxShadow: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      ...(variant === 'contained' && {
        background: ACCENTURE_COLORS.gradients.purple,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${alpha(ACCENTURE_COLORS.corePurple1, 0.3)}`,
        }
      }),
      ...sx
    }}
    {...props}
  >
    {children}
  </Button>
);

const ReviewCertifications = ({ open, onClose }) => {
  const theme = useTheme();
  
  const [certifications, setCertifications] = useState([]);
  const [filteredCertifications, setFilteredCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [skillsDialogOpen, setSkillsDialogOpen] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [proficiencyLevels, setProficiencyLevels] = useState({});
  const [experienceYears, setExperienceYears] = useState({});
  const [userSkills, setUserSkills] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch certifications data
  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        setLoading(true);
        
        // Get all user certifications
        const { data, error } = await supabase
          .from('UserCertifications')
          .select(`
            user_ID,
            certification_ID,
            completed_Date,
            valid_Until,
            score,
            evidence,
            status,
            rejection_reason
          `)
          .order('completed_Date', { ascending: false });
        
        if (error) throw error;
        
        // Obtener datos de usuarios
        const userIds = [...new Set(data.map(cert => cert.user_ID))];
        const { data: userData, error: userError } = await supabase
          .from('User')
          .select('user_id, name, last_name, mail, profile_pic')
          .in('user_id', userIds);
          
        if (userError) throw userError;
        
        // Obtener datos de certificaciones
        const certIds = [...new Set(data.map(cert => cert.certification_ID))];
        const { data: certData, error: certError } = await supabase
          .from('Certifications')
          .select('certification_id, title, description, skill_acquired')
          .in('certification_id', certIds);
          
        if (certError) throw certError;
        
        // Crear mapas para acceso rápido
        const userMap = {};
        userData.forEach(user => {
          userMap[user.user_id] = user;
        });
        
        const certMap = {};
        certData.forEach(cert => {
          certMap[cert.certification_id] = cert;
        });
        
        // Transform data for display
        const formattedData = data.map(cert => {
          const user = userMap[cert.user_ID] || {};
          const certification = certMap[cert.certification_ID] || {};
          
          return {
            uniqueId: `${cert.user_ID}_${cert.certification_ID}`,
            userId: cert.user_ID,
            certificationId: cert.certification_ID,
            userName: `${user.name || ''} ${user.last_name || ''}`.trim() || 'Usuario desconocido',
            userEmail: user.mail || '',
            userProfilePic: user.profile_pic,
            certificationName: certification.title || 'Certificación',
            certificationDesc: certification.description || '',
            completedDate: cert.completed_Date ? new Date(cert.completed_Date).toLocaleDateString() : 'N/A',
            validUntil: cert.valid_Until ? new Date(cert.valid_Until).toLocaleDateString() : 'N/A',
            score: cert.score || 0,
            evidence: cert.evidence || '',
            status: cert.status || 'pending',
            rejectionReason: cert.rejection_reason || '',
            skillAcquired: certification.skill_acquired,
            originalData: cert
          };
        });
        
        setCertifications(formattedData);
        setFilteredCertifications(formattedData);
        
        // Fetch available skills for later use
        const { data: skills, error: skillsError } = await supabase
          .from('Skill')
          .select('skill_ID, name, category, type, description');
          
        if (skillsError) throw skillsError;
        
        setAllSkills(skills || []);
        
      } catch (error) {
        console.error('Error fetching certifications:', error);
        setSnackbar({
          open: true,
          message: `Error al cargar certificaciones: ${error.message}`,
          severity: 'error'
        });
        // Set some mock data for display purposes
        setMockData();
      } finally {
        setLoading(false);
      }
    };
    
    // Mock data function in case of API errors
    const setMockData = () => {
      const mockCertifications = [
        {
          uniqueId: '1_1',
          userId: 'user123',
          certificationId: 'cert1',
          userName: 'Ana Fernanda Mendoza',
          userEmail: 'ana.mendoza@company.com',
          userProfilePic: null,
          certificationName: 'AWS Certified Solutions Architect',
          certificationDesc: 'Amazon Web Services certification',
          completedDate: '01/15/2025',
          validUntil: '01/15/2028',
          score: 85,
          evidence: 'https://example.com/cert1.pdf',
          status: 'pending',
          rejectionReason: null,
          skillAcquired: [1, 2]
        },
        {
          uniqueId: '2_2',
          userId: 'user456',
          certificationId: 'cert2',
          userName: 'Carlos Vega Noroña',
          userEmail: 'carlos.vega@company.com',
          userProfilePic: null,
          certificationName: 'SHRM Certification',
          certificationDesc: 'Society for Human Resource Management certification',
          completedDate: '02/20/2025',
          validUntil: '02/20/2027',
          score: 92,
          evidence: 'https://example.com/cert2.pdf',
          status: 'approved',
          rejectionReason: null,
          skillAcquired: 3
        },
        {
          uniqueId: '3_3',
          userId: 'user789',
          certificationId: 'cert3',
          userName: 'Daniela Morales Quintero',
          userEmail: 'daniela.morales@company.com',
          userProfilePic: null,
          certificationName: 'Microsoft Teams Specialization',
          certificationDesc: 'Microsoft certification for Teams administration',
          completedDate: '03/05/2025',
          validUntil: '03/05/2026',
          score: 78,
          evidence: 'https://example.com/cert3.pdf',
          status: 'rejected',
          rejectionReason: 'Certificate appears to be expired',
          skillAcquired: [4, 5]
        }
      ];
      
      setCertifications(mockCertifications);
      setFilteredCertifications(mockCertifications);
      
      const mockSkills = [
        { skill_ID: 1, name: 'AWS', category: 'Cloud Computing', type: 'Technical Skill', description: 'Amazon Web Services: platform for cloud computing' },
        { skill_ID: 2, name: 'Cloud Architecture', category: 'Cloud Computing', type: 'Technical Skill', description: 'Design and implementation of cloud solutions' },
        { skill_ID: 3, name: 'Leadership', category: 'Management', type: 'Soft Skill', description: 'Facility to lead people and coordinate teams' },
        { skill_ID: 4, name: 'SCRUM', category: 'Project Management', type: 'Technical Skill', description: 'Agile framework for managing complex projects' },
        { skill_ID: 5, name: 'Docker', category: 'DevOps', type: 'Technical Skill', description: 'Tool for containerizing applications and microservices' }
      ];
      
      setAllSkills(mockSkills);
    };
    
    if (open) {
      fetchCertifications();
    }
  }, [open]);
  
  // Filter certifications based on search and status filter
  useEffect(() => {
    if (!certifications.length) {
      setFilteredCertifications([]);
      return;
    }
    
    let filtered = [...certifications];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(cert => cert.status === statusFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(cert =>
        cert.userName.toLowerCase().includes(search) ||
        cert.certificationName.toLowerCase().includes(search) ||
        cert.userEmail?.toLowerCase().includes(search)
      );
    }
    
    setFilteredCertifications(filtered);
  }, [certifications, searchTerm, statusFilter]);
  
  // Open preview dialog for PDF evidence
  const handleViewEvidence = (cert) => {
    setPreviewFile(cert.evidence);
    setPreviewOpen(true);
  };
  
  // Reset skills when dialog closes
  useEffect(() => {
    if (!skillsDialogOpen) {
      setSelectedSkills([]);
      setProficiencyLevels({});
      setExperienceYears({});
      setAvailableSkills([]);
    }
  }, [skillsDialogOpen]);
  
  // Open approval dialog with skills selection
  const handleApprove = async (cert) => {
    setSelectedCertification(cert);
    
    // Reset proficiency and experience states
    setProficiencyLevels({});
    setExperienceYears({});
    setSelectedSkills([]);
    
    try {
      // Get user's current skills
      const { data: userSkills, error: userSkillsError } = await supabase
        .from('UserSkill')
        .select(`
          skill_ID, 
          proficiency,
          year_Exp,
          Skill:skill_ID(name, type, category)
        `)
        .eq('user_ID', cert.userId);
        
      if (userSkillsError) throw userSkillsError;
      
      // Store the user's current skills for reference
      setUserSkills(userSkills || []);
      
      // Get related skills from the certification
      let relatedSkillIds = [];
      
      if (cert.skillAcquired) {
        // Lógica existente para obtener skills relacionadas...
        // Si skillAcquired es un array de skill IDs
        if (Array.isArray(cert.skillAcquired)) {
          relatedSkillIds = cert.skillAcquired;
        } 
        // Si skillAcquired es un único skill ID
        else if (typeof cert.skillAcquired === 'number') {
          relatedSkillIds = [cert.skillAcquired];
        }
        // Si skillAcquired es un string que podría analizarse como JSON
        else if (typeof cert.skillAcquired === 'string') {
          try {
            const parsed = JSON.parse(cert.skillAcquired);
            if (Array.isArray(parsed)) {
              relatedSkillIds = parsed;
            } else {
              relatedSkillIds = [parsed];
            }
          } catch (e) {
            // Si no es un JSON válido, intentar ver si es un solo ID
            const id = parseInt(cert.skillAcquired);
            if (!isNaN(id)) {
              relatedSkillIds = [id];
            }
          }
        }
      }
      
      // Si no se encuentran skills en skillAcquired, usar coincidencia de nombres como fallback
      if (relatedSkillIds.length === 0) {
        const suggestedSkillIds = allSkills
          .filter(skill => {
            if (!skill || !skill.name || !cert || !cert.certificationName) return false;
            
            const certNameLower = cert.certificationName.toLowerCase();
            const skillNameLower = skill.name.toLowerCase();
            
            // Algoritmo de coincidencia simple
            return certNameLower.includes(skillNameLower) || 
                  skillNameLower.includes(certNameLower.split(' ')[0]) ||
                  certNameLower.split(' ').some(word => 
                    word.length > 3 && skillNameLower.includes(word.toLowerCase())
                  );
          })
          .map(skill => skill.skill_ID);
        
        relatedSkillIds = suggestedSkillIds;
      }
      
      // Filtrar availableSkills para mostrar solo skills relacionadas
      const filteredSkills = allSkills.filter(skill => 
        relatedSkillIds.includes(skill.skill_ID)
      );
      
      // Asegurarnos de que haya al menos una habilidad disponible
      if (filteredSkills.length === 0) {
        // Si no hay habilidades relacionadas, mostrar todas las habilidades
        setAvailableSkills(allSkills);
      } else {
        setAvailableSkills(filteredSkills);
      }
      
      // Establecer la primera skill como seleccionada por defecto
      if (filteredSkills.length > 0) {
        const defaultSkillId = filteredSkills[0].skill_ID;
        setSelectedSkills([defaultSkillId]);
        
        // Find if user already has this skill
        const existingSkill = userSkills?.find(us => us.skill_ID === defaultSkillId);
        
        // Set initial proficiency (current or Basic if new)
        setProficiencyLevels({
          [defaultSkillId]: existingSkill?.proficiency || "Basic"
        });
        
        // Set initial experience (current+1 or 1 if new)
        setExperienceYears({
          [defaultSkillId]: existingSkill?.year_Exp ? 
            Math.min(10, (existingSkill.year_Exp || 0) + 1) : 1
        });
      }
      
    } catch (error) {
      console.error('Error fetching user skills:', error);
      setSnackbar({
        open: true,
        message: `Error al cargar habilidades del usuario: ${error.message}`,
        severity: 'error'
      });
    }
    
    setSkillsDialogOpen(true);
  };

  const loadCertifications = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('UserCertifications')
        .select(`
          user_ID,
          certification_ID,
          completed_Date,
          valid_Until,
          score,
          evidence,
          status,
          rejection_reason
        `)
        .order('completed_Date', { ascending: false });
      
      if (error) throw error;
      
      // El resto del procesamiento es igual que en fetchCertifications
      // Obtener datos de usuarios
      const userIds = [...new Set(data.map(cert => cert.user_ID))];
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('user_id, name, last_name, mail, profile_pic')
        .in('user_id', userIds);
        
      if (userError) throw userError;
      
      // Obtener datos de certificaciones
      const certIds = [...new Set(data.map(cert => cert.certification_ID))];
      const { data: certData, error: certError } = await supabase
        .from('Certifications')
        .select('certification_id, title, description, skill_acquired')
        .in('certification_id', certIds);
        
      if (certError) throw certError;
      
      // Mapeo y procesamiento igual que antes...
      const userMap = {};
      userData.forEach(user => {
        userMap[user.user_id] = user;
      });
      
      const certMap = {};
      certData.forEach(cert => {
        certMap[cert.certification_id] = cert;
      });
      
      const formattedData = data.map(cert => {
        const user = userMap[cert.user_ID] || {};
        const certification = certMap[cert.certification_ID] || {};
        
        return {
          uniqueId: `${cert.user_ID}_${cert.certification_ID}`,
          userId: cert.user_ID,
          certificationId: cert.certification_ID,
          userName: `${user.name || ''} ${user.last_name || ''}`.trim() || 'Usuario desconocido',
          userEmail: user.mail || '',
          userProfilePic: user.profile_pic,
          certificationName: certification.title || 'Certificación',
          certificationDesc: certification.description || '',
          completedDate: cert.completed_Date ? new Date(cert.completed_Date).toLocaleDateString() : 'N/A',
          validUntil: cert.valid_Until ? new Date(cert.valid_Until).toLocaleDateString() : 'N/A',
          score: cert.score || 0,
          evidence: cert.evidence || '',
          status: cert.status || 'pending',
          rejectionReason: cert.rejection_reason || '',
          skillAcquired: certification.skill_acquired,
          originalData: cert
        };
      });
      
      setCertifications(formattedData);
      setFilteredCertifications(formattedData);
      
    } catch (error) {
      console.error('Error reloading certifications:', error);
      setSnackbar({
        open: true,
        message: `Error al recargar certificaciones: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Open rejection dialog
  const handleReject = (cert) => {
    setSelectedCertification(cert);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };
  
  // Get progression message for skill
  const getProgressionMessage = (skillId) => {
    // Find if this skill exists for the user
    const existingUserSkill = userSkills?.find(skill => skill.skill_ID === skillId);
    
    if (!existingUserSkill) {
      return "New skill will be added";
    }
    
    // For existing skills, explain progression
    const currentProficiency = existingUserSkill.proficiency || "Basic";
    const newProficiency = proficiencyLevels[skillId] || "Basic";
    const currentExp = existingUserSkill.year_Exp || 0;
    
    // Get indices to compare proficiency levels
    const proficiencyOrder = PROFICIENCY_LEVELS.map(p => p.value);
    const currentIndex = proficiencyOrder.indexOf(currentProficiency);
    const newIndex = proficiencyOrder.indexOf(newProficiency);
    
    let message = `Current: ${currentProficiency}, ${currentExp} years → `;
    
    if (newIndex > currentIndex) {
      message += `Upgrades to: ${newProficiency}, ${Math.min(10, currentExp + 1)} years`;
    } else {
      message += `Level remains, +1 year: ${currentProficiency}, ${Math.min(10, currentExp + 1)} year`;
    }
    
    return message;
  };
  
  
// Reemplaza tu función handleConfirmApproval con esta versión

// Función adaptada de handleConfirmApproval para tu código
const handleConfirmApproval = async () => {
  if (!selectedCertification || selectedSkills.length === 0) {
    setSnackbar({
      open: true,
      message: 'Selecciona al menos una habilidad para aprobar',
      severity: 'error'
    });
    return;
  }
  
  setLoading(true);
  try {
    // 1. Primero actualizar la certificación
    const { error: certError } = await supabase
      .from('UserCertifications')
      .update({ 
        status: 'approved', 
        rejection_reason: null 
      })
      .eq('user_ID', selectedCertification.userId)
      .eq('certification_ID', selectedCertification.certificationId);
    
    if (certError) throw certError;
    
    // 2. Llamar a un stored procedure o función que maneje los permisos
    for (const skillId of selectedSkills) {
      try {
        const profLevel = proficiencyLevels[skillId] || 'Medium';
        const expYears = experienceYears[skillId] || 1;
        
        // Llamada a función autorizada en el servidor
        const { data, error } = await supabase.rpc(
          'manage_user_skill',  // Debes crear esta función en Supabase
          {
            user_id: selectedCertification.userId,
            skill_id: skillId,
            prof_level: profLevel,
            exp_years: expYears
          }
        );
        
        if (error) console.error(`Error con skill ${skillId}:`, error);
      } catch (skillErr) {
        console.error(`Error procesando skill ${skillId}:`, skillErr);
      }
    }
    
    await loadCertifications();
    
    setSnackbar({
      open: true,
      message: `Certificación aprobada exitosamente`,
      severity: 'success'
    });
  } catch (err) {
    console.error('Error:', err);
    setSnackbar({
      open: true,
      message: `Error: ${err.message}`,
      severity: 'error'
    });
  } finally {
    setLoading(false);
    setSkillsDialogOpen(false);
    setSelectedCertification(null);
    setSelectedSkills([]);
  }
};
  
  // Submit rejection with reason
  const handleConfirmRejection = async () => {
    if (!selectedCertification || !rejectionReason) return;
    
    try {
      setLoading(true);
      
      console.log("Rejecting certification with ID:", selectedCertification.certificationId);
      console.log("User ID:", selectedCertification.userId);
      console.log("Rejection reason:", rejectionReason);
      
      // FIXED: Make sure we use exactly the same field names as in the database
      const { data: rejectData, error } = await supabase
        .from('UserCertifications')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionReason
        })
        .eq('user_ID', selectedCertification.userId)
        .eq('certification_ID', selectedCertification.certificationId);
        
      console.log("Reject response:", rejectData);
      
      if (error) {
        console.error("Reject error:", error);
        throw error;
      }
      
      // Success notification
      setSnackbar({
        open: true,
        message: `Certificación de ${selectedCertification.userName} ha sido rechazada`,
        severity: 'info'
      });
      
      // Update local data
      setCertifications(prevCerts => 
        prevCerts.map(cert => 
          (cert.userId === selectedCertification.userId && 
           cert.certificationId === selectedCertification.certificationId)
            ? { ...cert, status: 'rejected', rejectionReason: rejectionReason }
            : cert
        )
      );
      
    } catch (error) {
      console.error('Error rejecting certification:', error);
      setSnackbar({
        open: true,
        message: `Error al rechazar certificación: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setRejectDialogOpen(false);
      setSelectedCertification(null);
      setRejectionReason('');
    }
  };
  
  // Handle skill toggle selection - MODIFIED to allow multiple selection
  const handleToggleSkill = (skillId) => {
    // Allow multiple skill selection
    setSelectedSkills(prev => {
      // If already selected, remove it
      if (prev.includes(skillId)) {
        return prev.filter(id => id !== skillId);
      } 
      // If not selected, add it to the selection array
      else {
        return [...prev, skillId];
      }
    });
    
    // Initialize proficiency and experience if not set
    if (!proficiencyLevels[skillId]) {
      const existingSkill = userSkills?.find(us => us.skill_ID === skillId);
      setProficiencyLevels(prev => ({ 
        ...prev, 
        [skillId]: existingSkill?.proficiency || "Basic" 
      }));
    }
    
    if (!experienceYears[skillId]) {
      const existingSkill = userSkills?.find(us => us.skill_ID === skillId);
      setExperienceYears(prev => ({ 
        ...prev, 
        [skillId]: existingSkill?.year_Exp ? 
          Math.min(10, (existingSkill.year_Exp || 0) + 1) : 1 
      }));
    }
  };
  
  // Handle proficiency level change
  const handleProficiencyChange = (skillId, level) => {
    setProficiencyLevels(prev => ({
      ...prev,
      [skillId]: level
    }));
  };
  
  // Handle experience years change
  const handleExperienceChange = (skillId, years) => {
    // Ensure years is within 1-10 range
    const validYears = Math.max(1, Math.min(10, parseInt(years) || 1));
    
    setExperienceYears(prev => ({
      ...prev,
      [skillId]: validYears
    }));
  };
  
  // Get color for proficiency level
  const getProficiencyColor = (level) => {
    const profLevel = PROFICIENCY_LEVELS.find(p => p.value === level);
    return profLevel ? profLevel.color : ACCENTURE_COLORS.darkGray;
  };

  // Get background color for status
  const getStatusBgColor = (status) => {
    switch(status) {
      case 'approved':
        return alpha(ACCENTURE_COLORS.green, 0.1);
      case 'pending':
        return alpha(ACCENTURE_COLORS.blue, 0.1);
      case 'rejected':
        return alpha(ACCENTURE_COLORS.red, 0.1);
      default:
        return alpha(ACCENTURE_COLORS.darkGray, 0.1);
    }
  };
  
  // Get text color for status
  const getStatusTextColor = (status) => {
    switch(status) {
      case 'approved':
        return ACCENTURE_COLORS.green;
      case 'pending':
        return ACCENTURE_COLORS.blue;
      case 'rejected':
        return ACCENTURE_COLORS.red;
      default:
        return ACCENTURE_COLORS.darkGray;
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return '?';
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  // Generate avatar color based on name
  const getAvatarColor = (name) => {
    if (!name) return ACCENTURE_COLORS.darkGray;
    
    const purpleColors = [
      ACCENTURE_COLORS.corePurple1,
      ACCENTURE_COLORS.corePurple2, 
      ACCENTURE_COLORS.corePurple3,
      ACCENTURE_COLORS.accentPurple1,
      ACCENTURE_COLORS.accentPurple2
    ];
    
    // Simple hash function to pick a color based on name
    const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return purpleColors[charSum % purpleColors.length];
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      TransitionComponent={Fade}
      transitionDuration={400}
      PaperProps={{
        sx: { 
          height: { xs: '100vh', sm: '95vh' },
          maxHeight: { xs: '100vh', sm: '95vh' },
          borderRadius: 3,
          overflow: 'hidden',
          background: alpha(ACCENTURE_COLORS.white, 0.98),
          backdropFilter: 'blur(10px)',
          boxShadow: `0 25px 50px -12px ${alpha(ACCENTURE_COLORS.black, 0.25)}`
        }
      }}
    >
      {/* Enhanced Header with Gradient */}
      <Box
        sx={{
          background: ACCENTURE_COLORS.gradients.purple,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 50%, ${alpha(ACCENTURE_COLORS.accentPurple2, 0.3)} 0%, transparent 50%)`,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '200px',
            height: '200px',
            background: `radial-gradient(circle, ${alpha(ACCENTURE_COLORS.accentPurple3, 0.2)} 0%, transparent 70%)`,
            transform: 'translate(50%, -50%)',
          }
        }}
      >
        <Box sx={{ 
          position: 'relative', 
          zIndex: 1,
          py: 3.5,
          px: 4,
          color: ACCENTURE_COLORS.white,
          display: 'flex',
          alignItems: 'center',
          minHeight: 100
        }}>
          <Fade in={open} timeout={600}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              width: '100%'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: alpha(ACCENTURE_COLORS.white, 0.15),
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 8px 32px ${alpha(ACCENTURE_COLORS.black, 0.1)}`,
                  }}
                >
                  <WorkspacePremiumIcon sx={{ fontSize: 28, color: ACCENTURE_COLORS.white }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={600} sx={{ letterSpacing: '-0.02em' }}>
                    Certification Review Center
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    Manage and approve employee certifications
                  </Typography>
                </Box>
              </Box>
              <IconButton 
                onClick={onClose}
                sx={{ 
                  color: ACCENTURE_COLORS.white,
                  bgcolor: alpha(ACCENTURE_COLORS.white, 0.1),
                  backdropFilter: 'blur(10px)',
                  '&:hover': { 
                    bgcolor: alpha(ACCENTURE_COLORS.white, 0.2),
                    transform: 'rotate(90deg)'
                  },
                  transition: 'all 0.3s ease',
                  alignSelf: 'center'
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Fade>
        </Box>
      </Box>
      
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#f8f9fc' }}>
        {/* Enhanced Filters Section */}
        <GlassCard sx={{ 
          m: 3,
          mb: 2,
          borderRadius: 3,
          background: alpha(ACCENTURE_COLORS.white, 0.9),
          backdropFilter: 'blur(20px)',
          boxShadow: `0 4px 20px ${alpha(ACCENTURE_COLORS.corePurple1, 0.08)}`
        }}>
          <CardContent sx={{ p: 3 }}>
            <Fade in={open} timeout={800}>
              <Box>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: 2.5, 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 2.5,
                    flexWrap: 'wrap',
                    flex: 1
                  }}>
                    <TextField
                      placeholder="Search certifications..."
                      size="medium"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{ 
                        minWidth: { xs: 250, sm: 350 },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: alpha(ACCENTURE_COLORS.white, 0.8),
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.3),
                            bgcolor: ACCENTURE_COLORS.white,
                            transform: 'translateY(-1px)',
                            boxShadow: `0 4px 12px ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`
                          },
                          '&.Mui-focused': {
                            borderColor: ACCENTURE_COLORS.corePurple1,
                            boxShadow: `0 0 0 3px ${alpha(ACCENTURE_COLORS.accentPurple4, 0.2)}`,
                            bgcolor: ACCENTURE_COLORS.white
                          },
                          '& input': {
                            fontWeight: 500,
                            '&::placeholder': {
                              color: alpha(ACCENTURE_COLORS.darkGray, 0.6)
                            }
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ 
                              color: ACCENTURE_COLORS.corePurple2, 
                              fontSize: 22 
                            }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    px: 2.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.05),
                    border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`
                  }}>
                    <Typography variant="body2" fontWeight={600} color={ACCENTURE_COLORS.corePurple2}>
                      {filteredCertifications.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      of {certifications.length} certifications
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterListIcon sx={{ fontSize: 18, color: ACCENTURE_COLORS.darkGray }} />
                    <Typography variant="body2" fontWeight={500} color="text.secondary">
                      Filter by status:
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {[
                      { value: 'all', label: 'All', icon: <AutoAwesomeIcon />, color: ACCENTURE_COLORS.corePurple1 },
                      { value: 'pending', label: 'Pending', icon: <HourglassEmptyIcon />, color: ACCENTURE_COLORS.blue },
                      { value: 'approved', label: 'Approved', icon: <VerifiedIcon />, color: ACCENTURE_COLORS.green },
                      { value: 'rejected', label: 'Rejected', icon: <BlockIcon />, color: ACCENTURE_COLORS.red }
                    ].map((status) => (
                      <AnimatedChip
                        key={status.value}
                        label={status.label}
                        icon={status.icon}
                        variant={statusFilter === status.value ? "filled" : "outlined"}
                        onClick={() => setStatusFilter(status.value)}
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: statusFilter === status.value ? 600 : 400,
                          borderRadius: 2,
                          px: 1,
                          bgcolor: statusFilter === status.value 
                            ? alpha(status.color, 0.15) 
                            : 'transparent',
                          borderColor: statusFilter === status.value 
                            ? 'transparent' 
                            : alpha(status.color, 0.3),
                          color: statusFilter === status.value 
                            ? status.color 
                            : alpha(status.color, 0.8),
                          '& .MuiChip-icon': {
                            fontSize: 16,
                            color: status.color
                          },
                          '&:hover': {
                            bgcolor: alpha(status.color, statusFilter === status.value ? 0.2 : 0.05),
                            borderColor: status.color,
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Fade>
          </CardContent>
        </GlassCard>
        
        {/* Enhanced Certifications Display */}
        {loading ? (
          <Box sx={{ px: 3, pb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3].map((index) => (
                <Grow in={loading} key={index} timeout={index * 200}>
                  <GlassCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Skeleton variant="circular" width={48} height={48} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="30%" height={24} />
                        <Skeleton variant="text" width="50%" height={20} />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Skeleton variant="rounded" width={80} height={32} />
                        <Skeleton variant="rounded" width={80} height={32} />
                      </Box>
                    </Box>
                  </GlassCard>
                </Grow>
              ))}
            </Box>
          </Box>
        ) : filteredCertifications.length > 0 ? (
          <Box sx={{ 
            px: 3, 
            pb: 3,
            flex: 1,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: 8,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: alpha(ACCENTURE_COLORS.lightGray, 0.3),
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.3),
              borderRadius: 4,
              '&:hover': {
                bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.5),
              }
            }
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredCertifications.map((cert, index) => (
                <Zoom in key={cert.uniqueId} timeout={300 + index * 50}>
                  <GlassCard 
                    sx={{ 
                      p: 3,
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 12px 40px ${alpha(ACCENTURE_COLORS.corePurple1, 0.15)}`,
                        '& .action-buttons': {
                          opacity: 1,
                          transform: 'translateX(0)'
                        }
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: cert.status === 'approved' 
                          ? ACCENTURE_COLORS.gradients.success
                          : cert.status === 'pending'
                          ? ACCENTURE_COLORS.gradients.info
                          : ACCENTURE_COLORS.gradients.error,
                        opacity: 0.8
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      {/* Employee Info */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            <Box sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: cert.status === 'approved' 
                                ? ACCENTURE_COLORS.green
                                : cert.status === 'pending'
                                ? ACCENTURE_COLORS.blue
                                : ACCENTURE_COLORS.red,
                              border: `2px solid ${ACCENTURE_COLORS.white}`
                            }} />
                          }
                        >
                          <Avatar 
                            src={cert.userProfilePic} 
                            sx={{ 
                              width: 56, 
                              height: 56,
                              bgcolor: getAvatarColor(cert.userName),
                              color: ACCENTURE_COLORS.white,
                              fontSize: 20,
                              fontWeight: 600,
                              boxShadow: `0 4px 12px ${alpha(getAvatarColor(cert.userName), 0.3)}`
                            }}
                          >
                            {getUserInitials(cert.userName)}
                          </Avatar>
                        </Badge>
                        
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            color: ACCENTURE_COLORS.black,
                            letterSpacing: '-0.01em'
                          }}>
                            {cert.userName}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: ACCENTURE_COLORS.darkGray,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            mt: 0.25
                          }}>
                            {cert.userEmail}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Certification Info */}
                      <Box sx={{ flex: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <SchoolIcon sx={{ fontSize: 18, color: ACCENTURE_COLORS.corePurple2 }} />
                          <Typography variant="subtitle1" sx={{ 
                            fontWeight: 600,
                            color: ACCENTURE_COLORS.corePurple2
                          }}>
                            {cert.certificationName}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarTodayIcon sx={{ fontSize: 14, color: ACCENTURE_COLORS.darkGray }} />
                            <Typography variant="caption" color="text.secondary">
                              Completed: {cert.completedDate}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 14, color: ACCENTURE_COLORS.darkGray }} />
                            <Typography variant="caption" color="text.secondary">
                              Valid until: {cert.validUntil}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Score and Status */}
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Box sx={{ 
                          textAlign: 'center',
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 1.5,
                          bgcolor: alpha(
                            cert.score >= 90 ? ACCENTURE_COLORS.green :
                            cert.score >= 70 ? ACCENTURE_COLORS.orange :
                            ACCENTURE_COLORS.red, 
                            0.1
                          ),
                          border: `1px solid ${alpha(
                            cert.score >= 90 ? ACCENTURE_COLORS.green :
                            cert.score >= 70 ? ACCENTURE_COLORS.orange :
                            ACCENTURE_COLORS.red, 
                            0.2
                          )}`,
                          minWidth: 65
                        }}>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            lineHeight: 1.5,
                            color: cert.score >= 90 ? ACCENTURE_COLORS.green :
                                  cert.score >= 70 ? ACCENTURE_COLORS.orange :
                                  ACCENTURE_COLORS.red
                          }}>
                            {cert.score}%
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.7rem' }} color="text.secondary">
                            Score
                          </Typography>
                        </Box>

                        <AnimatedChip
                          icon={
                            cert.status === 'approved' ? <VerifiedIcon /> :
                            cert.status === 'pending' ? <HourglassEmptyIcon /> :
                            <BlockIcon />
                          }
                          label={
                            cert.status === 'approved' ? 'Approved' :
                            cert.status === 'pending' ? 'Pending' :
                            'Rejected'
                          }
                          sx={{
                            px: 2,
                            height: 36,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            bgcolor: cert.status === 'approved' 
                              ? alpha(ACCENTURE_COLORS.green, 0.15)
                              : cert.status === 'pending'
                              ? alpha(ACCENTURE_COLORS.blue, 0.15)
                              : alpha(ACCENTURE_COLORS.red, 0.15),
                            color: cert.status === 'approved' 
                              ? ACCENTURE_COLORS.green
                              : cert.status === 'pending'
                              ? ACCENTURE_COLORS.blue
                              : ACCENTURE_COLORS.red,
                            '& .MuiChip-icon': {
                              color: 'inherit'
                            }
                          }}
                        />
                      </Box>

                      {/* Action Buttons */}
                      <Box 
                        className="action-buttons"
                        sx={{ 
                          display: 'flex', 
                          gap: 1,
                          opacity: 0,
                          transform: 'translateX(20px)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {cert.evidence && (
                          <Tooltip title="View Evidence" arrow placement="top">
                            <IconButton 
                              onClick={() => handleViewEvidence(cert)}
                              sx={{ 
                                bgcolor: alpha(ACCENTURE_COLORS.blue, 0.1),
                                color: ACCENTURE_COLORS.blue,
                                '&:hover': {
                                  bgcolor: alpha(ACCENTURE_COLORS.blue, 0.2),
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {cert.status === 'pending' && (
                          <>
                            <Tooltip title="Approve" arrow placement="top">
                              <IconButton 
                                onClick={() => handleApprove(cert)}
                                sx={{ 
                                  bgcolor: alpha(ACCENTURE_COLORS.green, 0.1),
                                  color: ACCENTURE_COLORS.green,
                                  '&:hover': {
                                    bgcolor: alpha(ACCENTURE_COLORS.green, 0.2),
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Reject" arrow placement="top">
                              <IconButton 
                                onClick={() => handleReject(cert)}
                                sx={{ 
                                  bgcolor: alpha(ACCENTURE_COLORS.red, 0.1),
                                  color: ACCENTURE_COLORS.red,
                                  '&:hover': {
                                    bgcolor: alpha(ACCENTURE_COLORS.red, 0.2),
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </Box>

                    {/* Rejection Reason */}
                    {cert.status === 'rejected' && cert.rejectionReason && (
                      <Box sx={{ 
                        mt: 2, 
                        p: 2, 
                        borderRadius: 2,
                        bgcolor: alpha(ACCENTURE_COLORS.red, 0.05),
                        border: `1px solid ${alpha(ACCENTURE_COLORS.red, 0.1)}`
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <WarningIcon sx={{ fontSize: 18, color: ACCENTURE_COLORS.red, mt: 0.25 }} />
                          <Box>
                            <Typography variant="body2" fontWeight={600} color={ACCENTURE_COLORS.red} gutterBottom>
                              Rejection Reason
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {cert.rejectionReason}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </GlassCard>
                </Zoom>
              ))}
            </Box>
          </Box>
        ) : (
          <Fade in timeout={500}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center',
                flexGrow: 1,
                p: 5
              }}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: ACCENTURE_COLORS.gradients.purpleLight,
                  mb: 3,
                  position: 'relative',
                  boxShadow: `0 20px 40px ${alpha(ACCENTURE_COLORS.corePurple1, 0.2)}`,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: -10,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(ACCENTURE_COLORS.accentPurple3, 0.4)} 0%, transparent 70%)`,
                    animation: 'pulse 2s ease-in-out infinite'
                  },
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)', opacity: 1 },
                    '50%': { transform: 'scale(1.1)', opacity: 0.5 },
                    '100%': { transform: 'scale(1)', opacity: 1 }
                  }
                }}
              >
                <WorkspacePremiumIcon 
                  sx={{ 
                    fontSize: 56, 
                    color: ACCENTURE_COLORS.white,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                  }} 
                />
              </Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 600,
                background: ACCENTURE_COLORS.gradients.purple,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}>
                No certifications found
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ 
                maxWidth: 400,
                lineHeight: 1.6
              }}>
                Try adjusting your filters or search terms to find the certifications you're looking for.
              </Typography>
            </Box>
          </Fade>
        )}
      </DialogContent>
      
      {/* Enhanced Footer */}
      <Box 
        sx={{ 
          p: 3,
          background: `linear-gradient(180deg, transparent 0%, ${alpha(ACCENTURE_COLORS.accentPurple5, 0.3)} 100%)`,
          borderTop: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 2,
            bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.05),
            border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`
          }}>
            <InfoIcon sx={{ fontSize: 18, color: ACCENTURE_COLORS.corePurple2 }} />
            <Typography variant="caption" color="text.secondary">
              Review and manage employee certification requests
            </Typography>
          </Box>
        </Box>

        <StyledButton
          variant="outlined"
          onClick={onClose}
          startIcon={<ArrowBackIcon />}
          sx={{
            borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.3),
            color: ACCENTURE_COLORS.corePurple2,
            '&:hover': {
              borderColor: ACCENTURE_COLORS.corePurple1,
              bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.05)
            }
          }}
        >
          Close
        </StyledButton>
      </Box>
      
      {/* Enhanced PDF Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullWidth
        maxWidth="lg"
        TransitionComponent={Zoom}
        transitionDuration={300}
        PaperProps={{
          sx: { 
            height: '90vh',
            borderRadius: 3,
            overflow: 'hidden',
            background: alpha(ACCENTURE_COLORS.white, 0.98),
            backdropFilter: 'blur(10px)',
            boxShadow: `0 25px 50px -12px ${alpha(ACCENTURE_COLORS.black, 0.25)}`
          }
        }}
      >
        <Box
          sx={{
            p: 2.5, 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: `linear-gradient(135deg, ${alpha(ACCENTURE_COLORS.corePurple1, 0.05)} 0%, ${alpha(ACCENTURE_COLORS.accentPurple2, 0.05)} 100%)`,
            borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: ACCENTURE_COLORS.gradients.error,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${alpha(ACCENTURE_COLORS.red, 0.3)}`
            }}>
              <PdfIcon sx={{ color: ACCENTURE_COLORS.white, fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Certification Evidence
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Review the submitted documentation
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={() => setPreviewOpen(false)}
            sx={{
              color: ACCENTURE_COLORS.darkGray,
              bgcolor: alpha(ACCENTURE_COLORS.black, 0.05),
              '&:hover': {
                bgcolor: alpha(ACCENTURE_COLORS.black, 0.1),
                transform: 'rotate(90deg)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ 
          height: 'calc(90vh - 100px)', 
          bgcolor: '#f8f9fc',
          p: 2
        }}>
          <Box sx={{
            height: '100%',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: `0 4px 20px ${alpha(ACCENTURE_COLORS.black, 0.1)}`,
            bgcolor: ACCENTURE_COLORS.white
          }}>
            <iframe
              src={previewFile}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="PDF Preview"
            />
          </Box>
        </Box>
      </Dialog>
      
      {/* Enhanced Approval Dialog with Skills Update */}
      <Dialog
        open={skillsDialogOpen}
        onClose={() => setSkillsDialogOpen(false)}
        fullWidth
        maxWidth="lg"
        TransitionComponent={Slide}
        transitionDuration={400}
        PaperProps={{
          sx: { 
            maxHeight: '90vh',
            borderRadius: 3,
            overflow: 'hidden',
            background: alpha(ACCENTURE_COLORS.white, 0.98),
            backdropFilter: 'blur(10px)',
            boxShadow: `0 25px 50px -12px ${alpha(ACCENTURE_COLORS.black, 0.25)}`
          }
        }}
      >
        <Box
          sx={{
            background: ACCENTURE_COLORS.gradients.success,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '300px',
              height: '300px',
              background: `radial-gradient(circle, ${alpha(ACCENTURE_COLORS.white, 0.1)} 0%, transparent 70%)`,
              transform: 'translate(50%, -50%)',
            }
          }}
        >
          <Box sx={{ 
            position: 'relative',
            zIndex: 1,
            py: 2.5,
            px: 3.5,
            color: ACCENTURE_COLORS.white
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  background: alpha(ACCENTURE_COLORS.white, 0.2),
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <VerifiedIcon sx={{ fontSize: 26, color: ACCENTURE_COLORS.white }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Approve Certification & Update Skills
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Select skills to be added or updated for this employee
                  </Typography>
                </Box>
              </Box>
              <IconButton 
                onClick={() => setSkillsDialogOpen(false)}
                sx={{ 
                  color: ACCENTURE_COLORS.white,
                  bgcolor: alpha(ACCENTURE_COLORS.white, 0.1),
                  '&:hover': {
                    bgcolor: alpha(ACCENTURE_COLORS.white, 0.2),
                    transform: 'rotate(90deg)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
        
        <DialogContent sx={{ p: 3, bgcolor: '#f8f9fc' }}>
          {selectedCertification && (
            <Fade in timeout={300}>
              <GlassCard sx={{ mb: 3, p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Avatar 
                    src={selectedCertification.userProfilePic} 
                    sx={{ 
                      width: 64, 
                      height: 64,
                      bgcolor: getAvatarColor(selectedCertification.userName),
                      color: ACCENTURE_COLORS.white,
                      fontSize: 24,
                      fontWeight: 600,
                      boxShadow: `0 8px 24px ${alpha(getAvatarColor(selectedCertification.userName), 0.3)}`
                    }}
                  >
                    {getUserInitials(selectedCertification.userName)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} color={ACCENTURE_COLORS.black}>
                      {selectedCertification.userName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <SchoolIcon sx={{ fontSize: 16, color: ACCENTURE_COLORS.corePurple2 }} />
                      <Typography variant="body2" color={ACCENTURE_COLORS.corePurple2} fontWeight={500}>
                        {selectedCertification.certificationName}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(ACCENTURE_COLORS.green, 0.05),
                    border: `1px solid ${alpha(ACCENTURE_COLORS.green, 0.2)}`
                  }}>
                    <EmojiEventsIcon sx={{ fontSize: 32, color: ACCENTURE_COLORS.green, mb: 0.5 }} />
                    <Typography variant="h6" fontWeight={700} color={ACCENTURE_COLORS.green}>
                      {selectedCertification.score}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Score
                    </Typography>
                  </Box>
                </Box>
              </GlassCard>
            </Fade>
          )}
          
          <Box
            sx={{
              background: `linear-gradient(135deg, ${alpha(ACCENTURE_COLORS.corePurple1, 0.05)} 0%, ${alpha(ACCENTURE_COLORS.accentPurple2, 0.05)} 100%)`,
              borderRadius: 2,
              p: 2.5,
              mb: 3,
              border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <InfoIcon sx={{ fontSize: 20, color: ACCENTURE_COLORS.corePurple2, flexShrink: 0 }} />
            <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
              Select the skills to update based on this certification. The system will automatically 
              add new skills or update existing ones with improved proficiency levels.
            </Typography>
          </Box>
          
          <GlassCard
            sx={{ 
              mb: 3,
              maxHeight: '45vh',
              overflow: 'hidden',
              p: 0
            }}
          >
            <TableContainer sx={{ 
              maxHeight: '45vh',
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: 8,
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: alpha(ACCENTURE_COLORS.lightGray, 0.3),
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.3),
                borderRadius: 4,
                '&:hover': {
                  bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.5),
                }
              }
            }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '0.875rem', 
                        width: '20%',
                        background: `linear-gradient(180deg, ${alpha(ACCENTURE_COLORS.white, 0.9)} 0%, ${alpha(ACCENTURE_COLORS.accentPurple5, 0.5)} 100%)`,
                        backdropFilter: 'blur(10px)',
                        color: ACCENTURE_COLORS.black,
                        borderBottom: `2px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PsychologyIcon sx={{ fontSize: 18, color: ACCENTURE_COLORS.corePurple2 }} />
                        Skill
                      </Box>
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.875rem',
                        width: '12%',
                        background: `linear-gradient(180deg, ${alpha(ACCENTURE_COLORS.white, 0.9)} 0%, ${alpha(ACCENTURE_COLORS.accentPurple5, 0.5)} 100%)`,
                        backdropFilter: 'blur(10px)',
                        color: ACCENTURE_COLORS.black,
                        borderBottom: `2px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`
                      }}
                    >
                      Type
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.875rem',
                        width: '25%',
                        background: `linear-gradient(180deg, ${alpha(ACCENTURE_COLORS.white, 0.9)} 0%, ${alpha(ACCENTURE_COLORS.accentPurple5, 0.5)} 100%)`,
                        backdropFilter: 'blur(10px)',
                        color: ACCENTURE_COLORS.black,
                        borderBottom: `2px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`
                      }}
                    >
                      Description
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.875rem',
                        width: '8%', 
                        textAlign: 'center',
                        background: `linear-gradient(180deg, ${alpha(ACCENTURE_COLORS.white, 0.9)} 0%, ${alpha(ACCENTURE_COLORS.accentPurple5, 0.5)} 100%)`,
                        backdropFilter: 'blur(10px)',
                        color: ACCENTURE_COLORS.black,
                        borderBottom: `2px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`
                      }}
                    >
                      Select
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.875rem',
                        width: '15%',
                        background: `linear-gradient(180deg, ${alpha(ACCENTURE_COLORS.white, 0.9)} 0%, ${alpha(ACCENTURE_COLORS.accentPurple5, 0.5)} 100%)`,
                        backdropFilter: 'blur(10px)',
                        color: ACCENTURE_COLORS.black,
                        borderBottom: `2px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`
                      }}
                    >
                      Proficiency
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.875rem',
                        width: '10%',
                        background: `linear-gradient(180deg, ${alpha(ACCENTURE_COLORS.white, 0.9)} 0%, ${alpha(ACCENTURE_COLORS.accentPurple5, 0.5)} 100%)`,
                        backdropFilter: 'blur(10px)',
                        color: ACCENTURE_COLORS.black,
                        borderBottom: `2px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`
                      }}
                    >
                      Years
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.875rem',
                        width: '10%',
                        background: `linear-gradient(180deg, ${alpha(ACCENTURE_COLORS.white, 0.9)} 0%, ${alpha(ACCENTURE_COLORS.accentPurple5, 0.5)} 100%)`,
                        backdropFilter: 'blur(10px)',
                        color: ACCENTURE_COLORS.black,
                        borderBottom: `2px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUpIcon sx={{ fontSize: 18, color: ACCENTURE_COLORS.corePurple2 }} />
                        Progress
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableSkills.length > 0 ? (
                    availableSkills.map((skill, index) => {
                      const isSelected = selectedSkills.includes(skill.skill_ID);
                      return (
                        <Zoom in key={skill.skill_ID} timeout={200 + index * 50}>
                          <TableRow sx={{
                            position: 'relative',
                            bgcolor: isSelected ? alpha(ACCENTURE_COLORS.corePurple1, 0.05) : 'transparent',
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              bgcolor: isSelected 
                                ? alpha(ACCENTURE_COLORS.corePurple1, 0.08) 
                                : alpha(ACCENTURE_COLORS.lightGray, 0.3),
                              transform: 'translateX(4px)'
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: '3px',
                              background: isSelected ? ACCENTURE_COLORS.gradients.purple : 'transparent',
                              transition: 'all 0.3s ease'
                            }
                          }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: isSelected ? ACCENTURE_COLORS.corePurple2 : ACCENTURE_COLORS.lightGray,
                                  transition: 'all 0.3s ease'
                                }} />
                                <Typography 
                                  variant="body2" 
                                  fontWeight={isSelected ? 600 : 400}
                                  sx={{ 
                                    color: isSelected ? ACCENTURE_COLORS.corePurple2 : ACCENTURE_COLORS.black,
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  {skill.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <AnimatedChip
                                label={skill.type}
                                size="small"
                                icon={skill.type === 'Soft Skill' ? <PsychologyIcon /> : <SchoolIcon />}
                                sx={{ 
                                  borderRadius: 2,
                                  height: 28,
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  bgcolor: skill.type === 'Soft Skill' 
                                    ? alpha(ACCENTURE_COLORS.blue, 0.1) 
                                    : alpha(ACCENTURE_COLORS.corePurple1, 0.1),
                                  color: skill.type === 'Soft Skill' 
                                    ? ACCENTURE_COLORS.blue 
                                    : ACCENTURE_COLORS.corePurple2,
                                  '& .MuiChip-icon': {
                                    fontSize: 16,
                                    color: 'inherit'
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Tooltip title={skill.description || ''} arrow placement="top">
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: 300,
                                    fontSize: '0.875rem',
                                    color: alpha(ACCENTURE_COLORS.darkGray, 0.8),
                                    lineHeight: 1.5
                                  }}
                                >
                                  {skill.description}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox
                                checked={isSelected}
                                onChange={() => handleToggleSkill(skill.skill_ID)}
                                sx={{
                                  color: alpha(ACCENTURE_COLORS.corePurple1, 0.4),
                                  '&.Mui-checked': { 
                                    color: ACCENTURE_COLORS.corePurple2,
                                    transform: 'scale(1.1)'
                                  },
                                  '&:hover': {
                                    bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.08)
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {isSelected && (
                                <Fade in timeout={300}>
                                  <FormControl fullWidth size="small">
                                    <Select
                                      value={proficiencyLevels[skill.skill_ID] || "Basic"}
                                      onChange={(e) => handleProficiencyChange(skill.skill_ID, e.target.value)}
                                      sx={{
                                        height: 36,
                                        fontSize: '0.875rem',
                                        borderRadius: 2,
                                        bgcolor: alpha(getProficiencyColor(proficiencyLevels[skill.skill_ID] || "Basic"), 0.08),
                                        '& .MuiOutlinedInput-notchedOutline': {
                                          borderColor: alpha(getProficiencyColor(proficiencyLevels[skill.skill_ID] || "Basic"), 0.3),
                                          borderWidth: 1.5
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                          borderColor: getProficiencyColor(proficiencyLevels[skill.skill_ID] || "Basic"),
                                          borderWidth: 2
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                          borderColor: getProficiencyColor(proficiencyLevels[skill.skill_ID] || "Basic"),
                                        },
                                        color: getProficiencyColor(proficiencyLevels[skill.skill_ID] || "Basic"),
                                        fontWeight: 600,
                                        '.MuiSelect-select': {
                                          py: 0.75,
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1
                                        },
                                        transition: 'all 0.3s ease'
                                      }}
                                    >
                                      {PROFICIENCY_LEVELS.map((level) => (
                                        <MenuItem 
                                          key={level.value} 
                                          value={level.value}
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            py: 1
                                          }}
                                        >
                                          <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1,
                                            color: level.color
                                          }}>
                                            <StarIcon sx={{ fontSize: 18 }} />
                                            {level.label}
                                          </Box>
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Fade>
                              )}
                            </TableCell>
                            <TableCell>
                              {isSelected && (
                                <Fade in timeout={400}>
                                  <TextField
                                    type="number"
                                    size="small"
                                    value={experienceYears[skill.skill_ID] || 1}
                                    onChange={(e) => handleExperienceChange(skill.skill_ID, e.target.value)}
                                    InputProps={{ 
                                      inputProps: { min: 1, max: 10 },
                                      sx: {
                                        height: 36,
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                      }
                                    }}
                                    sx={{ 
                                      width: '80px',
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.05),
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                          borderColor: ACCENTURE_COLORS.corePurple1,
                                          borderWidth: 2
                                        },
                                        '&:hover': {
                                          bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.08)
                                        },
                                        transition: 'all 0.3s ease'
                                      }
                                    }}
                                  />
                                </Fade>
                              )}
                            </TableCell>
                            <TableCell>
                              {isSelected && (
                                <Zoom in timeout={500}>
                                  <Box sx={{ 
                                    background: ACCENTURE_COLORS.gradients.purpleLight,
                                    color: ACCENTURE_COLORS.white,
                                    py: 0.75,
                                    px: 1.5,
                                    borderRadius: 2,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    boxShadow: `0 4px 12px ${alpha(ACCENTURE_COLORS.corePurple1, 0.2)}`,
                                    whiteSpace: 'nowrap'
                                  }}>
                                    <TrendingUpIcon sx={{ fontSize: 14 }} />
                                    {getProgressionMessage(skill.skill_ID)}
                                  </Box>
                                </Zoom>
                              )}
                            </TableCell>
                          </TableRow>
                        </Zoom>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <Box sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: alpha(ACCENTURE_COLORS.corePurple1, 0.08),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                          }}>
                            <PsychologyIcon sx={{ fontSize: 40, color: ACCENTURE_COLORS.corePurple2 }} />
                            <Box sx={{
                              position: 'absolute',
                              bottom: -5,
                              right: -5,
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: ACCENTURE_COLORS.orange,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <WarningIcon sx={{ fontSize: 16, color: ACCENTURE_COLORS.white }} />
                            </Box>
                          </Box>
                          <Typography variant="h6" color={ACCENTURE_COLORS.corePurple2} fontWeight={600}>
                            No skills available
                          </Typography>
                          <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={300}>
                            This certification does not have any associated skills to update.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassCard>
          
          {selectedSkills.length === 0 && availableSkills.length > 0 && (
            <Fade in timeout={300}>
              <Box 
                sx={{ 
                  mt: 2, 
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(ACCENTURE_COLORS.red, 0.05)} 0%, ${alpha(ACCENTURE_COLORS.orange, 0.05)} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  border: `1px solid ${alpha(ACCENTURE_COLORS.red, 0.2)}`
                }}
              >
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: alpha(ACCENTURE_COLORS.red, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <WarningIcon sx={{ color: ACCENTURE_COLORS.red, fontSize: 20 }} />
                </Box>
                <Typography variant="body2" color={ACCENTURE_COLORS.red} fontWeight={500}>
                  Please select at least one skill to continue with the approval process.
                </Typography>
              </Box>
            </Fade>
          )}
        </DialogContent>
        
        <Box 
          sx={{ 
            p: 3,
            background: `linear-gradient(180deg, transparent 0%, ${alpha(ACCENTURE_COLORS.green, 0.05)} 100%)`,
            borderTop: `1px solid ${alpha(ACCENTURE_COLORS.green, 0.1)}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <StyledButton 
            variant="outlined"
            onClick={() => setSkillsDialogOpen(false)}
            sx={{
              borderColor: alpha(ACCENTURE_COLORS.darkGray, 0.3),
              color: ACCENTURE_COLORS.darkGray,
              '&:hover': {
                borderColor: ACCENTURE_COLORS.darkGray,
                bgcolor: alpha(ACCENTURE_COLORS.darkGray, 0.05)
              }
            }}
          >
            Cancel
          </StyledButton>
          
          <StyledButton 
            variant="contained"
            onClick={handleConfirmApproval}
            disabled={selectedSkills.length === 0 || loading}
            startIcon={loading ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : <VerifiedIcon />}
            sx={{
              background: selectedSkills.length > 0 ? ACCENTURE_COLORS.gradients.success : undefined,
              '&:hover': {
                background: selectedSkills.length > 0 ? ACCENTURE_COLORS.gradients.success : undefined,
                filter: 'brightness(0.95)'
              },
              '&:disabled': {
                background: 'none',
                bgcolor: alpha(ACCENTURE_COLORS.darkGray, 0.1)
              }
            }}
          >
            {loading ? 'Processing...' : 'Approve & Update Skills'}
          </StyledButton>
        </Box>
      </Dialog>
      
      {/* Enhanced Rejection Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Slide}
        transitionDuration={400}
        PaperProps={{
          sx: { 
            borderRadius: 3,
            overflow: 'hidden',
            background: alpha(ACCENTURE_COLORS.white, 0.98),
            backdropFilter: 'blur(10px)',
            boxShadow: `0 25px 50px -12px ${alpha(ACCENTURE_COLORS.black, 0.25)}`
          }
        }}
      >
        <Box
          sx={{
            background: ACCENTURE_COLORS.gradients.error,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: alpha(ACCENTURE_COLORS.white, 0.1),
            }
          }}
        >
          <Box sx={{ 
            position: 'relative',
            zIndex: 1,
            py: 2.5,
            px: 3.5,
            color: ACCENTURE_COLORS.white
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  background: alpha(ACCENTURE_COLORS.white, 0.2),
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BlockIcon sx={{ fontSize: 26, color: ACCENTURE_COLORS.white }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Reject Certification
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Provide a reason for rejection
                  </Typography>
                </Box>
              </Box>
              <IconButton 
                onClick={() => setRejectDialogOpen(false)}
                sx={{ 
                  color: ACCENTURE_COLORS.white,
                  bgcolor: alpha(ACCENTURE_COLORS.white, 0.1),
                  '&:hover': {
                    bgcolor: alpha(ACCENTURE_COLORS.white, 0.2),
                    transform: 'rotate(90deg)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
        
        <DialogContent sx={{ p: 3, bgcolor: '#f8f9fc' }}>
          {selectedCertification && (
            <Fade in timeout={300}>
              <GlassCard sx={{ mb: 3, p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    src={selectedCertification.userProfilePic} 
                    sx={{ 
                      width: 56, 
                      height: 56,
                      bgcolor: getAvatarColor(selectedCertification.userName),
                      color: ACCENTURE_COLORS.white,
                      fontSize: 20,
                      fontWeight: 600,
                      boxShadow: `0 4px 12px ${alpha(getAvatarColor(selectedCertification.userName), 0.3)}`
                    }}
                  >
                    {getUserInitials(selectedCertification.userName)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} color={ACCENTURE_COLORS.black}>
                      {selectedCertification.userName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <SchoolIcon sx={{ fontSize: 16, color: ACCENTURE_COLORS.red }} />
                      <Typography variant="body2" color={ACCENTURE_COLORS.red} fontWeight={500}>
                        {selectedCertification.certificationName}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </GlassCard>
            </Fade>
          )}
          
          <Box
            sx={{
              background: `linear-gradient(135deg, ${alpha(ACCENTURE_COLORS.red, 0.05)} 0%, ${alpha(ACCENTURE_COLORS.orange, 0.05)} 100%)`,
              borderRadius: 2,
              p: 2.5,
              mb: 3,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              border: `1px solid ${alpha(ACCENTURE_COLORS.red, 0.1)}`
            }}
          >
            <WarningIcon sx={{ fontSize: 20, color: ACCENTURE_COLORS.red, flexShrink: 0, mt: 0.25 }} />
            <Box>
              <Typography variant="subtitle2" fontWeight={600} color={ACCENTURE_COLORS.red} gutterBottom>
                Important Notice
              </Typography>
              <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                Please provide a clear and constructive reason for rejecting this certification. 
                This feedback will be sent to the employee to help them understand the decision.
              </Typography>
            </Box>
          </Box>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Enter a detailed reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
            error={rejectDialogOpen && !rejectionReason}
            helperText={rejectDialogOpen && !rejectionReason ? "Rejection reason is required" : "Be specific and constructive in your feedback"}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '0.9375rem',
                bgcolor: ACCENTURE_COLORS.white,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: alpha(ACCENTURE_COLORS.red, 0.02),
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(ACCENTURE_COLORS.red, 0.08)}`
                },
                '&.Mui-focused': {
                  borderColor: ACCENTURE_COLORS.red,
                  boxShadow: `0 0 0 3px ${alpha(ACCENTURE_COLORS.red, 0.1)}`
                },
                '&.Mui-error': {
                  animation: 'shake 0.3s ease-in-out'
                }
              },
              '& .MuiFormHelperText-root': {
                fontSize: '0.8125rem',
                mt: 1
              },
              '@keyframes shake': {
                '0%, 100%': { transform: 'translateX(0)' },
                '25%': { transform: 'translateX(-5px)' },
                '75%': { transform: 'translateX(5px)' }
              }
            }}
          />
        </DialogContent>
        
        <Box 
          sx={{ 
            p: 3,
            background: `linear-gradient(180deg, transparent 0%, ${alpha(ACCENTURE_COLORS.red, 0.05)} 100%)`,
            borderTop: `1px solid ${alpha(ACCENTURE_COLORS.red, 0.1)}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <StyledButton 
            variant="outlined"
            onClick={() => setRejectDialogOpen(false)}
            sx={{
              borderColor: alpha(ACCENTURE_COLORS.darkGray, 0.3),
              color: ACCENTURE_COLORS.darkGray,
              '&:hover': {
                borderColor: ACCENTURE_COLORS.darkGray,
                bgcolor: alpha(ACCENTURE_COLORS.darkGray, 0.05)
              }
            }}
          >
            Cancel
          </StyledButton>
          
          <StyledButton 
            variant="contained"
            onClick={handleConfirmRejection}
            disabled={!rejectionReason || loading}
            startIcon={loading ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : <BlockIcon />}
            sx={{
              background: rejectionReason ? ACCENTURE_COLORS.gradients.error : undefined,
              '&:hover': {
                background: rejectionReason ? ACCENTURE_COLORS.gradients.error : undefined,
                filter: 'brightness(0.95)'
              },
              '&:disabled': {
                background: 'none',
                bgcolor: alpha(ACCENTURE_COLORS.darkGray, 0.1)
              }
            }}
          >
            {loading ? 'Processing...' : 'Confirm Rejection'}
          </StyledButton>
        </Box>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            ...(snackbar.severity === 'success' && {
              bgcolor: alpha(ACCENTURE_COLORS.green, 0.9),
              color: ACCENTURE_COLORS.white,
              '& .MuiAlert-icon': {
                color: ACCENTURE_COLORS.white
              }
            }),
            ...(snackbar.severity === 'error' && {
              bgcolor: alpha(ACCENTURE_COLORS.red, 0.9),
              color: ACCENTURE_COLORS.white,
              '& .MuiAlert-icon': {
                color: ACCENTURE_COLORS.white
              }
            }),
            ...(snackbar.severity === 'info' && {
              bgcolor: alpha(ACCENTURE_COLORS.blue, 0.9),
              color: ACCENTURE_COLORS.white,
              '& .MuiAlert-icon': {
                color: ACCENTURE_COLORS.white
              }
            })
          }}
        >
          <Typography fontSize="0.875rem">
            {snackbar.message}
          </Typography>
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ReviewCertifications;