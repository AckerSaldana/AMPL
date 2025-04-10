import React, { useState } from "react";
import { Box, Grid, Paper, Typography, useTheme, Button } from "@mui/material";
import AssistantIcon from "@mui/icons-material/Assistant";
import RoleCard from "../components/RoleCard";
import MatchedEmployeeCard from "../components/MatchedEmployeeCard";

const initialRoles = [
  {
    id: "frontend",
    role: "Frontend Developer",
    assigned: {
      id: "bruno",
      name: "Bruno Jiménez",
      avatar: "/avatars/1.jpg",
      score: 100,
    },
    matches: [
      {
        id: "valeria",
        name: "Valeria Oliva",
        avatar: "/avatars/6.jpg",
        score: 94,
      },
      {
        id: "daniel",
        name: "Daniel Morales",
        avatar: "/avatars/7.jpg",
        score: 90,
      },
      {
        id: "yeni",
        name: "Yeni Cruz",
        avatar: "/avatars/8.jpg",
        score: 83,
      },
    ],
  },
  {
    id: "frontend",
    role: "Frontend Developer",
    assigned: {
      id: "bruno",
      name: "Bruno Jiménez",
      avatar: "/avatars/1.jpg",
      score: 100,
    },
    matches: [
      {
        id: "valeria",
        name: "Valeria Oliva",
        avatar: "/avatars/6.jpg",
        score: 94,
      },
    ],
  },
  {
    id: "frontend",
    role: "Frontend Developer",
    assigned: {
      id: "bruno",
      name: "Bruno Jiménez",
      avatar: "/avatars/1.jpg",
      score: 100,
    },
    matches: [
      {
        id: "valeria",
        name: "Valeria Oliva",
        avatar: "/avatars/6.jpg",
        score: 94,
      },
    ],
  },
  {
    id: "frontend",
    role: "Frontend Developer",
    assigned: {
      id: "bruno",
      name: "Bruno Jiménez",
      avatar: "/avatars/1.jpg",
      score: 100,
    },
    matches: [
      {
        id: "valeria",
        name: "Valeria Oliva",
        avatar: "/avatars/6.jpg",
        score: 94,
      },
    ],
  },
  {
    id: "backend",
    role: "Backend Developer",
    assigned: {
      id: "andres",
      name: "Andrés Aguilar",
      avatar: "/avatars/2.jpg",
      score: 100,
    },
    matches: [
      {
        id: "rodrigo",
        name: "Rodrigo Cortés",
        avatar: "/avatars/6.jpg",
        score: 93,
      },
      {
        id: "daniela",
        name: "Daniela Morales",
        avatar: "/avatars/7.jpg",
        score: 92,
      },
      {
        id: "carlos",
        name: "Carlos Pérez",
        avatar: "/avatars/8.jpg",
        score: 85,
      },
      {
        id: "juan",
        name: "Juan Pérez",
        avatar: "/avatars/8.jpg",
        score: 85,
      },
      {
        id: "amehd",
        name: "Amhed Pérez",
        avatar: "/avatars/8.jpg",
        score: 85,
      },
      {
        id: "dana",
        name: "Dana Pérez",
        avatar: "/avatars/8.jpg",
        score: 85,
      },
      {
        id: "jazmin",
        name: "Jazmin Pérez",
        avatar: "/avatars/8.jpg",
        score: 85,
      },
    ],
  },
];

const RoleAssign = () => {
  const theme = useTheme();
  const [roles, setRoles] = useState(initialRoles);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);

  const handleEmployeeChange = (roleIndex, newEmployee) => {
    const updated = [...roles];
    updated[roleIndex].assigned = newEmployee;
    setRoles(updated);
  };

  return (
    <Paper>
      {/* Heading */}
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.text.white,
          p: 2,
          borderTopLeftRadius: "4px",
          borderTopRightRadius: "4px",
          height: "3.5rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        <AssistantIcon />
        <Typography variant="body1" fontWeight={600} sx={{ pl: 1 }}>
          Assign Roles
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {/* Left Side */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              AI Suggested Employees
            </Typography>

            <Box
              sx={{
                maxHeight: 400,
                overflowY: "auto",
                pr: 1,
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#ccc",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-track": { backgroundColor: "#f1f1f1" },
              }}
            >
              {roles.map((r, i) => (
                <RoleCard
                  key={r.id}
                  role={r.role}
                  name={r.assigned.name}
                  avatar={r.assigned.avatar}
                  percentage={r.assigned.score}
                  onClick={() => setSelectedRoleIndex(i)}
                  selected={selectedRoleIndex === i}
                />
              ))}
            </Box>
          </Grid>

          {/* Right Side */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              All matched employees for "{roles[selectedRoleIndex].role}"
            </Typography>

            <Box
              sx={{
                maxHeight: 400,
                overflowY: "auto",
                backgroundColor: "#ededed",
                borderRadius: 1,
                p: 1,
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#ccc",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-track": { backgroundColor: "#f1f1f1" },
              }}
            >
              {roles[selectedRoleIndex].matches.map((match) => (
                <MatchedEmployeeCard
                  key={match.id}
                  name={match.name}
                  avatar={match.avatar}
                  score={match.score}
                  onSelect={() =>
                    handleEmployeeChange(selectedRoleIndex, match)
                  }
                />
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
          <Button variant="outlined" color="primary" sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button variant="contained" color="primary">
            Create
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default RoleAssign;
