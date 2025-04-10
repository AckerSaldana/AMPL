import React from "react";
import { Box, Typography, Paper, Avatar, IconButton } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const MatchedEmployeeCard = ({ name, avatar, score, onSelect }) => (
  <Paper
    elevation={2}
    sx={{
      display: "flex",
      alignItems: "center",
      p: 2,
      mb: 2,
      cursor: "pointer",
      overflowY: "auto",
      maxHeight: "10em",
    }}
    onClick={onSelect}
  >
    <Avatar
      src={avatar}
      sx={{ width: 48, height: 48, mr: 2, backgroundColor: "primary.light" }}
    />
    <Box sx={{ flexGrow: 1 }}>
      <Typography fontWeight={600}>{name}</Typography>
      <Typography variant="body2" color="text.secondary">
        Skills: Lorem ipsum dolor sit amet...
      </Typography>
    </Box>
    <Typography variant="h6" sx={{ mr: 2 }}>{`${score}%`}</Typography>
    <ArrowForwardIosIcon />
  </Paper>
);

export default MatchedEmployeeCard;
