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
} from "@mui/material";

import { NavLink } from "react-router-dom";

import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [prevActiveItem, setPrevActiveItem] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [rippleActive, setRippleActive] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

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
    setExpanded(!expanded);
  };

  // Simula como se ven las notis jijiji
  const handleNotificationClick = () => {
    if (notificationCount > 0) {
      setNotificationCount(notificationCount - 1);
    }
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, route: "/" },
    { text: "Projects", icon: <FolderIcon />, route: "/projects" },
    { text: "Profiles", icon: <PeopleIcon />, route: "/profiles" },
    { text: "Analytics", icon: <BarChartIcon />, route: "/analytics" },
    { text: "Settings", icon: <SettingsIcon />, route: "/settings" },
  ];

  const primaryColor = "#973EBC";
  const primaryLight = alpha(primaryColor, 0.15);
  const primaryDark = "#7b2e9e";

  const bgColor = darkMode ? "#1a1a2e" : "#f5f7fa";
  const navBgColor = darkMode ? "#262642" : "white";
  const borderColor = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const textColor = darkMode ? "white" : "#333";
  const secondaryTextColor = darkMode ? "rgba(255,255,255,0.7)" : "#666";

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
      {/* Barra superior */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1,
          px: 3,
          height: "60px",
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 5 }}>
          {/* Logo */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              transition: "all 0.5s ease",
            }}
          >
            {isMobile && (
              <IconButton
                sx={{
                  color: primaryColor,
                  mr: 1,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    color: primaryDark,
                    transform: "scale(1.05)",
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}

            <Box
              component="img"
              src="/src/brand/AccenturePurpleLogo.png"
              alt="Logo"
              sx={{
                height: 30,
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "scale(1.05) rotate(2deg)",
                },
              }}
            />

            {/* Nombre de la aplicación con animación refinada */}
            <Box
              sx={{
                overflow: "hidden",
                maxWidth: expanded ? "180px" : "0px",
                opacity: expanded ? 1 : 0,
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                ml: expanded ? 2 : 0,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: primaryColor,
                  fontFamily: '"Graphik", "Arial", sans-serif',
                  whiteSpace: "nowrap",
                  display: { xs: "none", sm: "block" },
                  transition: "all 0.3s ease",
                }}
              >
                PathExplorer
              </Typography>
            </Box>
          </Box>

          {/* Botón para expandir/contraer el menú con animación mejorada */}
          <IconButton
            onClick={toggleSidebar}
            size="small"
            sx={{
              color: primaryColor,
              bgcolor: alpha(primaryColor, 0.08),
              width: 36,
              height: 36,
              borderRadius: "8px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden",
              "&:hover": {
                bgcolor: alpha(primaryColor, 0.15),
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
                background: `radial-gradient(circle at center, ${alpha(
                  primaryColor,
                  0.2
                )} 0%, transparent 70%)`,
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
                transform: expanded ? "rotate(-180deg)" : "rotate(0deg)",
                transition:
                  "transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)", // Rebote suave
              }}
            >
              {expanded ? <ChevronLeftIcon /> : <MenuIcon />}
            </Box>
          </IconButton>
        </Box>

        {/* Lado derecho: acciones (modo oscuro, notificaciones, avatar) */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Botón de modo oscuro/claro con animación mejorada */}
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

          {/* Notificaciones con animación mejorada y badge dinámico */}
          <IconButton
            onClick={handleNotificationClick}
            size="small"
            sx={{
              color: secondaryTextColor,
              bgcolor: darkMode
                ? alpha("#ffffff", 0.1)
                : alpha("#000000", 0.08),
              width: 36,
              height: 36,
              borderRadius: "8px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden",
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

          {/* Avatar con efectos mejorados */}
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
            />
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexGrow: 1, pt: "60px" }}>
        {/* Barra lateral con navegación (puede expandirse o contraerse) */}
        <Box
          component="nav"
          sx={{
            width: expanded ? "200px" : "80px",
            height: "calc(100vh - 60px)",
            bgcolor: navBgColor,
            borderRight: "1px solid",
            borderColor: borderColor,
            position: "relative",
            zIndex: 1000,
            overflow: "hidden",
            transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: expanded ? `2px 0 15px ${alpha("#000", 0.05)}` : "none",
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
          <List
            sx={{
              p: 1.5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: "100%",
            }}
          >
            {menuItems.map((item) => (
              <Tooltip
                title={expanded ? "" : item.text}
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
                  onClick={() => setActiveItem(item.text)}
                  onMouseEnter={() => setHoveredItem(item.text)}
                  onMouseLeave={() => setHoveredItem(null)}
                  sx={{
                    py: 1.5,
                    px: expanded ? 2 : 0,
                    mb: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: expanded ? "flex-start" : "center",
                    borderRadius: "10px",
                    bgcolor:
                      activeItem === item.text ? primaryColor : "transparent",
                    color: activeItem === item.text ? "white" : "inherit",
                    boxShadow:
                      activeItem === item.text
                        ? `0 4px 10px ${alpha(primaryColor, 0.3)}`
                        : "none",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform:
                      hoveredItem === item.text && activeItem !== item.text
                        ? "translateY(-3px)"
                        : "translateY(0)",
                    position: "relative",
                    overflow: "hidden",
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
                    ...(expanded
                      ? {}
                      : {
                          width: "48px",
                          height: "48px",
                          minWidth: "48px",
                          minHeight: "48px",
                          marginLeft: "auto",
                          marginRight: "auto",
                        }),
                  }}
                >
                  {/* Ripple Effect if active */}
                  {activeItem === item.text && rippleActive && (
                    <RippleEffect active={rippleActive} />
                  )}

                  <ListItemIcon
                    sx={{
                      minWidth: expanded ? 36 : 0,
                      mr: expanded ? 2 : 0,
                      color:
                        activeItem === item.text ? "white" : secondaryTextColor,
                      justifyContent: expanded ? "flex-start" : "center",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
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
                      }}
                    >
                      {item.icon}
                    </Box>
                  </ListItemIcon>

                  {expanded && (
                    <ListItemText
                      primary={item.text}
                      sx={{
                        ml: 0.5,
                        transform: expanded
                          ? "translateX(0)"
                          : "translateX(-10px)",
                        opacity: expanded ? 1 : 0,
                        transition:
                          "opacity 0.3s ease 0.1s, transform 0.3s ease",
                        "& .MuiTypography-root": {
                          fontSize: "0.95rem",
                          fontWeight: activeItem === item.text ? 600 : 500,
                          color:
                            activeItem === item.text
                              ? "white"
                              : darkMode
                              ? alpha("#ffffff", 0.1)
                              : "#444",
                          fontFamily: '"Palanquin", "Arial", sans-serif',
                          transition: "all 0.3s ease",
                          letterSpacing:
                            activeItem === item.text ? "0.3px" : "normal",
                        },
                      }}
                    />
                  )}
                </ListItem>
              </Tooltip>
            ))}
          </List>
        </Box>

        {/* Contenido principal con transición más suave */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: "calc(100vh - 60px)",
            overflow: "auto",
            bgcolor: bgColor,
            color: textColor,
            p: 3,
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
