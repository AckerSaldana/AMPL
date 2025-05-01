import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  Button,
  Avatar,
  useTheme,
} from "@mui/material";
import {
  Code,
  CalendarMonth,
  Person,
  Business,
  KeyboardArrowRight,
} from "@mui/icons-material";

const ProjectPathCard = ({ project }) => {
  const theme = useTheme();

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: 3,
          transform: "translateY(-4px)",
        },
      }}
    >
      <CardContent sx={{ pt: 2, pb: 1 }}>
        <Box display="flex" gap={2} mb={1} alignItems="flex-start">
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 40,
              height: 40,
            }}
          >
            <Code />
          </Avatar>
          <Box>
            <Typography variant="h6" component="div">
              {project.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {project.description}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <Divider sx={{ my: 1 }} />

      <CardContent sx={{ pt: 1, pb: 1, flex: 1 }}>
        <Box display="flex" gap={1} alignItems="center" mb={1}>
          <Person fontSize="small" color="action" />
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight="medium"
          >
            {project.role}
          </Typography>
        </Box>

        <Box display="flex" gap={1} alignItems="center" mb={1}>
          <Business fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {project.company}
          </Typography>
        </Box>

        <Box display="flex" gap={1} alignItems="center" mb={2}>
          <CalendarMonth fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {project.date}
          </Typography>
        </Box>

        <Box display="flex" gap={1} flexWrap="wrap">
          {project.skills.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              size="small"
              sx={{ bgcolor: theme.palette.primary.light, color: "white" }}
            />
          ))}
        </Box>
      </CardContent>

      <Divider />
      <Box sx={{ p: 1 }}>
        <Button
          size="small"
          endIcon={<KeyboardArrowRight />}
          sx={{ width: "100%", justifyContent: "space-between" }}
        >
          View Project Details
        </Button>
      </Box>
    </Card>
  );
};

export default ProjectPathCard;
