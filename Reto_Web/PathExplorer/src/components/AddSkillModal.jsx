import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Typography,
  IconButton,
  Divider,
  alpha,
  Fade,
  useTheme,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { supabase } from "../supabase/supabaseClient.js";
import { 
  ACCENTURE_COLORS, 
  primaryButtonStyles, 
  outlineButtonStyles 
} from "../styles/styles.js";
import { useDarkMode } from "../contexts/DarkModeContext";

const AddSkillModal = ({ onSkillAdded }) => {
  const theme = useTheme();
  const { darkMode } = useDarkMode();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    type: "",
    skill_ID: null,
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("Skill")
        .insert([
          {
            name: formData.name,
            category: formData.category,
            description: formData.description,
            type: formData.type,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      // Show success message
      setSnackbar({
        open: true,
        message: "Skill added successfully!",
        severity: "success",
      });

      // Reset form
      setFormData({
        name: "",
        category: "",
        description: "",
        type: "",
        skill_ID: null,
      });

      // Close modal
      setOpen(false);

      // Callback to refresh parent component
      if (onSkillAdded) {
        onSkillAdded();
      }
    } catch (error) {
      console.error("Error adding skill:", error.message);
      setSnackbar({
        open: true,
        message: `Failed to add skill: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={handleOpen}
        size="small"
        sx={{
          ...primaryButtonStyles,
          height: '36px',
          boxShadow: 'none',
          fontSize: '0.8rem',
          '&:hover': {
            boxShadow: 'none',
            bgcolor: ACCENTURE_COLORS.corePurple2,
            transform: 'translateY(-2px)',
          }
        }}
      >
        Add Skill
      </Button>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          elevation: darkMode ? 0 : 12,
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
          }
        }}
      >
        {/* Modal Header */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: '16px 24px',
            bgcolor: darkMode ? 'rgba(161, 0, 255, 0.05)' : alpha(ACCENTURE_COLORS.corePurple1, 0.03),
            borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : `1px solid ${alpha(ACCENTURE_COLORS.darkGray, 0.1)}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AddCircleOutlineIcon 
              sx={{ 
                color: ACCENTURE_COLORS.corePurple1, 
                fontSize: 24 
              }} 
            />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                color: darkMode ? '#ffffff' : ACCENTURE_COLORS.black,
                fontSize: '1.1rem'
              }}
            >
              Add New Skill
            </Typography>
          </Box>
          <IconButton 
            onClick={handleClose}
            size="small"
            sx={{ 
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : ACCENTURE_COLORS.darkGray,
              '&:hover': { 
                color: darkMode ? '#ffffff' : ACCENTURE_COLORS.black,
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : alpha(ACCENTURE_COLORS.corePurple1, 0.05)
              }
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3, pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Campo Skill Name */}
            <TextField
              required
              label="Skill Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              placeholder="Enter skill name"
              InputLabelProps={{
                shrink: true,
                sx: {
                  color: ACCENTURE_COLORS.corePurple1,
                  fontWeight: 500
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : alpha(ACCENTURE_COLORS.white, 0.8),
                  transition: 'all 0.2s',
                  color: darkMode ? '#ffffff' : 'inherit',
                  '& fieldset': {
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : alpha(ACCENTURE_COLORS.darkGray, 0.1),
                    borderWidth: '1px',
                  },
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : ACCENTURE_COLORS.white,
                    '& fieldset': {
                      borderColor: ACCENTURE_COLORS.corePurple1,
                    }
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: ACCENTURE_COLORS.corePurple1,
                    borderWidth: '1px',
                  },
                  '& input::placeholder': {
                    color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                    opacity: 1
                  }
                }
              }}
            />

            {/* Campo Category */}
            <TextField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              placeholder="e.g., Programming, Leadership, Design"
              InputLabelProps={{ 
                shrink: true,
                sx: {
                  color: ACCENTURE_COLORS.corePurple1,
                  fontWeight: 500
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : alpha(ACCENTURE_COLORS.white, 0.8),
                  transition: 'all 0.2s',
                  color: darkMode ? '#ffffff' : 'inherit',
                  '& fieldset': {
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : alpha(ACCENTURE_COLORS.darkGray, 0.1),
                    borderWidth: '1px',
                  },
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : ACCENTURE_COLORS.white,
                    '& fieldset': {
                      borderColor: ACCENTURE_COLORS.corePurple1,
                    }
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: ACCENTURE_COLORS.corePurple1,
                    borderWidth: '1px',
                  },
                  '& input::placeholder': {
                    color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                    opacity: 1
                  }
                }
              }}
            />

            {/* Campo Skill Type */}
            <FormControl 
              fullWidth 
              required 
              sx={{
                '& .MuiInputLabel-root': {
                  color: ACCENTURE_COLORS.corePurple1,
                  fontWeight: 500
                }
              }}
            >
              <InputLabel 
                shrink 
                sx={{
                  color: ACCENTURE_COLORS.corePurple1,
                  fontWeight: 500
                }}
              >
                Skill Type
              </InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                displayEmpty
                notched
                label="Skill Type"
                sx={{
                  borderRadius: 1.5,
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : alpha(ACCENTURE_COLORS.white, 0.8),
                  transition: 'all 0.2s',
                  color: darkMode ? '#ffffff' : 'inherit',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : alpha(ACCENTURE_COLORS.darkGray, 0.1),
                    borderWidth: '1px',
                  },
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : ACCENTURE_COLORS.white,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: ACCENTURE_COLORS.corePurple1,
                    }
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: ACCENTURE_COLORS.corePurple1,
                    borderWidth: '1px',
                  },
                  '& .MuiSelect-icon': {
                    color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit'
                  }
                }}
                MenuProps={{
                  PaperProps: {
                    elevation: darkMode ? 0 : 3,
                    sx: {
                      mt: 1,
                      borderRadius: 2,
                      bgcolor: darkMode ? '#2e2e2e' : '#ffffff',
                      border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
                      boxShadow: darkMode ? '0 4px 12px rgba(0, 0, 0, 0.5)' : `0 4px 12px ${alpha(ACCENTURE_COLORS.corePurple1, 0.08)}`,
                      '& .MuiMenuItem-root': {
                        fontSize: '0.9rem',
                        py: 1.2,
                        px: 2,
                        color: darkMode ? '#ffffff' : 'inherit',
                        '&:hover': {
                          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : alpha(ACCENTURE_COLORS.corePurple1, 0.04),
                        },
                        '&.Mui-selected': {
                          backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.2)' : alpha(ACCENTURE_COLORS.corePurple1, 0.08),
                          color: darkMode ? ACCENTURE_COLORS.accentPurple3 : ACCENTURE_COLORS.corePurple1,
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.3)' : alpha(ACCENTURE_COLORS.corePurple1, 0.12),
                          }
                        }
                      }
                    }
                  }
                }}
                renderValue={(selected) => {
                  if (!selected) {
                    return <Typography sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'text.secondary' }}>Select skill type</Typography>;
                  }
                  return selected;
                }}
              >
                <MenuItem value="Technical Skill">Technical Skill</MenuItem>
                <MenuItem value="Soft Skill">Soft Skill</MenuItem>
              </Select>
            </FormControl>

            {/* Campo Description */}
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Brief description of this skill"
              InputLabelProps={{ 
                shrink: true,
                sx: {
                  color: ACCENTURE_COLORS.corePurple1,
                  fontWeight: 500
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : alpha(ACCENTURE_COLORS.white, 0.8),
                  transition: 'all 0.2s',
                  color: darkMode ? '#ffffff' : 'inherit',
                  '& fieldset': {
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : alpha(ACCENTURE_COLORS.darkGray, 0.1),
                    borderWidth: '1px',
                  },
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : ACCENTURE_COLORS.white,
                    '& fieldset': {
                      borderColor: ACCENTURE_COLORS.corePurple1,
                    }
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: ACCENTURE_COLORS.corePurple1,
                    borderWidth: '1px',
                  },
                  '& textarea::placeholder': {
                    color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                    opacity: 1
                  }
                }
              }}
            />
          </Box>
        </DialogContent>

        <Divider sx={{ mx: 2, borderColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : alpha(ACCENTURE_COLORS.darkGray, 0.08) }} />
        
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Button 
            onClick={handleClose} 
            sx={{
              ...outlineButtonStyles,
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : ACCENTURE_COLORS.darkGray,
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : alpha(ACCENTURE_COLORS.darkGray, 0.3),
              '&:hover': {
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.4)' : ACCENTURE_COLORS.darkGray,
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : alpha(ACCENTURE_COLORS.darkGray, 0.05),
                transform: 'translateY(-2px)',
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.name || !formData.type}
            sx={{
              ...primaryButtonStyles,
              width: loading ? '100px' : 'auto',
              position: 'relative',
              '&:hover': {
                boxShadow: `0 4px 8px ${alpha(ACCENTURE_COLORS.corePurple1, 0.2)}`,
                bgcolor: ACCENTURE_COLORS.corePurple2,
                transform: 'translateY(-2px)',
              },
              '&.Mui-disabled': {
                bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.4),
                color: 'white',
              }
            }}
          >
            {loading ? (
              <CircularProgress 
                size={24} 
                sx={{ 
                  color: 'white',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }} 
              />
            ) : "Save Skill"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
          sx={{ 
            borderRadius: 1.5,
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            width: '100%',
            '& .MuiAlert-icon': {
              fontSize: '1.2rem'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddSkillModal;