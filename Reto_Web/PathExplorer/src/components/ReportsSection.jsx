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
  Paper,
  Fade,
  Grow,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import TuneIcon from "@mui/icons-material/Tune";
import { supabase } from "../supabase/supabaseClient.js";
import { ACCENTURE_COLORS } from "../styles/styles.js";
import { useDarkMode } from "../contexts/DarkModeContext";

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
  const { darkMode } = useDarkMode();
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
  // Define Accenture color scheme with dark mode support
  const colors = {
    primary: "#a100ff",       // Core Purple 1
    secondary: "#7500c0",     // Core Purple 2 
    tertiary: "#460073",      // Core Purple 3
    accent1: "#b455aa",       // Accent Purple 1
    accent2: "#a055f5",       // Accent Purple 2
    light: darkMode ? "#1e1e1e" : "#ffffff",         // Background
    text: darkMode ? "#ffffff" : "#000000",          // Text
    lightText: darkMode ? "rgba(255,255,255,0.7)" : "#75757a",     // Secondary text
    border: darkMode ? "rgba(255,255,255,0.12)" : "#e6e6dc",        // Borders
    gradientLight: darkMode ? "rgba(161,0,255,0.1)" : "#f5f0ff", // Light background
    success: "#2ecc71"        // Success Green
  };
  
  // Helper function to safely get client data
  const getClientData = (clientId) => {
    if (!clientId || !clients[clientId]) {
      return { name: "Unknown Client", industry: "Not specified" };
    }
    return clients[clientId];
  };

  // Helper function to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return "Invalid date";
      
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date error";
    }
  };
  
  // Create a temporary canvas for the skills chart
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = 600;
  tempCanvas.height = 400;
  const ctx = tempCanvas.getContext("2d");
  
  // Set canvas background for dark mode
  if (darkMode) {
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  }

  // Get all skills from team members
  const allSkills = project.team_members.flatMap((member) => {
    // Skip if user or skills are undefined
    if (!member.user || !member.user.skills) return [];
    
    return member.user.skills.map((skill) => {
      // Handle potentially missing data
      if (!skill.skill) return { 
        name: "Unknown skill", 
        proficiency: 0,
        type: "Unknown",
        category: "Unknown" 
      };
      
      return {
        name: skill.skill.name || "Unknown skill",
        proficiency: isNaN(skill.proficiency) ? 0 : skill.proficiency,
        type: skill.skill.type || "Unknown",
        category: skill.skill.category || "Unknown",
      };
    });
  });

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

  const skillData = Object.entries(skillMap).map(([name, data]) => {
    // Safely calculate average proficiency
    let averageProficiency = 0;
    if (data.count > 0 && !isNaN(data.totalProficiency)) {
      averageProficiency = Math.round(data.totalProficiency / data.count);
    }
    
    return {
      name,
      averageProficiency,
      count: data.count,
      type: data.type,
      category: data.category,
    };
  });

  // Sort by count descending
  skillData.sort((a, b) => b.count - a.count);
  
  // Limit to top 10 skills for better visualization
  const topSkills = skillData.slice(0, 10);

  // Create chart with Accenture purple colors and additional styling
  try {
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: topSkills.map((skill) => skill.name),
        datasets: [
          {
            label: "Team Members with Skill",
            data: topSkills.map((skill) => skill.count),
            backgroundColor: colors.primary,
            borderRadius: 6,
            barThickness: 20,
            maxBarThickness: 25,
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            borderWidth: darkMode ? 1 : 0
          },
          {
            label: "Average Proficiency (%)",
            data: topSkills.map((skill) => skill.averageProficiency),
            backgroundColor: colors.accent2,
            borderColor: colors.accent2,
            borderWidth: 2,
            type: "line",
            yAxisID: "y1",
            tension: 0.2,
            pointRadius: 4,
            pointBackgroundColor: colors.light,
            pointBorderColor: colors.accent2,
            pointBorderWidth: 2,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { 
              display: true, 
              text: "Team Members",
              font: {
                size: 12,
                color: darkMode ? 'rgba(255, 255, 255, 0.9)' : '#000',
              },
              padding: {bottom: 10}
            },
            grid: {
              color: darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
            },
            ticks: {
              padding: 10,
              font: {
                size: 11,
                color: darkMode ? 'rgba(255, 255, 255, 0.7)' : '#000',
              }
            }
          },
          y1: {
            position: "right",
            beginAtZero: true,
            max: 100,
            title: { 
              display: true, 
              text: "Proficiency %",
              font: {
                size: 12,
                color: darkMode ? 'rgba(255, 255, 255, 0.9)' : '#000',
              },
              padding: {bottom: 10}
            },
            grid: { drawOnChartArea: false },
            ticks: {
              padding: 10,
              callback: function(value) {
                return value + '%';
              },
              font: {
                size: 11,
                color: darkMode ? 'rgba(255, 255, 255, 0.7)' : '#000',
              }
            }
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              padding: 5,
              maxRotation: 45,
              minRotation: 45,
              font: {
                size: 10,
                color: darkMode ? 'rgba(255, 255, 255, 0.7)' : '#000',
              }
            }
          }
        },
        devicePixelRatio: 2,
        plugins: {
          legend: {
            position: 'top',
            align: 'center',
            labels: {
              boxWidth: 12,
              usePointStyle: true,
              padding: 15,
              font: {
                size: 11,
                color: darkMode ? 'rgba(255, 255, 255, 0.7)' : '#000',
              },
            },
          },
          title: {
            display: true,
            text: 'Team Skills Distribution & Proficiency',
            font: {
              size: 14,
              weight: 'bold',
            },
            padding: {
              top: 10,
              bottom: 20
            },
            color: darkMode ? 'rgba(255, 255, 255, 0.9)' : colors.tertiary
          },
          tooltip: {
            backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            titleColor: darkMode ? '#fff' : '#000',
            bodyColor: darkMode ? 'rgba(255, 255, 255, 0.8)' : '#000',
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error creating chart:", error);
    // Create a placeholder if chart creation fails
    ctx.fillStyle = darkMode ? '#2e2e2e' : colors.gradientLight;
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.fillStyle = colors.primary;
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Skills Chart Unavailable", tempCanvas.width/2, tempCanvas.height/2);
  }

  // Convert chart to image, waiting some time to render image
  await new Promise((resolve) => setTimeout(resolve, 150));
  const chartImage = tempCanvas.toDataURL("image/png");
  
  // Helper function to create accent SVG shapes
  const createAccentShape = (shape) => {
    switch(shape) {
      case 'wave':
        return `<svg width="100" height="10" viewBox="0 0 100 10">
          <path d="M0,5 C10,0 15,10 25,5 C35,0 40,10 50,5 C60,0 65,10 75,5 C85,0 90,10 100,5" 
          stroke="${colors.accent2}" stroke-width="2" fill="none" />
        </svg>`;
      case 'dots':
        return `<svg width="100" height="10" viewBox="0 0 100 10">
          <circle cx="10" cy="5" r="2" fill="${colors.primary}" />
          <circle cx="25" cy="5" r="2" fill="${colors.accent2}" />
          <circle cx="40" cy="5" r="2" fill="${colors.primary}" />
          <circle cx="55" cy="5" r="2" fill="${colors.accent2}" />
          <circle cx="70" cy="5" r="2" fill="${colors.primary}" />
          <circle cx="85" cy="5" r="2" fill="${colors.accent2}" />
        </svg>`;
      default:
        return `<svg width="100" height="4" viewBox="0 0 100 4">
          <rect width="100" height="4" fill="${colors.primary}" />
        </svg>`;
    }
  };
  
  // Get client information safely
  const clientInfo = getClientData(project.client_id);
  
  // Calculate project timeline info
  const calculateProgress = () => {
    try {
      if (!project.start_date) return { percent: 0, status: "Not Started" };
      
      const start = new Date(project.start_date).getTime();
      const end = project.end_date ? new Date(project.end_date).getTime() : null;
      const today = new Date().getTime();
      
      if (isNaN(start)) return { percent: 0, status: "Invalid Dates" };
      
      if (project.status === "Completed") return { percent: 100, status: "Complete" };
      
      if (!end) return { percent: 50, status: "In Progress" };
      
      if (isNaN(end)) return { percent: 0, status: "Invalid End Date" };
      
      // Calculate percent complete based on timeline
      const totalDuration = end - start;
      const elapsed = today - start;
      let percent = Math.round((elapsed / totalDuration) * 100);
      
      // Validate the calculated percentage
      if (isNaN(percent) || percent < 0) percent = 0;
      if (percent > 100) percent = 100;
      
      return { percent, status: "In Progress" };
    } catch (error) {
      console.error("Error calculating progress:", error);
      return { percent: 0, status: "Calculation Error" };
    }
  };
  
  const progress = calculateProgress();
  
  // Create progress bar SVG
  const progressBarSvg = `<svg width="200" height="15" viewBox="0 0 200 15">
    <rect width="200" height="8" rx="4" ry="4" fill="${darkMode ? '#333' : '#f0f0f0'}" />
    <rect width="${progress.percent * 2}" height="8" rx="4" ry="4" fill="${progress.percent === 100 ? colors.success : colors.primary}" />
  </svg>`;
  
  // Determine if team skills should be on a new page based on team size
  const needSkillsNewPage = project.team_members.length > 4;
  
  // Simplify team members organization for better display
  const teamMemberCount = project.team_members.length;
  
  // Document definition with enhanced professional Accenture-styled design
  const docDefinition = {
    // Reduce page margins for better use of space
    pageMargins: [40, 40, 40, 40],
    
    // Control how el contenido fluye entre páginas
    pageBreakBefore: function(currentNode, followingNodesOnPage) {
      // Evitar saltos de página antes de tablas y secciones pequeñas
      if (currentNode.table && followingNodesOnPage.length > 2) {
        return false;
      }
      return false;
    },
    
    // Enhanced branding with Accenture colors
    background: function() {
      return [
        {
          canvas: [
            {
              type: 'rect',
              x: 0, y: 0,
              w: 12,
              h: 792,
              color: colors.primary
            },
            // Add subtle background for dark mode
            ...(darkMode ? [{
              type: 'rect',
              x: 12, y: 0,
              w: 583,
              h: 792,
              color: '#1a1a1a'
            }] : [])
          ]
        }
      ];
    },
    
    // Professional document content
    content: [
      // Cover page with Accenture styling
      {
        stack: [
          { 
            svg: createAccentShape(),
            width: 530,
            margin: [0, 0, 0, 20]
          },
          {
            text: project.title?.toUpperCase() || "PROJECT REPORT",
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
                    text: clientInfo.name, 
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
                    text: clientInfo.industry, 
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
                    text: project.status || "Not Specified", 
                    style: 'coverValue',
                    margin: [0, 2, 0, 0]
                  }
                ],
                width: '33%'
              }
            ],
            margin: [0, 10, 0, 20]
          },
          {
            columns: [
              {
                stack: [
                  { text: 'START DATE', style: 'coverLabel' },
                  { 
                    text: formatDate(project.start_date), 
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
                    text: project.end_date ? formatDate(project.end_date) : "In Progress", 
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
                    text: project.priority || "Not Specified", 
                    style: 'coverValue',
                    margin: [0, 2, 0, 0]
                  }
                ],
                width: '33%'
              }
            ],
            margin: [0, 0, 0, 20]
          },
          // Add project progress visualization
          {
            stack: [
              { 
                text: 'PROJECT PROGRESS', 
                style: 'coverLabel',
                margin: [0, 20, 0, 8]
              },
              {
                columns: [
                  {
                    svg: progressBarSvg,
                    width: 200,
                  },
                  {
                    text: `${progress.percent}% Complete`,
                    style: 'progressText',
                    width: 'auto',
                    margin: [10, 0, 0, 0]
                  }
                ]
              }
            ],
            margin: [0, 10, 0, 30]
          },
          {
            text: `Generated on ${new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric'
            })}`,
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
        svg: createAccentShape('wave'),
        width: 100,
        margin: [0, 0, 0, 10]
      },
      { 
        text: project.description || "No project description available.",
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
        svg: createAccentShape('wave'),
        width: 100,
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['40%', '30%', '30%'],
          body: [
            [
              { text: 'Role Name', style: 'tableHeader' },
              { text: 'Area', style: 'tableHeader' },
              { text: 'Status', style: 'tableHeader' }
            ],
            ...(project.roles || []).map((role) => [
              { text: role.name || "Undefined", style: 'tableCell' },
              { text: role.area || "Not specified", style: 'tableCell' },
              { 
                text: role.is_assigned ? "Assigned" : "Open", 
                style: role.is_assigned ? 'tableCellAssigned' : 'tableCellOpen' 
              }
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
            if (rowIndex === 0) return colors.primary;
            if (darkMode) return (rowIndex % 2 === 0) ? 'rgba(255, 255, 255, 0.02)' : null;
            return (rowIndex % 2 === 0) ? colors.gradientLight : null;
          },
          paddingTop: function() { return 8; },
          paddingBottom: function() { return 8; }
        },
        margin: [0, 0, 0, 20]
      },
      
      // Team skills analysis section
      {
        text: 'Team Skills Analysis',
        style: 'sectionTitle',
        pageBreak: needSkillsNewPage ? 'before' : null,
        margin: [0, 20, 0, 10],
      },
      { 
        svg: createAccentShape('wave'),
        width: 100,
        margin: [0, 0, 0, 10]
      },
      {
        text: 'The chart below shows the distribution of top skills across the team and their average proficiency levels.',
        style: 'paragraph',
        margin: [0, 0, 0, 15]
      },
      { 
        image: chartImage, 
        width: 530,
        alignment: 'center',
        margin: [0, 5, 0, 15]
      },
      
      // Team feedback section with enhanced design
      {
        text: 'Team Feedback',
        style: 'sectionTitle',
        margin: [0, 20, 0, 10]
      },
      { 
        svg: createAccentShape('wave'),
        width: 100,
        margin: [0, 0, 0, 10]
      },
      // Team members table - simplificado
      {
        stack: project.team_members.map((member, index) => {
          // Validate member data
          const memberName = member.user ? 
            `${member.user.name || ""} ${member.user.last_name || ""}`.trim() || "Unknown Member" : 
            "Unknown Member";
            
          const memberRole = member.role_name || "No role assigned";
          
          // Get member skills safely
          const memberSkills = (member.user && member.user.skills) ? 
            member.user.skills
            .filter(s => s.skill && s.skill.name)
            .map(s => s.skill.name)
            .join(", ") || "No skills recorded" :
            "No skills recorded";
            
          const feedback = member.feedback_notes || "No feedback provided";
          
          // Determine page breaks - simplificado
          let shouldBreakPage = false;
          
          // Para equipos de 4 miembros, divide 2 y 2
          if (teamMemberCount === 4 && index === 1) {
            shouldBreakPage = true;
          }
          // Para equipos de 5-6 miembros, divide 3 y 2-3
          else if ((teamMemberCount === 5 || teamMemberCount === 6) && index === 2) {
            shouldBreakPage = true;
          }
          // Para equipos grandes, máximo 3 por página
          else if (teamMemberCount > 6 && index > 0 && index % 3 === 0) {
            shouldBreakPage = true;
          }
          
          return {
            unbreakable: true, // Evita cortar los bloques de miembros entre páginas
            stack: [
              // Member header with name and role
              {
                columns: [
                  {
                    text: memberName,
                    style: 'memberName',
                    width: '60%',
                  },
                  {
                    text: memberRole,
                    style: 'memberRole',
                    width: '40%',
                    alignment: 'right'
                  }
                ],
                margin: [0, 0, 0, 5]
              },
              // Member details
              {
                table: {
                  widths: ['25%', '*'],
                  body: [
                    [
                      { text: 'Skills', style: 'tableKey' },
                      { text: memberSkills, style: 'tableValue' }
                    ],
                    [
                      { text: 'Feedback', style: 'tableKey' },
                      { text: feedback, style: 'tableValue' }
                    ]
                  ]
                },
                layout: {
                  hLineWidth: function() { return 0.5; },
                  vLineWidth: function() { return 0; },
                  hLineColor: function() { return colors.border; },
                  fillColor: function(rowIndex) {
                    if (darkMode) return rowIndex % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : null;
                    return rowIndex % 2 === 0 ? colors.gradientLight : null;
                  },
                  paddingTop: function() { return 6; },
                  paddingBottom: function() { return 6; }
                }
              },
              // Spacing between members
              {
                svg: createAccentShape('dots'),
                width: 100,
                alignment: 'center',
                margin: [0, 10, 0, 10]
              }
            ],
            pageBreak: shouldBreakPage ? 'after' : null
          };
        }),
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
      progressText: {
        fontSize: 11,
        color: colors.secondary,
        bold: true
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
        color: darkMode ? 'white' : 'white',
        alignment: 'center',
        fillColor: colors.primary
      },
      tableCell: {
        fontSize: 10,
        color: colors.text,
        alignment: 'left'
      },
      tableCellAssigned: {
        fontSize: 10,
        color: colors.success,
        alignment: 'center',
        bold: true
      },
      tableCellOpen: {
        fontSize: 10,
        color: colors.secondary,
        alignment: 'center',
        italics: true
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
      },
      memberName: {
        fontSize: 13,
        bold: true,
        color: colors.secondary
      },
      memberRole: {
        fontSize: 11,
        italics: true,
        color: colors.lightText
      }
    },
    
    // Footer with page numbers and Accenture styling
    footer: function(currentPage, pageCount) {
      return {
        columns: [
          { 
            text: `${project.title || "Project Report"}`, 
            alignment: 'left',
            fontSize: 8,
            color: colors.lightText,
            margin: [40, 0, 0, 0]
          },
          {
            text: currentPage.toString() + ' | ' + pageCount,
            alignment: 'right',
            fontSize: 8,
            color: colors.lightText,
            margin: [0, 0, 40, 0]
          }
        ],
        margin: [0, 20, 0, 0]
      };
    },
    
    // Default styles
    defaultStyle: { 
      fontSize: 11,
      color: colors.text
    }
  };

  // Create and download the Accenture-styled PDF
  try {
    pdfMake.createPdf(docDefinition).download(`${project.title || "Project"}_Report.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("There was an error generating the PDF. Please try again.");
  }
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
    <Fade in={true} timeout={2400}>
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          mb: 4,
          borderRadius: 3,
          background: theme.palette.background.paper,
          border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.2 : 0.08)}`,
          overflow: "hidden",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: `0 8px 24px ${alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.3 : 0.08)}`,
          }
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* Header with title */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: { xs: 2.5, md: 3 },
              borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.1 : 0.05)}`,
              background: darkMode 
                ? `linear-gradient(135deg, ${alpha(ACCENTURE_COLORS.corePurple1, 0.05)}, transparent)`
                : `linear-gradient(135deg, ${alpha(ACCENTURE_COLORS.corePurple1, 0.02)}, transparent)`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
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
                  fontWeight: 600,
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                  color: theme.palette.text.primary,
                }}
              >
                Project Reports
              </Typography>
            </Box>
            <TuneIcon sx={{ color: alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.8 : 0.6), fontSize: 24 }} />
          </Box>

        {/* Search and filter controls - Redesigned for better aesthetics */}
        <Box sx={{ 
          p: { xs: 2.5, md: 3 },
          borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.1 : 0.05)}`,
          backgroundColor: darkMode 
            ? alpha(ACCENTURE_COLORS.corePurple1, 0.03)
            : alpha(ACCENTURE_COLORS.corePurple1, 0.01),
        }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search projects by title or client..."
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    fontSize: "0.875rem",
                    backgroundColor: theme.palette.background.paper,
                    transition: "all 0.2s, box-shadow 0.2s",
                    border: darkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.03)",
                    "&:hover": {
                      boxShadow: darkMode ? "0 2px 4px rgba(255,255,255,0.04)" : "0 2px 4px rgba(0,0,0,0.04)",
                      "& fieldset": {
                        borderColor: ACCENTURE_COLORS.corePurple1,
                      },
                    },
                    "&.Mui-focused": {
                      boxShadow: darkMode ? "0 2px 8px rgba(255,255,255,0.08)" : "0 2px 8px rgba(0,0,0,0.08)",
                      "& fieldset": {
                        borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.5),
                      },
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <SearchIcon
                      sx={{ mr: 1, color: theme.palette.text.secondary, fontSize: 20 }}
                    />
                  ),
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                    backgroundColor: theme.palette.background.paper,
                    transition: "box-shadow 0.2s",
                    border: darkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.03)",
                    "&:hover": {
                      boxShadow: darkMode ? "0 2px 4px rgba(255,255,255,0.04)" : "0 2px 4px rgba(0,0,0,0.04)",
                    },
                    "&.Mui-focused": {
                      boxShadow: darkMode ? "0 2px 8px rgba(255,255,255,0.08)" : "0 2px 8px rgba(0,0,0,0.08)",
                      "& fieldset": {
                        borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.5),
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
                        backgroundColor: alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.15 : 0.05),
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
                            backgroundColor: alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.2 : 0.08),
                            borderColor: ACCENTURE_COLORS.corePurple1,
                            boxShadow: `0 2px 6px ${alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.4 : 0.2)}`,
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
                              backgroundColor: alpha(getStatusColor(project.status), darkMode ? 0.25 : 0.15),
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
                  <Divider component="li" sx={{ borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)' }} />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </CardContent>
    </Paper>
    </Fade>
  );
};

export default ReportsSection;