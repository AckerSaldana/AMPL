import React from "react";
import { Box, Typography, Paper, Avatar, Button } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import { useNavigate } from "react-router-dom";

const TeammatesDisplay = ({ teammates }) => {
  const navigate = useNavigate();

  const handleReassign = () => {
    navigate("/role-assign");
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 2,
        maxHeight: 300,
        overflowY: "auto",
        "&::-webkit-scrollbar": { width: "6px" },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#ccc",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "#f1f1f1",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PeopleIcon sx={{ fontSize: 24, mr: 1, color: "primary.main" }} />
          <Typography variant="h6" fontWeight={600}>
            Teammates
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<AssignmentIndIcon />}
          onClick={handleReassign}
          sx={{
            borderRadius: 1.5,
            textTransform: "none",
            px: 2,
          }}
        >
          Reassign
        </Button>
      </Box>

      {teammates.map((teammate, index) => (
        <Box
          key={index}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 1,
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            "&:hover": {
              borderColor: "primary.light",
              transition: "0.3s",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Left: Avatar + Name */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar src={teammate.avatar} sx={{ mr: 2 }} />
              <Typography variant="body1" fontWeight={600}>
                {teammate.name} {teammate.last_name}
              </Typography>
            </Box>

            {/* Right: Role */}
            <Typography variant="body2" color="text.secondary">
              Role: <strong>{teammate.role}</strong>
            </Typography>
          </Box>
        </Box>
      ))}
    </Paper>
  );
};

export default TeammatesDisplay;
