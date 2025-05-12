import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
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
} from "@mui/material";
import { Add } from "@mui/icons-material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { supabase } from "../supabase/supabaseClient.js";

const AddSkillModal = ({ onSkillAdded }) => {
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
      >
        Add Skill
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        {/* Properly styled DialogTitle with icon */}
        <DialogTitle
          sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}
        >
          <AddCircleOutlineIcon color="primary" />
          <Typography variant="h6">Add New Skill</Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              required
              label="Skill Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              fullWidth
              placeholder="e.g., Programming, Leadership, etc."
            />

            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Type"
              >
                <MenuItem value="Technical Skill">Technical Skill</MenuItem>
                <MenuItem value="Soft Skill">Soft Skill</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Describe this skill"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={loading || !formData.name || !formData.type}
          >
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddSkillModal;
