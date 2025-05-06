import React from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  LinearProgress,
  Grid,
  Chip,
  CircularProgress
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DescriptionIcon from "@mui/icons-material/Description";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { ACCENTURE_COLORS } from "../styles/styles";

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
 * Upload Step Component - First step in the form wizard
 */
const UploadStep = ({
  file,
  filePreviewUrl,
  fileInputRef,
  parsing,
  parseProgress,
  aiAnalysisDetails,
  handleFileChange,
  handleParseCV,
  setFile,
  setFilePreviewUrl
}) => {
  return (
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
        onClick={handleParseCV}
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
};

export default UploadStep;