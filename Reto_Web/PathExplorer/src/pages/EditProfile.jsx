import React, { useState } from "react";
import { Box, Grid, TextField, Button, Paper, Typography } from "@mui/material";
import { Person, Phone, Email, Info, Flag } from "@mui/icons-material";
import { AddSkillsCard } from "../components/AddSkillsCard";
import { EditBannerProfile } from "../components/EditBannerProfile";
import { SkillsCard } from "../components/SkillsCard";

const EditProfile = ({ userData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ ...userData });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Box
      sx={{
        p: 4,
        minHeight: "calc(100vh - 60px)",
        width: "100%",
        maxWidth: "calc(100vw - 150px)",
      }}
    >
      <Grid container spacing={3}>
        {/* Banner */}
        <Grid item md={12}>
          <EditBannerProfile />
        </Grid>

        {/* Editable Information Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" fontWeight="bold">
              Edit Information
            </Typography>
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              sx={{
                mt: 2,
                "& .MuiInputLabel-root": { color: "gray" },
                "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
              }}
              InputProps={{
                startAdornment: <Person color="primary" sx={{ mr: 1 }} />,
              }}
              color="secondary"
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              sx={{
                mt: 2,
                "& .MuiInputLabel-root": { color: "gray" },
                "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
              }}
              InputProps={{
                startAdornment: <Phone color="primary" sx={{ mr: 1 }} />,
              }}
              color="secondary"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              sx={{
                mt: 2,
                "& .MuiInputLabel-root": { color: "gray" },
                "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
              }}
              InputProps={{
                startAdornment: <Email color="primary" sx={{ mr: 1 }} />,
              }}
              color="secondary"
            />
          </Paper>
        </Grid>

        {/* Editable About Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: "flex", flexDirection: "column" }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              display="flex"
              alignItems="center"
            >
              <Info color="primary" sx={{ mr: 1 }} /> Edit About
            </Typography>
            <Paper
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                mt: 2,
              }}
            >
              <Typography variant="body1" fontWeight="bold">
                Edit About
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="about"
                label="Who are you?"
                value={formData.about}
                onChange={handleChange}
                sx={{
                  mt: 2,
                  "& .MuiInputLabel-root": { color: "gray" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
                }}
                color="secondary"
              />
            </Paper>
          </Paper>
        </Grid>

        {/* Add Skills Section */}
        <Grid item xs={12}>
          <AddSkillsCard />
        </Grid>

        {/* Editable Goals Section - Primera parte */}
        <Grid item md={12}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              display="flex"
              alignItems="center"
            >
              <Flag color="primary" sx={{ mr: 1 }} /> Edit Goals
            </Typography>
            {["Short-Term", "Mid-Term", "Long-Term"].map((goalType, index) => (
              <TextField
                key={goalType}
                fullWidth
                multiline
                rows={2}
                label={`${goalType} Goal`}
                name={`goal${index + 1}`}
                value={formData[`goal${index + 1}`] || ""}
                onChange={handleChange}
                sx={{
                  mt: 2,
                  "& .MuiInputLabel-root": { color: "gray" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
                }}
              />
            ))}
          </Paper>
        </Grid>

        {/* Editable Goals Section - Segunda parte */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body1" fontWeight="bold">
              Edit Goals
            </Typography>
            {[1, 2, 3].map((index) => (
              <TextField
                key={index}
                fullWidth
                label={`Goal ${index}`}
                name={`goal${index}`}
                value={formData[`goal${index}`] || ""}
                onChange={handleChange}
                sx={{ mt: 2 }}
              />
            ))}
          </Paper>
        </Grid>

        {/* Editable Skills Section */}
        <Grid item xs={12}>
          <SkillsCard />
        </Grid>

        {/* Botones */}
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button variant="contained" color="primary" onClick={() => onSave(formData)}>
            Save
          </Button>
          <Button
            variant="outlined"
            sx={{
              bgcolor: "text.secondary",
              color: "white",
              "&:hover": { bgcolor: "gray" },
            }}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EditProfile;
