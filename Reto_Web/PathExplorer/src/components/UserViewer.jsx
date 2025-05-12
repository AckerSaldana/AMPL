import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Chip,
  Paper,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DownloadIcon from "@mui/icons-material/Download";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { supabase } from "../supabase/supabaseClient";
import { useTheme } from "@mui/material/styles";
import { ACCENTURE_COLORS } from "../styles/styles.js";

// Importar pdfMake para la generación de PDF
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts?.pdfMake?.vfs;

// Importar Chart.js para gráficos dentro del PDF
import {
  Chart,
  DoughnutController,
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

// Registrar los componentes necesarios de Chart.js
Chart.register(
  DoughnutController,
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartTooltip,
  Legend
);

const UserViewer = () => {
  const theme = useTheme();

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [permissionFilter, setPermissionFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Fetch users from Supabase on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("User")
          .select("user_id, name, last_name, level, permission, profile_pic")
          .order("last_name", { ascending: true });

        if (error) throw error;

        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err.message);
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users when search term or permission filter changes
  useEffect(() => {
    const filtered = users.filter((user) => {
      const fullName = `${user.name} ${user.last_name}`.toLowerCase();
      const searchMatch = fullName.includes(searchTerm.toLowerCase());
      const permissionMatch =
        permissionFilter === "All" || user.permission === permissionFilter;
      return searchMatch && permissionMatch;
    });

    setFilteredUsers(filtered);
  }, [searchTerm, permissionFilter, users]);

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle permission filter change
  const handlePermissionFilterChange = (event) => {
    setPermissionFilter(event.target.value);
  };

  // Get appropriate color for permission level
  const getPermissionColor = (permission) => {
    switch (permission) {
      case "Manager":
        return ACCENTURE_COLORS.corePurple1; // Accenture Core Purple 1
      case "TFS":
        return ACCENTURE_COLORS.corePurple2; // Accenture Core Purple 2
      case "Employee":
        return ACCENTURE_COLORS.accentPurple2; // Accenture Accent Purple 2
      default:
        return ACCENTURE_COLORS.darkGray;
    }
  };

  // Map proficiency text to colors for visual indicators
  const getProficiencyColor = (proficiency) => {
    switch (proficiency) {
      case "High":
        return ACCENTURE_COLORS.corePurple1;
      case "Medium":
        return ACCENTURE_COLORS.corePurple2;
      case "Low":
        return ACCENTURE_COLORS.accentPurple1;
      case "Basic":
        return ACCENTURE_COLORS.accentPurple2;
      default:
        return ACCENTURE_COLORS.lightGray;
    }
  };

  // Map proficiency text to numeric values for chart display
  const getProficiencyValue = (proficiency) => {
    switch (proficiency) {
      case "High":
        return 100;
      case "Medium":
        return 75;
      case "Low":
        return 50;
      case "Basic":
        return 25;
      default:
        return 0;
    }
  };

  // Handle download user analytics - Función actualizada para generar un PDF con los datos del usuario
  const handleDownloadAnalytics = async (userId) => {
    try {
      setGeneratingPdf(true);
      
      // 1. Obtener todos los datos del usuario
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (userError) throw userError;

      // 2. Obtener las habilidades del usuario
      const { data: userSkills, error: skillsError } = await supabase
        .from("UserSkill")
        .select(`
          proficiency, 
          year_Exp,
          skill:Skill (
            name,
            category,
            type,
            description
          )
        `)
        .eq("user_ID", userId);

      if (skillsError) throw skillsError;

      // 3. Obtener las certificaciones del usuario
      const { data: userCertifications, error: certsError } = await supabase
        .from("UserCertifications")
        .select(`
          status,
          score,
          valid_Until,
          completed_Date,
          certification:Certifications (
            title,
            issuer,
            type,
            description
          )
        `)
        .eq("user_ID", userId);

      if (certsError) throw certsError;

      // Agrupar habilidades por tipo
      const softSkills = userSkills.filter(
        (skill) => skill.skill?.type === "Soft Skill"
      );
      
      const technicalSkills = userSkills.filter(
        (skill) => skill.skill?.type === "Technical Skill"
      );

      // Categorizar certificaciones por estado
      const approvedCertifications = userCertifications.filter(
        (cert) => cert.status === "approved"
      );
      
      const pendingCertifications = userCertifications.filter(
        (cert) => cert.status === "pending"
      );

      // Calcular estadísticas
      const totalSkills = userSkills.length;
      const totalCertifications = userCertifications.length;
      const approvedCertificationsCount = approvedCertifications.length;

      // Crear gráfico de habilidades
      const skillsCanvas = document.createElement("canvas");
      skillsCanvas.width = 500;
      skillsCanvas.height = 300;
      const skillsCtx = skillsCanvas.getContext("2d");

      // Preparar datos para el gráfico de barras de habilidades
      const topSkills = [...userSkills]
        .sort((a, b) => getProficiencyValue(b.proficiency) - getProficiencyValue(a.proficiency))
        .slice(0, 5);

      new Chart(skillsCtx, {
        type: "bar",
        data: {
          labels: topSkills.map((skill) => skill.skill?.name || "Unknown"),
          datasets: [
            {
              label: "Proficiency",
              data: topSkills.map((skill) => getProficiencyValue(skill.proficiency)),
              backgroundColor: topSkills.map((skill) => getProficiencyColor(skill.proficiency)),
              borderRadius: 4,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: "Proficiency Level",
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
          responsive: false,
        },
      });

      // Esperar a que el gráfico se renderice
      await new Promise((resolve) => setTimeout(resolve, 100));
      const skillsChartImage = skillsCanvas.toDataURL("image/png");

      // Crear gráfico de distribución de tipos de habilidades (pie chart mejorado)
      const distributionCanvas = document.createElement("canvas");
      distributionCanvas.width = 300;
      distributionCanvas.height = 300;
      const distributionCtx = distributionCanvas.getContext("2d");

      new Chart(distributionCtx, {
        type: "pie", // Changing to pie instead of doughnut for better segment connection
        data: {
          labels: ["Technical Skills", "Soft Skills"],
          datasets: [
            {
              data: [technicalSkills.length, softSkills.length],
              backgroundColor: [
                ACCENTURE_COLORS.corePurple1,
                ACCENTURE_COLORS.accentPurple3,
              ],
              borderColor: 'transparent', // No borders between segments
              borderWidth: 0,
              hoverBorderWidth: 0,
              borderRadius: 0,
              spacing: 0, // Ensures there's no spacing between segments
              borderJoinStyle: 'round',
              circumference: 360, // Full circle
              rotation: 0, // Start at top
              weight: 1
            },
          ],
        },
        options: {
          responsive: false,
          radius: '90%', // Make it slightly smaller to ensure it's within canvas
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: {
                  size: 10
                },
                boxWidth: 12,
                padding: 10
              }
            },
            tooltip: {
              enabled: false // Disable tooltips to ensure no hover effects
            }
          },
          layout: {
            padding: 0
          },
          // Disable hover effects and animations that might cause rendering issues
          hover: { mode: null },
          animation: {
            animateRotate: false,
            animateScale: false
          },
          elements: {
            arc: {
              borderWidth: 0,
              borderAlign: 'center'
            }
          }
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));
      const distributionChartImage = distributionCanvas.toDataURL("image/png");

      // Parse goals from array to separate bullet points
      let goalsContent = [];
      if (userData.goals && typeof userData.goals === 'string') {
        try {
          // Try to parse the goals if it's a JSON string
          let goalsArray = JSON.parse(userData.goals);
          if (Array.isArray(goalsArray)) {
            goalsArray.forEach((goal, index) => {
              if (goal && goal.trim() !== '') {
                goalsContent.push({
                  text: goal,
                  style: 'bullet',
                  margin: [0, index === 0 ? 0 : 5, 0, 0]
                });
              }
            });
          } else {
            goalsContent.push({ text: userData.goals, style: 'paragraph' });
          }
        } catch (e) {
          // If not valid JSON, just use as string
          goalsContent.push({ text: userData.goals, style: 'paragraph' });
        }
      }

      // Define Accenture color scheme
      const colors = {
        primary: ACCENTURE_COLORS.corePurple1,
        secondary: ACCENTURE_COLORS.corePurple2, 
        tertiary: ACCENTURE_COLORS.corePurple3,
        accent1: ACCENTURE_COLORS.accentPurple1,
        accent2: ACCENTURE_COLORS.accentPurple2,
        light: "#ffffff",
        text: "#000000",
        lightText: "#96968c",
        border: "#e6e6dc"
      };

      // Crear definición del documento PDF
      const docDefinition = {
        pageMargins: [40, 40, 40, 40],
        content: [
          // Encabezado
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
                text: `${userData.name} ${userData.last_name}`,
                style: 'title',
                margin: [0, 10, 0, 10]
              },
              {
                text: `EMPLOYEE ANALYTICS REPORT`,
                style: 'subtitle',
                margin: [0, 0, 0, 20]
              },
              {
                columns: [
                  {
                    stack: [
                      { text: 'ROLE', style: 'coverLabel' },
                      { 
                        text: userData.permission || "N/A", 
                        style: 'coverValue',
                        margin: [0, 2, 0, 0]
                      }
                    ],
                    width: '33%'
                  },
                  {
                    stack: [
                      { text: 'LEVEL', style: 'coverLabel' },
                      { 
                        text: userData.level || "N/A", 
                        style: 'coverValue',
                        margin: [0, 2, 0, 0]
                      }
                    ],
                    width: '33%'
                  },
                  {
                    stack: [
                      { text: 'JOINED', style: 'coverLabel' },
                      { 
                        text: userData.enter_date ? new Date(userData.enter_date).toLocaleDateString() : "N/A", 
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
                text: `Generated on ${new Date().toLocaleDateString()}`,
                style: 'date',
                margin: [0, 30, 0, 0]
              }
            ],
            alignment: 'left'
          },
          
          // Resumen de estadísticas
          {
            text: 'Summary',
            style: 'sectionTitle',
            margin: [0, 30, 0, 10]
          },
          {
            columns: [
              {
                width: '50%',
                stack: [
                  {
                    table: {
                      headerRows: 0,
                      widths: ['40%', '60%'],
                      body: [
                        [
                          { text: 'Total Skills:', style: 'tableKey' },
                          { text: totalSkills, style: 'tableValue' }
                        ],
                        [
                          { text: 'Technical Skills:', style: 'tableKey' },
                          { text: technicalSkills.length, style: 'tableValue' }
                        ],
                        [
                          { text: 'Soft Skills:', style: 'tableKey' },
                          { text: softSkills.length, style: 'tableValue' }
                        ],
                      ]
                    },
                    layout: 'noBorders'
                  }
                ]
              },
              {
                width: '50%',
                stack: [
                  {
                    table: {
                      headerRows: 0,
                      widths: ['60%', '40%'],
                      body: [
                        [
                          { text: 'Total Certifications:', style: 'tableKey' },
                          { text: totalCertifications, style: 'tableValue' }
                        ],
                        [
                          { text: 'Approved Certifications:', style: 'tableKey' },
                          { text: approvedCertificationsCount, style: 'tableValue' }
                        ],
                        [
                          { text: 'Pending Certifications:', style: 'tableKey' },
                          { text: pendingCertifications.length, style: 'tableValue' }
                        ],
                        [
                          { text: 'Availability:', style: 'tableKey' },
                          { 
                            text: userData.availability_status ? 'Available' : 'Unavailable', 
                            style: userData.availability_status ? 'availableValue' : 'unavailableValue' 
                          }
                        ],
                      ]
                    },
                    layout: 'noBorders'
                  }
                ]
              }
            ],
            margin: [0, 10, 0, 20]
          },
          
          // Gráficos
          {
            text: 'Skills Distribution',
            style: 'sectionTitle',
            margin: [0, 10, 0, 10]
          },
          {
            columns: [
              {
                width: '40%',
                stack: [
                  { 
                    image: distributionChartImage, 
                    width: 200,
                    alignment: 'center',
                    margin: [0, 0, 0, 0]
                  }
                ]
              },
              {
                width: '60%',
                stack: [
                  {
                    text: 'Top Skills by Proficiency',
                    style: 'subsectionTitle',
                    margin: [0, 0, 0, 10]
                  },
                  { 
                    image: skillsChartImage, 
                    width: 300,
                    alignment: 'center',
                    margin: [0, 0, 0, 0]
                  }
                ]
              }
            ],
            margin: [0, 0, 0, 20]
          },
          
          // Lista de habilidades
          {
            text: 'Skills Details',
            style: 'sectionTitle',
            pageBreak: 'before',
            margin: [0, 0, 0, 10]
          },
          {
            table: {
              headerRows: 1,
              widths: ['40%', '20%', '20%', '20%'],
              body: [
                [
                  { text: 'Skill Name', style: 'tableHeader' },
                  { text: 'Category', style: 'tableHeader' },
                  { text: 'Type', style: 'tableHeader' },
                  { text: 'Proficiency', style: 'tableHeader' }
                ],
                ...userSkills.map((skill) => [
                  { text: skill.skill?.name || 'Unknown', style: 'tableCell' },
                  { text: skill.skill?.category || 'N/A', style: 'tableCell' },
                  { text: skill.skill?.type || 'N/A', style: 'tableCell' },
                  { 
                    text: skill.proficiency || 'N/A',
                    style: 'tableCell',
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
                return (rowIndex === 0) ? colors.primary : null;
              },
              paddingTop: function() { return 6; },
              paddingBottom: function() { return 6; }
            }
          },
          
          // Certificaciones
          {
            text: 'Certifications',
            style: 'sectionTitle',
            margin: [0, 30, 0, 10]
          },
          
          ...(userCertifications.length > 0 ? [
            {
              table: {
                headerRows: 1,
                widths: ['40%', '20%', '20%', '20%'],
                body: [
                  [
                    { text: 'Certification', style: 'tableHeader' },
                    { text: 'Issuer', style: 'tableHeader' },
                    { text: 'Status', style: 'tableHeader' },
                    { text: 'Completed', style: 'tableHeader' }
                  ],
                  ...userCertifications.map((cert) => [
                    { text: cert.certification?.title || 'Unknown', style: 'tableCell' },
                    { text: cert.certification?.issuer || 'N/A', style: 'tableCell' },
                    { 
                      text: cert.status || 'N/A', 
                      style: 'tableCell'
                    },
                    { 
                      text: cert.completed_Date ? new Date(cert.completed_Date).toLocaleDateString() : 'In Progress', 
                      style: 'tableCell' 
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
                  return (rowIndex === 0) ? colors.primary : null;
                },
                paddingTop: function() { return 6; },
                paddingBottom: function() { return 6; }
              }
            }
          ] : [
            {
              text: 'No certifications found for this employee.',
              style: 'paragraph',
              margin: [0, 10, 0, 20]
            }
          ]),
          
          // Metas (Goals)
          ...(goalsContent.length > 0 ? [
            {
              text: 'Goals & Objectives',
              style: 'sectionTitle',
              margin: [0, 30, 0, 10]
            },
            ...goalsContent
          ] : []),
          
          ...(userData.about ? [
            {
              text: 'About',
              style: 'sectionTitle',
              margin: [0, 30, 0, 10]
            },
            {
              text: userData.about,
              style: 'paragraph',
              margin: [0, 10, 0, 20]
            }
          ] : [])
        ],
        
        // Estilos
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
          subsectionTitle: {
            fontSize: 14,
            bold: true,
            color: colors.secondary,
          },
          paragraph: { 
            fontSize: 11,
            lineHeight: 1.4,
            alignment: 'justify',
            color: colors.text
          },
          bullet: { 
            fontSize: 11,
            lineHeight: 1.4,
            color: colors.text,
            margin: [0, 2, 0, 0]
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
            color: colors.secondary
          },
          tableValue: {
            fontSize: 11,
            color: colors.text
          },
          availableValue: {
            fontSize: 11,
            color: "#4caf50",
            bold: true
          },
          unavailableValue: {
            fontSize: 11,
            color: "#f44336",
            bold: true
          }
        },
        
        // Pie de página
        footer: function(currentPage, pageCount) {
          return {
            columns: [
              { 
                text: `${userData.name} ${userData.last_name} - Analytics Report`, 
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
        
        // Estilo predeterminado - sin mencionar Arial para evitar errores
        defaultStyle: { 
          fontSize: 11,
          color: colors.text
        }
      };

      // Generar y descargar el PDF
      pdfMake.createPdf(docDefinition).download(`${userData.name}_${userData.last_name}_Analytics.pdf`);
      
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Error al generar el PDF. Por favor, inténtalo de nuevo.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <Grid item xs={12} lg={6}>
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "none",
        }}
      >
        <CardContent sx={{ p: 0, flexGrow: 0, width: "100%" }}>
          <Box 
            sx={{ 
              p: { xs: 2.5, md: 3 }, 
              borderBottom: '1px solid rgba(0,0,0,0.03)' 
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                fontSize: { xs: "1rem", sm: "1.1rem" },
                color: theme.palette.text.primary,
                mb: 2.5,
              }}
            >
              Team Members
            </Typography>

            {/* Search and Filter Controls - Redesigned for better aesthetics */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ 
                          fontSize: isMobile ? 16 : 18,
                          color: theme.palette.text.secondary
                        }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      fontSize: "0.875rem",
                      backgroundColor: "rgba(0,0,0,0.02)",
                      transition: "background-color 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.03)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      },
                      "&.Mui-focused": {
                        boxShadow: "0 1px 5px rgba(0,0,0,0.08)",
                      },
                      "& fieldset": {
                        borderColor: "transparent",
                      },
                      "&:hover fieldset": {
                        borderColor: "transparent",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: `${ACCENTURE_COLORS.corePurple1}50`,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <FormControl 
                  fullWidth 
                  variant="outlined" 
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      fontSize: "0.875rem",
                      backgroundColor: "rgba(0,0,0,0.02)",
                      transition: "background-color 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.03)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      },
                      "&.Mui-focused": {
                        boxShadow: "0 1px 5px rgba(0,0,0,0.08)",
                      },
                      "& fieldset": {
                        borderColor: "transparent",
                      },
                      "&:hover fieldset": {
                        borderColor: "transparent",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: `${ACCENTURE_COLORS.corePurple1}50`,
                      },
                    },
                  }}
                >
                  <InputLabel 
                    id="permission-filter-label"
                    sx={{ 
                      fontSize: "0.875rem",
                      backgroundColor: "transparent",
                      color: theme.palette.text.secondary
                    }}
                  >
                    Role
                  </InputLabel>
                  <Select
                    labelId="permission-filter-label"
                    value={permissionFilter}
                    onChange={handlePermissionFilterChange}
                    label="Role"
                    sx={{ 
                      fontSize: "0.875rem",
                      "&.MuiOutlinedInput-root": {
                        "& .MuiSvgIcon-root": {
                          color: theme.palette.text.secondary,
                        },
                      },
                    }}
                  >
                    <MenuItem value="All">All Roles</MenuItem>
                    <MenuItem value="Employee">Employee</MenuItem>
                    <MenuItem value="TFS">TFS</MenuItem>
                    <MenuItem value="Manager">Manager</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </CardContent>

        {/* Users List with Scrollbar - Mejorado para incluir descarga de analytics */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            p: { xs: 2, sm: 2.5 },
            height: { xs: 220, sm: 280 },
            width: "100%",
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "rgba(0,0,0,0.02)",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,0.09)",
              borderRadius: "4px",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.13)",
              },
            },
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress 
                size={28} 
                sx={{ color: ACCENTURE_COLORS.corePurple1 }} 
              />
            </Box>
          ) : error ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                px: 2,
              }}
            >
              <Typography
                color="error"
                sx={{
                  fontSize: "0.875rem",
                  textAlign: "center",
                }}
              >
                {error}
              </Typography>
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                color: theme.palette.text.secondary,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontSize: "0.875rem" }}
              >
                No users found
              </Typography>
            </Box>
          ) : (
            <Box sx={{ width: "100%" }}>
              {filteredUsers.map((user) => (
                <Paper
                  key={user.user_id}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    mb: 1.5,
                    borderRadius: 1.5,
                    backgroundColor: "rgba(0,0,0,0.01)",
                    transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      backgroundColor: `${ACCENTURE_COLORS.corePurple1}05`,
                      borderColor: `${ACCENTURE_COLORS.corePurple1}30`,
                    },
                    width: "100%",
                    border: "1px solid rgba(0,0,0,0.03)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      <Avatar
                        src={user.profile_pic}
                        alt={`${user.name} ${user.last_name}`}
                        sx={{
                          width: 36,
                          height: 36,
                          mr: 1.5,
                          backgroundColor: !user.profile_pic 
                            ? `${getPermissionColor(user.permission)}15` 
                            : undefined,
                          color: !user.profile_pic 
                            ? getPermissionColor(user.permission) 
                            : undefined,
                          fontWeight: "medium",
                        }}
                      >
                        {!user.profile_pic && 
                          (user.name.charAt(0) + user.last_name.charAt(0)).toUpperCase()
                        }
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 500,
                            fontSize: "0.9rem",
                            color: theme.palette.text.primary,
                          }}
                        >
                          {`${user.name} ${user.last_name}`}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.75,
                            mt: 0.5,
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          <Chip
                            label={user.permission}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.7rem",
                              backgroundColor: `${getPermissionColor(user.permission)}15`,
                              color: getPermissionColor(user.permission),
                              fontWeight: 500,
                              borderRadius: "4px",
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: "0.7rem",
                              color: theme.palette.text.secondary,
                            }}
                          >
                            Level {user.level}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    {/* Botón de descargar analytics - cambiado para tener icono de descarga y tooltip */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Download Analytics Report">
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => handleDownloadAnalytics(user.user_id)}
                          disabled={generatingPdf}
                          sx={{
                            minWidth: "32px",
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            p: 0,
                            color: theme.palette.text.secondary,
                            "&:hover": {
                              backgroundColor: `${ACCENTURE_COLORS.corePurple1}15`,
                              color: ACCENTURE_COLORS.corePurple1,
                            },
                          }}
                        >
                          {generatingPdf ? (
                            <CircularProgress size={16} sx={{ color: ACCENTURE_COLORS.corePurple1 }} />
                          ) : (
                            <DownloadIcon fontSize="small" />
                          )}
                        </Button>
                      </Tooltip>
                      <Tooltip title="More Options">
                        <Button
                          variant="text"
                          size="small"
                          sx={{
                            minWidth: "32px",
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            p: 0,
                            color: theme.palette.text.secondary,
                            "&:hover": {
                              backgroundColor: `${ACCENTURE_COLORS.corePurple1}15`,
                              color: ACCENTURE_COLORS.corePurple1,
                            },
                          }}
                        >
                          <MoreHorizIcon fontSize="small" />
                        </Button>
                      </Tooltip>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Card>
    </Grid>
  );
};

export default UserViewer;