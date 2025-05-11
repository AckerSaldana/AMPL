import React, { useState } from "react";
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
} from "@mui/material";
import { Send, SmartToy } from "@mui/icons-material";

// Import styles
import { ACCENTURE_COLORS } from "../styles/styles";

const VirtualAssistant = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "bot",
      text: "Hello! Welcome to your professional profile. How can I help you today?",
      time: "9:30 AM"
    },
    {
      sender: "bot",
      text: "I can assist you with information about your career path, projects, certifications, or any questions about your professional development.",
      time: "9:31 AM"
    }
  ]);

  const handleSendMessage = () => {
    if (message.trim() === "") return;
    
    // Add user message to chat
    const newUserMessage = {
      sender: "user",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatHistory([...chatHistory, newUserMessage]);
    setMessage("");
    
    // Simulate bot response (in a real app, this would be an API call)
    setTimeout(() => {
      const botResponse = {
        sender: "bot",
        text: "I understand. Let me find relevant information to help you with your professional development query.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, botResponse]);
    }, 1000);
  };

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
          borderBottom: "1px solid #eaeaea",
        }}
      >
        <SmartToy sx={{ mr: 1, color: ACCENTURE_COLORS.corePurple1 }} />
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: "1rem", 
            fontWeight: 500, 
            color: ACCENTURE_COLORS.corePurple1,
          }}
        >
          Virtual Assistant
        </Typography>
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
                    maxWidth: "80%",
                    display: "inline-block",
                  }}
                >
                  <Typography variant="body2">{chat.text}</Typography>
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
      </List>
      
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
          placeholder="Type a message..."
          size="small"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={message.trim() === ""}
          sx={{ ml: 1, color: ACCENTURE_COLORS.corePurple1 }}
        >
          <Send />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default VirtualAssistant;