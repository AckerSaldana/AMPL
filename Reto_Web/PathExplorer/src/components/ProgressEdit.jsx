import React from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  LinearProgress,
  Chip,
  Tooltip,
  useTheme,
} from "@mui/material";
import MovingIcon from "@mui/icons-material/Moving";
import FlagIcon from "@mui/icons-material/Flag";

const phases = [
  { label: "Planning", value: 0, color: "#E57373" },
  { label: "Design", value: 20, color: "#FFB74D" },
  { label: "Development", value: 50, color: "#FFF176" },
  { label: "Testing", value: 70, color: "#AED581" },
  { label: "Deployment", value: 90, color: "#4FC3F7" },
  { label: "Completed", value: 100, color: "#81C784" },
];

// Function to get the current phase based on progress value
const getCurrentPhase = (value) => {
  // Find the current phase or the previous one if we're between phases
  return phases.reduce((prev, current) => {
    return value >= current.value && current.value >= prev.value
      ? current
      : prev;
  }, phases[0]);
};

// Function to get color based on progress value
const getColorForProgress = (value) => {
  const phase = getCurrentPhase(value);
  return phase.color;
};

const ProgressEdit = ({ progressValue, onProgressChange }) => {
  const currentPhase = getCurrentPhase(progressValue);
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background progress indicator */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "4px",
          width: `${progressValue}%`,
          backgroundColor: "primary.main",
          transition: "width 0.5s ease-in-out",
        }}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          mb: 3,
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <MovingIcon sx={{ color: "primary.main", mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Progress
          </Typography>
        </Box>

        <Tooltip title={`Project is currently in ${currentPhase.label} phase`}>
          <Chip
            icon={<FlagIcon />}
            label={currentPhase.label}
            size="small"
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              fontWeight: "bold",
              "& .MuiChip-icon": {
                color: "white",
              },
            }}
          />
        </Tooltip>
      </Box>

      {/* Mini progress visualizer */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Progress: {progressValue}%
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progressValue}
          sx={{
            height: 8,
            borderRadius: 1,
            backgroundColor: "rgba(0,0,0,0.05)",
            "& .MuiLinearProgress-bar": {
              backgroundColor: getColorForProgress(progressValue),
              transition: "transform 0.8s ease-in-out",
            },
          }}
        />
      </Box>

      {/* Milestone indicators */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        {phases.map((phase) => (
          <Tooltip key={phase.label} title={phase.label}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor:
                  progressValue >= phase.value
                    ? phase.color
                    : "rgba(0,0,0,0.1)",
                border:
                  progressValue === phase.value ? "2px solid #666" : "none",
                transform:
                  progressValue === phase.value ? "scale(1.2)" : "scale(1)",
                transition: "all 0.3s ease",
              }}
            />
          </Tooltip>
        ))}
      </Box>

      <FormControl fullWidth>
        <InputLabel id="progress-label">Progress Phase</InputLabel>
        <Select
          labelId="progress-label"
          label="Progress Phase"
          value={progressValue}
          onChange={(e) => onProgressChange(Number(e.target.value))}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: getColorForProgress(progressValue),
              borderWidth: "2px",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: getColorForProgress(progressValue),
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: getColorForProgress(progressValue),
            },
          }}
        >
          {phases.map((phase) => (
            <MenuItem key={phase.label} value={phase.value}>
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: phase.color,
                    mr: 1,
                  }}
                />
                <Typography>{phase.label}</Typography>
                <Typography sx={{ ml: "auto", color: "text.secondary" }}>
                  {phase.value}%
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Paper>
  );
};

export default ProgressEdit;
