import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  AvatarGroup,
  LinearProgress,
  Chip,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  const getProgressColor = () => {
    if (project.status === "Completed") return "success.main";
    if (project.progress >= 70) return "#8bc34a";
    if (project.progress >= 30) return "#9c27b0";
    return "#e0e0e0";
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }); // Resulting format example: "Apr 13, 2025"
    } catch (error) {
      return dateString;
    }
  };

  // Truncate description with ellipsis if too long
  const truncateDescription = (text, maxLength = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card
      onClick={() => navigate(`/project-detail/${project.id}`)}
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 1,
        overflow: "visible",
        boxShadow: "none",
        border: "1px solid rgba(0,0,0,0.12)",
        transition: "all 0.2s ease-in-out",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
          pb: 2,
          flexGrow: 1,
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Status Chip */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Chip
            label={project.status}
            size="small"
            sx={{
              height: "24px",
              borderRadius: 5,
              backgroundColor:
                project.status === "In Progress"
                  ? "rgba(155, 79, 234, 0.1)"
                  : project.status === "Completed"
                  ? "rgba(111, 207, 151, 0.1)"
                  : "rgba(245, 159, 0, 0.1)",
              color:
                project.status === "In Progress"
                  ? "rgb(155, 79, 234)"
                  : project.status === "Completed"
                  ? "rgb(111, 207, 151)"
                  : "rgb(245, 159, 0)",
              fontWeight: 500,
              fontSize: "0.7rem",
              "& .MuiChip-label": {
                px: 1,
              },
            }}
          />
        </Box>

        {/* Project Logo and Title */}
        <Box sx={{ display: "flex", mb: 1 }}>
          <Box
            sx={{
              mr: 2,
              width: 55,
              height: 55,
              borderRadius: 0.5,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: project.logoBackground || "#f5f5f5",
              flexShrink: 0,
            }}
          >
            {project.logo ? (
              <img
                src={project.logo}
                alt={project.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <Typography variant="h6" sx={{ color: "#fff" }}>
                {project.title.charAt(0)}
              </Typography>
            )}
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 500, mb: 0.5, fontSize: "0.95rem" }}
            >
              {project.title}
            </Typography>
            <Tooltip title={project.description} placement="top">
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: "0.75rem",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  height: "2.4em", // Fixed height for 2 lines
                }}
              >
                {project.description}
              </Typography>
            </Tooltip>
          </Box>
        </Box>

        {/* Spacer to push content to consistent positions */}
        <Box sx={{ flexGrow: 1, minHeight: 12 }} />

        {/* Team Section - now at consistent height */}
        <Box>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500, fontSize: "0.75rem" }}
          >
            Team:
          </Typography>
          <Box sx={{ mb: 1, display: "flex", flexWrap: "wrap", mt: 2 }}>
            <AvatarGroup
              max={4}
              sx={{
                justifyContent: "flex-start",
                mb: 2,
                "& .MuiAvatar-root": {
                  width: 36,
                  height: 36,
                  fontSize: "0.75rem",
                  border: "2px solid #fff",
                },
                "& .MuiAvatarGroup-avatar": {
                  width: 36,
                  height: 36,
                  fontSize: "0.75rem",
                },
              }}
            >
              {project.team.map((member, index) => (
                <Avatar
                  key={index}
                  alt={member.name}
                  src={member.avatar || undefined}
                  sx={{
                    bgcolor: member.avatar
                      ? "transparent"
                      : ["#f44336", "#2196f3", "#4caf50", "#ff9800"][index % 4],
                  }}
                >
                  {!member.avatar && member.name
                    ? member.name.charAt(0).toUpperCase()
                    : ""}
                </Avatar>
              ))}
            </AvatarGroup>
          </Box>

          {/* Progress Bar */}
          <Typography
            variant="body2"
            sx={{
              mb: 0.5,
              fontWeight: 500,
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.75rem",
            }}
          >
            <span>Project Progress:</span>
            <span>{project.progress}%</span>
          </Typography>
          <LinearProgress
            variant="determinate"
            value={project.progress}
            sx={{
              height: 8,
              borderRadius: 4,
              mb: 3,
              bgcolor: "rgba(0,0,0,0.06)",
              "& .MuiLinearProgress-bar": {
                bgcolor: getProgressColor(),
              },
            }}
          />
        </Box>

        {/* Dates - Now formatted */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            pt: 2,
            borderTop: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.65rem" }}
            >
              Assigned Date:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, fontSize: "0.75rem" }}
            >
              {formatDate(project.assignedDate)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.65rem" }}
            >
              Due Date:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, fontSize: "0.75rem" }}
            >
              {formatDate(project.dueDate)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
