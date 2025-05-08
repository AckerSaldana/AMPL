import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Chip,
  Paper,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import PersonIcon from "@mui/icons-material/Person";
import { supabase } from "../supabase/supabaseClient";
import { useTheme } from "@mui/material/styles";

const UserViewer = () => {
  const theme = useTheme();

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [permissionFilter, setPermissionFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users from Supabase on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("User")
          .select("user_id, name, last_name, level, permission, profile_pic")
          .order("last_name", { ascending: true });

        if (error) throw error;

        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err.message);
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users when search term or permission filter changes
  useEffect(() => {
    const filtered = users.filter((user) => {
      const fullName = `${user.name} ${user.last_name}`.toLowerCase();
      const searchMatch = fullName.includes(searchTerm.toLowerCase());
      const permissionMatch =
        permissionFilter === "All" || user.permission === permissionFilter;
      return searchMatch && permissionMatch;
    });

    setFilteredUsers(filtered);
  }, [searchTerm, permissionFilter, users]);

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle permission filter change
  const handlePermissionFilterChange = (event) => {
    setPermissionFilter(event.target.value);
  };

  // Handle download user analytics (placeholder for future implementation)
  const handleDownloadAnalytics = (userId) => {
    console.log(`Downloading analytics for user ID: ${userId}`);
    // TODO: Implement PDF generation and download functionality
  };

  // Get appropriate color for permission level
  const getPermissionColor = (permission) => {
    switch (permission) {
      case "Manager":
        return theme.palette.success.main;
      case "TFS":
        return theme.palette.info.main;
      case "Employee":
        return theme.palette.primary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Grid item xs={12} lg={6}>
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", // Prevent content from overflowing
          width: "100%", // Ensure card takes full width of grid item
        }}
      >
        <CardContent
          sx={{
            p: { xs: 1.5, sm: 2 },
            pb: 0,
            flexGrow: 0,
            width: "100%", // Ensure content takes full width
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              color: theme.palette.text.primary,
              mb: 2,
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            Team Members
          </Typography>

          {/* Search and Filter Controls */}
          <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 2 }}>
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: isMobile ? 18 : 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel
                  id="permission-filter-label"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  Permission
                </InputLabel>
                <Select
                  labelId="permission-filter-label"
                  value={permissionFilter}
                  onChange={handlePermissionFilterChange}
                  label="Permission"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Employee">Employee</MenuItem>
                  <MenuItem value="TFS">TFS</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>

        {/* Users List with Scrollbar */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            p: { xs: 1.5, sm: 2 },
            pt: 0,
            height: { xs: 200, sm: 250 }, // Adjust height based on screen size
            width: "100%", // Ensure box takes full width
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "rgba(0,0,0,0.05)",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,0.2)",
              borderRadius: "10px",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.3)",
              },
            },
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress size={isMobile ? 28 : 40} />
            </Box>
          ) : error ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                px: 2,
              }}
            >
              <Typography
                color="error"
                sx={{
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  textAlign: "center",
                }}
              >
                {error}
              </Typography>
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Typography
                variant="body1"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                No users found
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 1, width: "100%" }}>
              {filteredUsers.map((user) => (
                <Paper
                  key={user.user_id}
                  elevation={0}
                  sx={{
                    p: { xs: 1, sm: 1.5 },
                    mb: 1,
                    borderRadius: 1.5,
                    backgroundColor: theme.palette.background.default,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    },
                    width: "100%", // Ensure paper takes full width
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "flex-start", sm: "center" },
                      justifyContent: "space-between",
                      gap: { xs: 1, sm: 0 },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: { xs: "100%", sm: "auto" },
                      }}
                    >
                      <Avatar
                        src={user.profile_pic}
                        alt={`${user.name} ${user.last_name}`}
                        sx={{
                          width: { xs: 32, sm: 36 },
                          height: { xs: 32, sm: 36 },
                          mr: 1.5,
                        }}
                      >
                        {!user.profile_pic && (
                          <PersonIcon
                            sx={{
                              width: { xs: 18, sm: 22 },
                              height: { xs: 18, sm: 22 },
                            }}
                          />
                        )}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 500,
                            fontSize: { xs: "0.875rem", sm: "1rem" },
                          }}
                        >
                          {`${user.name} ${user.last_name}`}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.75,
                            mt: 0.25,
                            flexWrap: "wrap",
                          }}
                        >
                          <Chip
                            label={user.permission}
                            size="small"
                            sx={{
                              height: { xs: 20, sm: 22 },
                              fontSize: { xs: "0.7rem", sm: "0.75rem" },
                              backgroundColor: getPermissionColor(
                                user.permission
                              ),
                              color: "white",
                            }}
                          />
                          <Chip
                            label={`Level ${user.level}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: { xs: 20, sm: 22 },
                              fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={
                        <DownloadIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
                      }
                      onClick={() => handleDownloadAnalytics(user.user_id)}
                      sx={{
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                        py: 0.5,
                        alignSelf: { xs: "flex-end", sm: "center" },
                        mt: { xs: 1, sm: 0 },
                        ml: { xs: "auto", sm: 0 },
                        minWidth: { xs: "auto", sm: "80px" },
                      }}
                    >
                      Analytics
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Card>
    </Grid>
  );
};

export default UserViewer;
