// VirtualAssistant.jsx con recomendaciones solo de la base de datos
import React, { useState, useEffect, useRef } from "react";
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
  Chip
} from "@mui/material";
import { Send, SmartToy, School, Psychology, WorkspacePremium, EmojiEvents } from "@mui/icons-material";
import useAuth from "../hooks/useAuth";
import { supabase } from "../supabase/supabaseClient";
import MessageContent from "./MessageContent";

// Import styles
import { ACCENTURE_COLORS } from "../styles/styles";

const VirtualAssistant = () => {
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your Accenture Career AI Assistant. I can help with skill development and recommend certifications from our database.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      sender: "bot",
      text: "What would you like to know today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableCertifications, setAvailableCertifications] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const chatEndRef = useRef(null);
  
  // Cargar perfil de usuario, certificaciones y habilidades
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }
      
      try {
        setProfileLoading(true);
        
        // 1. Obtener perfil del usuario
        const { data: userData, error: userError } = await supabase
          .from('User')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (userError) {
          console.error("Error al obtener el perfil:", userError);
        } else {
          setUserProfile(userData);
        }
        
        // 2. Obtener todas las certificaciones
        const { data: certData, error: certError } = await supabase
          .from('Certifications')
          .select('*')
          .limit(100);
          
        if (certError) {
          console.error("Error al obtener certificaciones:", certError);
        } else {
          setAvailableCertifications(certData || []);
          console.log("Certificaciones cargadas:", certData?.length || 0);
        }
        
        // 3. Obtener todas las habilidades
        const { data: skillsData, error: skillsError } = await supabase
          .from('Skill')
          .select('*')
          .limit(100);
          
        if (skillsError) {
          console.error("Error al obtener habilidades:", skillsError);
        } else {
          setAvailableSkills(skillsData || []);
          console.log("Habilidades cargadas:", skillsData?.length || 0);
        }
        
        setDataLoaded(true);
        
        // 4. Mensaje personalizado de bienvenida
        if (userData && chatHistory.length === 2) {
          setChatHistory(prev => [
            ...prev,
            {
              sender: "bot",
              text: `Welcome, ${userData.name || 'there'}! I can provide personalized recommendations based on your specific needs.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
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
    { text: "What certifications should I pursue next?", icon: <WorkspacePremium fontSize="small" /> },
    { text: "How can I improve my React skills?", icon: <School fontSize="small" /> },
    { text: "What certifications are available for AWS?", icon: <WorkspacePremium fontSize="small" /> },
    { text: "Which skills are trending in tech?", icon: <Psychology fontSize="small" /> }
  ];

  const handleSendMessage = async () => {
    if (message.trim() === "" || isLoading) return;
    
    if (!user || !user.id) {
      setChatHistory(prev => [...prev, {
        sender: "bot",
        text: "Please sign in to use the AI assistant features.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      return;
    }
    
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
      
      // Crear un mapa para convertir IDs de skills a nombres
      const skillMap = {};
      availableSkills.forEach(skill => {
        if (skill && skill.skill_ID) {
          skillMap[skill.skill_ID] = {
            id: skill.skill_ID,
            name: skill.name || `Skill #${skill.skill_ID}`,
            category: skill.category || "",
            type: skill.type || "Technical"
          };
        }
      });
      
      // Preparar las certificaciones con los nombres de las skills
      const enhancedCertifications = availableCertifications.map(cert => {
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
      
      // Preparar payload con validaciones e información detallada
      const payload = {
        message: newUserMessage.text,
        userId: user.id,
        history: chatHistory.slice(-6), // Limitamos a 6 mensajes para el contexto
        userProfile: userProfile || {},
        availableCertifications: enhancedCertifications,
        availableSkills: availableSkills.map(s => ({ 
          id: s.skill_ID, 
          name: s.name,
          category: s.category,
          type: s.type
        })),
        requestConciseResponse: true // Flag para respuestas más concisas
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
        setChatHistory(prev => [...prev, data.response]);
      } else {
        throw new Error(data.error || "Unknown error from server");
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
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        backgroundColor: "#fff",
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          p: 2,
          backgroundColor: "#fff",
          color: ACCENTURE_COLORS.black,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #eaeaea",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SmartToy sx={{ mr: 1, color: ACCENTURE_COLORS.corePurple1 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: "1rem", 
              fontWeight: 500, 
              color: ACCENTURE_COLORS.corePurple1,
            }}
          >
            Career AI Assistant
          </Typography>
        </Box>
        {isDataLoading ? (
          <CircularProgress size={20} sx={{ color: ACCENTURE_COLORS.corePurple1 }} />
        ) : userProfile ? (
          <Chip 
            label={`${userProfile.name || 'User'}`}
            size="small"
            sx={{ 
              backgroundColor: ACCENTURE_COLORS.corePurple1 + '20',
              color: ACCENTURE_COLORS.corePurple1,
              fontWeight: 500
            }}
          />
        ) : null}
      </Box>
      
      {/* Chat Messages */}
      <List
        sx={{
          flexGrow: 1,
          overflow: "auto",
          p: 2,
          backgroundColor: "#f8f8f8",
        }}
      >
        {chatHistory.map((chat, index) => (
          <ListItem
            key={index}
            alignItems="flex-start"
            sx={{
              flexDirection: chat.sender === "user" ? "row-reverse" : "row",
              mb: 2,
              py: 0,
            }}
          >
            <ListItemAvatar sx={{ minWidth: 40 }}>
              <Avatar
                sx={{
                  bgcolor: chat.sender === "user" ? "#e3e3e3" : ACCENTURE_COLORS.corePurple1,
                  width: 32,
                  height: 32,
                }}
              >
                {chat.sender === "user" ? "U" : <SmartToy fontSize="small" />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    backgroundColor: chat.sender === "user" ? "#e9e9e9" : "#fff",
                    border: chat.sender === "bot" ? "1px solid #eaeaea" : "none",
                    borderRadius: 2,
                    maxWidth: "85%",
                    display: "inline-block",
                  }}
                >
                  <MessageContent text={chat.text} sender={chat.sender} />
                  <Typography
                    variant="caption"
                    sx={{ display: "block", textAlign: "right", mt: 0.5, opacity: 0.7 }}
                  >
                    {chat.time}
                  </Typography>
                </Paper>
              }
            />
          </ListItem>
        ))}
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress size={24} sx={{ color: ACCENTURE_COLORS.corePurple1 }} />
          </Box>
        )}
        <div ref={chatEndRef} />
      </List>
      
      {/* Suggested Prompts */}
      <Box 
        sx={{ 
          px: 2, 
          py: 1.5, 
          borderTop: "1px solid #eaeaea",
          display: "flex",
          flexWrap: "wrap",
          gap: 1
        }}
      >
        {suggestedPrompts.map((prompt, idx) => (
          <Chip
            key={idx}
            icon={prompt.icon}
            label={prompt.text}
            onClick={() => handleSuggestedPrompt(prompt.text)}
            sx={{
              borderRadius: "16px",
              backgroundColor: "#f0f0f0",
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          />
        ))}
      </Box>
      
      {/* Message Input */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid #eaeaea",
          display: "flex",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask anything about your career development..."
          size="small"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
          disabled={isLoading || !user}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={message.trim() === "" || isLoading || !user}
          sx={{ ml: 1, color: ACCENTURE_COLORS.corePurple1 }}
        >
          <Send />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default VirtualAssistant;