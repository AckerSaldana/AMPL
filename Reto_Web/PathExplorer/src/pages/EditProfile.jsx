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

        <Grid item md={12}>
          <EditBannerProfile />
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" fontWeight="bold">

        <Grid item xs={12} md={6}>
          {/* Editable Information Section */}
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Typography variant="body1" fontWeight="bold">

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

              sx={{ mt: 2 }}
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

              sx={{ mt: 2 }}
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

              sx={{ mt: 2 }}
              color="secondary"

            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>

          <Paper sx={{ p: 3, display: "flex", flexDirection: "column" }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              display="flex"
              alignItems="center"
            >
              <Info color="primary" sx={{ mr: 1 }} /> Edit About

          {/* Editable About Section */}
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Typography variant="body1" fontWeight="bold">
              Edit About

            </Typography>
            <TextField
              fullWidth
              multiline

              rows={7}
              name="about"
              label="Who are you?"
              value={formData.about}
              onChange={handleChange}
              sx={{
                mt: 2,
                flexGrow: 1,
                "& .MuiInputLabel-root": { color: "gray" },
                "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
              }}

              rows={4}
              name="about"
              value={formData.about}
              onChange={handleChange}
              sx={{ mt: 2 }}
              color="secondary"

            />
          </Paper>
        </Grid>


        <Grid item xs={12}>
          <AddSkillsCard />
        </Grid>

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
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "primary.main",
                  },
                }}

        {/* Editable Goals Section */}
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
                sx={{ mt: 2, color: "gray" }}

              />
            ))}
          </Paper>
        </Grid>


        {/* Editable Skills Section */}
        <Grid item xs={12}>
          <SkillsCard />
        </Grid>

        {/* Buttons */}

        <Grid
          item
          xs={12}
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => onSave(formData)}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            sx={{

              bgcolor: "#f5f5f5",
              color: "black",
              "&:hover": { bgcolor: "#e0e0e0" },

              bgcolor: "text.secondary",
              color: "white",
              "&:hover": {
                bgcolor: "gray",
              },

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
