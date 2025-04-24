import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Paper,
} from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const OverviewEdit = ({ projectData, onChange }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  // Update preview when projectData.logo changes
  useEffect(() => {
    if (projectData.logo && typeof projectData.logo === "string") {
      setPreviewUrl(projectData.logo);
    }
  }, [projectData.logo]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
      onChange("logo", file); // File object para subir después
    }
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }} component="form">
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          mb: 2,
        }}
      >
        <InfoOutlined sx={{ color: "primary.main", mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Overview
        </Typography>
      </Box>

      <Stack spacing={2}>
        {/* Logo upload*/}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ mb: 2, color: "text.secondary", alignSelf: "flex-start" }}
          >
            Logo Upload
          </Typography>

          <Box
            sx={{
              border: "2px dashed",
              borderColor: "divider",
              borderRadius: 2,
              p: 3,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 2,
              backgroundColor: "background.paper",
              transition: "0.3s",
              "&:hover": {
                borderColor: "primary.main",
              },
            }}
          >
            {!previewUrl ? (
              <>
                <Box
                  component="label"
                  htmlFor="logo-upload"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  <CloudUploadIcon
                    sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
                  />
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Drag & drop your logo or click to browse
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports JPG, PNG, SVG
                  </Typography>
                  <Button
                    variant="contained"
                    component="span"
                    sx={{ mt: 2 }}
                    startIcon={<AddPhotoAlternateIcon />}
                  >
                    Select File
                  </Button>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </Box>
              </>
            ) : (
              <Box sx={{ width: "100%", textAlign: "center" }}>
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Logo Preview"
                  sx={{
                    maxWidth: "100%",
                    maxHeight: 200,
                    borderRadius: 1,
                    mb: 2,
                  }}
                />
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      // Clear preview and file input
                      setPreviewUrl(null);
                      // Reset file input - would need to be implemented in parent component
                    }}
                  >
                    Remove
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    component="label"
                    htmlFor="logo-upload"
                  >
                    Change
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Title */}
        <TextField
          label="Title"
          variant="outlined"
          value={projectData.title}
          onChange={(e) => onChange("title", e.target.value)}
          fullWidth
        />

        {/* Description */}
        <TextField
          label="Description"
          variant="outlined"
          multiline
          rows={4}
          value={projectData.description}
          onChange={(e) => onChange("description", e.target.value)}
          fullWidth
        />

        {/* Due Date */}
        <TextField
          label="Due Date"
          variant="outlined"
          type="date"
          value={projectData.dueDate ? projectData.dueDate.split("T")[0] : ""}
          onChange={(e) => onChange("dueDate", e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        {/* Priority Select */}
        <FormControl fullWidth>
          <InputLabel id="priority-label">Priority</InputLabel>
          <Select
            labelId="priority-label"
            label="Priority"
            value={projectData.priority}
            onChange={(e) => onChange("priority", e.target.value)}
          >
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
          </Select>
        </FormControl>

        {/* Status Select */}
        <FormControl fullWidth>
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            label="Status"
            value={projectData.status}
            onChange={(e) => onChange("status", e.target.value)}
          >
            <MenuItem value="Not Started">Not Started</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="On Hold">On Hold</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Paper>
  );
};

export default OverviewEdit;
