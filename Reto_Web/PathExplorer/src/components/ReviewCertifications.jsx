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
  Avatar
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
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { supabase } from '../supabase/supabaseClient';

// Accenture Colors - Version más tenue/minimalista
const ACCENTURE_COLORS = {
  corePurple1: "#a873e8", // Versión más tenue del Core Purple 1
  corePurple2: "#8a60b0", // Versión más tenue del Core Purple 2
  corePurple3: "#6a4b87", // Versión más tenue del Core Purple 3
  accentPurple1: "#c99fd1", // Versión más tenue del Accent Purple 1
  accentPurple2: "#c8a4f2", // Versión más tenue del Accent Purple 2
  accentPurple3: "#d4b6f7", // Versión más tenue del Accent Purple 3
  accentPurple4: "#e7d6f9", // Versión más tenue del Accent Purple 4
  accentPurple5: "#f0e9fa", // Versión más tenue del Accent Purple 5
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
  white: "#ffffff"
};

const PROFICIENCY_LEVELS = [
  { value: "Basic", label: "Basic", color: ACCENTURE_COLORS.lightBlue },
  { value: "Low", label: "Low", color: ACCENTURE_COLORS.green },
  { value: "Medium", label: "Medium", color: ACCENTURE_COLORS.orange },
  { value: "High", label: "High", color: ACCENTURE_COLORS.red }
];

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
      PaperProps={{
        sx: { 
          height: { xs: '100vh', sm: '90vh' },
          maxHeight: { xs: '100vh', sm: '90vh' },
          borderRadius: 1,
          overflow: 'hidden'
        }
      }}
    >
      {/* Header - versión minimalista */}
      <Box
        sx={{
          bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.15), 
          color: ACCENTURE_COLORS.black,
          py: 2,
          px: 3,
          borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.1)}`
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AssignmentIcon sx={{ fontSize: 24, color: ACCENTURE_COLORS.corePurple2 }} />
            <Typography variant="h6" fontWeight={500}>
              Check certifications
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose}
            size="small"
            sx={{ 
              color: ACCENTURE_COLORS.darkGray,
              '&:hover': { 
                bgcolor: alpha(ACCENTURE_COLORS.black, 0.05)
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: alpha(ACCENTURE_COLORS.accentPurple5, 0.1) }}>
        {/* Filters and Search */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 2, 
          p: 2,
          pb: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: ACCENTURE_COLORS.white,
          borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.06)}`
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <TextField
              placeholder="Search by employee or certification"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ 
                minWidth: { xs: 200, sm: 300 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  bgcolor: ACCENTURE_COLORS.white,
                  border: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.12)}`,
                  '&:hover': {
                    borderColor: alpha(ACCENTURE_COLORS.black, 0.3)
                  },
                  '&.Mui-focused': {
                    borderColor: ACCENTURE_COLORS.corePurple1,
                    boxShadow: `0 0 0 2px ${alpha(ACCENTURE_COLORS.accentPurple4, 0.25)}`
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: alpha(ACCENTURE_COLORS.black, 0.4), fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight={400} color="text.secondary">
                Status:
              </Typography>
            </Box>
            
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <Chip
                key={status}
                label={
                  status === 'all' ? 'All' :
                  status === 'pending' ? 'Pending' :
                  status === 'approved' ? 'Approved' :
                  'Rejected'
                }
                variant={statusFilter === status ? "filled" : "outlined"}
                onClick={() => setStatusFilter(status)}
                sx={{
                  fontSize: '0.75rem',
                  height: 28,
                  fontWeight: 400,
                  borderRadius: 1,
                  bgcolor: statusFilter === status ? alpha(ACCENTURE_COLORS.corePurple1, 0.08) : 'transparent',
                  borderColor: statusFilter === status ? 'transparent' : alpha(ACCENTURE_COLORS.black, 0.15),
                  color: statusFilter === status ? ACCENTURE_COLORS.corePurple2 : ACCENTURE_COLORS.darkGray,
                  '&:hover': {
                    bgcolor: statusFilter === status ? alpha(ACCENTURE_COLORS.corePurple1, 0.12) : alpha(ACCENTURE_COLORS.black, 0.03),
                  }
                }}
              />
            ))}
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            <Box component="span" sx={{ fontWeight: 500 }}>
              {filteredCertifications.length}
            </Box> of {certifications.length} certifications
          </Typography>
        </Box>
        
        {/* Certifications Table */}
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            flexGrow: 1,
            p: 5 
          }}>
            <CircularProgress 
              sx={{ 
                color: ACCENTURE_COLORS.corePurple2,
                mb: 2 
              }} 
              size={32}
            />
            <Typography variant="body2" color="text.secondary">
              Loading certifications...
            </Typography>
          </Box>
        ) : filteredCertifications.length > 0 ? (
          <TableContainer 
            sx={{ 
              flexGrow: 1,
              maxHeight: 'unset',
              overflow: 'auto'
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      fontWeight: 500, 
                      fontSize: '0.75rem',
                      bgcolor: ACCENTURE_COLORS.white,
                      color: ACCENTURE_COLORS.black,
                      borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.12)}`
                    }}
                  >
                    Employee
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 500, 
                      fontSize: '0.75rem',
                      bgcolor: ACCENTURE_COLORS.white,
                      color: ACCENTURE_COLORS.black,
                      borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.12)}`
                    }}
                  >
                    Certification
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 500, 
                      fontSize: '0.75rem',
                      bgcolor: ACCENTURE_COLORS.white,
                      color: ACCENTURE_COLORS.black,
                      borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.12)}`
                    }}
                  >
                    Completed
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 500, 
                      fontSize: '0.75rem',
                      bgcolor: ACCENTURE_COLORS.white,
                      color: ACCENTURE_COLORS.black,
                      borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.12)}`
                    }}
                  >
                    Valid until
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 500, 
                      fontSize: '0.75rem',
                      bgcolor: ACCENTURE_COLORS.white,
                      color: ACCENTURE_COLORS.black,
                      borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.12)}`
                    }}
                  >
                    Score
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 500, 
                      fontSize: '0.75rem',
                      bgcolor: ACCENTURE_COLORS.white,
                      color: ACCENTURE_COLORS.black,
                      borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.12)}`
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell 
                    align="center"
                    sx={{ 
                      fontWeight: 500, 
                      fontSize: '0.75rem',
                      bgcolor: ACCENTURE_COLORS.white,
                      color: ACCENTURE_COLORS.black,
                      borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.12)}`
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCertifications.map((cert) => (
                  <TableRow 
                    key={cert.uniqueId} 
                    sx={{
                      '&:hover': { bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.02) },
                      transition: 'background-color 0.2s ease',
                      '&:nth-of-type(odd)': {
                        bgcolor: alpha(ACCENTURE_COLORS.lightGray, 0.2),
                      },
                      '&:nth-of-type(even)': {
                        bgcolor: ACCENTURE_COLORS.white,
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar 
                          src={cert.userProfilePic} 
                          sx={{ 
                            width: 32, 
                            height: 32,
                            bgcolor: alpha(getAvatarColor(cert.userName), 0.85),
                            color: ACCENTURE_COLORS.white,
                            fontWeight: 400,
                            fontSize: 12
                          }}
                        >
                          {getUserInitials(cert.userName)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ color: ACCENTURE_COLORS.black }}>
                            {cert.userName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: ACCENTURE_COLORS.darkGray }}>
                            {cert.userEmail}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={cert.certificationDesc || ''} arrow placement="top">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: ACCENTURE_COLORS.corePurple2,
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {cert.certificationName}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {cert.completedDate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {cert.validUntil}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${cert.score}%`}
                        size="small"
                        sx={{ 
                          height: 20,
                          borderRadius: 1,
                          fontSize: '0.7rem',
                          bgcolor: 
                            cert.score >= 90 ? alpha(ACCENTURE_COLORS.green, 0.1) :
                            cert.score >= 70 ? alpha(ACCENTURE_COLORS.orange, 0.1) :
                                              alpha(ACCENTURE_COLORS.red, 0.1),
                          color: 
                            cert.score >= 90 ? ACCENTURE_COLORS.green :
                            cert.score >= 70 ? ACCENTURE_COLORS.orange :
                                              ACCENTURE_COLORS.red
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Chip 
                          label={
                            cert.status === 'approved' ? 'Approved' :
                            cert.status === 'pending' ? 'Pending' :
                                                      'Rejected'
                          }
                          size="small"
                          sx={{ 
                            height: 20,
                            fontSize: '0.7rem',
                            borderRadius: 1,
                            bgcolor: getStatusBgColor(cert.status),
                            color: getStatusTextColor(cert.status)
                          }}
                        />
                        {cert.status === 'rejected' && cert.rejectionReason && (
                          <Tooltip title={cert.rejectionReason} arrow placement="top">
                            <Typography 
                              variant="caption" 
                              color="error" 
                              sx={{ 
                                display: 'block', 
                                cursor: 'pointer',
                                fontSize: '0.7rem',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                            >
                              See reason
                            </Typography>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        {cert.evidence && (
                          <Tooltip title="See evidence" arrow placement="top">
                            <IconButton 
                              size="small"
                              onClick={() => handleViewEvidence(cert)}
                              sx={{ 
                                color: ACCENTURE_COLORS.blue,
                                p: 0.5
                              }}
                            >
                              <VisibilityIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {cert.status === 'pending' && (
                          <>
                            <Tooltip title="Approve" arrow placement="top">
                              <IconButton 
                                size="small"
                                onClick={() => handleApprove(cert)}
                                sx={{ 
                                  color: ACCENTURE_COLORS.green,
                                  p: 0.5
                                }}
                              >
                                <CheckCircleIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Reject" arrow placement="top">
                              <IconButton 
                                size="small"
                                onClick={() => handleReject(cert)}
                                sx={{ 
                                  color: ACCENTURE_COLORS.red,
                                  p: 0.5
                                }}
                              >
                                <CancelIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
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
                width: 80,
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.08),
                mb: 2
              }}
            >
              <AssignmentIcon 
                sx={{ 
                  fontSize: 36, 
                  color: ACCENTURE_COLORS.corePurple2,
                  opacity: 0.7
                }} 
              />
            </Box>
            <Typography variant="subtitle1" color={ACCENTURE_COLORS.corePurple2} gutterBottom>
              No certifications found
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
              Try filtering by status or searching for a specific employee or certification name.
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <Box 
        sx={{ 
          p: 2, 
          borderTop: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.08)}`,
          display: 'flex',
          justifyContent: 'flex-end',
          bgcolor: ACCENTURE_COLORS.white
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 0.75,
            borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.5),
            color: ACCENTURE_COLORS.corePurple2,
            '&:hover': {
              borderColor: ACCENTURE_COLORS.corePurple1,
              bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.03)
            },
            textTransform: 'none'
          }}
          startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
        >
          Back
        </Button>
      </Box>
      
      {/* PDF Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: { 
            height: '90vh',
            borderRadius: 1,
            overflow: 'hidden'
          }
        }}
      >
        <Box
          sx={{
            p: 1.5, 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.08)}`,
            bgcolor: ACCENTURE_COLORS.white
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PdfIcon sx={{ color: ACCENTURE_COLORS.red, fontSize: 20 }} />
            <Typography variant="subtitle1">
              Certification Evidence
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setPreviewOpen(false)}
            size="small"
            sx={{
              color: ACCENTURE_COLORS.darkGray
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ height: 'calc(90vh - 54px)', bgcolor: alpha(ACCENTURE_COLORS.black, 0.03) }}>
          <iframe
            src={previewFile}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="PDF Preview"
          />
        </Box>
      </Dialog>
      
      {/* Approval Dialog with Skills Update UI */}
      <Dialog
        open={skillsDialogOpen}
        onClose={() => setSkillsDialogOpen(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: { 
            maxHeight: '90vh',
            borderRadius: 1,
            overflow: 'hidden'
          }
        }}
      >
        <Box
          sx={{
            bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.08), 
            color: ACCENTURE_COLORS.black,
            py: 1.5,
            px: 2.5,
            borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.06)}`
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon sx={{ color: ACCENTURE_COLORS.corePurple2, fontSize: 20 }} />
              <Typography variant="subtitle1">
              Approve certifiations and update skills
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setSkillsDialogOpen(false)}
              size="small"
              sx={{ 
                color: ACCENTURE_COLORS.darkGray
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        
        <DialogContent sx={{ pb: 2, pt: 2 }}>
          {selectedCertification && (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                src={selectedCertification.userProfilePic} 
                sx={{ 
                  width: 40, 
                  height: 40,
                  bgcolor: alpha(getAvatarColor(selectedCertification.userName), 0.85),
                  color: ACCENTURE_COLORS.white,
                  fontSize: 16
                }}
              >
                {getUserInitials(selectedCertification.userName)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" color={ACCENTURE_COLORS.black}>
                  {selectedCertification.userName}
                </Typography>
                <Typography variant="body2" color={ACCENTURE_COLORS.darkGray}>
                  {selectedCertification.certificationName}
                </Typography>
              </Box>
            </Box>
          )}
          
          <Box
            sx={{
              bgcolor: alpha(ACCENTURE_COLORS.accentPurple5, 0.3),
              borderRadius: 1,
              p: 1.5,
              mb: 2,
              border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`
            }}
          >
            <Typography variant="body2">
              Select the skills to update and their proficiency levels. You can also add new skills if needed.
            </Typography>
          </Box>
          
          <TableContainer 
            component={Paper} 
            variant="outlined" 
            sx={{ 
              mb: 3,
              maxHeight: '50vh',
              overflow: 'auto',
              borderRadius: 1,
              borderColor: alpha(ACCENTURE_COLORS.black, 0.08),
              boxShadow: 'none'
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      fontWeight: 500,
                      fontSize: '0.75rem', 
                      width: '15%',
                      bgcolor: alpha(ACCENTURE_COLORS.accentPurple5, 0.5),
                      color: ACCENTURE_COLORS.black,
                      borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.08)}`
                    }}
                  >
                    Skill
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 500, 
                      fontSize: '0.75rem',
                      width: '10%',
                      bgcolor: alpha(ACCENTURE_COLORS.accentPurple5, 0.5),
                      color: ACCENTURE_COLORS.black,
                      borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.08)}`
                    }}
                  >
                    Type
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 500, 
                      fontSize: '0.75rem',
                      width: '20%',
                      bgcolor: alpha(ACCENTURE_COLORS.accentPurple5, 0.5),
                      color: ACCENTURE_COLORS.black,
                      borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.08)}`
                    }}
                  >
                    Description
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 500, 
                      fontSize: '0.75rem',
                      width: '10%', 
                      textAlign: 'center',
                      bgcolor: alpha(ACCENTURE_COLORS.accentPurple5, 0.5),
                      color: ACCENTURE_COLORS.black,
                      borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.08)}`
                    }}
                  >
                    Include
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 500, 
                      fontSize: '0.75rem',
                      width: '15%',
                      bgcolor: alpha(ACCENTURE_COLORS.accentPurple5, 0.5),
                      color: ACCENTURE_COLORS.black,
                      borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.08)}`
                    }}
                  >
                    Level of proficiency
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 500, 
                      fontSize: '0.75rem',
                      width: '15%',
                      bgcolor: alpha(ACCENTURE_COLORS.accentPurple5, 0.5),
                      color: ACCENTURE_COLORS.black,
                      borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.08)}`
                    }}
                  >
                    Experience (Years)
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 500, 
                      fontSize: '0.75rem',
                      width: '15%',
                      bgcolor: alpha(ACCENTURE_COLORS.accentPurple5, 0.5),
                      color: ACCENTURE_COLORS.black,
                      borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.08)}`
                    }}
                  >
                    Progress
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {availableSkills.length > 0 ? (
                  availableSkills.map((skill) => {
                    const isSelected = selectedSkills.includes(skill.skill_ID);
                    return (
                      <TableRow key={skill.skill_ID} sx={{
                        bgcolor: isSelected ? alpha(ACCENTURE_COLORS.corePurple1, 0.03) : 'inherit',
                        '&:hover': { 
                          bgcolor: isSelected ? alpha(ACCENTURE_COLORS.corePurple1, 0.05) : alpha(ACCENTURE_COLORS.black, 0.01) 
                        }
                      }}>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ color: isSelected ? ACCENTURE_COLORS.corePurple2 : ACCENTURE_COLORS.black }}
                          >
                            {skill.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={skill.type}
                            size="small"
                            sx={{ 
                              borderRadius: 1,
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: skill.type === 'Soft Skill' ? 
                                alpha(ACCENTURE_COLORS.blue, 0.05) : alpha(ACCENTURE_COLORS.red, 0.05),
                              color: skill.type === 'Soft Skill' ? 
                                ACCENTURE_COLORS.blue : ACCENTURE_COLORS.red
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
                                maxWidth: 250,
                                fontSize: '0.8rem',
                                color: ACCENTURE_COLORS.darkGray
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
                              color: alpha(ACCENTURE_COLORS.corePurple1, 0.3),
                              padding: 0.5,
                              '&.Mui-checked': { color: ACCENTURE_COLORS.corePurple2 }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {isSelected && (
                            <FormControl fullWidth size="small">
                              <Select
                                value={proficiencyLevels[skill.skill_ID] || "Basic"}
                                onChange={(e) => handleProficiencyChange(skill.skill_ID, e.target.value)}
                                sx={{
                                  height: 32,
                                  fontSize: '0.8rem',
                                  borderRadius: 1,
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: alpha(getProficiencyColor(proficiencyLevels[skill.skill_ID] || "Basic"), 0.5),
                                    borderWidth: 1
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: getProficiencyColor(proficiencyLevels[skill.skill_ID] || "Basic"),
                                    borderWidth: 1
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: getProficiencyColor(proficiencyLevels[skill.skill_ID] || "Basic"),
                                  },
                                  color: getProficiencyColor(proficiencyLevels[skill.skill_ID] || "Basic"),
                                  '.MuiSelect-select': {
                                    py: 0.5
                                  }
                                }}
                              >
                                {PROFICIENCY_LEVELS.map((level) => (
                                  <MenuItem key={level.value} value={level.value}>
                                    {level.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </TableCell>
                        <TableCell>
                          {isSelected && (
                            <TextField
                              type="number"
                              size="small"
                              value={experienceYears[skill.skill_ID] || 1}
                              onChange={(e) => handleExperienceChange(skill.skill_ID, e.target.value)}
                              InputProps={{ 
                                inputProps: { min: 1, max: 10 },
                                sx: {
                                  height: 32,
                                  fontSize: '0.8rem',
                                  p: 0
                                }
                              }}
                              sx={{ 
                                width: '70px',
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 1,
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.7),
                                    borderWidth: 1
                                  }
                                }
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {isSelected && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.05),
                                color: ACCENTURE_COLORS.corePurple2,
                                py: 0.5,
                                px: 1,
                                borderRadius: 1,
                                display: 'inline-block',
                                fontSize: '0.7rem'
                              }}
                            >
                              {getProgressionMessage(skill.skill_ID)}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <AssignmentIcon sx={{ fontSize: 24, color: alpha(ACCENTURE_COLORS.corePurple1, 0.5), mb: 1 }} />
                        <Typography variant="body1" color={ACCENTURE_COLORS.corePurple2}>
                          No selected skills available
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                          This certification does not have any skills to update.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {selectedSkills.length === 0 && availableSkills.length > 0 && (
            <Box 
              sx={{ 
                mt: 1, 
                mb: 2,
                p: 1.5,
                borderRadius: 1,
                bgcolor: alpha(ACCENTURE_COLORS.red, 0.05),
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                border: `1px solid ${alpha(ACCENTURE_COLORS.red, 0.1)}`
              }}
            >
              <CancelIcon sx={{ color: ACCENTURE_COLORS.red, fontSize: 18 }} />
              <Typography variant="body2" color={ACCENTURE_COLORS.red} fontSize="0.8rem">
                Please select at least one skill to update.
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <Box 
          sx={{ 
            p: 2, 
            borderTop: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.08)}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: ACCENTURE_COLORS.white
          }}
        >
          <Button 
            variant="text"
            onClick={() => setSkillsDialogOpen(false)}
            sx={{
              px: 2,
              py: 0.75,
              color: ACCENTURE_COLORS.darkGray,
              '&:hover': {
                bgcolor: alpha(ACCENTURE_COLORS.black, 0.03)
              },
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          
          <Button 
            variant="contained"
            onClick={handleConfirmApproval}
            disabled={selectedSkills.length === 0 || loading}
            sx={{
              borderRadius: 1,
              px: 3,
              py: 0.75,
              bgcolor: ACCENTURE_COLORS.corePurple1,
              '&:hover': {
                bgcolor: ACCENTURE_COLORS.corePurple2
              },
              '&:disabled': {
                bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.2)
              },
              textTransform: 'none',
              boxShadow: 'none'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={14} sx={{ color: ACCENTURE_COLORS.white }} />
                <span>Processing...</span>
              </Box>
            ) : (
              'Approve and Update Skills'
            )}
          </Button>
        </Box>
      </Dialog>
      
      {/* Rejection Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { 
            borderRadius: 1,
            overflow: 'hidden'
          }
        }}
      >
        <Box
          sx={{
            bgcolor: alpha(ACCENTURE_COLORS.red, 0.08), 
            color: ACCENTURE_COLORS.black,
            py: 1.5,
            px: 2.5,
            borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.06)}`
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CancelIcon sx={{ color: ACCENTURE_COLORS.red, fontSize: 20 }} />
              <Typography variant="subtitle1">
                Reject certification
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setRejectDialogOpen(false)}
              size="small"
              sx={{ 
                color: ACCENTURE_COLORS.darkGray
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        
        <DialogContent sx={{ py: 2 }}>
          {selectedCertification && (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar 
                src={selectedCertification.userProfilePic} 
                sx={{ 
                  width: 36, 
                  height: 36,
                  bgcolor: alpha(getAvatarColor(selectedCertification.userName), 0.85),
                  color: ACCENTURE_COLORS.white,
                  fontSize: 14
                }}
              >
                {getUserInitials(selectedCertification.userName)}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" color={ACCENTURE_COLORS.black}>
                  {selectedCertification.userName}
                </Typography>
                <Typography variant="body2" color={ACCENTURE_COLORS.darkGray} fontSize="0.8rem">
                  {selectedCertification.certificationName}
                </Typography>
              </Box>
            </Box>
          )}
          
          <Box
            sx={{
              bgcolor: alpha(ACCENTURE_COLORS.red, 0.05),
              borderRadius: 1,
              p: 1.5,
              mb: 2,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              border: `1px solid ${alpha(ACCENTURE_COLORS.red, 0.1)}`
            }}
          >
            <Typography variant="body2" fontSize="0.8rem">
              <Box component="span" fontWeight={500}>Importante: </Box>
              Please give a reason for rejecting the certification. This will be sent to the employee.
            </Typography>
          </Box>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Explain the reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
            error={rejectDialogOpen && !rejectionReason}
            helperText={rejectDialogOpen && !rejectionReason ? "Motive of rejection required" : ""}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                fontSize: '0.875rem',
                bgcolor: ACCENTURE_COLORS.white,
                border: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.15)}`,
                '&:hover': {
                  borderColor: alpha(ACCENTURE_COLORS.black, 0.3)
                },
                '&.Mui-focused': {
                  borderColor: ACCENTURE_COLORS.red,
                  boxShadow: `0 0 0 2px ${alpha(ACCENTURE_COLORS.red, 0.1)}`
                }
              },
              '& .MuiFormHelperText-root': {
                fontSize: '0.7rem'
              }
            }}
          />
        </DialogContent>
        
        <Box 
          sx={{ 
            p: 2, 
            borderTop: `1px solid ${alpha(ACCENTURE_COLORS.black, 0.08)}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: ACCENTURE_COLORS.white
          }}
        >
          <Button 
            variant="text"
            onClick={() => setRejectDialogOpen(false)}
            sx={{
              px: 2,
              py: 0.75,
              color: ACCENTURE_COLORS.darkGray,
              '&:hover': {
                bgcolor: alpha(ACCENTURE_COLORS.black, 0.03)
              },
              textTransform: 'none'
            }}
          >
            Cancelar
          </Button>
          
          <Button 
            variant="contained"
            onClick={handleConfirmRejection}
            disabled={!rejectionReason || loading}
            sx={{
              borderRadius: 1,
              px: 3,
              py: 0.75,
              bgcolor: ACCENTURE_COLORS.red,
              '&:hover': {
                bgcolor: alpha(ACCENTURE_COLORS.red, 0.85)
              },
              '&:disabled': {
                bgcolor: alpha(ACCENTURE_COLORS.red, 0.2)
              },
              textTransform: 'none',
              boxShadow: 'none'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={14} sx={{ color: ACCENTURE_COLORS.white }} />
                <span>Processing...</span>
              </Box>
            ) : (
              'Reject certification'
            )}
          </Button>
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