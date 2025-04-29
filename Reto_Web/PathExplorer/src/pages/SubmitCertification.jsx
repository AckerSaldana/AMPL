import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Divider,
  IconButton,
  alpha,
  useTheme,
  Tooltip,
  Avatar,
  InputAdornment,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  CalendarMonth as CalendarIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { supabase } from '../supabase/supabaseClient';
import uploadEvidenceToSupabase from '../utils/uploadEvidenceToSupabase';

const SubmitCertification = ({ onClose }) => {
  const theme = useTheme();
  
  // Colores de Accenture según las directrices
  const corePurple1 = "#a100ff"; // Core Purple 1
  const corePurple2 = "#7500c0"; // Core Purple 2
  const corePurple3 = "#460073"; // Core Purple 3
  const lightGray = "#e6e6dc"; // Light Gray
  
  const [file, setFile] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [completedDate, setCompletedDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [score, setScore] = useState('');
  const [certifications, setCertifications] = useState([]);
  const [selectedCertificationId, setSelectedCertificationId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchCertifications = async () => {
      const { data, error } = await supabase
        .from('Certifications')
        .select('certification_id, title');

      if (error) {
        console.error('Error fetching certifications:', error);
        setFormError('Unable to load certifications. Please try again later.');
      } else {
        setCertifications(data || []);
      }
    };

    fetchCertifications();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setPdfPreviewUrl(URL.createObjectURL(selected));
      setFormError(null);
    } else {
      setFormError("Please upload a valid PDF file.");
      setFile(null);
      setPdfPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPdfPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const validateForm = () => {
    if (!selectedCertificationId) {
      setFormError("Please select a certification");
      return false;
    }
    if (!file) {
      setFormError("Please upload certification evidence (PDF)");
      return false;
    }
    if (!completedDate) {
      setFormError("Please select the completion date");
      return false;
    }
    if (!validUntil) {
      setFormError("Please select the expiration date");
      return false;
    }
    if (!score || parseInt(score) < 1 || parseInt(score) > 100) {
      setFormError("Please enter a valid score between 1 and 100");
      return false;
    }
    
    // Verificar que la fecha de validez sea posterior a la fecha de finalización
    if (new Date(validUntil) <= new Date(completedDate)) {
      setFormError("Valid until date must be after completion date");
      return false;
    }
    
    setFormError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      const publicUrl = await uploadEvidenceToSupabase(file);
      const user = await supabase.auth.getUser();

      const { error } = await supabase.from('UserCertifications').insert({
        user_ID: user.data.user.id,
        certification_ID: selectedCertificationId,
        completed_Date: completedDate,
        valid_Until: validUntil,
        score: parseInt(score),
        evidence: publicUrl,
      });

      if (error) throw new Error(`Insert error: ${error.message}`);

      // Resetear el formulario
      setFile(null);
      setPdfPreviewUrl(null);
      setCompletedDate('');
      setValidUntil('');
      setScore('');
      setSelectedCertificationId('');
      if (fileInputRef.current) fileInputRef.current.value = null;
      
      // Cerrar modal con un pequeño retardo para permitir la animación
      setTimeout(() => {
        onClose();
      }, 500);
      
    } catch (err) {
      setFormError(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', bgcolor: '#fff' }}>
      {/* Header */}
      <Box 
        sx={{ 
          p: 2.5, 
          borderBottom: `1px solid ${alpha('#000', 0.08)}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6" fontWeight={600} color="#333">
          Submit Certification
        </Typography>
        
        <IconButton 
          onClick={onClose}
          size="small"
          sx={{ 
            color: alpha('#000', 0.6),
            '&:hover': { bgcolor: alpha('#000', 0.05) }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      
      {/* Content */}
      <Box sx={{ p: 3, maxHeight: 'calc(90vh - 70px)', overflowY: 'auto' }}>
        {formError && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 1,
              bgcolor: alpha('#f44336', 0.05),
              border: '1px solid',
              borderColor: alpha('#f44336', 0.2),
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <InfoIcon sx={{ color: '#f44336', fontSize: 20 }} />
            <Typography variant="body2" color="error">
              {formError}
            </Typography>
          </Paper>
        )}
        
        <Box sx={{ mb: 4 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="certification-label">Select Certification</InputLabel>
            <Select
              labelId="certification-label"
              value={selectedCertificationId}
              onChange={(e) => setSelectedCertificationId(e.target.value)}
              label="Select Certification"
              sx={{
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: corePurple1
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(corePurple1, 0.7)
                }
              }}
            >
              <MenuItem value="">Select one</MenuItem>
              {certifications.map((cert) => (
                <MenuItem key={cert.certification_id} value={cert.certification_id}>
                  {cert.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography 
            variant="subtitle2" 
            fontWeight={600} 
            sx={{ mb: 1.5, color: '#333' }}
          >
            Certification Evidence
          </Typography>
          
          {!file ? (
            <Box
              sx={{
                border: '1px dashed',
                borderColor: alpha(corePurple1, 0.3),
                borderRadius: 1,
                p: 3,
                textAlign: 'center',
                bgcolor: alpha(corePurple1, 0.02),
                mb: 3,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: alpha(corePurple1, 0.05),
                  borderColor: alpha(corePurple1, 0.5)
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                hidden
                accept=".pdf"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              <UploadIcon 
                sx={{ 
                  fontSize: 36, 
                  color: corePurple1,
                  mb: 1.5 
                }} 
              />
              <Typography variant="subtitle1" gutterBottom fontWeight={500} color="#333">
                Upload PDF Evidence
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click to browse or drag and drop your file here
              </Typography>
              <Typography variant="caption" display="block" mt={1} color={alpha('#000', 0.5)}>
                Accepted format: PDF
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                border: '1px solid',
                borderColor: alpha(corePurple1, 0.2),
                borderRadius: 1,
                overflow: 'hidden',
                mb: 3,
                bgcolor: alpha('#fff', 0.9)
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: alpha(corePurple1, 0.05),
                  borderBottom: '1px solid',
                  borderColor: alpha(corePurple1, 0.1)
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(corePurple1, 0.15),
                      color: corePurple1,
                      width: 40,
                      height: 40
                    }}
                  >
                    <PdfIcon />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight={600}
                      sx={{
                        maxWidth: '230px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(file.size / 1024).toFixed(0)} KB
                    </Typography>
                  </Box>
                </Box>
                
                <Tooltip title="Remove file">
                  <IconButton 
                    size="small" 
                    onClick={handleRemoveFile}
                    sx={{ color: alpha('#000', 0.6) }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {pdfPreviewUrl && (
                <Box sx={{ height: '200px', borderTop: `1px solid ${alpha('#000', 0.08)}` }}>
                  <iframe
                    src={pdfPreviewUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    title="PDF Preview"
                  />
                </Box>
              )}
            </Box>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          <Typography 
            variant="subtitle2" 
            fontWeight={600} 
            sx={{ mb: 2, color: '#333' }}
          >
            Certification Details
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              type="date"
              label="Completed Date"
              InputLabelProps={{ shrink: true }}
              value={completedDate}
              onChange={(e) => setCompletedDate(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon 
                      fontSize="small" 
                      sx={{ color: alpha('#000', 0.5) }} 
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: corePurple1
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(corePurple1, 0.7)
                  }
                }
              }}
            />
            
            <TextField
              fullWidth
              type="date"
              label="Valid Until"
              InputLabelProps={{ shrink: true }}
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon 
                      fontSize="small" 
                      sx={{ color: alpha('#000', 0.5) }} 
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: corePurple1
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(corePurple1, 0.7)
                  }
                }
              }}
            />
          </Box>
          
          <TextField
            fullWidth
            label="Score (1 - 100)"
            value={score}
            onChange={(e) => {
              const input = e.target.value;
              // Permitir solo dígitos (no letras, símbolos, ni más de 3 dígitos)
              if (/^\d{0,3}$/.test(input)) {
                setScore(input);
              }
            }}
            onBlur={() => {
              const num = parseInt(score);
              if (isNaN(num) || num < 1 || num > 100) {
                setScore('');
              }
            }}
            error={score !== '' && (parseInt(score) < 1 || parseInt(score) > 100)}
            helperText={
              score !== '' && (parseInt(score) < 1 || parseInt(score) > 100)
                ? "Score must be between 1 and 100"
                : ""
            }
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              maxLength: 3,
            }}
            sx={{ 
              mb: 4,
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: corePurple1
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(corePurple1, 0.7)
                }
              }
            }}
          />
        </Box>
      </Box>
      
      {/* Footer */}
      <Box 
        sx={{ 
          p: 2.5, 
          borderTop: `1px solid ${alpha('#000', 0.08)}`,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={isSubmitting}
          sx={{
            borderColor: alpha('#000', 0.2),
            color: '#333',
            '&:hover': {
              borderColor: alpha('#000', 0.4),
              bgcolor: alpha('#000', 0.03)
            },
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting ? null : <CheckIcon />}
          sx={{
            bgcolor: corePurple1,
            '&:hover': {
              bgcolor: corePurple2
            },
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Certification'}
        </Button>
      </Box>
    </Box>
  );
};

export default SubmitCertification;