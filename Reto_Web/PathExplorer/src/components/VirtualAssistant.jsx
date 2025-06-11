// VirtualAssistant.jsx con recomendaciones solo de la base de datos
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  Divider,
  Chip,
  Fade,
  Grow,
  alpha,
  useTheme,
  Tooltip,
  Snackbar,
  Alert,
  Badge
} from "@mui/material";
import { 
  Send, 
  SmartToy, 
  School, 
  Psychology, 
  WorkspacePremium, 
  EmojiEvents,
  AutoAwesome,
  TipsAndUpdates,
  AutoFixHigh
} from "@mui/icons-material";
import useAuth from "../hooks/useAuth";
import { supabase } from "../supabase/supabaseClient";
import MessageContent from "./MessageContent";
import { useDarkMode } from "../contexts/DarkModeContext";
import eventBus, { EVENTS } from "../utils/eventBus";

//

// Import styles
import { ACCENTURE_COLORS } from "../styles/styles";

const VirtualAssistant = () => {
  const theme = useTheme();
  const { darkMode } = useDarkMode();
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your Accenture Career AI Assistant. I can help with skill development and recommend certifications from our database. What would you like to know today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isWelcome: true
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableCertifications, setAvailableCertifications] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const chatEndRef = useRef(null);
  
  // Crear un mapa para convertir IDs de skills a nombres
      const skillMap = useMemo(() => {
        const map = {};
        availableSkills.forEach(skill => {
          if (skill && skill.skill_ID) {
            map[skill.skill_ID.toString()] = {
              id: skill.skill_ID.toString(),
              name: skill.name || `Skill #${skill.skill_ID}`,
              category: skill.category || "",
              type: skill.type || "Technical"
            };
          }
        });
        return map;
      }, [availableSkills]);
      
      // Preparar las certificaciones con los nombres de las skills
      const enhancedCertifications = useMemo(() => {
        return availableCertifications.map(cert => {
          const certSkills = [];
        
        // Procesar el array de skill_acquired
        if (cert.skill_acquired && Array.isArray(cert.skill_acquired)) {
          cert.skill_acquired.forEach(skillId => {
            // Convertir skillId a string si es necesario
            const skillIdStr = String(skillId);
            const skill = skillMap[skillIdStr];
            if (skill) {
              certSkills.push({
                id: skillIdStr,
                name: skill.name
              });
            }
          });
        }
        
          return {
            id: cert.certification_id,
            title: cert.title || "Unknown Certification",
            description: cert.description || "",
            issuer: cert.issuer || "Unknown Issuer",
            skills: certSkills,
            type: cert.type || "General"
          };
        });
      }, [availableCertifications, skillMap]);

  // Cargar perfil de usuario, certificaciones y habilidades
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }
      
      try {
        setProfileLoading(true);
        
        const [userRes, certRes, skillsRes] = await Promise.all([
          supabase.from('User').select('*').eq('user_id', user.id).single(), // 1. Obtener perfil del usuario
          supabase.from('Certifications').select('*').limit(100),  // 2. Obtener todas las certificaciones
          supabase.from('Skill').select('*').limit(100)  // 3. Obtener todas las habilidades
        ]);
          
        if (userRes.error) console.error("Error al obtener el perfil:", userRes.error);
        else setUserProfile(userRes.data);
           
        if (certRes.error) console.error("Error al obtener certificaciones:", certRes.error);
        else setAvailableCertifications(certRes.data || []);
             
        if (skillsRes.error) console.error("Error al obtener habilidades:", skillsRes.error);
        else setAvailableSkills(skillsRes.data || []);
        
        setDataLoaded(true);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setProfileLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);
  
  // Suggested prompts for the user
  const suggestedPrompts = [
    { text: "What certifications should I pursue next?", icon: <WorkspacePremium fontSize="small" />, color: '#FFB800' },
    { text: "How can I improve my React skills?", icon: <School fontSize="small" />, color: '#00B3A6' },
    { text: "What certifications are available for AWS?", icon: <AutoAwesome fontSize="small" />, color: '#FF395A' },
    { text: "Which skills are trending in tech?", icon: <TipsAndUpdates fontSize="small" />, color: '#00C5DC' }
  ];

  const handleSendMessage = async () => {
    if (message.trim() === "" || isLoading) return;
     
    // Add user message to chat
    const newUserMessage = {
      sender: "user",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatHistory(prev => [...prev, newUserMessage]);
    setMessage("");
    setIsLoading(true);
    
    try {
      // Obtener token de sesión para autorización
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token || '';

      // Preparar payload con validaciones e información detallada
      const payload = {
        message: newUserMessage.text,
        userId: user.id,
        history: chatHistory.slice(-6),
        requestConciseResponse: true,
        enhancedCertifications
      };
      
      console.log("Sending request to assistant API:", {
        userId: payload.userId,
        messageLength: payload.message.length,
        certifications: enhancedCertifications.length,
        skills: availableSkills.length
      });
      
      // Realizar la solicitud real al backend
      const response = await fetch("/api/virtual-assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      
      // Manejar errores HTTP
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error ${response.status}: ${errorText}`);
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }
      
      // Procesar respuesta
      const data = await response.json();
      
      if (data.success && data.response) {
        setChatHistory(prev => {
          const alreadyExists = prev.some(
            msg => msg.sender === "bot" && msg.text.trim() === data.response.text.trim()
          );
          if (!alreadyExists) {
            return [...prev, {
              sender: "bot",
              text: data.response.text,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              certifications: data.response.metadata?.certifications || []
            }];
          } else {
            return prev;
          }
        });
      }
        
    } catch (error) {
      console.error("Error sending message:", error);
      setChatHistory(prev => [...prev, {
        sender: "bot",
        text: `Sorry, I encountered an error: ${error.message}. Please try again later.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

    const handleAddPrompt = async (certificationId) => {
    if (!user || !certificationId) return;
    try {
      // First, delete any existing AI suggested certifications for this user
      const { error: deleteError } = await supabase
        .from('AISuggested')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error("Error removing previous suggestions:", deleteError);
      }

      // Then, insert the new certification
      const { error: insertError } = await supabase
        .from('AISuggested')
        .insert([{ user_id: user.id, certification_id: certificationId }]);

      if (insertError) {
        console.error("Insert error:", insertError);
        setSnackbar({
          open: true,
          message: "Error adding certification to your path",
          severity: "error"
        });
      } else {
        setSnackbar({
          open: true,
          message: "Certification added to your Timeline",
          severity: "success"
        });
        
        // Emit event to refresh timeline
        eventBus.emit(EVENTS.AI_CERT_ADDED);
        
        // Also invalidate cache to refresh timeline in MyPath
        if (window.invalidateUserCache) {
          window.invalidateUserCache();
        }
      }
    } catch (err) {
      console.error("Unexpected error adding prompt:", err);
      setSnackbar({
        open: true,
        message: "An unexpected error occurred",
        severity: "error"
      });
    }
  };

    useEffect(() => {
      window.handleAddPrompt = handleAddPrompt;
    }, [handleAddPrompt]);

  const handleSuggestedPrompt = (promptText) => {
    setMessage(promptText);
  };

  // Estado de carga combinado
  const isDataLoading = authLoading || profileLoading || !dataLoaded;

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "24px",
        overflow: "hidden",
        backgroundColor: theme.palette.background.paper,
        boxShadow: darkMode ? '0 8px 24px rgba(0, 0, 0, 0.3)' : '0 8px 24px rgba(0, 0, 0, 0.06)',
        border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.2 : 0.12)}`,
        position: 'relative'
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          p: 2.5,
          backgroundColor: darkMode ? alpha(ACCENTURE_COLORS.corePurple1, 0.1) : alpha(ACCENTURE_COLORS.corePurple1, 0.02),
          color: theme.palette.text.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.3 : 0.15)}`,
          position: 'relative',
          zIndex: 2
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  bgcolor: '#00C852',
                  borderRadius: '50%',
                  border: darkMode ? '2px solid #121212' : '2px solid white',
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(0.95)', opacity: 1 },
                    '50%': { transform: 'scale(1.1)', opacity: 0.7 },
                    '100%': { transform: 'scale(0.95)', opacity: 1 }
                  }
                }}
              />
            }
          >
            <Avatar
              sx={{
                backgroundColor: ACCENTURE_COLORS.corePurple1,
                width: 40,
                height: 40,
                boxShadow: `0 2px 8px ${alpha(ACCENTURE_COLORS.corePurple1, 0.25)}`
              }}
            >
              <SmartToy sx={{ fontSize: 24 }} />
            </Avatar>
          </Badge>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: "1.1rem", 
                fontWeight: 600, 
                color: darkMode ? ACCENTURE_COLORS.accentPurple3 : ACCENTURE_COLORS.corePurple1,
                letterSpacing: '-0.01em'
              }}
            >
              Career AI Assistant
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: darkMode
                  ? alpha(theme.palette.text.primary, 0.7)
                  : alpha(ACCENTURE_COLORS.black, 0.6),
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <AutoFixHigh sx={{ fontSize: 12 }} />
              Powered by Accenture AI
            </Typography>
          </Box>
        </Box>
        {isDataLoading ? (
          <Box sx={{ position: 'relative' }}>
            <CircularProgress 
              size={24} 
              thickness={5}
              sx={{ 
                color: darkMode
                  ? alpha(ACCENTURE_COLORS.accentPurple3, 0.2)
                  : alpha(ACCENTURE_COLORS.corePurple1, 0.2)
              }} 
            />
            <CircularProgress 
              size={24} 
              thickness={5}
              variant="indeterminate"
              sx={{ 
                color: darkMode
                  ? ACCENTURE_COLORS.accentPurple3
                  : ACCENTURE_COLORS.corePurple1,
                position: 'absolute',
                left: 0,
                animationDuration: '1s'
              }} 
            />
          </Box>
        ) : userProfile ? (
          <Chip 
            label={`${userProfile.name || 'User'}`}
            size="small"
            sx={{ 
              backgroundColor: darkMode
                ? alpha(ACCENTURE_COLORS.corePurple1, 0.2)
                : alpha(ACCENTURE_COLORS.corePurple1, 0.08),
              color: darkMode
                ? ACCENTURE_COLORS.accentPurple3
                : ACCENTURE_COLORS.corePurple1,
              fontWeight: 600,
              border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.3 : 0.2)}`,
              px: 2
            }}
          />
        ) : null}
      </Box>
      
      {/* Chat Messages */}
      <List
        sx={{
          flexGrow: 1,
          overflow: "auto",
          p: 3,
          backgroundColor: darkMode ? '#1a1a1a' : '#f8f9fa',
          position: 'relative',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: darkMode 
              ? alpha(ACCENTURE_COLORS.accentPurple3, 0.3)
              : alpha(ACCENTURE_COLORS.corePurple1, 0.2),
            borderRadius: '3px',
            '&:hover': {
              background: darkMode 
                ? alpha(ACCENTURE_COLORS.accentPurple3, 0.4)
                : alpha(ACCENTURE_COLORS.corePurple1, 0.3),
            }
          }
        }}
      >
        {chatHistory.map((chat, index) => (
          <Fade in key={index} timeout={600}>
            <ListItem
              alignItems="flex-start"
              sx={{
                flexDirection: chat.sender === "user" ? "row-reverse" : "row",
                mb: 3,
                py: 0,
                px: 0,
                animation: chat.sender === "user" ? 'slideInRight 0.3s ease-out' : 'slideInLeft 0.3s ease-out',
                '@keyframes slideInLeft': {
                  from: { opacity: 0, transform: 'translateX(-20px)' },
                  to: { opacity: 1, transform: 'translateX(0)' }
                },
                '@keyframes slideInRight': {
                  from: { opacity: 0, transform: 'translateX(20px)' },
                  to: { opacity: 1, transform: 'translateX(0)' }
                }
              }}
            >
              <ListItemAvatar sx={{ minWidth: 45, mx: 1 }}>
                {chat.sender === "user" ? (
                  <Avatar
                    sx={{
                      backgroundColor: darkMode ? ACCENTURE_COLORS.corePurple1 : ACCENTURE_COLORS.corePurple3,
                      width: 36,
                      height: 36,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      boxShadow: darkMode 
                        ? `0 2px 8px ${alpha(ACCENTURE_COLORS.corePurple1, 0.4)}`
                        : `0 2px 8px ${alpha(ACCENTURE_COLORS.corePurple3, 0.3)}`
                    }}
                  >
                    {userProfile?.name?.charAt(0).toUpperCase() || "U"}
                  </Avatar>
                ) : (
                  <Avatar
                    sx={{
                      backgroundColor: chat.isWelcome 
                        ? ACCENTURE_COLORS.corePurple1
                        : darkMode ? '#2e2e2e' : 'white',
                      width: 36,
                      height: 36,
                      border: chat.isWelcome ? 'none' : `2px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.2)}`,
                      color: chat.isWelcome ? 'white' : ACCENTURE_COLORS.corePurple1,
                      boxShadow: chat.isWelcome 
                        ? `0 2px 8px ${alpha(ACCENTURE_COLORS.corePurple1, 0.3)}`
                        : 'none'
                    }}
                  >
                    <SmartToy fontSize="small" />
                  </Avatar>
                )}
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: 'inline-block',
                      maxWidth: '85%',
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        px: 2.5,
                        background: chat.sender === "user" 
                          ? darkMode ? ACCENTURE_COLORS.corePurple1 : ACCENTURE_COLORS.corePurple3
                          : chat.isWelcome
                            ? darkMode ? alpha(ACCENTURE_COLORS.corePurple1, 0.15) : alpha(ACCENTURE_COLORS.corePurple1, 0.06)
                            : darkMode ? '#2e2e2e' : 'white',
                        border: chat.sender === "bot" && !chat.isWelcome 
                          ? `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.3 : 0.1)}` 
                          : 'none',
                        borderRadius: chat.sender === "user" 
                          ? '20px 20px 4px 20px' 
                          : '20px 20px 20px 4px',
                        color: chat.sender === "user" ? 'white' : darkMode ? '#ffffff' : ACCENTURE_COLORS.black,
                        boxShadow: chat.sender === "user"
                          ? darkMode 
                            ? `0 4px 12px ${alpha(ACCENTURE_COLORS.corePurple1, 0.4)}`
                            : `0 4px 12px ${alpha(ACCENTURE_COLORS.corePurple3, 0.3)}`
                          : chat.isWelcome
                            ? darkMode
                              ? `0 4px 12px ${alpha(ACCENTURE_COLORS.corePurple1, 0.2)}`
                              : `0 4px 12px ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`
                            : darkMode 
                              ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                              : '0 2px 8px rgba(0, 0, 0, 0.04)',
                        position: 'relative',
                        overflow: 'visible'
                      }}
                    >
                      <MessageContent 
                        text={chat.text} 
                        sender={chat.sender}
                        metadata={{
                          ...chat.metadata,
                          certifications: chat.certifications
                        }}
                        sx={{
                          color: chat.sender === "user" ? 'white' : 'inherit',
                          '& a': {
                            color: chat.sender === "user" 
                              ? 'white' 
                              : darkMode 
                                ? ACCENTURE_COLORS.accentPurple3
                                : ACCENTURE_COLORS.corePurple1,
                            textDecoration: 'underline'
                          }
                        }}
                      />
                      
                      <Typography
                        variant="caption"
                        sx={{ 
                          display: "block", 
                          textAlign: chat.sender === "user" ? "left" : "right", 
                          mt: 1, 
                          opacity: chat.sender === "user" ? 0.9 : darkMode ? 0.5 : 0.6,
                          fontSize: '0.7rem'
                        }}
                      >
                        {chat.time}
                      </Typography>
                    </Paper>
                  </Box>
                }
              />

            </ListItem>
          </Fade>
        ))}
        {isLoading && (
          <Fade in timeout={300}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 6, py: 2 }}>
              <Avatar
                sx={{
                  background: darkMode ? '#2e2e2e' : 'white',
                  width: 36,
                  height: 36,
                  border: `2px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.2)}`,
                  color: ACCENTURE_COLORS.corePurple1,
                }}
              >
                <SmartToy fontSize="small" />
              </Avatar>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: ACCENTURE_COLORS.corePurple1,
                      animation: `typing 1.4s ease-in-out ${i * 0.2}s infinite`,
                      '@keyframes typing': {
                        '0%, 60%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
                        '30%': { opacity: 1, transform: 'scale(1)' }
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Fade>
        )}
        <div ref={chatEndRef} />
      </List>
      
      {/* Suggested Prompts */}
      <Box 
        sx={{ 
          px: 3, 
          py: 2, 
          backgroundColor: darkMode ? alpha(ACCENTURE_COLORS.corePurple1, 0.05) : alpha(ACCENTURE_COLORS.corePurple1, 0.01),
          borderTop: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.2 : 0.1)}`,
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          justifyContent: 'center'
        }}
      >
        {suggestedPrompts.map((prompt, idx) => (
          <Grow in key={idx} timeout={300 + idx * 100}>
            <Chip
              icon={
                <Box
                  sx={{
                    color: prompt.color,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {prompt.icon}
                </Box>
              }
              label={prompt.text}
              onClick={() => handleSuggestedPrompt(prompt.text)}
              sx={{
                borderRadius: "20px",
                backgroundColor: darkMode ? alpha(prompt.color, 0.15) : alpha(prompt.color, 0.06),
                border: `1px solid ${alpha(prompt.color, 0.2)}`,
                color: darkMode ? '#ffffff' : ACCENTURE_COLORS.black,
                fontWeight: 500,
                fontSize: '0.85rem',
                py: 2.5,
                px: 1,
                '&:hover': {
                  backgroundColor: darkMode ? alpha(prompt.color, 0.2) : alpha(prompt.color, 0.1),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${alpha(prompt.color, 0.2)}`,
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '& .MuiChip-icon': {
                  marginLeft: '8px',
                  marginRight: '-2px'
                }
              }}
            />
          </Grow>
        ))}
      </Box>
      
      {/* Message Input */}
      <Box
        sx={{
          p: 2.5,
          backgroundColor: darkMode ? alpha(ACCENTURE_COLORS.corePurple1, 0.05) : alpha(ACCENTURE_COLORS.corePurple1, 0.01),
          borderTop: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.2 : 0.1)}`,
          display: "flex",
          alignItems: "center",
          gap: 2,
          position: 'relative',
          zIndex: 2
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder={user ? "Ask anything about your career development..." : "Please sign in to chat"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoading || !user}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: '24px',
              background: darkMode ? '#2e2e2e' : 'white',
              border: `2px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.3),
                boxShadow: `0 0 0 4px ${alpha(ACCENTURE_COLORS.corePurple1, 0.05)}`
              },
              '&.Mui-focused': {
                borderColor: ACCENTURE_COLORS.corePurple1,
                boxShadow: `0 0 0 4px ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`
              },
              '& fieldset': {
                border: 'none'
              },
              '& input': {
                px: 3,
                py: 1.5,
                fontSize: '0.95rem',
                color: darkMode ? '#ffffff' : ACCENTURE_COLORS.black,
                '&::placeholder': {
                  color: darkMode ? 'rgba(255, 255, 255, 0.5)' : alpha(ACCENTURE_COLORS.black, 0.4)
                }
              }
            },
          }}
        />
        <Tooltip title={!user ? "Sign in to send messages" : "Send message"}>
          <span>
            <IconButton
              onClick={handleSendMessage}
              disabled={message.trim() === "" || isLoading || !user}
              sx={{ 
                backgroundColor: message.trim() && !isLoading && user
                  ? darkMode ? ACCENTURE_COLORS.accentPurple3 : ACCENTURE_COLORS.corePurple1
                  : alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.2 : 0.1),
                color: message.trim() && !isLoading && user 
                  ? 'white' 
                  : darkMode 
                    ? alpha(ACCENTURE_COLORS.accentPurple3, 0.5)
                    : alpha(ACCENTURE_COLORS.corePurple1, 0.4),
                width: 48,
                height: 48,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: message.trim() && !isLoading && user
                    ? darkMode ? ACCENTURE_COLORS.corePurple2 : ACCENTURE_COLORS.corePurple3
                    : alpha(ACCENTURE_COLORS.corePurple1, darkMode ? 0.2 : 0.1),
                  transform: message.trim() && !isLoading && user ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: message.trim() && !isLoading && user 
                    ? `0 4px 16px ${alpha(ACCENTURE_COLORS.corePurple1, 0.4)}`
                    : 'none'
                },
                '&:active': {
                  transform: 'scale(0.95)'
                }
              }}
            >
              <Send sx={{ fontSize: 20 }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Paper>
  );
};

export default VirtualAssistant;