// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  useTheme,
  Button,
  CircularProgress
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

// Componentes personalizados
import { IconInfo } from "../components/IconInfo";
import { CertificationGrid } from "../components/CertificationGrid";
import { MyPathTimeline } from "../components/MyPathTimeline";
import { CalendarWithReminders } from "../components/CalendarWithReminders";
import { UserSkillsList } from "../components/UserSkillsList";
import { PopularCertifications } from "../components/PopularCertifications";

import useAuth from "../hooks/useAuth";

// Iconos
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const Dashboard = () => {
  const theme = useTheme();
  const { user, role } = useAuth();
  const [pathItems, setPathItems] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [topCertifications, setTopCertifications] = useState([]);
  const [stats, setStats] = useState({
    available: 0,
    completed: 0,
    inProgress: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date();
  const options = { day: "numeric", month: "long", year: "numeric" };
  const formattedDate = today.toLocaleDateString("en-US", options);
  const finalDate = formattedDate;

  const navigate = useNavigate();

  useEffect(() => {

    console.log("Current user:", user);
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user path items
        const { data: pathData, error: pathError } = await supabase
  .from('UserCertifications')
  .select('*')
  .eq('user_ID', user.id)
  .order('status', { ascending: false });

        if (pathError) throw pathError;
        setPathItems(pathData || []);

        // Fetch calendar events
        const { data: eventsData, error: eventsError } = await supabase
  .from('UserCertifications')
  .select('*')
  .eq('user_ID', user.id)
  .eq('status', 'pending')  // Only get pending certifications
  .order('valid_Until', { ascending: true });  // Order by expiration date

        if (eventsError) throw eventsError;
        setCalendarEvents(eventsData || []);

        // Fetch top certifications (most popular)
        // Obtener conteo de certificaciones por usuarios
        const { data: certCountData, error: countError } = await supabase
        .from('UserCertifications')
        .select('certification_ID');

if (countError) throw countError;

// Agrupar por certification_ID
const certCountMap = {};
certCountData.forEach(entry => {
const id = entry.certification_ID;
certCountMap[id] = (certCountMap[id] || 0) + 1;
});

const topCertIDs = Object.entries(certCountMap)
.sort((a, b) => b[1] - a[1])
.slice(0, 3)
.map(([id]) => id);

// Obtener detalles de esas certificaciones
const { data: certDetails, error: detailError } = await supabase
.from('Certifications')
.select('certification_id, title, issuer, type')
.in('certification_id', topCertIDs);

if (detailError) throw detailError;

// Calcular popularidad relativa
const maxCount = Math.max(...Object.values(certCountMap));

const topCertifications = certDetails.map(cert => {
const count = certCountMap[cert.certification_id] || 0;
return {
  id: cert.certification_id,
  name: cert.title,
  category: cert.type,
  completions: count,
  popularity: Math.round((count / maxCount) * 100),
  iconType: cert.type // para íconos en el componente
};
});

setTopCertifications(topCertifications);

        // Fetch stats
        const { count: availableCount } = await supabase
          .from('Certifications')
          .select('*', { count: 'exact' });

          const { count: completedCount } = await supabase
          .from('UserCertifications')
          .select('*', { count: 'exact' })
          .eq('user_ID', user.id)
          .eq('status', 'approved');

          const { count: inProgressCount } = await supabase
          .from('UserCertifications')
          .select('*', { count: 'exact' })
          .eq('user_ID', user.id)
          .eq('status', 'pending');

        setStats({
          available: availableCount || 0,
          completed: completedCount || 0,
          inProgress: inProgressCount || 0
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);
        setupFallbackData();
      } finally {
        setIsLoading(false);
      }
    };

    // Fallback data setup
    const setupFallbackData = () => {
      console.log("Using fallback dashboard data");
      setPathItems([
        {
          id,
          title: "Advanced React and Node JS Certificate",
          type: "AI Suggested Certificate",
          date: null,
        },
        {
          id,
          title: "Certificate: AWS Certified Solutions Architect",
          type: "Certificate",
          date: "2025-02-26",
        }
      ]);

      setCalendarEvents([
        {
          id,
          date: "12 Feb 2025",
          title: "React Certification",
        },
        {
          id,
          date: "15 Feb 2025",
          title: "HTML Certification",
        }
      ]);

      setTopCertifications([
        {
          id,
          name: "AWS Certified Cloud Practitioner",
          category: "Cloud",
          completions: 258,
          iconType: "Storage",
        },
        {
          id,
          name: "React Professional Developer",
          category: "Frontend",
          completions: 189,
          iconType: "Code",
        }
      ]);

      setStats({
        available: 15,
        completed: 6,
        inProgress: 2
      });
    };

    fetchDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Error loading dashboard: {error}</Typography>
        <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 4,
        minHeight: "calc(100vh - 60px)",
        width: "100%", // Expanded navbar is 230px wide
      }}
    >
      {/* Banner superior con bienvenida personalizada */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          color: "#ffffff",
          boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            Welcome back!
          </Typography>
          <Typography variant="body1">Today is {finalDate}</Typography>
        </Box>
        <Box sx={{ mt: { xs: 2, md: 0 } }}>
                <Button
          variant="contained"
          onClick={() => navigate('/certifications')}
          sx={{
            borderRadius: 8,
            px: 3,
            py: 1,
            textTransform: "none",
            fontWeight: 500,
            bgcolor: "#ffffff",
            color: theme.palette.primary.main,
            "&:hover": {
              bgcolor: "#f5f5f5",
            },
          }}
        >
          Explore Certifications
        </Button>
        </Box>
      </Paper>

      {/* Certificaciones Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 2,
              bgcolor: "#fff",
              display: "flex",
              alignItems: "center",
              borderRadius: 2,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <Box
              sx={{
                width: { xs: 64, sm: 48 },
                height: { xs: 64, sm: 48 },
                borderRadius: "50%",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                mr: 2,
              }}
            >
              <InsertDriveFileIcon sx={{ color: theme.palette.primary.main }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="medium" color="primary.main">
                
                {stats.available}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available Certifications
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 2,
              bgcolor: "#fff",
              display: "flex",
              alignItems: "center",
              borderRadius: 2,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <Box
              sx={{
                width: { xs: 64, sm: 48 },
                height: { xs: 64, sm: 48 },
                borderRadius: "50%",
                bgcolor: alpha("#2196f3", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                mr: 2,
              }}
            >
              <CheckCircleIcon sx={{ color: "#2196f3" }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="medium" color="#2196f3">
                {stats.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed Certifications
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 2,
              bgcolor: "#fff",
              display: "flex",
              alignItems: "center",
              borderRadius: 2,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <Box
              sx={{
                width: { xs: 64, sm: 48 },
                height: { xs: 64, sm: 48 },
                borderRadius: "50%",
                bgcolor: alpha("#ff9800", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                mr: 2,
              }}
            >
              <PendingIcon sx={{ color: "#ff9800" }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="medium" color="#ff9800">
                {stats.inProgress}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                On Progress Certifications
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Sección principal */}
      <Box sx={{ display: "flex", flexWrap: "wrap", margin: -1.5 }}>
        {/* Columna izquierda con calendario y MyPath */}
        <Box
          sx={{
            width: { xs: "100%", md: "370px" },
            padding: 1.5,
            flexShrink: 0,
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Paper
              sx={{
                bgcolor: "#fff",
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                overflow: "hidden",
              }}
            >
              <CalendarWithReminders userId={user?.id} />
            </Paper>
          </Box>

          <Box>
            <MyPathTimeline items={pathItems} />
          </Box>
        </Box>

        {/* Columna derecha con habilidades, certificaciones y más */}
        <Box
          sx={{
            flex: 1,
            padding: 1.5,
            minWidth: { xs: "100%", md: 0 },
          }}
        >
          {/* Fila superior: Skills y Certificaciones populares */}
          <Box sx={{ display: "flex", flexWrap: "wrap", mb: 3, mx: -1.5 }}>
            {/* Top Skills */}
            <Box
              sx={{
                width: { xs: "100%", lg: "50%" },
                px: 1.5,
                mb: { xs: 3, lg: 0 },
              }}
            >
              <UserSkillsList userRole={role} userId={user?.id} />
            </Box>

            {/* Certificaciones populares */}
            <Box sx={{ width: { xs: "100%", lg: "50%" }, px: 1.5 }}>
              <PopularCertifications certifications={topCertifications} />
            </Box>
          </Box>

          {/* Certificaciones Grid */}
          <Box>
            <CertificationGrid userId={user?.id}/>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
