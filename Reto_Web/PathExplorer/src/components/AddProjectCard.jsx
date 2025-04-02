import React, { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  TextField,
  MenuItem,
  Stack,
  Button,
  useTheme,
  IconButton,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import RoleItem from "./RoleItem";

export const AddProjectCard = () => {
  const theme = useTheme();

  // State for mock roles
  const [roles, setRoles] = useState([
    "Frontend Developer",
    "Backend Developer",
  ]);

  const handleAddRole = () => {
    const newRole = `Role ${roles.length + 1}`;
    setRoles((prev) => [...prev, newRole]);
  };

  const handleDeleteRole = (number) => {
    setRoles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Paper sx={{ height: "100%" }}>
      {/* Heading */}
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: "#fff",
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderTopLeftRadius: "4px",
          borderTopRightRadius: "4px",
          height: "3.5rem",
        }}
      >
        <AddCircleOutlineIcon />
        <Typography fontWeight={600}>Add a project</Typography>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Project title */}
          <Box>
            <Typography fontWeight={600} mb={0.5} color="text.secondary">
              Project title
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Add project title here..."
            />
          </Box>

          {/* Description */}
          <Box>
            <Typography fontWeight={600} mb={0.5} color="text.secondary">
              Description
            </Typography>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={4}
              placeholder="Add a description here..."
            />
          </Box>

          {/* Status & Priority */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Box flex={1}>
              <Typography fontWeight={600} mb={0.5} color="text.secondary">
                Status
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                defaultValue="Not Started"
              >
                <MenuItem value="Not Started">Not Started</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>
            </Box>

            <Box flex={1}>
              <Typography fontWeight={600} mb={0.5} color="text.secondary">
                Priority
              </Typography>
              <TextField select fullWidth size="small" defaultValue="High">
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </TextField>
            </Box>
          </Stack>

          {/* Dates */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Box flex={1}>
              <Typography fontWeight={600} mb={0.5} color="text.secondary">
                Start Date
              </Typography>
              <TextField
                fullWidth
                type="date"
                size="small"
                defaultValue="2025-02-10"
              />
            </Box>
            <Box flex={1}>
              <Typography fontWeight={600} mb={0.5} color="text.secondary">
                End Date
              </Typography>
              <TextField
                fullWidth
                type="date"
                size="small"
                defaultValue="2025-10-25"
              />
            </Box>
          </Stack>

          {/* Role list */}
          <Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography fontWeight={600} color="text.secondary">
                Role list
              </Typography>
              <Button
                startIcon={<AddCircleOutlineIcon />}
                size="small"
                onClick={handleAddRole}
              >
                Add Role
              </Button>
            </Box>

            {/* Scrollable list of RoleItems */}
            <Box
              sx={{
                maxHeight: 200,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {roles.map((role, index) => (
                <RoleItem
                  key={index}
                  title={role}
                  onDelete={() => handleDeleteRole(index)}
                />
              ))}
            </Box>
          </Box>

          {/* Buttons */}
          <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
            <Button
              variant="contained"
              sx={(theme) => ({
                backgroundColor: theme.palette.primary.main,
                color: "#fff",
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              })}
            >
              Assign
            </Button>
            <Button
              variant="contained"
              sx={(theme) => ({
                backgroundColor: theme.palette.text.secondary,
                color: theme.palette.getContrastText(
                  theme.palette.text.secondary
                ),
                "&:hover": {
                  backgroundColor: theme.palette.grey[700],
                },
              })}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};
