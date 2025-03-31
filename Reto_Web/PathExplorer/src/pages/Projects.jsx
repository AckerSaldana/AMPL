import React from "react";
import { Box, Grid, Typography } from "@mui/material";

import { AddProjectCard } from "../components/AddProjectCard";
import { AddRoleCard } from "../components/AddRoleCard";

const Projects = () => {
  return (
    <Box sx={{ p: 4, minHeight: "calc(100vh - 60px)" }}>
      <Grid container spacing={3}>
        {/* Left: Add Project */}
        <Grid item xs={12} md={4}>
          <AddProjectCard />
        </Grid>

        {/* Right: Create Role */}
        <Grid item xs={12} md={8}>
          <AddRoleCard />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Projects;
