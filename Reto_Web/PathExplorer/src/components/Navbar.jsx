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
  Button,
  Divider
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

import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import UpdateIcon from '@mui/icons-material/Update';
import RateReviewIcon from '@mui/icons-material/RateReview';
import MessageIcon from '@mui/icons-material/Message';
import { Popover } from "@mui/material";

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
  const [expanded, setExpanded] = useState(!isMobile); // Collapsed by default on mobile
  const [mobileOpen, setMobileOpen] = useState(false); // State for mobile drawer
  const [hoveredItem, setHoveredItem] = useState(null);
  const [rippleActive, setRippleActive] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("Dashboard");
  const navBgColor = darkMode ? "#222" : "#fff";
  const [userName, setUserName] = useState("");

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  const getIconByType = (type) => {
    switch (type) {
      case "task": return <AssignmentIcon fontSize="small" />;
      case "event": return <EventIcon fontSize="small" />;
      case "update": return <UpdateIcon fontSize="small" />;
      case "review": return <RateReviewIcon fontSize="small" />;
      case "message": return <MessageIcon fontSize="small" />;
      case "project": return <FolderIcon fontSize="small" />;
      case "certification": return <SchoolIcon fontSize="small" />;
      case "course": return <WorkspacePremiumIcon fontSize="small" />;
      case "path": return <ExploreIcon fontSize="small" />;
      default: return null;
    }
  };

  // Update expansion state when screen size changes
  useEffect(() => {
    if (isMobile && expanded) {
      setExpanded(false);
    } else if (!isMobile && !expanded && !mobileOpen) {
      // Only auto-expand when switching from mobile to desktop
      setExpanded(true);
    }
  }, [isMobile]);

  useEffect(() => {
    // Get user info when component loads
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

  // Fetch project notifications - only for projects the user is assigned to
  useEffect(() => {
    const fetchProjectNotifications = async () => {
      if (!user) return;
      
      // First, get the projects the user is assigned to
      const { data: userRoles, error: userRolesError } = await supabase
        .from("UserRole")
        .select("project_id")
        .eq("user_id", user.id);

      if (userRolesError || !userRoles || userRoles.length === 0) {
        return;
      }

      // Extract project IDs the user is assigned to
      const userProjectIds = userRoles.map(role => role.project_id);

      // Fetch only assigned projects that are active
      const { data: projectsData, error } = await supabase
        .from("Project")
        .select("projectID, title, status, progress, end_date")
        .in("projectID", userProjectIds)
        .in("status", ["In Progress", "On Hold"]);

      if (!error && projectsData) {
        const notifs = projectsData.map((project) => {
          const endDate = new Date(project.end_date);
          const timeRemaining = endDate - new Date();
          const daysRemaining = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
          
          // Create notification only if deadline is within 10 days
          if (daysRemaining >= 0 && daysRemaining <= 10) {
            return {
              id: `project-${project.projectID}`,
              text: `Project: ${project.title} - ${daysRemaining} days until deadline`,
              type: "project",
              read: false,
              date: new Date(),
              priority: daysRemaining <= 3 ? "high" : "medium",
              entityId: project.projectID
            };
          }
          return null;
        }).filter(Boolean); // Remove null entries

        setNotifications(prev => {
          // Filter out any existing project notifications to avoid duplicates
          const filteredPrev = prev.filter(n => !n.id.startsWith('project-'));
          return [...filteredPrev, ...notifs];
        });
      }
    };

    fetchProjectNotifications();
    const interval = setInterval(fetchProjectNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch certification notifications - only for certifications about to expire
  useEffect(() => {
    const fetchCertificationNotifications = async () => {
      if (!user) return;
      
      // Get the user's certifications that are about to expire
      const { data: userCerts, error: userCertsError } = await supabase
        .from("UserCertifications")
        .select("certification_ID, valid_Until")
        .eq("user_ID", user.id);

      if (userCertsError || !userCerts || userCerts.length === 0) {
        return;
      }

      // Filter for certifications expiring within 30 days
      const expiringCerts = userCerts.filter(cert => {
        const validUntil = new Date(cert.valid_Until);
        const today = new Date();
        const daysRemaining = Math.floor((validUntil - today) / (24 * 60 * 60 * 1000));
        return daysRemaining >= 0 && daysRemaining <= 30;
      });

      if (expiringCerts.length === 0) {
        return;
      }

      // Get certification details
      const { data: certsData } = await supabase
        .from("Certifications")
        .select("certification_id, title")
        .in("certification_id", expiringCerts.map(c => c.certification_ID));

      if (certsData && certsData.length > 0) {
        const notifs = certsData.map(cert => {
          const userCert = expiringCerts.find(uc => uc.certification_ID === cert.certification_id);
          const validUntil = new Date(userCert.valid_Until);
          const daysRemaining = Math.floor((validUntil - new Date()) / (24 * 60 * 60 * 1000));
          
          return {
            id: `cert-${cert.certification_id}`,
            text: `Certification: ${cert.title} expires in ${daysRemaining} days`,
            type: "certification",
            read: false,
            date: new Date(),
            priority: daysRemaining <= 7 ? "high" : "medium",
            entityId: cert.certification_id
          };
        });

        setNotifications(prev => {
          // Remove existing certification notifications
          const filteredPrev = prev.filter(n => !n.id.startsWith('cert-'));
          return [...filteredPrev, ...notifs];
        });
      }
    };

    // Initial fetch
    fetchCertificationNotifications();
    
    // Fetch every 6 hours (we don't need to check this as often)
    const interval = setInterval(fetchCertificationNotifications, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Optional: Add course notifications if needed
  useEffect(() => {
    // Commenting out Course notifications as the table doesn't exist
    // const fetchCourseNotifications = async () => {
    //   if (!user) return;
      
    //   // Get recently added courses (last 7 days)
    //   const oneWeekAgo = new Date();
    //   oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
    //   const { data: courses } = await supabase
    //     .from("Course")
    //     .select("title, created_at")
    //     .gte("created_at", oneWeekAgo.toISOString())
    //     .order("created_at", { ascending: false })
    //     .limit(3);
        
    //   if (courses && courses.length > 0) {
    //     const notifs = courses.map(course => ({
    //       id: `course-${course.title}`,
    //       text: `New course available: ${course.title}`,
    //       type: "course",
    //       read: false,
    //       date: new Date(course.created_at),
    //       priority: "low",
    //     }));
        
    //     setNotifications(prev => {
    //       // Remove existing course notifications
    //       const filteredPrev = prev.filter(n => !n.id.startsWith('course-'));
    //       return [...filteredPrev, ...notifs];
    //     });
    //   }
    // };
    
    // fetchCourseNotifications();
  }, [user]);

  // Determine active item based on current route
  useEffect(() => {
    const path = location.pathname;

    if (path === "/" || path === "") {
      setActiveItem("Dashboard");
    } else {
      // Get menu item name based on route
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Define menu items based on role
  const getMenuItems = () => {
    // Base items all users can see
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

    // Additional items based on role
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

    // Default, return only base items (employee)
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

  // Navigation list shared between sidebar and mobile version
  const navList = (
    <List
      sx={{
        p: 1.8,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start", // Left alignment
        height: "100%",
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative", // For absolute child positioning
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
              height: "56px", // Fixed height for menu items
              minHeight: "56px",
              width: expanded || isMobile ? "100%" : "60px", // 100% width when expanded
              py: 0,
              px: 1,
              mb: 1.8,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start", // Left alignment
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
              overflow: "hidden", // Hide overflow
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

            {/* Menu text within ListItem */}
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

  // Mobile view: SwipeableDrawer
  const mobileDrawer = (
    <SwipeableDrawer
      open={mobileOpen}
      onOpen={() => setMobileOpen(true)}
      onClose={() => setMobileOpen(false)}
      variant="temporary"
      ModalProps={{ keepMounted: true }} // Better performance on mobile
      sx={{
        display: { xs: "block", sm: "none" },
        "& .MuiDrawer-paper": {
          width: "230px",
          backgroundColor: navBgColor,
          pt: "60px", // Space for top bar
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
      {/* Top bar with fixed height */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 0,
          px: { xs: 2, sm: 3 }, // Smaller horizontal padding on mobile
          height: "60px", // Fixed height for top bar
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
        {/* Left side: Logo and expand button */}
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
          {/* Always visible logo */}
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

          {/* Title that appears/disappears */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: primaryColor,
              fontFamily: '"Graphik", "Arial", sans-serif',
              whiteSpace: "nowrap",
              opacity: expanded && !isMobile ? 1 : 0,
              visibility: expanded && !isMobile ? "visible" : "hidden", // Ensure text is hidden when retracted
              transform:
                expanded && !isMobile ? "translateX(0)" : "translateX(-20px)", // Horizontal movement animation
              transition: "opacity 0.2s ease, transform 0.3s ease",
              ml: 3,
              position: "absolute",
              left: "30px", // Positioned after logo
              display: { xs: "none", sm: "block" }, // Hide on mobile
            }}
          >
            PathExplorer
          </Typography>

          {/* Button to expand/collapse menu with fixed size */}
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

        {/* Right side: actions (dark mode, notifications, avatar) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2 }, // Less space between items on mobile
            height: "60px",
          }}
        >
          {/* Username - Hidden on very small screens */}
          {userName && (
            <Typography
              variant="body2"
              sx={{
                color: textColor,
                fontWeight: 500,
                mr: 1,
                display: { xs: "none", md: "block" }, // Hide on small screens and mobile
              }}
            >
              Hello, {userName}
            </Typography>
          )}

          {/* Dark mode/light mode button - Always visible */}
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

          {/* Simplified notification button */}
          <IconButton
            onClick={(e) => setNotifAnchorEl(e.currentTarget)}
            size="small"
            sx={{
              color: unreadCount > 0 ? primaryColor : secondaryTextColor,
              bgcolor: darkMode ? alpha("#ffffff", 0.05) : alpha("#000000", 0.05),
              width: 36,
              height: 36,
              borderRadius: "8px",
              "&:hover": {
                bgcolor: darkMode ? alpha("#ffffff", 0.1) : alpha("#000000", 0.08),
              },
            }}
          >
            <Badge
              badgeContent={unreadCount}
              color="error"
              overlap="circular"
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <NotificationsIcon fontSize="small" />
            </Badge>
          </IconButton>

          {/* Simplified Notification Popover */}
          <Popover
            open={Boolean(notifAnchorEl)}
            anchorEl={notifAnchorEl}
            onClose={() => setNotifAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              sx: {
                mt: 1.5,
                width: 320,
                borderRadius: 2,
                boxShadow: 3,
              },
            }}
          >
            {/* Header */}
            <Box sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              px: 2, 
              py: 1.5,
              borderBottom: 1,
              borderColor: "divider"
            }}>
              <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600 }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Box sx={{ 
                  bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 10,
                  fontSize: "0.75rem",
                  fontWeight: 500
                }}>
                  {unreadCount} unread
                </Box>
              )}
            </Box>

            {/* Notification List */}
            <Box sx={{ maxHeight: 400, overflow: "auto" }}>
              {notifications.length > 0 ? (
                <List disablePadding>
                  {notifications.map((notif) => (
                    <ListItem 
                      key={notif.id}
                      divider
                      button
                      onClick={() => {
                        // Navigate based on notification type
                        switch (notif.type) {
                          case "project":
                            navigate("/projects");
                            break;
                          case "certification":
                            navigate("/certifications");
                            break;
                          case "course":
                          case "path":
                            navigate("/mypath");
                            break;
                          default:
                            navigate("/");
                        }
                        
                        // Mark as read
                        setNotifications(prev => 
                          prev.map(n => n.id === notif.id ? {...n, read: true} : n)
                        );
                        setNotifAnchorEl(null);
                      }}
                      sx={{
                        px: 2,
                        py: 1.5,
                        position: "relative",
                        bgcolor: !notif.read ? alpha(primaryColor, 0.05) : "transparent",
                      }}
                    >
                      {/* Icon */}
                      <ListItemIcon sx={{ 
                        minWidth: 42,
                        color: notif.priority === "high" ? "error.main" : notif.type === "certification" ? "#06D6A0" : primaryColor 
                      }}>
                        {getIconByType(notif.type)}
                      </ListItemIcon>

                      {/* Content */}
                      <ListItemText
                        primary={
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: notif.read ? 400 : 600,
                            }}
                          >
                            {notif.text}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            sx={{ display: "block", mt: 0.5 }}
                          >
                            {notif.date ? new Date(notif.date).toLocaleDateString('en-US', { 
                              month: 'numeric',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true
                            }) : 'Now'}
                          </Typography>
                        }
                      />
                      
                      {/* Unread indicator - simple dot */}
                      {!notif.read && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: notif.priority === "high" ? "error.main" : primaryColor,
                            position: "absolute",
                            right: 16,
                            top: 16
                          }}
                        />
                      )}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <NotificationsIcon 
                    sx={{ fontSize: 40, color: "text.secondary", opacity: 0.5, mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    No notifications
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Footer */}
            {notifications.length > 0 && (
              <Box sx={{ 
                display: "flex", 
                borderTop: 1,
                borderColor: "divider"
              }}>
                <Button
                  fullWidth
                  sx={{ py: 1.5 }}
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({...n, read: true})));
                  }}
                >
                  Mark all as read
                </Button>
                <Divider orientation="vertical" flexItem />
                <Button
                  fullWidth
                  sx={{ py: 1.5 }}
                  onClick={() => setNotifAnchorEl(null)}
                >
                  Close
                </Button>
              </Box>
            )}
          </Popover>

          {/* Logout button - Always visible */}
          <Tooltip title="Log out" arrow TransitionComponent={Zoom}>
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

          {/* Avatar - Always visible */}
          <NavLink to="/User" style={{ textDecoration: "none" }}>
            <Tooltip title="User" arrow TransitionComponent={Zoom}>
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

      {/* Drawer for mobile */}
      {mobileDrawer}

      <Box sx={{ display: "flex", flexGrow: 1, pt: "60px" }}>
        {/* Sidebar with navigation (for tablets and desktop) */}
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
            display: { xs: "none", sm: "block" }, // Hide on mobile
            "&:after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "80px", // Width when retracted
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

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: "calc(100vh - 60px)",
            overflow: "auto",
            bgcolor: bgColor,
            color: textColor,
            p: { xs: 2, sm: 3 }, // Smaller padding on mobile
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