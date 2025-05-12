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
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import TuneIcon from "@mui/icons-material/Tune";
import { supabase } from "../supabase/supabaseClient.js";
import { ACCENTURE_COLORS } from "../styles/styles.js";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts?.pdfMake?.vfs;

// Importamos Chart.js con todos los componentes necesarios
import {
  Chart,
  LineController,
  LineElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Title,
  Tooltip
} from 'chart.js';

// Registramos los componentes necesarios
Chart.register(
  LineController,
  LineElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Title,
  Tooltip
);

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
    // Define Accenture color scheme - MOVIDO AL PRINCIPIO DE LA FUNCIÓN
    const colors = {
      primary: "#a100ff", // Core Purple 1
      secondary: "#7500c0", // Core Purple 2 
      tertiary: "#460073", // Core Purple 3
      accent1: "#b455aa", // Accent Purple 1
      accent2: "#a055f5", // Accent Purple 2
      light: "#ffffff", // White
      text: "#000000", // Black
      lightText: "#96968c", // Dark Gray
      border: "#e6e6dc" // Light Gray
    };
    
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

    // Create chart with Accenture purple colors
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: skillData.map((skill) => skill.name),
        datasets: [
          {
            label: "Team Members with Skill",
            data: skillData.map((skill) => skill.count),
            backgroundColor: colors.primary,
            borderRadius: 6,
          },
          {
            label: "Average Proficiency (%)",
            data: skillData.map((skill) => skill.averageProficiency),
            backgroundColor: colors.accent2,
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
            grid: {
              color: 'rgba(0, 0, 0, 0.06)',
            },
          },
          y1: {
            position: "right",
            beginAtZero: true,
            max: 100,
            title: { display: true, text: "Proficiency %" },
            grid: { drawOnChartArea: false },
          },
          x: {
            grid: {
              display: false,
            },
          }
        },
        devicePixelRatio: 2,
        plugins: {
          legend: {
            labels: {
              font: {
                family: '"Helvetica", sans-serif',
              },
            },
          },
        },
      },
    });

    // Convert chart to image, waiting some time to render image
    await new Promise((resolve) => setTimeout(resolve, 100));
    const chartImage = tempCanvas.toDataURL("image/png");

    // Document definition with minimalist Accenture-styled design
    const docDefinition = {
      // Reduce page margins for better use of space
      pageMargins: [40, 40, 40, 40],
      
      // Professional document content
      content: [
        // Cover page with Accenture styling
        {
          stack: [
            { 
              svg: `<svg width="100" height="4" viewBox="0 0 100 4">
                <rect width="100" height="4" fill="${colors.primary}" />
              </svg>`,
              width: 530,
              margin: [0, 0, 0, 20]
            },
            {
              text: project.title.toUpperCase(),
              style: 'title',
              margin: [0, 10, 0, 10]
            },
            {
              text: "PROJECT REPORT",
              style: 'subtitle',
              margin: [0, 0, 0, 20]
            },
            {
              columns: [
                {
                  stack: [
                    { text: 'CLIENT', style: 'coverLabel' },
                    { 
                      text: clients[project.client_id]?.name || "Unknown", 
                      style: 'coverValue',
                      margin: [0, 2, 0, 0]
                    }
                  ],
                  width: '33%'
                },
                {
                  stack: [
                    { text: 'INDUSTRY', style: 'coverLabel' },
                    { 
                      text: clients[project.client_id]?.industry || "Not specified", 
                      style: 'coverValue',
                      margin: [0, 2, 0, 0]
                    }
                  ],
                  width: '33%'
                },
                {
                  stack: [
                    { text: 'STATUS', style: 'coverLabel' },
                    { 
                      text: project.status, 
                      style: 'coverValue',
                      margin: [0, 2, 0, 0]
                    }
                  ],
                  width: '33%'
                }
              ],
              margin: [0, 10, 0, 10]
            },
            {
              columns: [
                {
                  stack: [
                    { text: 'START DATE', style: 'coverLabel' },
                    { 
                      text: new Date(project.start_date).toLocaleDateString(), 
                      style: 'coverValue',
                      margin: [0, 2, 0, 0]
                    }
                  ],
                  width: '33%'
                },
                {
                  stack: [
                    { text: 'END DATE', style: 'coverLabel' },
                    { 
                      text: project.end_date ? new Date(project.end_date).toLocaleDateString() : "In Progress", 
                      style: 'coverValue',
                      margin: [0, 2, 0, 0]
                    }
                  ],
                  width: '33%'
                },
                {
                  stack: [
                    { text: 'PRIORITY', style: 'coverLabel' },
                    { 
                      text: project.priority, 
                      style: 'coverValue',
                      margin: [0, 2, 0, 0]
                    }
                  ],
                  width: '33%'
                }
              ],
              margin: [0, 0, 0, 20]
            },
            {
              text: `Generated on ${new Date().toLocaleDateString()}`,
              style: 'date',
              margin: [0, 30, 0, 0]
            }
          ],
          alignment: 'left'
        },
        
        // Project overview section
        {
          text: 'Project Overview',
          style: 'sectionTitle',
          margin: [0, 40, 0, 10]
        },
        { 
          text: project.description,
          style: 'paragraph',
          margin: [0, 0, 0, 20]
        },
        
        // Project roles section
        {
          text: 'Project Roles',
          style: 'sectionTitle',
          margin: [0, 30, 0, 10]
        },
        {
          table: {
            headerRows: 1,
            widths: ['50%', '50%'],
            body: [
              [
                { text: 'Role Name', style: 'tableHeader' },
                { text: 'Area', style: 'tableHeader' }
              ],
              ...project.roles.map((role) => [
                { text: role.name, style: 'tableCell' },
                { text: role.area, style: 'tableCell' }
              ])
            ]
          },
          layout: {
            hLineWidth: function(i, node) {
              return (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5;
            },
            vLineWidth: function() { return 0; },
            hLineColor: function(i) { return i === 0 || i === 1 ? colors.primary : colors.border; },
            fillColor: function(rowIndex, node, columnIndex) {
              return (rowIndex === 0) ? colors.primary : null;
            },
            paddingTop: function() { return 6; },
            paddingBottom: function() { return 6; }
          },
          margin: [0, 0, 0, 20]
        },
        
        // Team skills analysis section
        {
          text: 'Team Skills Analysis',
          style: 'sectionTitle',
          pageBreak: 'before',
          margin: [0, 0, 0, 10]
        },
        {
          text: 'The chart below shows the distribution of skills across the team and their average proficiency levels.',
          style: 'paragraph',
          margin: [0, 0, 0, 10]
        },
        { 
          image: chartImage, 
          width: 530,
          alignment: 'center',
          margin: [0, 5, 0, 15]
        },
        
        // Team feedback section
        {
          text: 'Team Feedback',
          style: 'sectionTitle',
          margin: [0, 15, 0, 10]
        },
        {
          table: {
            headerRows: 1,
            widths: ['25%', '15%', '25%', '35%'],
            body: [
              [
                { text: 'Team Member', style: 'tableHeader' },
                { text: 'Role', style: 'tableHeader' },
                { text: 'Skills', style: 'tableHeader' },
                { text: 'Feedback', style: 'tableHeader' }
              ],
              ...project.team_members.map((member) => [
                { text: `${member.user.name} ${member.user.last_name}`, style: 'tableCell' },
                { text: member.role_name, style: 'tableCell' },
                { text: member.user.skills.map((s) => s.skill.name).join(", "), style: 'tableCell' },
                { text: member.feedback_notes || "No feedback provided", style: 'tableCell' }
              ])
            ]
          },
          layout: {
            hLineWidth: function(i, node) {
              return (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5;
            },
            vLineWidth: function() { return 0; },
            hLineColor: function(i) { return i === 0 || i === 1 ? colors.primary : colors.border; },
            fillColor: function(rowIndex, node, columnIndex) {
              return (rowIndex === 0) ? colors.primary : null;
            },
            paddingTop: function() { return 6; },
            paddingBottom: function() { return 6; }
          }
        }
      ],
      
      // Enhanced styles for a minimalist, Accenture-aligned design
      styles: {
        title: { 
          fontSize: 24, 
          bold: true,
          color: colors.primary,
        },
        subtitle: { 
          fontSize: 14,
          color: colors.secondary,
        },
        coverLabel: {
          fontSize: 10,
          color: colors.primary,
          bold: true
        },
        coverValue: {
          fontSize: 12,
          color: colors.text
        },
        date: {
          fontSize: 10,
          color: colors.lightText,
        },
        sectionTitle: { 
          fontSize: 16, 
          bold: true, 
          color: colors.primary,
          margin: [0, 10, 0, 8]
        },
        paragraph: { 
          fontSize: 11,
          lineHeight: 1.4,
          alignment: 'justify',
          color: colors.text
        },
        tableHeader: { 
          bold: true, 
          fontSize: 11,
          color: 'white',
          alignment: 'center',
          fillColor: colors.primary
        },
        tableCell: {
          fontSize: 10,
          color: colors.text,
          alignment: 'left'
        },
        tableKey: {
          fontSize: 11,
          bold: true,
          alignment: 'right',
          color: colors.primary
        },
        tableValue: {
          fontSize: 11,
          color: colors.text
        }
      },
      
      // Footer with page numbers and Accenture styling
      footer: function(currentPage, pageCount) {
        return {
          columns: [
            { 
              text: `${project.title}`, 
              alignment: 'left',
              fontSize: 8,
              color: colors.lightText,
              margin: [40, 0, 0, 0]
            },
            {
              text: currentPage.toString() + ' of ' + pageCount,
              alignment: 'right',
              fontSize: 8,
              color: colors.lightText,
              margin: [0, 0, 40, 0]
            }
          ],
          margin: [0, 10, 0, 0]
        };
      },
      
      // Default styles - ELIMINADA LA REFERENCIA A ARIAL
      defaultStyle: { 
        fontSize: 11,
        color: colors.text
      }
    };

    // Create and download the Accenture-styled PDF
    pdfMake.createPdf(docDefinition).download(`${project.title}_Report.pdf`);
  };

  // Get color based on project status
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return ACCENTURE_COLORS.corePurple3;
      case "In Progress":
        return ACCENTURE_COLORS.corePurple1;
      case "On Hold":
        return ACCENTURE_COLORS.accentPurple1;
      case "Not Started":
        return ACCENTURE_COLORS.accentPurple2;
      default:
        return ACCENTURE_COLORS.darkGray;
    }
  };

  // Get color based on priority
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return ACCENTURE_COLORS.red;
      case "Medium":
        return ACCENTURE_COLORS.orange;
      case "Low":
        return ACCENTURE_COLORS.blue;
      default:
        return ACCENTURE_COLORS.darkGray;
    }
  };

  return (
    <Card
      sx={{
        mt: 4,
        mb: 4,
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        overflow: "hidden",
        border: "none",
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Header with title */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: { xs: 2.5, md: 3 },
            borderBottom: '1px solid rgba(0,0,0,0.03)',
            position: 'relative',
          }}
        >
          <DescriptionIcon
            sx={{
              fontSize: 24,
              color: ACCENTURE_COLORS.corePurple1,
              mr: 2,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              fontSize: { xs: "1rem", sm: "1.1rem" },
              color: theme.palette.text.primary,
            }}
          >
            Project Reports
          </Typography>
        </Box>

        {/* Search and filter controls - Redesigned for better aesthetics */}
        <Box sx={{ 
          p: { xs: 2.5, md: 3 },
          borderBottom: '1px solid rgba(0,0,0,0.03)',
          backgroundColor: 'rgba(0,0,0,0.01)',
        }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search projects by title or client..."
                size="small"
                InputProps={{
                  startAdornment: (
                    <SearchIcon
                      sx={{ mr: 1, color: theme.palette.text.secondary, fontSize: 20 }}
                    />
                  ),
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    fontSize: "0.875rem",
                    backgroundColor: "#ffffff",
                    transition: "box-shadow 0.2s",
                    border: "1px solid rgba(0,0,0,0.03)",
                    "&:hover": {
                      boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      "& fieldset": {
                        borderColor: `${ACCENTURE_COLORS.corePurple1}50`,
                      },
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                select
                fullWidth
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    fontSize: "0.875rem",
                    backgroundColor: "#ffffff",
                    transition: "box-shadow 0.2s",
                    border: "1px solid rgba(0,0,0,0.03)",
                    "&:hover": {
                      boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      "& fieldset": {
                        borderColor: `${ACCENTURE_COLORS.corePurple1}50`,
                      },
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "0.875rem",
                    color: theme.palette.text.secondary,
                    "&.Mui-focused": {
                      color: ACCENTURE_COLORS.corePurple1,
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <TuneIcon
                      sx={{ mr: 1, color: theme.palette.text.secondary, fontSize: 18 }}
                    />
                  ),
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
        </Box>

        {/* Project list - Enhanced with Accenture styling */}
        <Box
          sx={{
            maxHeight: 450,
            overflow: "hidden",
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
              <CircularProgress sx={{ color: ACCENTURE_COLORS.corePurple1 }} />
            </Box>
          ) : filteredProjects.length === 0 ? (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <Typography sx={{ color: theme.palette.text.secondary }}>
                No projects found
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 450, overflow: "auto", p: 0 }}>
              {filteredProjects.map((project, index) => (
                <React.Fragment key={project.projectID}>
                  <ListItem
                    sx={{
                      py: 2.5,
                      px: 3,
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: `${ACCENTURE_COLORS.corePurple1}05`,
                      },
                    }}
                    secondaryAction={
                      <Button
                        variant="outlined"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={() => generateProjectReport(project)}
                        sx={{
                          borderRadius: 1.5,
                          borderColor: ACCENTURE_COLORS.corePurple1,
                          color: ACCENTURE_COLORS.corePurple1,
                          fontSize: "0.8rem",
                          fontWeight: 500,
                          px: 2,
                          py: 0.75,
                          transition: "all 0.2s",
                          "&:hover": {
                            backgroundColor: `${ACCENTURE_COLORS.corePurple1}08`,
                            borderColor: ACCENTURE_COLORS.corePurple1,
                            boxShadow: `0 2px 6px ${ACCENTURE_COLORS.corePurple1}20`,
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        Download
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 500,
                              color: theme.palette.text.primary,
                              fontSize: "0.95rem",
                              mr: 1.5,
                            }}
                          >
                            {project.title}
                          </Typography>
                          <Chip
                            label={project.status}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              fontWeight: 500,
                              backgroundColor: `${getStatusColor(project.status)}15`,
                              color: getStatusColor(project.status),
                              ml: 1,
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: theme.palette.text.secondary,
                                  fontSize: "0.8rem",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <span style={{ fontWeight: 500, marginRight: '6px' }}>
                                  Client:
                                </span>
                                {clients[project.client_id]?.name || "Unknown"}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: theme.palette.text.secondary,
                                  fontSize: "0.8rem",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <span style={{ fontWeight: 500, marginRight: '6px' }}>
                                  Team:
                                </span>
                                {project.team_members?.length || 0} members
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: theme.palette.text.secondary,
                                  fontSize: "0.8rem",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <span style={{ fontWeight: 500, marginRight: '6px' }}>
                                  Priority:
                                </span>
                                <Box component="span" sx={{ 
                                  color: getPriorityColor(project.priority),
                                  fontWeight: 500,
                                }}>
                                  {project.priority}
                                </Box>
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider component="li" sx={{ borderColor: 'rgba(0,0,0,0.03)' }} />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ReportsSection;