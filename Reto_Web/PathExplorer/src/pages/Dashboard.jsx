import React from "react";
import { Box, Typography, Paper, Grid } from "@mui/material";
import { Calendar } from "../components/Calendar";
import { WelcomeCard } from "../components/WelcomeCard";
import { IconInfo } from "../components/IconInfo";
import { CertificationGrid } from "../components/CertificationGrid";
import { PathTimeline } from "../components/PathTimeline";

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";

const Dashboard = () => {
  return (
    <Typography variant="h4" gutterBottom>
      <Box sx={{ p: 4, height: "100vh" }}>
        <Grid container spacing={3} sx={{ height: "100%" }}>
          {/* Left Column */}
          <Grid
            item
            xs={12}
            md={3}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <WelcomeCard name="Benito" />
            <Paper sx={{ flex: "1 1 auto" }}>
              <PathTimeline />
            </Paper>
          </Grid>

          {/* Center Column */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {/* Top 15% with 3 IconInfo components */}
            <Box
              sx={{ flex: "0 0 25%", display: "flex", gap: 2, minHeight: 100 }}
            >
              <IconInfo
                icon={InsertDriveFileIcon}
                title="Available Certifications"
                value="10"
                color="primary"
              />
              <IconInfo
                icon={CheckCircleIcon}
                title="Completed Certifications"
                value="5"
                color="secondary"
              />
              <IconInfo
                icon={PendingIcon}
                title="In Progress"
                value="15"
                color="accent"
              />
            </Box>

            {/* Bottom 85% */}
            <CertificationGrid />
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={3}>
            <Calendar />
          </Grid>
        </Grid>
      </Box>
    </Typography>
  );
};

export default Dashboard;
