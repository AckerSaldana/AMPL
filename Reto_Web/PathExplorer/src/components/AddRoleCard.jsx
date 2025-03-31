import React from "react";
import { Box, Grid, Paper, Typography, useTheme } from "@mui/material";
import { Role } from "./Role";
import { SkillList } from "./SkillList";

export const AddRoleCard = () => {
  const theme = useTheme();

  return (
    <Paper>
      {/* Heading */}
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.text.white,
          p: 2,
          borderTopLeftRadius: "4px",
          borderTopRightRadius: "4px",
        }}
      >
        <Typography variant="body1" fontWeight={600}>
          Create Role
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {/* Left: Role Form */}
          <Grid item xs={12} md={6}>
            <Role />
          </Grid>

          {/* Right: Skill List */}
          <Grid item xs={12} md={6}>
            <SkillList />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};
