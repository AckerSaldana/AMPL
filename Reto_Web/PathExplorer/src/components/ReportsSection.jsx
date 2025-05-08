import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import { supabase } from "../supabase/supabaseClient.js";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts?.pdfMake?.vfs;

import { Chart } from "chart.js";

const ReportsSection = () => {
  const theme = useTheme();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState({});

  // Fetch projects and clients from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch clients first
        const { data: clientsData, error: clientsError } = await supabase
          .from("Client")
          .select("client_id, name, industry");

        if (clientsError) throw clientsError;

        const clientsMap = clientsData.reduce((acc, client) => {
          acc[client.client_id] = client;
          return acc;
        }, {});
        setClients(clientsMap);

        // Then fetch projects with team members and their skills
        const { data: projectsData, error: projectsError } = await supabase
          .from("Project")
          .select(
            `
            *,
            team_members:UserRole (
              user_id,
              role_name,
              feedback_notes,
              user:User (
                user_id,
                name,
                last_name,
                profile_pic,
                skills:UserSkill (
                  proficiency,
                  year_Exp,
                  skill:Skill (
                    skill_ID,
                    name,
                    type,
                    category
                  )
                )
              )
            ),
            roles:Roles (
              name,
              area,
              description,
              is_assigned
            )
          `
          )
          .order("start_date", { ascending: false });

        if (projectsError) throw projectsError;

        setProjects(projectsData || []);
        setFilteredProjects(projectsData || []);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter projects based on search and status
  useEffect(() => {
    let result = projects;

    if (searchTerm) {
      result = result.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          clients[project.client_id]?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((project) => project.status === statusFilter);
    }

    setFilteredProjects(result);
  }, [searchTerm, statusFilter, projects, clients]);

  const generateProjectReport = async (project) => {
    // Create a temporary canvas for the skills chart
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 600;
    tempCanvas.height = 400;
    const ctx = tempCanvas.getContext("2d");

    // Get all skills from team members
    const allSkills = project.team_members.flatMap((member) =>
      member.user.skills.map((skill) => ({
        name: skill.skill.name,
        proficiency: skill.proficiency,
        type: skill.skill.type,
        category: skill.skill.category,
      }))
    );

    // Group by skill name and calculate average proficiency
    const skillMap = {};
    allSkills.forEach((skill) => {
      if (!skillMap[skill.name]) {
        skillMap[skill.name] = {
          count: 1,
          totalProficiency: skill.proficiency,
          type: skill.type,
          category: skill.category,
        };
      } else {
        skillMap[skill.name].count++;
        skillMap[skill.name].totalProficiency += skill.proficiency;
      }
    });

    const skillData = Object.entries(skillMap).map(([name, data]) => ({
      name,
      averageProficiency: Math.round(data.totalProficiency / data.count),
      count: data.count,
      type: data.type,
      category: data.category,
    }));

    // Sort by count descending
    skillData.sort((a, b) => b.count - a.count);

    // Create chart
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: skillData.map((skill) => skill.name),
        datasets: [
          {
            label: "Team Members with Skill",
            data: skillData.map((skill) => skill.count),
            backgroundColor:
              theme.palette.chart?.blue || "rgba(54, 162, 235, 0.7)",
          },
          {
            label: "Average Proficiency (%)",
            data: skillData.map((skill) => skill.averageProficiency),
            backgroundColor:
              theme.palette.chart?.red || "rgba(255, 99, 132, 0.7)",
            type: "line",
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Team Members" },
          },
          y1: {
            position: "right",
            beginAtZero: true,
            max: 100,
            title: { display: true, text: "Proficiency %" },
            grid: { drawOnChartArea: false },
          },
        },
        devicePixelRatio: 2,
      },
    });

    // Convert chart to image, waiting some time to render image
    await new Promise((resolve) => setTimeout(resolve, 100));
    const chartImage = tempCanvas.toDataURL("image/png");

    // Prepare feedback table
    const feedbackTable = {
      table: {
        headerRows: 1,
        widths: ["*", "*", "*", "*"],
        body: [
          [
            { text: "Team Member", style: "tableHeader" },
            { text: "Role", style: "tableHeader" },
            { text: "Skills", style: "tableHeader" },
            { text: "Feedback", style: "tableHeader" },
          ],
          ...project.team_members.map((member) => [
            `${member.user.name} ${member.user.last_name}`,
            member.role_name,
            member.user.skills.map((s) => s.skill.name).join(", "),
            member.feedback_notes || "No feedback yet",
          ]),
        ],
      },
      layout: "lightHorizontalLines",
    };

    // Prepare project roles table
    const rolesTable = {
      table: {
        headerRows: 1,
        widths: ["*", "*", "*"],
        body: [
          [
            { text: "Role Name", style: "tableHeader" },
            { text: "Area", style: "tableHeader" },
            { text: "Status", style: "tableHeader" },
          ],
          ...project.roles.map((role) => [
            role.name,
            role.area,
            role.is_assigned ? "Assigned" : "Unassigned",
          ]),
        ],
      },
      layout: "lightHorizontalLines",
      margin: [0, 0, 0, 15],
    };

    // Document definition
    const docDefinition = {
      content: [
        { text: project.title, style: "header" },
        {
          text: `Client: ${clients[project.client_id]?.name || "Unknown"} (${
            clients[project.client_id]?.industry || "No industry specified"
          })`,
          style: "subheader",
        },
        { text: `Description: ${project.description}` },
        {
          columns: [
            {
              text: `Start Date: ${new Date(
                project.start_date
              ).toLocaleDateString()}`,
            },
            {
              text: `End Date: ${
                project.end_date
                  ? new Date(project.end_date).toLocaleDateString()
                  : "Ongoing"
              }`,
            },
            { text: `Status: ${project.status}` },
            { text: `Priority: ${project.priority}` },
          ],
          margin: [0, 5, 0, 15],
        },
        { text: "Project Roles", style: "sectionHeader" },
        rolesTable,
        { text: "Team Skills Overview", style: "sectionHeader" },
        { image: chartImage, width: 500, alignment: "center" },
        {
          text: "Team Feedback",
          style: "sectionHeader",
          margin: [0, 20, 0, 10],
        },
        feedbackTable,
      ],
      styles: {
        header: { fontSize: 22, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 16, bold: true, margin: [0, 0, 0, 5] },
        sectionHeader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
        tableHeader: { bold: true, fontSize: 12 },
      },
      defaultStyle: { fontSize: 10 },
    };

    pdfMake.createPdf(docDefinition).download(`${project.title}_Report.pdf`);
  };

  return (
    <Card
      sx={{
        mt: 4,
        mb: 4,
        p: 2,
        borderRadius: 2,
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        transition: "box-shadow 0.3s",
        "&:hover": {
          boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 3,
          }}
        >
          <DescriptionIcon
            sx={{
              fontSize: 35,
              color: theme.palette.chart?.purple || theme.palette.primary.main,
              mr: 2,
            }}
          />
          <Typography variant="h5" sx={{ color: theme.palette.text.primary }}>
            Project Reports
          </Typography>
        </Box>

        {/* Search and Filter Bar */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search projects by title or client..."
              InputProps={{
                startAdornment: (
                  <SearchIcon
                    sx={{ mr: 1, color: theme.palette.text.secondary }}
                  />
                ),
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.primary.light,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.primary.light,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Not Started">Not Started</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="On Hold">On Hold</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* Projects List */}
        <Card
          variant="outlined"
          sx={{
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            borderRadius: 1.5,
            maxHeight: 400,
            overflow: "hidden",
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : filteredProjects.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: theme.palette.text.secondary }}>
                No projects found
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 400, overflow: "auto", p: 0 }}>
              {filteredProjects.map((project, index) => (
                <React.Fragment key={project.projectID}>
                  <ListItem
                    sx={{
                      py: 2,
                      px: 3,
                      transition: "background-color 0.2s",
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.02)",
                      },
                    }}
                    secondaryAction={
                      <Button
                        variant="contained"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={() => generateProjectReport(project)}
                        sx={{
                          borderRadius: 1.5,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          backgroundColor:
                            theme.palette.chart?.purple ||
                            theme.palette.primary.main,
                          "&:hover": {
                            backgroundColor: theme.palette.chart?.purple
                              ? theme.palette.chart.purple + "DD"
                              : theme.palette.primary.dark,
                            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                          },
                          transition: "all 0.2s",
                        }}
                      >
                        Download Report
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: "medium",
                            color: theme.palette.text.primary,
                          }}
                        >
                          {project.title}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.secondary,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 2,
                            }}
                          >
                            <span>
                              <strong>Client:</strong>{" "}
                              {clients[project.client_id]?.name || "Unknown"}
                            </span>
                            <span>
                              <strong>Status:</strong> {project.status}
                            </span>
                            <span>
                              <strong>Team:</strong>{" "}
                              {project.team_members?.length || 0} members
                            </span>
                            <span>
                              <strong>Priority:</strong> {project.priority}
                            </span>
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < filteredProjects.length - 1 && (
                    <Divider component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </Card>
      </CardContent>
    </Card>
  );
};

export default ReportsSection;
