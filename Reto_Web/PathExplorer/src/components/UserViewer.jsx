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
  Fade,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DownloadIcon from "@mui/icons-material/Download";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { supabase } from "../supabase/supabaseClient";
import { useTheme } from "@mui/material/styles";
import { ACCENTURE_COLORS } from "../styles/styles.js";
import { useDarkMode } from '../contexts/DarkModeContext';

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
  const { darkMode } = useDarkMode();

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

  // Función mejorada para generar el PDF de analytics del usuario
// Función mejorada para generar el PDF de analytics del usuario
const handleDownloadAnalytics = async (userId) => {
  try {
    setGeneratingPdf(true);
    
    // 1. Obtener todos los datos del usuario con validación
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (userError) throw new Error(`Error fetching user data: ${userError.message}`);
    if (!userData) throw new Error("User not found");

    // 2. Obtener las habilidades del usuario con validación
    const { data: userSkills, error: skillsError } = await supabase
      .from("UserSkill")
      .select(`
        proficiency, 
        year_Exp,
        skill:Skill (
          skill_ID,
          name,
          category,
          type,
          description
        )
      `)
      .eq("user_ID", userId);

    if (skillsError) throw new Error(`Error fetching skills: ${skillsError.message}`);

    // 3. Obtener las certificaciones del usuario con validación
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

    if (certsError) throw new Error(`Error fetching certifications: ${certsError.message}`);

    // Helper: Validación y formato seguro de fechas
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      
      try {
        const date = new Date(dateString);
        // Verificar si la fecha es válida
        if (isNaN(date.getTime())) return "Invalid date";
        
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
      } catch (error) {
        console.error("Error formatting date:", error);
        return "N/A";
      }
    };

    // Helper: Validación de array
    const safeArray = (arr) => {
      if (!arr || !Array.isArray(arr)) return [];
      return arr;
    };

    // Tratar arreglos de manera segura
    const validUserSkills = safeArray(userSkills);
    const validUserCertifications = safeArray(userCertifications);

    // Agrupar habilidades por tipo de forma segura
    const softSkills = validUserSkills.filter(
      (skill) => skill.skill?.type === "Soft Skill"
    );
    
    const technicalSkills = validUserSkills.filter(
      (skill) => skill.skill?.type === "Technical Skill"
    );

    // Agrupar certificaciones por estado de forma segura
    const approvedCertifications = validUserCertifications.filter(
      (cert) => cert.status === "approved"
    );
    
    const pendingCertifications = validUserCertifications.filter(
      (cert) => cert.status === "pending"
    );
    
    const rejectedCertifications = validUserCertifications.filter(
      (cert) => cert.status === "rejected"
    );

    // Calcular estadísticas con validación
    const totalSkills = validUserSkills.length;
    const totalCertifications = validUserCertifications.length;
    const approvedCertificationsCount = approvedCertifications.length;
    const pendingCertificationsCount = pendingCertifications.length;
    const rejectedCertificationsCount = rejectedCertifications.length;
    
    // Calcular métricas adicionales para visualizaciones
    const skillProficiencySum = validUserSkills.reduce((sum, skill) => {
      const profValue = getProficiencyValue(skill.proficiency);
      return !isNaN(profValue) ? sum + profValue : sum;
    }, 0);
    
    const avgProficiency = totalSkills > 0 
      ? Math.round(skillProficiencySum / totalSkills) 
      : 0;
    
    const certificationRate = totalCertifications > 0
      ? Math.round((approvedCertificationsCount / totalCertifications) * 100)
      : 0;

    // Crear gráfico de habilidades con manejo de errores
    const skillsCanvas = document.createElement("canvas");
    skillsCanvas.width = 500;
    skillsCanvas.height = 300;
    const skillsCtx = skillsCanvas.getContext("2d");
    let skillsChartImage;

    try {
      // Preparar datos para el gráfico de barras de habilidades
      const topSkills = [...validUserSkills]
        .sort((a, b) => getProficiencyValue(b.proficiency) - getProficiencyValue(a.proficiency))
        .slice(0, 6); // Limitamos a 6 para mejor visualización

      new Chart(skillsCtx, {
        type: "bar",
        data: {
          labels: topSkills.map((skill) => skill.skill?.name || "Unknown"),
          datasets: [
            {
              label: "Proficiency",
              data: topSkills.map((skill) => getProficiencyValue(skill.proficiency)),
              backgroundColor: topSkills.map((skill) => getProficiencyColor(skill.proficiency)),
              borderRadius: 5,
              barThickness: 25,
              maxBarThickness: 30
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
                font: {
                  size: 12,
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.06)',
              },
              ticks: {
                callback: function(value) {
                  return value + '%';
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
              }
            }
          },
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: 'Top Skills by Proficiency',
              font: {
                size: 14,
                weight: 'bold',
              },
              padding: {
                top: 10,
                bottom: 10
              },
              color: ACCENTURE_COLORS.corePurple1
            },
          },
          responsive: false,
        },
      });

      // Esperar a que el gráfico se renderice
      await new Promise((resolve) => setTimeout(resolve, 150));
      skillsChartImage = skillsCanvas.toDataURL("image/png");
    } catch (chartError) {
      console.error("Error creating skills chart:", chartError);
      
      // Crear un placeholder si falla la creación del gráfico
      skillsCtx.fillStyle = "#f8f4ff"; // Light purple background
      skillsCtx.fillRect(0, 0, skillsCanvas.width, skillsCanvas.height);
      skillsCtx.fillStyle = ACCENTURE_COLORS.corePurple1;
      skillsCtx.font = "bold 18px sans-serif";
      skillsCtx.textAlign = "center";
      skillsCtx.fillText("Skills Chart Unavailable", skillsCanvas.width/2, skillsCanvas.height/2);
      
      skillsChartImage = skillsCanvas.toDataURL("image/png");
    }

    // Crear gráfico de distribución de tipos de habilidades con manejo de errores
    const distributionCanvas = document.createElement("canvas");
    distributionCanvas.width = 300;
    distributionCanvas.height = 300;
    const distributionCtx = distributionCanvas.getContext("2d");
    let distributionChartImage;

    try {
      // Verificar que tenemos datos válidos para el gráfico
      const hasSkillData = technicalSkills.length > 0 || softSkills.length > 0;
      
      if (!hasSkillData) {
        throw new Error("No skill data available for chart");
      }

      // Preparar datos, incluyendo solo categorías con valores > 0
      const skillsData = [];
      const skillsLabels = [];
      const skillsColors = [];
      
      if (technicalSkills.length > 0) {
        skillsData.push(technicalSkills.length);
        skillsLabels.push("Technical Skills");
        skillsColors.push(ACCENTURE_COLORS.corePurple1);
      }
      
      if (softSkills.length > 0) {
        skillsData.push(softSkills.length);
        skillsLabels.push("Soft Skills");
        skillsColors.push(ACCENTURE_COLORS.accentPurple1);
      }

      new Chart(distributionCtx, {
        type: "pie",
        data: {
          labels: skillsLabels,
          datasets: [
            {
              data: skillsData,
              backgroundColor: skillsColors,
              borderColor: 'white',
              borderWidth: 2,
              hoverOffset: 5,
              borderJoinStyle: 'round',
              borderAlign: 'center',
              spacing: 0,
              weight: 1
            },
          ],
        },
        options: {
          responsive: false,
          circumference: 360,
          radius: '90%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                usePointStyle: true,
                padding: 15,
                font: {
                  size: 11,
                }
              }
            },
            title: {
              display: true,
              text: 'Skills Distribution',
              font: {
                size: 14,
                weight: 'bold',
              },
              color: ACCENTURE_COLORS.corePurple2,
              padding: {
                top: 10,
                bottom: 10
              }
            }
          },
          // Desactivar animaciones para que el gráfico se renderice inmediatamente
          animation: {
            duration: 0
          }
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 300));
      distributionChartImage = distributionCanvas.toDataURL("image/png");
    } catch (chartError) {
      console.error("Error creating distribution chart:", chartError);
      
      // Crear un placeholder si falla la creación del gráfico
      distributionCtx.fillStyle = "#f8f4ff";
      distributionCtx.fillRect(0, 0, distributionCanvas.width, distributionCanvas.height);
      distributionCtx.fillStyle = ACCENTURE_COLORS.corePurple1;
      distributionCtx.font = "bold 16px sans-serif";
      distributionCtx.textAlign = "center";
      distributionCtx.fillText("Distribution Chart Unavailable", distributionCanvas.width/2, distributionCanvas.height/2);
      
      distributionChartImage = distributionCanvas.toDataURL("image/png");
    }

    // Crear gráfico de certificaciones
    let certificationChartImage = null;
    
    if (totalCertifications > 0) {
      try {
        const certCanvas = document.createElement("canvas");
        certCanvas.width = 250;
        certCanvas.height = 250;
        const certCtx = certCanvas.getContext("2d");
        
        // Preparar datos, incluyendo solo estados con valores > 0
        const certData = [];
        const certLabels = [];
        const certColors = [];
        
        if (approvedCertificationsCount > 0) {
          certData.push(approvedCertificationsCount);
          certLabels.push("Approved");
          certColors.push("#4caf50"); // Verde
        }
        
        if (pendingCertificationsCount > 0) {
          certData.push(pendingCertificationsCount);
          certLabels.push("Pending");
          certColors.push("#ff9800"); // Naranja
        }
        
        if (rejectedCertificationsCount > 0) {
          certData.push(rejectedCertificationsCount);
          certLabels.push("Rejected");
          certColors.push("#f44336"); // Rojo
        }
        
        new Chart(certCtx, {
          type: "pie",
          data: {
            labels: certLabels,
            datasets: [
              {
                data: certData,
                backgroundColor: certColors,
                borderColor: 'white',
                borderWidth: 2,
                hoverOffset: 5,
                borderJoinStyle: 'round',
                borderAlign: 'center',
                spacing: 0,
                weight: 1
              },
            ],
          },
          options: {
            responsive: false,
            circumference: 360,
            radius: '90%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 12,
                  usePointStyle: true,
                  padding: 15,
                  font: {
                    size: 11,
                  }
                }
              },
              title: {
                display: true,
                text: 'Certification Status',
                font: {
                  size: 14,
                  weight: 'bold',
                },
                color: ACCENTURE_COLORS.corePurple2,
                padding: {
                  top: 10,
                  bottom: 10
                }
              }
            },
            // Desactivar animaciones para que el gráfico se renderice inmediatamente
            animation: {
              duration: 0
            }
          },
        });
        
        await new Promise((resolve) => setTimeout(resolve, 300));
        certificationChartImage = certCanvas.toDataURL("image/png");
      } catch (chartError) {
        console.error("Error creating certification chart:", chartError);
        // Simplemente dejamos el gráfico como null y no lo incluimos
      }
    }

    // Parse goals from array to separate bullet points con validación
    let goalsContent = [];
    if (userData.goals) {
      try {
        // Si es un string JSON, intentar parsearlo
        if (typeof userData.goals === 'string') {
          try {
            const goalsArray = JSON.parse(userData.goals);
            if (Array.isArray(goalsArray)) {
              goalsContent = goalsArray
                .filter(goal => goal && goal.trim() !== '')
                .map((goal, index) => ({
                  text: goal,
                  style: 'bullet',
                  margin: [0, index === 0 ? 0 : 5, 0, 0]
                }));
            } else {
              goalsContent.push({ text: userData.goals, style: 'paragraph' });
            }
          } catch (e) {
            // Si no es JSON válido, usarlo como string
            goalsContent.push({ text: userData.goals, style: 'paragraph' });
          }
        } 
        // Si ya es un array, usarlo directamente
        else if (Array.isArray(userData.goals)) {
          goalsContent = userData.goals
            .filter(goal => goal && goal.trim() !== '')
            .map((goal, index) => ({
              text: goal,
              style: 'bullet',
              margin: [0, index === 0 ? 0 : 5, 0, 0]
            }));
        }
      } catch (e) {
        console.error("Error parsing goals:", e);
        goalsContent = [];
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
      lightText: "#75757a",
      border: "#e6e6dc",
      gradientLight: "#f5f0ff", // Light Purple background
      success: "#4caf50",    // Verde
      warning: "#ff9800",    // Naranja
      error: "#f44336"       // Rojo
    };
    
    // Funciones para elementos visuales avanzados
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

    // Crear gráfico de progreso para proficiencia promedio
    const createProgressBar = (percent, color) => {
      return `<svg width="200" height="15" viewBox="0 0 200 15">
        <rect width="200" height="8" rx="4" ry="4" fill="#f0f0f0" />
        <rect width="${percent * 2}" height="8" rx="4" ry="4" fill="${color}" />
      </svg>`;
    };

    const avgProficiencyColor = (() => {
      if (avgProficiency >= 75) return colors.success;
      if (avgProficiency >= 50) return colors.primary;
      if (avgProficiency >= 25) return colors.warning;
      return colors.error;
    })();

    const certRateColor = (() => {
      if (certificationRate >= 75) return colors.success;
      if (certificationRate >= 50) return colors.primary;
      if (certificationRate >= 25) return colors.warning;
      return colors.error;
    })();

    const avgProficiencyBar = createProgressBar(avgProficiency, avgProficiencyColor);
    const certificationRateBar = createProgressBar(certificationRate, certRateColor);
    
    // Determinar distribución de páginas basada en cantidad de datos
    const hasManyCertifications = validUserCertifications.length > 5;
    const hasManySkills = validUserSkills.length > 10;
    
    // Crear definición del documento PDF con visualizaciones mejoradas
    const docDefinition = {
      pageMargins: [40, 40, 40, 40],
      
      // Control de saltos de página automáticos
      pageBreakBefore: function(currentNode, followingNodesOnPage) {
        // Evitar saltos de página innecesarios
        if (currentNode.table && followingNodesOnPage.length > 2) {
          return false;
        }
        return false;
      },
      
      // Barra lateral con el color de Accenture 
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
              }
            ]
          }
        ];
      },
      
      content: [
        // Encabezado con estilo mejorado
        {
          stack: [
            { 
              svg: createAccentShape(),
              width: 530,
              margin: [0, 0, 0, 20]
            },
            {
              text: `${userData.name || ""} ${userData.last_name || ""}`.trim() || "Employee Report",
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
                      text: formatDate(userData.enter_date), 
                      style: 'coverValue',
                      margin: [0, 2, 0, 0]
                    }
                  ],
                  width: '33%'
                }
              ],
              margin: [0, 10, 0, 10]
            },
            // Indicador de disponibilidad
            {
              columns: [
                { width: '35%', text: '' },
                {
                  width: '30%',
                  stack: [
                    { 
                      text: 'AVAILABILITY', 
                      style: 'coverLabel',
                      alignment: 'center',
                      margin: [0, 10, 0, 5]
                    },
                    {
                      table: {
                        widths: ['*'],
                        body: [
                          [
                            { 
                              text: userData.availability_status ? 'AVAILABLE' : 'UNAVAILABLE', 
                              style: userData.availability_status ? 'availableTag' : 'unavailableTag',
                              alignment: 'center'
                            }
                          ]
                        ]
                      },
                      layout: {
                        hLineWidth: function() { return 0; },
                        vLineWidth: function() { return 0; },
                        fillColor: function() { 
                          return userData.availability_status ? 
                            'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'; 
                        },
                      }
                    }
                  ]
                },
                { width: '35%', text: '' }
              ]
            },
            {
              text: `Generated on ${new Date().toLocaleDateString(undefined, {
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
        
        // Resumen de estadísticas con visualizaciones mejoradas
        {
          text: 'Performance Overview',
          style: 'sectionTitle',
          margin: [0, 40, 0, 10]
        },
        { 
          svg: createAccentShape('wave'),
          width: 100,
          margin: [0, 0, 0, 15]
        },
        
        // Indicadores de rendimiento con barras de progreso
        {
          columns: [
            {
              width: '50%',
              stack: [
                { 
                  text: 'Average Skill Proficiency', 
                  style: 'statLabel',
                  margin: [0, 0, 0, 5]
                },
                {
                  columns: [
                    {
                      svg: avgProficiencyBar,
                      width: 150,
                    },
                    {
                      text: `${avgProficiency}%`,
                      style: 'statValue',
                      width: 'auto',
                      margin: [10, 0, 0, 0]
                    }
                  ],
                  margin: [0, 0, 0, 15]
                },
                { 
                  text: 'Certification Completion Rate', 
                  style: 'statLabel',
                  margin: [0, 0, 0, 5]
                },
                {
                  columns: [
                    {
                      svg: certificationRateBar,
                      width: 150,
                    },
                    {
                      text: `${certificationRate}%`,
                      style: 'statValue',
                      width: 'auto',
                      margin: [10, 0, 0, 0]
                    }
                  ],
                  margin: [0, 0, 0, 15]
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
                        { text: pendingCertificationsCount, style: 'tableValue' }
                      ],
                    ]
                  },
                  layout: {
                    hLineWidth: function(i, node) {
                      return 0.5;
                    },
                    vLineWidth: function() { return 0; },
                    hLineColor: function() { return colors.border; },
                    fillColor: function(rowIndex) {
                      return rowIndex % 2 === 0 ? colors.gradientLight : null;
                    },
                    paddingTop: function() { return 4; },
                    paddingBottom: function() { return 4; }
                  }
                }
              ]
            }
          ],
          margin: [0, 10, 0, 30]
        },
        
        // Gráficos mejorados
        {
          text: 'Skills Analysis',
          style: 'sectionTitle',
          margin: [0, 10, 0, 10]
        },
        { 
          svg: createAccentShape('wave'),
          width: 100,
          margin: [0, 0, 0, 15]
        },
        {
          columns: [
            {
              width: totalCertifications > 0 ? '33%' : '50%',
              stack: [
                { 
                  image: distributionChartImage, 
                  width: 200,
                  alignment: 'center',
                  margin: [0, 0, 0, 10]
                }
              ]
            },
            {
              width: totalCertifications > 0 ? '33%' : '50%',
              stack: [
                { 
                  image: skillsChartImage, 
                  width: 250,
                  alignment: 'center',
                  margin: [0, 0, 0, 10]
                }
              ]
            },
            ...(certificationChartImage ? [
              {
                width: '33%',
                stack: [
                  { 
                    image: certificationChartImage, 
                    width: 200,
                    alignment: 'center',
                    margin: [0, 0, 0, 10]
                  }
                ]
              }
            ] : [])
          ],
          margin: [0, 0, 0, 30]
        },
        
        // Lista de habilidades
        {
          text: 'Skills Details',
          style: 'sectionTitle',
          pageBreak: hasManySkills ? 'before' : undefined,
          margin: [0, 0, 0, 10]
        },
        { 
          svg: createAccentShape('wave'),
          width: 100,
          margin: [0, 0, 0, 15]
        },
        
        // Tabla con habilidades agrupadas por tipo para mejor organización
        ...(validUserSkills.length > 0 ? [
          // 1. Habilidades técnicas
          {
            text: 'Technical Skills',
            style: 'subsectionTitle',
            margin: [0, 0, 0, 10]
          },
          ...(technicalSkills.length > 0 ? [
            {
              table: {
                headerRows: 1,
                widths: ['40%', '20%', '20%', '20%'],
                body: [
                  [
                    { text: 'Skill Name', style: 'tableHeader' },
                    { text: 'Category', style: 'tableHeader' },
                    { text: 'Experience', style: 'tableHeader' },
                    { text: 'Proficiency', style: 'tableHeader' }
                  ],
                  ...technicalSkills.map((skill) => [
                    { text: skill.skill?.name || 'Unknown', style: 'tableCell' },
                    { text: skill.skill?.category || 'N/A', style: 'tableCell' },
                    { text: skill.year_Exp ? `${skill.year_Exp} year(s)` : 'N/A', style: 'tableCell' },
                    { 
                      text: skill.proficiency || 'N/A',
                      style: `proficiency${skill.proficiency?.replace(/\s+/g, '') || 'NA'}`
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
                  return (rowIndex === 0) ? colors.primary : (rowIndex % 2 === 0) ? colors.gradientLight : null;
                },
                paddingTop: function() { return 6; },
                paddingBottom: function() { return 6; }
              }
            }
          ] : [
            {
              text: 'No technical skills recorded.',
              style: 'paragraph',
              margin: [0, 0, 0, 10],
              italics: true
            }
          ]),
          
          // 2. Habilidades blandas (soft skills)
          {
            text: 'Soft Skills',
            style: 'subsectionTitle',
            margin: [0, 20, 0, 10]
          },
          ...(softSkills.length > 0 ? [
            {
              table: {
                headerRows: 1,
                widths: ['50%', '25%', '25%'],
                body: [
                  [
                    { text: 'Skill Name', style: 'tableHeader' },
                    { text: 'Category', style: 'tableHeader' },
                    { text: 'Proficiency', style: 'tableHeader' }
                  ],
                  ...softSkills.map((skill) => [
                    { text: skill.skill?.name || 'Unknown', style: 'tableCell' },
                    { text: skill.skill?.category || 'N/A', style: 'tableCell' },
                    { 
                      text: skill.proficiency || 'N/A',
                      style: `proficiency${skill.proficiency?.replace(/\s+/g, '') || 'NA'}`
                    }
                  ])
                ]
              },
              layout: {
                hLineWidth: function(i, node) {
                  return (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5;
                },
                vLineWidth: function() { return 0; },
                hLineColor: function(i) { return i === 0 || i === 1 ? colors.accent1 : colors.border; },
                fillColor: function(rowIndex, node, columnIndex) {
                  return (rowIndex === 0) ? colors.accent1 : (rowIndex % 2 === 0) ? colors.gradientLight : null;
                },
                paddingTop: function() { return 6; },
                paddingBottom: function() { return 6; }
              }
            }
          ] : [
            {
              text: 'No soft skills recorded.',
              style: 'paragraph',
              margin: [0, 0, 0, 10],
              italics: true
            }
          ])
        ] : [
          {
            text: 'No skills have been recorded for this employee.',
            style: 'paragraph',
            margin: [0, 10, 0, 20],
            italics: true
          }
        ]),
        
        // Certificaciones
        {
          text: 'Certifications',
          style: 'sectionTitle',
          pageBreak: hasManyCertifications ? 'before' : undefined,
          margin: [0, 30, 0, 10]
        },
        { 
          svg: createAccentShape('wave'),
          width: 100,
          margin: [0, 0, 0, 15]
        },
        
        ...(validUserCertifications.length > 0 ? [
          {
            table: {
              headerRows: 1,
              widths: ['35%', '20%', '15%', '30%'],
              body: [
                [
                  { text: 'Certification', style: 'tableHeader' },
                  { text: 'Issuer', style: 'tableHeader' },
                  { text: 'Status', style: 'tableHeader' },
                  { text: 'Date Information', style: 'tableHeader' }
                ],
                ...validUserCertifications.map((cert) => [
                  { text: cert.certification?.title || 'Unknown', style: 'tableCell' },
                  { text: cert.certification?.issuer || 'N/A', style: 'tableCell' },
                  { 
                    text: cert.status || 'N/A', 
                    style: `cert${cert.status?.replace(/\s+/g, '')?.toLowerCase() || 'unknown'}`
                  },
                  { 
                    stack: [
                      ...(cert.completed_Date ? [{
                        text: `Completed: ${formatDate(cert.completed_Date)}`,
                        style: 'certDate'
                      }] : []),
                      ...(cert.valid_Until ? [{
                        text: `Valid until: ${formatDate(cert.valid_Until)}`,
                        style: 'certDate',
                        margin: [0, cert.completed_Date ? 3 : 0, 0, 0]
                      }] : [])
                    ]
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
                return (rowIndex === 0) ? colors.primary : (rowIndex % 2 === 0) ? colors.gradientLight : null;
              },
              paddingTop: function() { return 6; },
              paddingBottom: function() { return 6; }
            }
          }
        ] : [
          {
            text: 'No certifications found for this employee.',
            style: 'paragraph',
            margin: [0, 10, 0, 20],
            italics: true
          }
        ]),
        
        // Metas (Goals) y Objetivos
        ...(goalsContent.length > 0 ? [
          {
            text: 'Goals & Objectives',
            style: 'sectionTitle',
            margin: [0, 30, 0, 10]
          },
          { 
            svg: createAccentShape('wave'),
            width: 100,
            margin: [0, 0, 0, 15]
          },
          {
            stack: [
              // Si los contenidos son bullets, los encapsulamos en un contenedor decorativo
              {
                stack: goalsContent,
                margin: [10, 10, 10, 10],
                background: colors.gradientLight
              }
            ]
          }
        ] : []),
        
        // About / Bio (if available)
        ...(userData.about ? [
          {
            text: 'About',
            style: 'sectionTitle',
            margin: [0, 30, 0, 10]
          },
          { 
            svg: createAccentShape('wave'),
            width: 100,
            margin: [0, 0, 0, 15]
          },
          {
            text: userData.about,
            style: 'paragraph',
            margin: [0, 10, 0, 20]
          }
        ] : [])
      ],
      
      // Estilos mejorados con manejo de colores por estado
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
        availableTag: {
          fontSize: 12,
          bold: true,
          color: colors.success
        },
        unavailableTag: {
          fontSize: 12,
          bold: true,
          color: colors.error
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
        certDate: {
          fontSize: 9,
          color: colors.text
        },
        statLabel: {
          fontSize: 11,
          color: colors.secondary,
          bold: true
        },
        statValue: {
          fontSize: 12,
          bold: true,
          color: colors.primary
        },
        // Estilos para estados de certificaciones
        certapproved: {
          fontSize: 10,
          color: colors.success,
          bold: true
        },
        certpending: {
          fontSize: 10,
          color: colors.warning,
          bold: true
        },
        certrejected: {
          fontSize: 10,
          color: colors.error,
          bold: true
        },
        certunknown: {
          fontSize: 10,
          color: colors.lightText,
          italics: true
        },
        // Estilos para niveles de proficiencia
        proficiencyHigh: {
          fontSize: 10,
          color: colors.success,
          bold: true
        },
        proficiencyMedium: {
          fontSize: 10,
          color: colors.primary,
          bold: true
        },
        proficiencyLow: {
          fontSize: 10,
          color: colors.warning
        },
        proficiencyBasic: {
          fontSize: 10,
          color: colors.lightText
        },
        proficiencyNA: {
          fontSize: 10,
          color: colors.lightText,
          italics: true
        }
      },
      
      // Pie de página con colores accenture
      footer: function(currentPage, pageCount) {
        return {
          columns: [
            { 
              text: `${userData.name || ""} ${userData.last_name || ""} - Analytics Report`.trim(), 
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
      
      // Estilo predeterminado sin mencionar fuentes específicas
      defaultStyle: { 
        fontSize: 11,
        color: colors.text
      }
    };

    // Generar y descargar el PDF con mejor manejo de errores
    try {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.download(`${userData.name || "Employee"}_${userData.last_name || "Report"}_Analytics.pdf`);
    } catch (pdfError) {
      console.error("Error generating PDF document:", pdfError);
      alert("Could not generate PDF document. Please try again or contact support.");
    }
    
  } catch (error) {
    console.error("Error generating analytics PDF:", error);
    alert("Error generating analytics report. Please try again.");
  } finally {
    setGeneratingPdf(false);
  }
};

  return (
    <Grid item xs={12} lg={6}>
      <Fade in={true} timeout={2200}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            background: darkMode ? '#1a1a1a' : '#fff',
            border: `1px solid ${darkMode ? alpha(ACCENTURE_COLORS.accentPurple1, 0.15) : alpha(ACCENTURE_COLORS.accentPurple1, 0.08)}`,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: `0 8px 24px ${darkMode ? alpha(ACCENTURE_COLORS.accentPurple1, 0.12) : alpha(ACCENTURE_COLORS.accentPurple1, 0.08)}`,
            }
          }}
        >
          <CardContent sx={{ p: 0, flexGrow: 0, width: "100%" }}>
            <Box 
              sx={{ 
                p: { xs: 2.5, md: 3 }, 
                borderBottom: `1px solid ${darkMode ? alpha(ACCENTURE_COLORS.accentPurple1, 0.1) : alpha(ACCENTURE_COLORS.accentPurple1, 0.05)}`,
                background: darkMode ? `linear-gradient(135deg, ${alpha(ACCENTURE_COLORS.accentPurple1, 0.05)}, transparent)` : `linear-gradient(135deg, ${alpha(ACCENTURE_COLORS.accentPurple1, 0.02)}, transparent)`,
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
                      backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                      transition: "background-color 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.03)",
                        boxShadow: darkMode ? "0 1px 3px rgba(255,255,255,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
                      },
                      "&.Mui-focused": {
                        boxShadow: darkMode ? "0 1px 5px rgba(255,255,255,0.12)" : "0 1px 5px rgba(0,0,0,0.08)",
                      },
                      "& fieldset": {
                        borderColor: darkMode ? "rgba(255,255,255,0.2)" : "transparent",
                      },
                      "&:hover fieldset": {
                        borderColor: darkMode ? "rgba(255,255,255,0.3)" : "transparent",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: `${ACCENTURE_COLORS.corePurple1}${darkMode ? '80' : '50'}`,
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
                      backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                      transition: "background-color 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.03)",
                        boxShadow: darkMode ? "0 1px 3px rgba(255,255,255,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
                      },
                      "&.Mui-focused": {
                        boxShadow: darkMode ? "0 1px 5px rgba(255,255,255,0.12)" : "0 1px 5px rgba(0,0,0,0.08)",
                      },
                      "& fieldset": {
                        borderColor: darkMode ? "rgba(255,255,255,0.2)" : "transparent",
                      },
                      "&:hover fieldset": {
                        borderColor: darkMode ? "rgba(255,255,255,0.3)" : "transparent",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: `${ACCENTURE_COLORS.corePurple1}${darkMode ? '80' : '50'}`,
                      },
                    },
                  }}
                >
                  <InputLabel 
                    id="permission-filter-label"
                    sx={{ 
                      fontSize: "0.875rem",
                      backgroundColor: "transparent",
                      color: darkMode ? 'rgba(255,255,255,0.7)' : theme.palette.text.secondary
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
                          color: darkMode ? 'rgba(255,255,255,0.5)' : theme.palette.text.secondary,
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
              backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: darkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.09)",
              borderRadius: "4px",
              "&:hover": {
                backgroundColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.13)",
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
                    backgroundColor: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.01)",
                    transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: darkMode ? "0 2px 8px rgba(255,255,255,0.1)" : "0 2px 8px rgba(0,0,0,0.06)",
                      backgroundColor: darkMode ? `${ACCENTURE_COLORS.corePurple1}15` : `${ACCENTURE_COLORS.corePurple1}05`,
                      borderColor: `${ACCENTURE_COLORS.corePurple1}${darkMode ? '40' : '30'}`,
                    },
                    width: "100%",
                    border: darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.03)",
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
                              backgroundColor: darkMode ? `${getPermissionColor(user.permission)}25` : `${getPermissionColor(user.permission)}15`,
                              color: darkMode ? getPermissionColor(user.permission) : getPermissionColor(user.permission),
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
                              backgroundColor: darkMode ? `${ACCENTURE_COLORS.corePurple1}25` : `${ACCENTURE_COLORS.corePurple1}15`,
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
                              backgroundColor: darkMode ? `${ACCENTURE_COLORS.corePurple1}25` : `${ACCENTURE_COLORS.corePurple1}15`,
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
      </Paper>
      </Fade>
    </Grid>
  );
};

export default UserViewer;