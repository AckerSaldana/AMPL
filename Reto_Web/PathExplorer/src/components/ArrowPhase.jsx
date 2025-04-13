import { Box, useTheme } from "@mui/material";

export default function ArrowPhase({
  label,
  percent,
  active = false,
  completed = false,
}) {
  const theme = useTheme();

  const fillColor = active
    ? theme.palette.primary.main // Active purple
    : completed
    ? "#FFF" // Completed
    : "#FFFFFF"; // Upcoming

  const strokeColor =
    active || completed ? theme.palette.primary.main : "#CCCCCC";

  return (
    <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
      <svg viewBox="0 0 140 60" width="100%" height="100%">
        {/* Arrow shape */}
        <polygon
          points="0,0 120,0 140,30 120,60 0,60 20,30"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="2"
        />

        {/* Label */}
        <text
          x="50%"
          y="45%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill={active ? "white" : "#333"}
        >
          {label}
        </text>

        {/* Percent */}
        <text
          x="50%"
          y="70%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="10"
          fill={active ? "white" : "#333"}
        >
          {percent}%
        </text>
      </svg>
    </Box>
  );
}
