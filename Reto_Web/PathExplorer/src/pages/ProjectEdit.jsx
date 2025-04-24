import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import OverviewEdit from "../components/OverviewEdit";
import ProgressEdit from "../components/ProgressEdit";
import TeammatesDisplay from "../components/TeammatesDisplay";
import { supabase } from "../supabase/supabaseClient.js";

const ProjectEdit = () => {
  const { id } = useParams();
  const projectId = id;
  const navigate = useNavigate();
  const theme = useTheme();

  const [project, setProject] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [overviewData, setOverviewData] = useState({
    logo: "",
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    status: "Not Started",
  });

  const [progressValue, setProgressValue] = useState(0);
  const [teammates, setTeammates] = useState([]);

  const fetchProjectDetails = async () => {
    const { data: projectData, error } = await supabase
      .from("Project")
      .select(
        "projectID, title, description, status, logo, progress, start_date, end_date, priority"
      )
      .eq("projectID", projectId)
      .single();
    if (error) {
      setSnackbar({
        open: true,
        message: `Error loading project: ${error.message}`,
        severity: "error",
      });
      return;
    }
    setProject(projectData);
    setOverviewData({
      logo: projectData.logo || "",
      title: projectData.title || "",
      description: projectData.description || "",
      dueDate: projectData.end_date || "",
      priority: projectData.priority || "Medium",
      status: projectData.status || "Not Started",
    });
    setProgressValue(projectData.progress || 0);
  };

  const fetchTeammates = async () => {
    const { data: userRolesData, error: rolesError } = await supabase
      .from("UserRole")
      .select(
        "project_id, role_name, user_id, User:User(user_id, name, last_name, profile_pic)"
      )
      .eq("project_id", projectId);

    if (rolesError) {
      setSnackbar({
        open: true,
        message: `Error loading teammates: ${rolesError.message}`,
        severity: "error",
      });
      return;
    }

    const teamByProject = userRolesData
      .filter((entry) => entry.User)
      .map(({ User, role_name }) => ({
        name: User.name || "User",
        last_name: User.last_name || "",
        avatar: User.profile_pic || "",
        role: role_name || "Member",
      }));

    setTeammates(teamByProject);
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
      fetchTeammates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading project details...</Typography>
      </Box>
    );
  }

  const handleOverviewChange = (field, value) => {
    setOverviewData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Updated Project Data:", {
      ...overviewData,
      progress: progressValue,
    });
    setSnackbar({
      open: true,
      message: "Project details updated (mock save).",
      severity: "success",
    });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: "100%" }}>
      <Box
        sx={{
          display: "flex",
          direction: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
          Edit Project
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left column - Overview */}
        <Grid item xs={12} md={6}>
          <OverviewEdit
            projectData={overviewData}
            onChange={handleOverviewChange}
          />
        </Grid>

        {/* Right column - stacked components */}
        <Grid item xs={12} md={6}>
          <Grid container direction="column" spacing={3}>
            {/* Progress component */}
            <Grid item>
              <ProgressEdit
                progressValue={progressValue}
                onProgressChange={setProgressValue}
              />
            </Grid>

            {/* Teammates component */}
            <Grid item>
              <TeammatesDisplay teammates={teammates} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Button variant="contained" onClick={handleSave}>
          Save Changes
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectEdit;
