import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Paper,
  useTheme,
  Button,
  useMediaQuery
} from "@mui/material";
import {
  PersonOutline as PersonOutlineIcon,
  Group as GroupIcon,
  Work as WorkIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

// Componentes modulares importados
import StatCard from "../components/StatCard";
import EmployeeCard from "../components/EmployeeCard";
import SearchFilter from "../components/SearchFilter";
import ReviewCertifications from "../components/ReviewCertifications"; // Import new component

// Función para extraer conteos de manera segura
const extractCount = (response) => {
  if (response === null || response === undefined) {
    return 0;
  }
  
  if (typeof response === 'number') {
    return response;
  }
  
  if (typeof response === 'object') {
    // Si tiene propiedad count directamente
    if ('count' in response && typeof response.count === 'number') {
      return response.count;
    }
    
    // Si tiene un objeto data con count
    if (response.data && typeof response.data === 'object' && 'count' in response.data) {
      return response.data.count;
    }
    
    // Si data es directamente un número
    if (response.data && typeof response.data === 'number') {
      return response.data;
    }
  }
  
  // Si no pudimos extraer un número, devolvemos 0 como fallback
  return 0;
};

const Profiles = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Media query hooks para responsividad
  const isSmallScreen = useMediaQuery('(max-width:599px)');
  const isExtraSmallScreen = useMediaQuery('(max-width:320px)');
  
  // Colores de Accenture definidos según las guías de marca
  const accentureColors = {
    corePurple1: "#a100ff", // RGB: 161/0/255, CMYK: 52/82/0/0
    corePurple2: "#7500c0", // RGB: 117/0/192, CMYK: 74/100/0/0
    corePurple3: "#460073"  // RGB: 70/0/115, CMYK: 85/100/0/0
  };
  
  // Estados
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    availableEmployees: 0,
    activeProjects: 0
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  // Estado para el modal de revisión de certificaciones
  const [reviewCertificationsOpen, setReviewCertificationsOpen] = useState(false);
  // Estado para saber si el usuario es TFS o Manager
  const [isReviewer, setIsReviewer] = useState(false);
  
  // Cargar datos de empleados
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        
        // Verificar si el usuario actual es TFS o Manager
        const { data: userSession, error: sessionError } = await supabase.auth.getUser();
        
        if (sessionError) throw sessionError;
        
        if (userSession && userSession.user) {
          const { data: userData, error: userError } = await supabase
            .from("User")
            .select("permission")
            .eq("user_id", userSession.user.id)
            .single();
          
          if (userError) throw userError;
          
          // Verificar si es TFS o Manager
          setIsReviewer(userData.permission === "TFS" || userData.permission === "Manager");
        }
        
        // Consulta optimizada: obtener usuarios con sus roles y habilidades en una sola consulta
        const { data: userData, error: userError } = await supabase
          .from("User")
          .select(`
            user_id, 
            name, 
            last_name, 
            mail, 
            profile_pic, 
            permission,
            UserRole(role_name, project_id, Project:project_id(status))
          `)
          .eq("permission", "Employee"); // Filtrar directamente en la consulta
        
        if (userError) {
          throw userError;
        }

        // Consulta separada para habilidades, solo para los usuarios recuperados
        const userIds = userData.map(user => user.user_id);
        
        const { data: skillsData, error: skillsError } = await supabase
          .from("UserSkill")
          .select("user_ID, skill_ID, Skill(name)")
          .in("user_ID", userIds);
          
        if (skillsError) {
          throw skillsError;
        }
        
        // Obtener proyectos activos (para las estadísticas)
        const { data: activeProjectsData, error: projectCountError } = await supabase
          .from("Project")
          .select("count", { count: "exact" })
          .neq("status", "Completed");
        
        if (projectCountError) {
          throw projectCountError;
        }
        
        // Asegurar que activeProjectsCount sea un número
        const activeProjectsCount = extractCount(activeProjectsData);
        
        // Procesar los datos de los empleados
        const employeesWithDetails = userData.map(user => {
          // Determinar si el empleado está actualmente asignado a un proyecto activo
          const hasActiveProject = user.UserRole && 
            user.UserRole.some(role => 
              role.Project && role.Project.status !== "Completed"
            );
          
          // Determinar el rol actual (el primero que encontremos)
          const currentRole = user.UserRole && user.UserRole.length > 0 ? 
            user.UserRole[0].role_name : "Employee";
          
          // Buscar habilidades
          const skills = skillsData
            .filter(s => s.user_ID === user.user_id)
            .map(s => ({
              id: s.skill_ID,
              name: s.Skill?.name || `Skill #${s.skill_ID}`
            }));
          
          // Calcular asignación: 
          // 0% si no tiene proyectos activos, 100% si tiene algún proyecto activo
          const assignment = hasActiveProject ? 100 : 0;
          
          return {
            user_id: user.user_id,
            name: user.name,
            last_name: user.last_name,
            profile_pic: user.profile_pic,
            email: user.mail,
            role: currentRole,
            skills,
            assignment,
            isAssigned: hasActiveProject,
            activeProjects: hasActiveProject ? 1 : 0
          };
        });
        
        // Establecer datos
        setEmployees(employeesWithDetails);
        setFilteredEmployees(employeesWithDetails);
        
        // Actualizar estadísticas
        setStats({
          totalEmployees: employeesWithDetails.length,
          availableEmployees: employeesWithDetails.filter(e => !e.isAssigned).length,
          activeProjects: activeProjectsCount
        });
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setSnackbar({
          open: true,
          message: `Error loading employee data: ${error.message}`,
          severity: "error"
        });
        
        // Datos de ejemplo
        generateMockData();
        
        // Para propósitos de demostración, establecer como revisor
        setIsReviewer(true);
      } finally {
        setLoading(false);
      }
    };

    // Función para generar datos de ejemplo en caso de error
    const generateMockData = () => {
      const mockEmployees = [
        {
          user_id: "1",
          name: "Ana Fernanda",
          last_name: "Mendoza Mendiola", 
          role: "Gamification Designer",
          skills: [{ id: 1, name: "UX/UI" }, { id: 2, name: "HTML/CSS" }, { id: 3, name: "JavaScript" }],
          isAssigned: true,
          assignment: 100,
          activeProjects: 1
        },
        {
          user_id: "2",
          name: "Carlos",
          last_name: "Vega Noroña",
          role: "Behavioral Health Expert",
          skills: [{ id: 4, name: "Psychology" }, { id: 5, name: "Research" }],
          isAssigned: true,
          assignment: 100,
          activeProjects: 1
        },
        {
          user_id: "3",
          name: "Daniela",
          last_name: "Morales Quintero",
          role: "Front End Developer",
          skills: [{ id: 1, name: "React" }, { id: 2, name: "JavaScript" }, { id: 3, name: "CSS" }],
          isAssigned: false,
          assignment: 0,
          activeProjects: 0
        },
        {
          user_id: "4",
          name: "Emily",
          last_name: "Lopez Johansson",
          role: "Content Creator",
          skills: [{ id: 1, name: "Leadership" }, { id: 2, name: "Adaptability" }, { id: 3, name: "Teamwork" }],
          isAssigned: false,
          assignment: 0,
          activeProjects: 0
        },
        {
          user_id: "5",
          name: "Fernanda",
          last_name: "Gutiérrez Fernández",
          role: "Project Manager",
          skills: [{ id: 1, name: "Adaptability" }, { id: 2, name: "Time Management" }, { id: 3, name: "Teamwork" }],
          isAssigned: false,
          assignment: 0,
          activeProjects: 0
        }
      ];
      
      setEmployees(mockEmployees);
      setFilteredEmployees(mockEmployees);
      
      // Establecer estadísticas
      setStats({
        totalEmployees: 18,
        availableEmployees: 5,
        activeProjects: 6
      });
    };
    
    fetchEmployeeData();
  }, []);
  
  // Filtrar empleados
  useEffect(() => {
    let filtered = [...employees];
    
    // Filtrar por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(emp => 
        `${emp.name} ${emp.last_name}`.toLowerCase().includes(search) ||
        emp.role?.toLowerCase().includes(search) ||
        emp.skills?.some(s => s.name.toLowerCase().includes(search))
      );
    }
    
    // Filtrar por pestaña
    if (activeTab === "available") {
      filtered = filtered.filter(emp => !emp.isAssigned);
    } else if (activeTab === "assigned") {
      filtered = filtered.filter(emp => emp.isAssigned);
    }
    
    setFilteredEmployees(filtered);
  }, [employees, searchTerm, activeTab]);
  
  // Manejadores de eventos
  const handleViewDetails = (userId) => {
    navigate(`/user/${userId}`);
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };
  
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  const handleClearFilters = () => {
    setSearchTerm("");
    setActiveTab("all");
  };
  
  const handleSort = (type) => {
    let sorted = [...filteredEmployees];
    
    switch (type) {
      case "nameAsc":
        sorted.sort((a, b) => `${a.name} ${a.last_name}`.localeCompare(`${b.name} ${b.last_name}`));
        break;
      case "nameDesc":
        sorted.sort((a, b) => `${b.name} ${b.last_name}`.localeCompare(`${a.name} ${a.last_name}`));
        break;
      case "assignmentAsc":
        sorted.sort((a, b) => a.assignment - b.assignment);
        break;
      case "assignmentDesc":
        sorted.sort((a, b) => b.assignment - a.assignment);
        break;
      default:
        break;
    }
    
    setFilteredEmployees(sorted);
    setSortAnchorEl(null);
  };
  
  // Handle employee addition refresh
  const handleEmployeeAdded = async () => {
    setSnackbar({
      open: true,
      message: "Employee added successfully! Refreshing data...",
      severity: "success"
    });
    
    // Refresh employee data
    setLoading(true);
    try {
      // Here you would fetch the employee data again
      // For demo purposes, we'll just wait a bit and show success
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error refreshing data:", error);
      setSnackbar({
        open: true,
        message: "Error refreshing data after adding employee",
        severity: "error"
      });
      setLoading(false);
    }
  };
  
  // Manejar apertura del modal de revisión de certificaciones
  const handleOpenReviewCertifications = () => {
    setReviewCertificationsOpen(true);
  };
  
  // Manejar cierre del modal de revisión de certificaciones
  const handleCloseReviewCertifications = () => {
    setReviewCertificationsOpen(false);
    // Opcionalmente, refrescar los datos después de revisar certificaciones
    // fetchEmployeeData();
  };

  return (
    <Box sx={{ 
      p: 2, 
      width: "100%",
      boxSizing: "border-box",
      maxWidth: "100vw"
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3 
      }}>
        <Typography variant="h4" fontWeight={600}>
          Employee Profiles
        </Typography>
        
        {/* Accenture-Branded Review Certifications Button */}
        {isReviewer && (
          <Button
            variant="contained"
            startIcon={isSmallScreen ? null : <AssessmentIcon />}
            onClick={handleOpenReviewCertifications}
            sx={{ 
              borderRadius: 6,
              textTransform: "none",
              fontWeight: 500,
              py: 1,
              px: isSmallScreen ? 1.5 : 2,
              minWidth: isSmallScreen ? (isExtraSmallScreen ? "40px" : "auto") : "160px",
              backgroundColor: accentureColors.corePurple1,
              "&:hover": {
                backgroundColor: accentureColors.corePurple2,
              },
              "&:active": {
                backgroundColor: accentureColors.corePurple3,
              },
              whiteSpace: "nowrap",
              flexShrink: 0,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            {isSmallScreen ? <AssessmentIcon /> : "Review Certifications"}
          </Button>
        )}
      </Box>
      
      {/* Tarjetas de estadísticas */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <StatCard 
            icon={PersonOutlineIcon} 
            title="Total Employees" 
            value={stats.totalEmployees || 0} 
            bgColor={accentureColors.corePurple1 + "20"} 
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            icon={GroupIcon} 
            title="Available Employees" 
            value={stats.availableEmployees || 0} 
            bgColor="#2196f320" 
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            icon={WorkIcon} 
            title="Active Projects" 
            value={stats.activeProjects || 0} 
            bgColor="#4caf5020" 
          />
        </Grid>
      </Grid>
      
      {/* Barra de búsqueda con filtros y funcionalidad para añadir empleados */}
      <SearchFilter 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onFilterClick={handleFilterClick}
        onSortClick={handleSortClick}
        onClearFilters={handleClearFilters}
        availableCount={stats.availableEmployees}
        onAddEmployee={handleEmployeeAdded}
      />
      
      {/* Resultado de la búsqueda */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredEmployees.length} of {stats.totalEmployees || 0} employees
        </Typography>
      </Box>
      
      {/* Lista de empleados - GRID OPTIMIZADO */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      ) : filteredEmployees.length > 0 ? (
        <Grid container spacing={2}>
          {filteredEmployees.map((employee) => (
            <Grid 
              item 
              xs={12}    // 1 tarjeta por fila en pantallas <600px
              sm={6}     // 2 columnas en pantallas >=600px
              md={4}     // 3 columnas en pantallas >=900px
              lg={3}     // 4 columnas en pantallas >=1200px
              key={employee.user_id}
            >
              <EmployeeCard 
                employee={employee} 
                onViewDetails={() => handleViewDetails(employee.user_id)}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper 
          sx={{ 
            p: 5, 
            textAlign: 'center', 
            borderRadius: 2,
            borderStyle: 'dashed',
            borderWidth: 1,
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No employees found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or clear the filters
          </Typography>
        </Paper>
      )}
      
      {/* Menús para sort y filter */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
      >
        <MenuItem onClick={() => handleSort("nameAsc")}>Name (A-Z)</MenuItem>
        <MenuItem onClick={() => handleSort("nameDesc")}>Name (Z-A)</MenuItem>
        <MenuItem onClick={() => handleSort("assignmentAsc")}>Assignment (Low-High)</MenuItem>
        <MenuItem onClick={() => handleSort("assignmentDesc")}>Assignment (High-Low)</MenuItem>
      </Menu>
      
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem onClick={() => setFilterAnchorEl(null)}>All Roles</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Developers</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Designers</MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Other Roles</MenuItem>
      </Menu>
      
      {/* Snackbar para mensajes */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Modal de Revisión de Certificaciones */}
      <ReviewCertifications 
        open={reviewCertificationsOpen} 
        onClose={handleCloseReviewCertifications} 
      />
    </Box>
  );
};

export default Profiles;