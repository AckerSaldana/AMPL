import React from "react";
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  AvatarGroup,
  Chip,
  Typography,
  Box,
  useTheme,
} from "@mui/material";

// Simulación de proyectos
const projects = [
  {
    title: "AI Integration in social platform",
    team: 4,
    role: "Backend Developer",
    skills: ["Nextjs", "Java"],
  },
  {
    title: "Starbucks application revamp",
    team: 9,
    role: "Frontend Developer",
    skills: ["React"],
  },
  {
    title: "AI estimation in UBER routes",
    team: 2,
    role: "Backend Developer",
    skills: ["Python", "Flask"],
  },
  {
    title: "MiTec overhaul",
    team: 1,
    role: "Frontend Developer",
    skills: ["Angular", "CSS"],
  },
  {
    title: "AI Integration in social platform",
    team: 4,
    role: "Backend Developer",
    skills: ["Nextjs", "Java", "Express", "OpenAI"],
  },
];

export const PastProjectsCard = () => {
  const theme = useTheme();

  return (
    <Paper sx={{ padding: 2, overflow: "auto" }}>
      <Typography variant="body1" fontWeight={"bold"}>
        Past Projects
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            {["Title", "Team", "Role", "Skills Used / Attained"].map(
              (header, index) => (
                <TableCell
                  key={index}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  <strong>{header}</strong>
                </TableCell>
              )
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {projects.map((project, index) => (
            <TableRow key={index}>
              <TableCell sx={{}}>{project.title}</TableCell>
              <TableCell>
                <AvatarGroup
                  max={4}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    "& .MuiAvatar-root": {
                      width: 24,
                      height: 24,
                      fontSize: 10,
                      bgcolor: theme.palette.primary.main,
                    },
                  }}
                >
                  {[...Array(project.team)].map((_, i) => (
                    <Avatar
                      key={i}
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: theme.palette.primary.main,
                      }}
                    />
                  ))}
                </AvatarGroup>
              </TableCell>
              <TableCell>{project.role}</TableCell>
              <TableCell>
                <Box
                  sx={{
                    maxWidth: 250,
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                    "&::-webkit-scrollbar": {
                      height: 0,
                    },
                  }}
                >
                  {project.skills.map((skill, i) => (
                    <Chip
                      key={i}
                      label={skill}
                      sx={{
                        margin: "2px",
                        backgroundColor: theme.palette.primary.light,
                        color: theme.palette.common.white,
                      }}
                    />
                  ))}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};
