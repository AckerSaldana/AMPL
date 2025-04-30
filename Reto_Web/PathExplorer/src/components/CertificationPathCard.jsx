import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Avatar,
  Button,
  useTheme,
} from "@mui/material";
import {
  WorkspacePremium,
  CalendarMonth,
  Badge,
  KeyboardArrowRight,
  Score,
} from "@mui/icons-material";

const CertificationPathCard = ({ certification }) => {
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
              bgcolor: theme.palette.secondary.main,
              width: 40,
              height: 40,
            }}
          >
            <WorkspacePremium />
          </Avatar>
          <Box>
            <Typography variant="h6" component="div">
              {certification.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {certification.issuer}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <Divider sx={{ my: 1 }} />

      <CardContent sx={{ pt: 1, pb: 1, flex: 1 }}>
        <Box display="flex" gap={1} alignItems="center" mb={1}>
          <CalendarMonth fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            Issued: {certification.date}
          </Typography>
        </Box>

        {certification.expiryDate && (
          <Box display="flex" gap={1} alignItems="center" mb={1}>
            <CalendarMonth fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Expires: {certification.expiryDate}
            </Typography>
          </Box>
        )}

        {certification.score && (
          <Box display="flex" gap={1} alignItems="center" mb={1}>
            <Score fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Score: {certification.score}
            </Typography>
          </Box>
        )}

        <Box display="flex" gap={1} alignItems="center">
          <Badge fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            ID: {certification.credentialId}
          </Typography>
        </Box>
      </CardContent>

      <Divider />
      <Box sx={{ p: 1 }}>
        <Button
          size="small"
          endIcon={<KeyboardArrowRight />}
          sx={{ width: "100%", justifyContent: "space-between" }}
        >
          View Certificate
        </Button>
      </Box>
    </Card>
  );
};

export default CertificationPathCard;
