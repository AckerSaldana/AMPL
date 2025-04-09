import React from "react";
import { Box, Grid, Paper, Typography, useTheme, Button } from "@mui/material";
import AssistantIcon from "@mui/icons-material/Assistant";
import RoleCard from "../components/RoleCard";
import MatchedEmployeeCard from "../components/MatchedEmployeeCard";

const RoleAssign = () => {
  const theme = useTheme();

  return (
    <Paper>
      {/* Heading */}
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.text.white,
          p: 2,
          borderTopLeftRadius: "4px",
          borderTopRightRadius: "4px",
          height: "3.5rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        <AssistantIcon />
        <Typography variant="body1" fontWeight={600} sx={{ pl: 1 }}>
          Assign Roles
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {/* Left Side */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              AI Suggested Employees
            </Typography>

            <RoleCard
              role="Frontend Developer"
              name="Bruno Jiménez"
              avatar="/avatars/1.jpg"
              percentage={100}
            />
            <RoleCard
              role="Backend Developer"
              name="Andrés Aguilar"
              avatar="/avatars/2.jpg"
              percentage={100}
            />
            <RoleCard
              role="QA / DevOps"
              name="Lucía Álvarez"
              avatar="/avatars/3.jpg"
              percentage={100}
            />
            <RoleCard
              role="Software Architect"
              name="Isaac Costa"
              avatar="/avatars/4.jpg"
              percentage={99}
            />
            <RoleCard
              role="Project Manager"
              name="Carlos Martínez"
              avatar="/avatars/5.jpg"
              percentage={99}
            />
          </Grid>

          {/* Right Side */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              All matched employees for "role"
            </Typography>

            <MatchedEmployeeCard
              name="Valeria Oliva"
              avatar="/avatars/6.jpg"
              score={94}
            />
            <MatchedEmployeeCard
              name="Daniel Morales"
              avatar="/avatars/7.jpg"
              score={90}
            />
            <MatchedEmployeeCard
              name="Yeni Cruz"
              avatar="/avatars/8.jpg"
              score={83}
            />
          </Grid>
        </Grid>

        {/* Bottom Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
          <Button variant="outlined" color="secondary" sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button variant="contained" color="primary">
            Create
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default RoleAssign;
