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

const SupervisorCard = ({ supervisor, available, onSelectSupervisor }) => {
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
          border: `2px solid ${ACCENTURE_COLORS.accentPurple4}20`,
          backgroundColor: `${ACCENTURE_COLORS.corePurple1}08`,
          transition: "all 0.3s ease",
          "&:hover": {
            border: `2px solid ${ACCENTURE_COLORS.accentPurple4}40`,
            backgroundColor: `${ACCENTURE_COLORS.corePurple1}6`,
            boxShadow: `0 8px 24px ${ACCENTURE_COLORS.corePurple1}15`,
          },
        }}
      >
        <Avatar
          src={supervisor?.profile_pic || ""}
          sx={{
            width: 64,
            height: 64,
            mr: 3,
            backgroundColor: `${ACCENTURE_COLORS.corePurple1}20`,
            color: ACCENTURE_COLORS.corePurple2,
            border: `2px solid ${ACCENTURE_COLORS.accentPurple5}60`,
            fontSize: "1.5rem",
          }}
        >
          {!supervisor?.profile_pic && <PersonIcon fontSize="large" />}
        </Avatar>

        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            color={ACCENTURE_COLORS.corePurple3}
            sx={{ mb: 0.5 }}
          >
            Project Supervisor
          </Typography>
          <Typography
            variant="body1"
            color="text.primary"
            sx={{
              mb: 1,
              fontWeight: supervisor ? 600 : 400,
              color: supervisor ? "text.primary" : "text.secondary",
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
                backgroundColor: `${ACCENTURE_COLORS.accentPurple4}15`,
                color: ACCENTURE_COLORS.corePurple3,
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
            borderColor: ACCENTURE_COLORS.accentPurple4,
            color: ACCENTURE_COLORS.corePurple3,
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            py: 1,
            "&:hover": {
              borderColor: ACCENTURE_COLORS.corePurple2,
              backgroundColor: `${ACCENTURE_COLORS.corePurple1}10`,
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
          },
        }}
        TransitionComponent={Fade}
      >
        <DialogTitle
          sx={{
            backgroundColor: `${ACCENTURE_COLORS.corePurple1}08`,
            borderBottom: `1px solid ${ACCENTURE_COLORS.accentPurple4}20`,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            color={ACCENTURE_COLORS.corePurple3}
          >
            Select Project Supervisor
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
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
                },
              }}
            />
          </Box>

          <List sx={{ px: 1, maxHeight: "350px", overflow: "auto" }}>
            {filteredUsers.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No users found"
                  secondary="Try adjusting your search terms"
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
                        backgroundColor: `${ACCENTURE_COLORS.corePurple1}15`,
                        "&:hover": {
                          backgroundColor: `${ACCENTURE_COLORS.corePurple1}20`,
                        },
                      },
                      "&:hover": {
                        backgroundColor: `${ACCENTURE_COLORS.corePurple1}08`,
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={user.profile_pic || ""}
                        sx={{
                          backgroundColor: `${ACCENTURE_COLORS.corePurple1}20`,
                          color: ACCENTURE_COLORS.corePurple2,
                          border:
                            selectedUser === user.user_id
                              ? `2px solid ${ACCENTURE_COLORS.accentPurple4}`
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
                          <Typography variant="subtitle1" fontWeight={600}>
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
                            borderColor: `${ACCENTURE_COLORS.accentPurple4}40`,
                            color: ACCENTURE_COLORS.corePurple2,
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
            borderTop: `1px solid ${ACCENTURE_COLORS.accentPurple4}20`,
            backgroundColor: `${ACCENTURE_COLORS.corePurple1}05`,
          }}
        >
          <Button
            onClick={handleCloseModal}
            sx={{
              color: "text.secondary",
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
              backgroundColor: ACCENTURE_COLORS.accentPurple4,
              color: "white",
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              "&:hover": {
                backgroundColor: ACCENTURE_COLORS.corePurple2,
              },
              "&:disabled": {
                backgroundColor: "grey.300",
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
