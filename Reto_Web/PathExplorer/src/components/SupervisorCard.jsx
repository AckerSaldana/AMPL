import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Chip,
  InputAdornment,
  IconButton,
  Divider,
  Fade,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ACCENTURE_COLORS } from "../styles/styles";
import { useDarkMode } from "../contexts/DarkModeContext";

const SupervisorCard = ({ supervisor, available, onSelectSupervisor }) => {
  const { darkMode } = useDarkMode();
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(supervisor?.user_id || "");

  // Filter available users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return available;

    const query = searchQuery.toLowerCase();
    return available.filter(
      (user) =>
        `${user.name} ${user.last_name}`.toLowerCase().includes(query) ||
        user.permission.toLowerCase().includes(query)
    );
  }, [available, searchQuery]);

  const handleOpenModal = () => {
    setModalOpen(true);
    setSelectedUser(supervisor?.user_id || "");
    setSearchQuery("");
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSearchQuery("");
  };

  const handleSelectUser = (userId) => {
    setSelectedUser(userId);
  };

  const handleConfirmSelection = () => {
    onSelectSupervisor(selectedUser);
    setModalOpen(false);
  };

  const selectedUserData = available.find(
    (user) => user.user_id === selectedUser
  );

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          p: 3,
          borderRadius: 3,
          border: darkMode ? '2px solid rgba(161, 0, 255, 0.2)' : `2px solid ${ACCENTURE_COLORS.accentPurple4}20`,
          backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.08)' : `${ACCENTURE_COLORS.corePurple1}08`,
          transition: "all 0.3s ease",
          "&:hover": {
            border: darkMode ? '2px solid rgba(161, 0, 255, 0.4)' : `2px solid ${ACCENTURE_COLORS.accentPurple4}40`,
            backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.06)' : `${ACCENTURE_COLORS.corePurple1}6`,
            boxShadow: darkMode ? '0 8px 24px rgba(161, 0, 255, 0.15)' : `0 8px 24px ${ACCENTURE_COLORS.corePurple1}15`,
          },
        }}
      >
        <Avatar
          src={supervisor?.profile_pic || ""}
          sx={{
            width: 64,
            height: 64,
            mr: 3,
            backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.2)' : `${ACCENTURE_COLORS.corePurple1}20`,
            color: darkMode ? '#a67aff' : ACCENTURE_COLORS.corePurple2,
            border: darkMode ? '2px solid rgba(161, 0, 255, 0.6)' : `2px solid ${ACCENTURE_COLORS.accentPurple5}60`,
            fontSize: "1.5rem",
          }}
        >
          {!supervisor?.profile_pic && <PersonIcon fontSize="large" />}
        </Avatar>

        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ 
              mb: 0.5,
              color: darkMode ? '#ffffff' : ACCENTURE_COLORS.corePurple3
            }}
          >
            Project Supervisor
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 1,
              fontWeight: supervisor ? 600 : 400,
              color: supervisor 
                ? (darkMode ? '#ffffff' : "text.primary") 
                : (darkMode ? 'rgba(255, 255, 255, 0.7)' : "text.secondary"),
            }}
          >
            {supervisor
              ? `${supervisor.name} ${supervisor.last_name}`
              : "No supervisor assigned"}
          </Typography>
          {supervisor && (
            <Chip
              label={supervisor.permission}
              size="small"
              sx={{
                backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.15)' : `${ACCENTURE_COLORS.accentPurple4}15`,
                color: darkMode ? '#a67aff' : ACCENTURE_COLORS.corePurple3,
                border: darkMode ? '1px solid rgba(161, 0, 255, 0.3)' : 'none',
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          )}
        </Box>

        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleOpenModal}
          sx={{
            borderColor: darkMode ? 'rgba(161, 0, 255, 0.4)' : ACCENTURE_COLORS.accentPurple4,
            color: darkMode ? '#a67aff' : ACCENTURE_COLORS.corePurple3,
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            py: 1,
            "&:hover": {
              borderColor: darkMode ? 'rgba(161, 0, 255, 0.6)' : ACCENTURE_COLORS.corePurple2,
              backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.1)' : `${ACCENTURE_COLORS.corePurple1}10`,
            },
          }}
        >
          Change
        </Button>
      </Paper>

      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: "500px",
            bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
            color: darkMode ? '#ffffff' : 'inherit',
          },
        }}
        TransitionComponent={Fade}
      >
        <DialogTitle
          sx={{
            backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.08)' : `${ACCENTURE_COLORS.corePurple1}08`,
            borderBottom: darkMode ? '1px solid rgba(161, 0, 255, 0.2)' : `1px solid ${ACCENTURE_COLORS.accentPurple4}20`,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ color: darkMode ? '#ffffff' : ACCENTURE_COLORS.corePurple3 }}
          >
            Select Project Supervisor
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary' }}>
            Choose a supervisor from the available candidates
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, pb: 1 }}>
            <TextField
              fullWidth
              placeholder="Search by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery("")}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'transparent',
                  color: darkMode ? '#ffffff' : 'inherit',
                  '& fieldset': {
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0,0,0,0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: darkMode ? 'rgba(161, 0, 255, 0.6)' : `${ACCENTURE_COLORS.corePurple1}40`,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: ACCENTURE_COLORS.corePurple1,
                  },
                },
                '& .MuiInputBase-input': {
                  '&::placeholder': {
                    color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                    opacity: 1
                  }
                }
              }}
            />
          </Box>

          <List sx={{ px: 1, maxHeight: "350px", overflow: "auto" }}>
            {filteredUsers.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary={<Typography sx={{ color: darkMode ? '#ffffff' : 'inherit' }}>No users found</Typography>}
                  secondary={<Typography variant="body2" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary' }}>Try adjusting your search terms</Typography>}
                  sx={{ textAlign: "center", py: 4 }}
                />
              </ListItem>
            ) : (
              filteredUsers.map((user, index) => (
                <React.Fragment key={user.user_id}>
                  <ListItemButton
                    selected={selectedUser === user.user_id}
                    onClick={() => handleSelectUser(user.user_id)}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      mb: 1,
                      "&.Mui-selected": {
                        backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.15)' : `${ACCENTURE_COLORS.corePurple1}15`,
                        "&:hover": {
                          backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.2)' : `${ACCENTURE_COLORS.corePurple1}20`,
                        },
                      },
                      "&:hover": {
                        backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.08)' : `${ACCENTURE_COLORS.corePurple1}08`,
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={user.profile_pic || ""}
                        sx={{
                          backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.2)' : `${ACCENTURE_COLORS.corePurple1}20`,
                          color: darkMode ? '#a67aff' : ACCENTURE_COLORS.corePurple2,
                          border:
                            selectedUser === user.user_id
                              ? darkMode ? '2px solid rgba(161, 0, 255, 0.4)' : `2px solid ${ACCENTURE_COLORS.accentPurple4}`
                              : "none",
                        }}
                      >
                        {!user.profile_pic && <PersonIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="subtitle1" fontWeight={600} sx={{ color: darkMode ? '#ffffff' : 'inherit' }}>
                            {user.name} {user.last_name}
                          </Typography>
                          {selectedUser === user.user_id && (
                            <CheckCircleIcon
                              color="primary"
                              fontSize="small"
                              sx={{ color: ACCENTURE_COLORS.accentPurple4 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Chip
                          label={user.permission}
                          size="small"
                          variant="outlined"
                          sx={{
                            mt: 0.5,
                            borderColor: darkMode ? 'rgba(161, 0, 255, 0.4)' : `${ACCENTURE_COLORS.accentPurple4}40`,
                            color: darkMode ? '#a67aff' : ACCENTURE_COLORS.corePurple2,
                            fontSize: "0.7rem",
                            height: "20px",
                          }}
                        />
                      }
                    />
                  </ListItemButton>
                  {index < filteredUsers.length - 1 && (
                    <Divider variant="inset" component="li" sx={{ mx: 2 }} />
                  )}
                </React.Fragment>
              ))
            )}
          </List>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: darkMode ? '1px solid rgba(161, 0, 255, 0.2)' : `1px solid ${ACCENTURE_COLORS.accentPurple4}20`,
            backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.05)' : `${ACCENTURE_COLORS.corePurple1}05`,
          }}
        >
          <Button
            onClick={handleCloseModal}
            sx={{
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : "text.secondary",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSelection}
            variant="contained"
            disabled={!selectedUser}
            sx={{
              backgroundColor: darkMode ? ACCENTURE_COLORS.corePurple1 : ACCENTURE_COLORS.accentPurple4,
              color: "white",
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              "&:hover": {
                backgroundColor: ACCENTURE_COLORS.corePurple2,
              },
              "&:disabled": {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : "grey.300",
              },
            }}
          >
            {selectedUserData
              ? `Select ${selectedUserData.name}`
              : "Select Supervisor"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SupervisorCard;
