// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  IconButton,
  Typography,
  Tooltip,
  Zoom,
  useMediaQuery,
  useTheme,
  alpha,
  Drawer,
  SwipeableDrawer,
} from "@mui/material";

import { NavLink, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";

import SchoolIcon from "@mui/icons-material/School";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";

import ExploreIcon from "@mui/icons-material/Explore";

import NotificationsIcon from "@mui/icons-material/Notifications";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import LogoutIcon from "@mui/icons-material/Logout";
import { supabase } from "../supabase/supabaseClient";

import AccentureLogo from "../brand/AccenturePurpleLogo.png";
import Loading from "./Loading";

const RippleEffect = ({ active }) => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: active ? "120%" : "0%",
        height: active ? "120%" : "0%",
        borderRadius: "50%",
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        opacity: active ? 0 : 0.5,
        transition: "all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)",
        pointerEvents: "none",
      }}
    />
  );
};

const Navbar = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const isXsScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [prevActiveItem, setPrevActiveItem] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [expanded, setExpanded] = useState(!isMobile); // Colapsa por defecto en móvil
  const [mobileOpen, setMobileOpen] = useState(false); // Estado para el drawer móvil
  const [hoveredItem, setHoveredItem] = useState(null);
  const [rippleActive, setRippleActive] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("Dashboard");
  const navBgColor = darkMode ? "#222" : "#fff";
  const [userName, setUserName] = useState("");

  // Actualizar el estado de expansión cuando cambie el tamaño de la pantalla
  useEffect(() => {
    if (isMobile && expanded) {
      setExpanded(false);
    } else if (!isMobile && !expanded && !mobileOpen) {
      // Solo expandir automáticamente si estamos pasando de móvil a desktop
      setExpanded(true);
    }
  }, [isMobile]);

  useEffect(() => {
    // Obtener información del usuario cuando se carga el componente
    const fetchUserInfo = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("User")
          .select("name")
          .eq("user_id", user.id)
          .single();

        if (!error && data) {
          setUserName(data.name);
        }
      }
    };

    fetchUserInfo();
  }, [user]);

  // Determinar el elemento activo basado en la ruta actual
  useEffect(() => {
    const path = location.pathname;

    if (path === "/" || path === "") {
      setActiveItem("Dashboard");
    } else {
      // Obtener el nombre del elemento del menú basado en la ruta
      const menuItem = menuItems.find(
        (item) => item.route === path || path.startsWith(item.route + "/")
      );
      if (menuItem) {
        setActiveItem(menuItem.text);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    if (prevActiveItem !== activeItem && prevActiveItem !== null) {
      setRippleActive(true);
      const timer = setTimeout(() => {
        setRippleActive(false);
      }, 800);
      return () => clearTimeout(timer);
    }
    setPrevActiveItem(activeItem);
  }, [activeItem, prevActiveItem]);

  const toggleThemeMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setExpanded(!expanded);
    }
  };

  const handleNotificationClick = () => {
    if (notificationCount > 0) {
      setNotificationCount(notificationCount - 1);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Definir items del menú basados en el rol
  const getMenuItems = () => {
    // Elementos base que todos los usuarios pueden ver
    const baseItems = [
      { text: "Dashboard", icon: <DashboardIcon />, route: "/" },
      { text: "Projects", icon: <FolderIcon />, route: "/projects" },
      { text: "My Path", icon: <ExploreIcon />, route: "/mypath" },
      {
        text: "Certifications",
        icon: <SchoolIcon />,
        route: "/certifications",
      },
    ];

    // Elementos adicionales según el rol
    if (role === "manager") {
      return [
        ...baseItems,
        { text: "Profiles", icon: <PeopleIcon />, route: "/profiles" },
        { text: "Analytics", icon: <BarChartIcon />, route: "/analytics" },
      ];
    } else if (role === "TFS") {
      return [
        ...baseItems,
        { text: "Profiles", icon: <PeopleIcon />, route: "/profiles" },
      ];
    }

    // Por defecto, devolver solo los elementos base (empleado)
    return baseItems;
  };

  const menuItems = getMenuItems();

  const primaryColor = "#973EBC";
  const primaryLight = alpha(primaryColor, 0.15);
  const primaryDark = "#7b2e9e";
  const bgColor = darkMode ? "#1a1a2e" : "#f5f7fa";
  const borderColor = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const textColor = darkMode ? "white" : "#333";
  const secondaryTextColor = darkMode ? "rgba(255,255,255,0.7)" : "#666";

  if (loading) {
    return <Loading />;
  }

  // Lista de navegación que se comparte entre la barra lateral normal y la versión móvil
  const navList = (
    <List
      sx={{
        p: 1.8,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start", // Alineación a la izquierda
        height: "100%",
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative", // Para que los hijos absolutos se posicionen respecto a esta lista
        width: "100%",
      }}
    >
      {menuItems.map((item) => (
        <Tooltip
          title={expanded || isMobile ? "" : item.text}
          placement="right"
          TransitionComponent={Zoom}
          arrow
          key={item.text}
        >
          <ListItem
            button
            component={NavLink}
            to={item.route}
            selected={activeItem === item.text}
            onClick={() => {
              setActiveItem(item.text);
              if (isMobile) {
                setMobileOpen(false);
              }
            }}
            end={item.route === "/"}
            onMouseEnter={() => setHoveredItem(item.text)}
            onMouseLeave={() => setHoveredItem(null)}
            sx={{
              height: "56px", // Altura fija para items del menú
              minHeight: "56px",
              width: expanded || isMobile ? "100%" : "60px", // Ancho del 100% cuando está expandido
              py: 0,
              px: 1,
              mb: 1.8,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start", // Alineación a la izquierda
              borderRadius: "10px",
              bgcolor: activeItem === item.text ? primaryColor : "transparent",
              color: activeItem === item.text ? "white" : "inherit",
              boxShadow:
                activeItem === item.text
                  ? `0 4px 10px ${alpha(primaryColor, 0.3)}`
                  : "none",
              transition:
                "all 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              transform:
                hoveredItem === item.text && activeItem !== item.text
                  ? "translateY(-3px)"
                  : "translateY(0)",
              position: "relative",
              overflow: "hidden", // Ocultar desbordamiento
              zIndex: 10,
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)",
                opacity: activeItem === item.text ? 1 : 0,
                transition: "opacity 0.3s ease",
                pointerEvents: "none",
              },
              "&:hover": {
                bgcolor:
                  activeItem === item.text
                    ? primaryColor
                    : darkMode
                    ? alpha("#ffffff", 0.1)
                    : alpha("#000000", 0.08),
                boxShadow:
                  activeItem === item.text
                    ? `0 6px 15px ${alpha(primaryColor, 0.35)}`
                    : hoveredItem === item.text
                    ? `0 4px 8px ${alpha("#000", 0.1)}`
                    : "none",
              },
            }}
          >
            {/* Ripple Effect if active */}
            {activeItem === item.text && rippleActive && (
              <RippleEffect active={rippleActive} />
            )}

            <ListItemIcon
              sx={{
                minWidth: 42,
                width: 42,
                height: 42,
                color: activeItem === item.text ? "white" : secondaryTextColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
            >
              <Box
                sx={{
                  transform:
                    hoveredItem === item.text && activeItem !== item.text
                      ? "scale(1.15)"
                      : activeItem === item.text
                      ? "scale(1.1)"
                      : "scale(1)",
                  transition:
                    "transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "24px",
                  height: "24px",
                }}
              >
                {item.icon}
              </Box>
            </ListItemIcon>

            {/* Texto del menú dentro del ListItem */}
            <ListItemText
              primary={item.text}
              sx={{
                ml: 1.5,
                opacity: expanded || isMobile ? 1 : 0,
                transition: "opacity 0.3s ease",
                "& .MuiTypography-root": {
                  fontSize: "1rem",
                  fontWeight: activeItem === item.text ? 600 : 500,
                  color:
                    activeItem === item.text
                      ? "white"
                      : darkMode
                      ? "rgba(255, 255, 255, 0.7)"
                      : "#444",
                  fontFamily: '"Palanquin", "Arial", sans-serif',
                  transition: "all 0.3s ease",
                  letterSpacing: activeItem === item.text ? "0.3px" : "normal",
                },
                whiteSpace: "nowrap",
              }}
            />
          </ListItem>
        </Tooltip>
      ))}
    </List>
  );

  // Vista para móvil: SwipeableDrawer
  const mobileDrawer = (
    <SwipeableDrawer
      open={mobileOpen}
      onOpen={() => setMobileOpen(true)}
      onClose={() => setMobileOpen(false)}
      variant="temporary"
      ModalProps={{ keepMounted: true }} // Mejor rendimiento en móvil
      sx={{
        display: { xs: "block", sm: "none" },
        "& .MuiDrawer-paper": {
          width: "230px",
          backgroundColor: navBgColor,
          pt: "60px", // Espacio para la barra superior
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      }}
    >
      {navList}
    </SwipeableDrawer>
  );

  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        bgcolor: bgColor,
        transition: "background-color 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Barra superior con altura fija */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 0,
          px: { xs: 2, sm: 3 }, // Padding horizontal más pequeño en móvil
          height: "60px", // Altura fija para la barra superior
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bgcolor: navBgColor,
          borderBottom: "1px solid",
          borderColor: borderColor,
          zIndex: 1100,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Lado izquierdo: Logo y botón de expandir */}
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            height: "60px",
            pl: expanded && !isMobile ? 26 : 6,
            position: "relative",
            width: expanded && !isMobile ? "230px" : "80px",
            transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: "visible",
          }}
        >
          {/* Logo siempre visible */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "70px",
              position: "absolute",
              left: 5,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
            }}
          >
            <Box
              component="img"
              src={AccentureLogo}
              alt="Logo"
              sx={{
                height: 30,
                width: "auto",
                minWidth: 30,
                objectFit: "contain",
                position: "relative",
                zIndex: 10,
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "scale(1.05) rotate(2deg)",
                },
              }}
            />
          </Box>

          {/* Título que aparece/desaparece */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: primaryColor,
              fontFamily: '"Graphik", "Arial", sans-serif',
              whiteSpace: "nowrap",
              opacity: expanded && !isMobile ? 1 : 0,
              visibility: expanded && !isMobile ? "visible" : "hidden", // Asegura que el texto esté oculto cuando está retraído
              transform:
                expanded && !isMobile ? "translateX(0)" : "translateX(-20px)", // Animación de movimiento horizontal
              transition: "opacity 0.2s ease, transform 0.3s ease",
              ml: 3,
              position: "absolute",
              left: "30px", // Posicionado después del logo
              display: { xs: "none", sm: "block" }, // Ocultar en móvil
            }}
          >
            PathExplorer
          </Typography>

          {/* Botón para expandir/contraer el menú con tamaño fijo */}
          <IconButton
            onClick={toggleSidebar}
            size="small"
            sx={{
              color: primaryColor,
              bgcolor: alpha(primaryColor, 0.08),
              width: 36,
              height: 36,
              minWidth: 36,
              minHeight: 36,
              borderRadius: "8px",
              transition: "all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
              position: "relative",
              overflow: "hidden",
              ml: expanded && !isMobile ? 2 : 2,
              transform:
                expanded && !isMobile ? "translateX(0)" : "translateX(-8px)",
              "&:hover": {
                bgcolor: alpha(primaryColor, 0.15),
                transform:
                  expanded && !isMobile
                    ? "translateX(0) scale(1.05)"
                    : "translateX(-8px) scale(1.05)",
                transition: "all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                transform:
                  (expanded && !isMobile) || mobileOpen
                    ? "rotate(-180deg)"
                    : "rotate(0deg)",
                transition: "transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              {(expanded && !isMobile) || mobileOpen ? (
                <ChevronLeftIcon />
              ) : (
                <MenuIcon />
              )}
            </Box>
          </IconButton>
        </Box>

        {/* Lado derecho: acciones (modo oscuro, notificaciones, avatar) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2 }, // Menos espacio entre elementos en móvil
            height: "60px",
          }}
        >
          {/* Nombre de usuario - Oculto en pantallas muy pequeñas */}
          {userName && (
            <Typography
              variant="body2"
              sx={{
                color: textColor,
                fontWeight: 500,
                mr: 1,
                display: { xs: "none", md: "block" }, // Ocultar en pantallas pequeñas y móviles
              }}
            >
              Hola, {userName}
            </Typography>
          )}

          {/* Botón de modo oscuro/claro - Siempre visible */}
          <IconButton
            onClick={toggleThemeMode}
            size="small"
            sx={{
              color: secondaryTextColor,
              bgcolor: darkMode
                ? alpha("#ffffff", 0.05)
                : alpha("#000000", 0.05),
              width: 36,
              height: 36,
              minWidth: 36,
              minHeight: 36,
              borderRadius: "8px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              overflow: "hidden",
              position: "relative",
              "&:hover": {
                bgcolor: darkMode
                  ? alpha("#ffffff", 0.1)
                  : alpha("#000000", 0.08),
                transform: "scale(1.05)",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0,
                transition: "opacity 0.3s ease",
                background: `radial-gradient(circle at center, ${
                  darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"
                } 0%, rgba(0,0,0,0) 70%)`,
                pointerEvents: "none",
              },
              "&:active::after": {
                opacity: 1,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: darkMode ? "rotate(180deg)" : "rotate(0deg)",
                transition:
                  "transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
              }}
            >
              {darkMode ? (
                <Brightness7Icon fontSize="small" />
              ) : (
                <Brightness4Icon fontSize="small" />
              )}
            </Box>
          </IconButton>

          {/* Notificaciones - Ocultar en pantallas muy pequeñas */}
          <IconButton
            onClick={handleNotificationClick}
            size="small"
            sx={{
              color: secondaryTextColor,
              bgcolor: darkMode
                ? alpha("#ffffff", 0.05)
                : alpha("#000000", 0.05),
              width: 36,
              height: 36,
              minWidth: 36,
              minHeight: 36,
              borderRadius: "8px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden",
              display: { xs: isXsScreen ? "none" : "flex", sm: "flex" }, // Ocultar en pantallas muy pequeñas
              "&:hover": {
                bgcolor: darkMode
                  ? alpha("#ffffff", 0.1)
                  : alpha("#000000", 0.08),
                transform: "scale(1.05)",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0,
                transition: "opacity 0.3s ease",
                background: `radial-gradient(circle at center, ${
                  darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"
                } 0%, transparent 70%)`,
                pointerEvents: "none",
              },
              "&:active::after": {
                opacity: 1,
              },
            }}
          >
            <Badge
              badgeContent={notificationCount}
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  transition: "all 0.3s ease",
                  transform: "scale(1) translate(25%, -25%)",
                  transformOrigin: "100% 0%",
                  animation:
                    notificationCount > 0 ? "pulse 2s infinite" : "none",
                  "@keyframes pulse": {
                    "0%": {
                      boxShadow: "0 0 0 0 rgba(255, 59, 48, 0.7)",
                    },
                    "70%": {
                      boxShadow: "0 0 0 5px rgba(255, 59, 48, 0)",
                    },
                    "100%": {
                      boxShadow: "0 0 0 0 rgba(255, 59, 48, 0)",
                    },
                  },
                },
              }}
            >
              <NotificationsIcon fontSize="small" />
            </Badge>
          </IconButton>

          {/* Botón de cerrar sesión - Siempre visible */}
          <Tooltip title="Cerrar sesión" arrow TransitionComponent={Zoom}>
            <IconButton
              onClick={handleLogout}
              size="small"
              sx={{
                color: secondaryTextColor,
                bgcolor: darkMode
                  ? alpha("#ffffff", 0.05)
                  : alpha("#000000", 0.05),
                width: 36,
                height: 36,
                minWidth: 36,
                minHeight: 36,
                borderRadius: "8px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  bgcolor: darkMode
                    ? alpha("#ffffff", 0.1)
                    : alpha("#000000", 0.08),
                  transform: "scale(1.05)",
                  color: "error.main",
                },
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Avatar - Siempre visible */}
          <NavLink to="/User" style={{ textDecoration: "none" }}>
            <Tooltip title="Usuario" arrow TransitionComponent={Zoom}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: primaryColor,
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: `0 2px 8px ${alpha(primaryColor, 0.3)}`,
                  border: "2px solid transparent",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: `0 4px 12px ${alpha(primaryColor, 0.4)}`,
                    border: "2px solid white",
                  },
                }}
              >
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </Avatar>
            </Tooltip>
          </NavLink>
        </Box>
      </Box>

      {/* Drawer para móvil */}
      {mobileDrawer}

      <Box sx={{ display: "flex", flexGrow: 1, pt: "60px" }}>
        {/* Barra lateral con navegación (para tablets y desktop) */}
        <Box
          component="nav"
          sx={{
            flexShrink: 0,
            width: expanded ? "230px" : "90px",
            height: "calc(100vh - 60px)",
            bgcolor: navBgColor,
            borderRight: "1px solid",
            borderColor: borderColor,
            position: "relative",
            zIndex: 1000,
            overflow: "hidden",
            transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: expanded ? `2px 0 15px ${alpha("#000", 0.05)}` : "none",
            display: { xs: "none", sm: "block" }, // Ocultar en móvil
            "&:after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "80px", // Ancho cuando está retraído
              bottom: 0,
              width: expanded ? "120px" : 0,
              backgroundColor: "inherit",
              transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: 1,
            },
            "&:hover": {
              boxShadow: `2px 0 15px ${alpha("#000", 0.08)}`,
            },
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: alpha("#000", 0.2),
              borderRadius: "10px",
            },
          }}
        >
          {navList}
        </Box>

        {/* Contenido principal */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: "calc(100vh - 60px)",
            overflow: "auto",
            bgcolor: bgColor,
            color: textColor,
            p: { xs: 2, sm: 3 }, // Padding más pequeño en móvil
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            "&::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: alpha("#000", darkMode ? 0.1 : 0.03),
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: alpha("#000", darkMode ? 0.3 : 0.15),
              borderRadius: "4px",
              "&:hover": {
                background: alpha("#000", darkMode ? 0.4 : 0.25),
              },
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Navbar;
