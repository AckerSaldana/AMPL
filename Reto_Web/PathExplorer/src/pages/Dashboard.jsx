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
      {/* Viewport height minus navbar height */}
      <Box sx={{ p: 4, minHeight: "calc(100vh - 60px)" }}>
        <Grid
          container
          spacing={3}
          sx={{ height: "100%", maxHeight: "calc(100vh - 60px)" }}
        >
          {/* Left Column */}
          <Grid
            item
            xs={12}
            md={3}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              height: "100%",
              minHeight: 0, // important for child flexbox scroll
            }}
          >
            <Box sx={{ flex: "0 0 25%" }}>
              <WelcomeCard name="Benito" />
            </Box>
            <Box
              sx={{
                flex: "1 1 75%",
                minHeight: 0,
                maxHeight: "calc(70vh - 60px)",
                overflowY: "auto",
              }}
            >
              <PathTimeline />
            </Box>
          </Grid>

          {/* Center Column */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              height: "100%",
              minHeight: 0,
            }}
          >
            {/* Top 25% with 3 IconInfo components */}
            <Box sx={{ flex: "0 0 25%" }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <IconInfo
                    icon={InsertDriveFileIcon}
                    title="Available Certifications"
                    value="15"
                    color="primary"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <IconInfo
                    icon={CheckCircleIcon}
                    title="Completed Certifications"
                    value="6"
                    color="secondary"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <IconInfo
                    icon={PendingIcon}
                    title="Certifications in Progress"
                    value="2"
                    color="accent"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Bottom 75% */}
            <Box
              sx={{
                flex: "1 1 75%",
                minHeight: 0,
                maxHeight: "calc(70vh - 160px)",
                overflowY: "auto",
              }}
            >
              <CertificationGrid />
            </Box>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={3} sx={{ height: "100%", minHeight: 0 }}>
            <Box sx={{ height: "100%", overflow: "auto" }}>
              <Calendar />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Typography>
  );
};

export default Dashboard;
