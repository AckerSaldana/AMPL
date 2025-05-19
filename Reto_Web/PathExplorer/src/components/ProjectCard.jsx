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
import { alpha } from "@mui/material/styles";
import { ACCENTURE_COLORS, cardStyles } from "../styles/styles";

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  const getProgressColor = () => {
    if (project.status === "Completed") return "#22A565";
    if (project.progress >= 70) return ACCENTURE_COLORS.corePurple1;
    if (project.progress >= 30) return ACCENTURE_COLORS.accentPurple2;
    return ACCENTURE_COLORS.lightGray;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }); // example: "Apr 13, 2025"
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card
      onClick={() => navigate(`/project-detail/${project.id}`)}
      variant="outlined"
      sx={{
        ...cardStyles,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.12)",
        transition: "all 0.2s ease-in-out",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.08)",
          borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.3),
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
          borderRadius: "8px",
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
                  ? alpha(ACCENTURE_COLORS.corePurple1, 0.1)
                  : project.status === "Completed"
                  ? alpha("#22A565", 0.1)
                  : project.status === "On Hold"
                  ? alpha(ACCENTURE_COLORS.orange, 0.1)
                  : alpha(ACCENTURE_COLORS.blue, 0.1),
              color:
                project.status === "In Progress"
                  ? ACCENTURE_COLORS.corePurple1
                  : project.status === "Completed"
                  ? "#22A565"
                  : project.status === "On Hold"
                  ? ACCENTURE_COLORS.orange
                  : ACCENTURE_COLORS.blue,
              fontWeight: 500,
              fontSize: "0.7rem",
              "& .MuiChip-label": {
                px: 1,
              },
            }}
          />
        </Box>

        {/* Project Logo and Title */}
        <Box sx={{ display: "flex", mb: 2 }}>
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
              bgcolor: project.logoBackground || alpha(ACCENTURE_COLORS.accentPurple2, 0.1),
              flexShrink: 0,
              border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`,
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
              <Typography 
                variant="h6" 
                sx={{ 
                  color: ACCENTURE_COLORS.corePurple1,
                  fontWeight: 600 
                }}
              >
                {project.title.charAt(0)}
              </Typography>
            )}
          </Box>
          <Box sx={{ width: "100%" }}>
            <Typography
              variant="subtitle1"
              sx={{ 
                fontWeight: 600, 
                mb: 0.5, 
                fontSize: "0.95rem",
                color: ACCENTURE_COLORS.black
              }}
            >
              {project.title}
            </Typography>
            <Tooltip title={project.description} placement="top">
              <Typography
                variant="body2"
                color={ACCENTURE_COLORS.darkGray}
                sx={{
                  fontSize: "0.75rem",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.2,
                  mb: 1,
                  maxHeight: "unset", // Remove fixed height
                }}
              >
                {project.description}
              </Typography>
            </Tooltip>
          </Box>
        </Box>

        {/* Spacer to push content to consistent positions */}
        <Box sx={{ flexGrow: 1, minHeight: 8 }} />

        {/* Team Section - consistent height */}
        <Box>
          <Typography
            variant="body2"
            sx={{ 
              mb: 0.5, 
              fontWeight: 600, 
              fontSize: "0.75rem",
              color: ACCENTURE_COLORS.corePurple3
            }}
          >
            Team:
          </Typography>
          <Box sx={{ mb: 1, display: "flex", flexWrap: "wrap", mt: 1 }}>
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
                      : [
                        ACCENTURE_COLORS.corePurple1, 
                        ACCENTURE_COLORS.accentPurple3, 
                        ACCENTURE_COLORS.blue, 
                        ACCENTURE_COLORS.accentPurple2
                      ][index % 4],
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
              fontWeight: 600,
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.75rem",
              color: ACCENTURE_COLORS.black,
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
              bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.08),
              "& .MuiLinearProgress-bar": {
                bgcolor: getProgressColor(),
                transition: "transform 0.5s ease-out",
              },
            }}
          />
        </Box>

        {/* Dates - formatted */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            pt: 2,
            borderTop: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.08)}`,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color={ACCENTURE_COLORS.darkGray}
              sx={{ fontSize: "0.65rem" }}
            >
              Assigned Date:
            </Typography>
            <Typography
              variant="body2"
              sx={{ 
                fontWeight: 600, 
                fontSize: "0.75rem",
                color: ACCENTURE_COLORS.black
              }}
            >
              {formatDate(project.assignedDate)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="caption"
              color={ACCENTURE_COLORS.darkGray}
              sx={{ fontSize: "0.65rem" }}
            >
              Due Date:
            </Typography>
            <Typography
              variant="body2"
              sx={{ 
                fontWeight: 600, 
                fontSize: "0.75rem",
                color: ACCENTURE_COLORS.black
              }}
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