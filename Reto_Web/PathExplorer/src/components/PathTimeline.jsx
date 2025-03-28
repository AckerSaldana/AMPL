import React from "react";
import { Box, Typography, useTheme, Paper } from "@mui/material";

// Mock data simulating stored procedure result
const mockData = [
  {
    id: 1,
    title: "Advanced React and Node JS Certificate",
    type: "AI Suggested Certificate",
    date: null,
  },
  {
    id: 2,
    title: "Certificate: AWS Certified Solutions Architect",
    type: "Certificate",
    date: "2025-02-26",
  },
  {
    id: 3,
    title: "Netflix Database Management",
    type: "Project",
    date: "2025-02-20",
  },
  {
    id: 4,
    title: "Disney App Project",
    type: "Project",
    date: "2025-01-20",
  },
  {
    id: 5,
    title: "Full-Stack Junior Dev",
    type: "Certificate",
    date: "2024-11-11",
  },
];

// Date formatter
const formatDate = (dateString) => {
  if (!dateString) return "Soon";
  const [year, month, day] = dateString.split("-");
  return `${month} | ${day} | ${year}`;
};

export const PathTimeline = () => {
  const theme = useTheme();

  const sortedData = [...mockData].sort((a, b) => {
    if (!a.date) return -1;
    if (!b.date) return 1;
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <Paper
      sx={{
        flex: 1,
        overflow: "hidden", // hide extra overflow (horizontal)
        p: 2,
        height: "100%",
        minHeight: 0,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        My Path
      </Typography>

      {/* This container scrolls vertically */}
      <Box
        sx={{
          position: "relative",
          ml: 2,
          overflowY: "auto",
          overflowX: "hidden",
          height: "100%",
          // Adjust the pseudo-element so it doesn't force horizontal scroll:
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 8,
            width: 2,
            bgcolor: "#ccc",
          },
        }}
      >
        {sortedData.map((item) => {
          const isProject = item.type === "Project";
          const isFirst = sortedData[0].id === item.id;
          const color = isFirst
            ? "#ccc"
            : isProject
            ? theme.palette.primary.main
            : theme.palette.secondary.main;

          return (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                position: "relative",
                mb: 3,
                ml: 3,
                p: 1.5,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 1,
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              {/* Timeline dot */}
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  backgroundColor: color,
                  position: "absolute",
                  left: -22,
                  top: "20%",
                  transform: "translateY(-50%)",
                }}
              />
              {/* Left content */}
              <Box sx={{ flex: 1, pr: 2 }}>
                <Typography
                  fontWeight={600}
                  variant="subtitle2"
                  sx={{
                    color: theme.palette.text.primary,
                    fontSize: "0.9rem",
                    wordBreak: "break-word",
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {item.type}
                </Typography>
              </Box>
              {/* Right date */}
              <Typography
                variant="caption"
                sx={{
                  whiteSpace: "nowrap",
                  color: theme.palette.text.disabled,
                  fontSize: "0.75rem",
                }}
              >
                {formatDate(item.date)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};
