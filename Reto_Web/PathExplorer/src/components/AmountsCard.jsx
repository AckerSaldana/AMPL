import React from "react";
import { Box, Typography, Card, CardContent, Avatar } from "@mui/material";

const AmountsCard = ({ count, title, subtitle, icon, color }) => {
  return (
    <Card
      sx={{
        height: "100%",
        borderLeft: `4px solid ${color}`,
        transition: "transform 0.2s",
        "&:hover": { transform: "translateY(-4px)" },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            {count}
          </Typography>
          <Avatar sx={{ bgcolor: color }}>{icon}</Avatar>
        </Box>
        <Typography variant="body1" fontWeight="medium">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default AmountsCard;
