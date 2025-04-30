import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  useTheme,
} from "@mui/material";
import { Person } from "@mui/icons-material";

const UserPathCard = ({ userInfo }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: "100%",
        bgcolor: theme.palette.grey[50],
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 56,
              height: 56,
            }}
          >
            <Person fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {userInfo.currentRole}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userInfo.yearsExperience} years professional experience
            </Typography>
          </Box>
        </Box>

        <Typography variant="subtitle2" fontWeight="medium" mb={1}>
          Primary Skills
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {userInfo.primarySkills.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              size="small"
              color="primary"
              sx={{ bgcolor: theme.palette.primary.light, color: "white" }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserPathCard;
