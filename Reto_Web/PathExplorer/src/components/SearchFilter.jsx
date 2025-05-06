import React, { useState } from "react";
import {
  Box,
  Paper,
  Button,
  InputBase,
  IconButton,
  Tabs,
  Tab,
  Typography,
  Divider,
  Badge,
  useMediaQuery,
  useTheme,
  Tooltip
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Clear as ClearIcon,
  PeopleAlt as PeopleAltIcon,
  PersonOutlineOutlined as PersonOutlineOutlinedIcon,
  DoneAll as DoneAllIcon,
  Add as AddIcon
} from "@mui/icons-material";

// Import our AddEmployeeForm component
import AddEmployeeForm from "./AddEmployeeForm";

/**
 * Enhanced SearchFilter component with Add Employee functionality
 * @param {Object} props - Component props
 * @param {string} props.searchTerm - Current search term
 * @param {function} props.onSearchChange - Function to handle search changes
 * @param {string} props.activeTab - Current active tab
 * @param {function} props.onTabChange - Function to handle tab changes
 * @param {function} props.onFilterClick - Function to open filter menu
 * @param {function} props.onSortClick - Function to open sort menu
 * @param {function} props.onClearFilters - Function to clear all filters
 * @param {number} props.availableCount - Number of available employees for badge
 */
const SearchFilter = ({
  searchTerm,
  onSearchChange,
  activeTab,
  onTabChange,
  onFilterClick,
  onSortClick,
  onClearFilters,
  availableCount
}) => {
  const theme = useTheme();
  // Media queries for responsive layout
  const isSmallScreen = useMediaQuery('(max-width:599px)');
  const isMediumScreen = useMediaQuery('(min-width:600px) and (max-width:959px)');
  const isLargeScreen = useMediaQuery('(min-width:960px)');
  
  // More specific breakpoints for certain components
  const isVerySmallScreen = useMediaQuery('(max-width:400px)');
  const isExtraSmallScreen = useMediaQuery('(max-width:320px)');

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  // State for controlling the Add Employee dialog
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  
  // Calculate the tab index for the Tabs component
  const getTabIndex = () => {
    switch(activeTab) {
      case "all": return 0;
      case "available": return 1;
      case "assigned": return 2;
      default: return 0;
    }
  };
  
  // Convert tab index to value
  const handleTabChange = (event, newIndex) => {
    switch(newIndex) {
      case 0: onTabChange("all"); break;
      case 1: onTabChange("available"); break;
      case 2: onTabChange("assigned"); break;
      default: onTabChange("all");
    }
  };
  
  // Open the Add Employee dialog
  const handleOpenAddEmployee = () => {
    setAddEmployeeOpen(true);
  };
  
  // Close the Add Employee dialog
  const handleCloseAddEmployee = () => {
    setAddEmployeeOpen(false);
  };
  
  return (
    <>
      <Paper 
        elevation={0} 
        sx={{ 
          mb: isSmallScreen ? 2 : 3, 
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "rgba(0,0,0,0.08)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Search bar */}
        <Box sx={{ 
          display: "flex", 
          flexDirection: isSmallScreen ? "column" : "row",
          alignItems: isSmallScreen ? "stretch" : "center",
          p: isSmallScreen ? (isExtraSmallScreen ? 1 : 1.5) : 2,
          backgroundColor: "#ffffff",
          gap: isSmallScreen ? 1.5 : 0,
          width: "100%",
          boxSizing: "border-box",
        }}>
          <Box
            sx={{ 
              display: "flex", 
              alignItems: "center",
              px: isSmallScreen ? (isExtraSmallScreen ? 1 : 1.5) : 2,
              py: 1,
              flex: 1,
              mr: isSmallScreen ? 0 : 2,
              mb: isSmallScreen ? 1 : 0,
              border: "1px solid",
              borderColor: isSearchFocused ? "#a100ff" : "rgba(0,0,0,0.12)",
              borderRadius: 10,
              transition: "all 0.2s ease",
              backgroundColor: "#ffffff",
              width: "100%",
              boxSizing: "border-box",
              minWidth: 0, // Important for compression
            }}
          >
            <SearchIcon 
              sx={{ 
                mr: 1, 
                color: isSearchFocused ? "#a100ff" : "action.active",
                flexShrink: 0
              }} 
            />
            <InputBase
              placeholder={isSmallScreen ? "Search..." : "Search employees by name, role, or skill..."}
              fullWidth
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              sx={{
                flex: 1,
                minWidth: 0, // Important for compression
              }}
            />
            {searchTerm && (
              <IconButton 
                size="small" 
                onClick={() => onSearchChange("")}
                sx={{ 
                  color: "text.secondary",
                  flexShrink: 0
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          
          <Box sx={{ 
            display: "flex", 
            gap: 1,
            justifyContent: isSmallScreen ? "space-between" : "flex-end",
            width: isSmallScreen ? "100%" : "auto",
            flexShrink: 0
          }}>
            <Button
              variant="contained"
              startIcon={isSmallScreen ? null : <AddIcon />}
              onClick={handleOpenAddEmployee}
              sx={{ 
                borderRadius: 6,
                textTransform: "none",
                fontWeight: 500,
                py: 1,
                px: isSmallScreen ? 1.5 : 2,
                minWidth: isSmallScreen ? (isExtraSmallScreen ? "40px" : "auto") : "140px",
                backgroundColor: "#a100ff",
                "&:hover": {
                  backgroundColor: "#7500c0",
                },
                // Ensure it won't compress too much
                whiteSpace: "nowrap",
                flexShrink: 0
              }}
            >
              {isSmallScreen ? <AddIcon /> : "Add Employee"}
            </Button>
            
            <Tooltip title="Filter">
              <IconButton 
                onClick={onFilterClick}
                sx={{ 
                  backgroundColor: "rgba(0,0,0,0.04)", 
                  borderRadius: 1,
                  color: "#666",
                  flexShrink: 0
                }}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Sort">
              <IconButton 
                onClick={onSortClick}
                sx={{ 
                  backgroundColor: "rgba(0,0,0,0.04)",
                  borderRadius: 1,
                  color: "#666",
                  flexShrink: 0
                }}
              >
                <SortIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider />
        
        {/* Tabs - Using a more robust approach for small screens */}
        <Box sx={{
          width: "100%",
          overflowX: "auto", // Allow horizontal scroll in extreme case
          "&::-webkit-scrollbar": { // Hide scrollbar but maintain functionality
            height: "4px"
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.1)",
            borderRadius: "4px"
          }
        }}>
          <Tabs 
            value={getTabIndex()}
            onChange={handleTabChange}
            variant={isSmallScreen ? "fullWidth" : "standard"}
            sx={{ 
              minHeight: isSmallScreen ? (isExtraSmallScreen ? "36px" : "40px") : "48px",
              '& .MuiTabs-indicator': {
                backgroundColor: '#a100ff',
                height: 3,
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minHeight: isSmallScreen ? (isExtraSmallScreen ? 36 : 40) : 48,
                fontSize: isSmallScreen ? '0.75rem' : '0.875rem',
                padding: isSmallScreen ? (isExtraSmallScreen ? 0.5 : 1) : "auto",
                minWidth: isSmallScreen ? (isExtraSmallScreen ? "70px" : "80px") : "120px",
                '&.Mui-selected': {
                  color: '#a100ff',
                  fontWeight: 600,
                },
                '& .MuiTab-iconWrapper': {
                  marginRight: isSmallScreen ? 0.5 : 1,
                  fontSize: isSmallScreen ? '0.875rem' : '1rem',
                },
              },
            }}
          >
            <Tab 
              icon={<PeopleAltIcon fontSize={isSmallScreen ? "small" : "medium"} />} 
              iconPosition="start"
              label={isExtraSmallScreen ? "" : "All Employees"} 
            />
            <Tab 
              icon={
                <Badge 
                  badgeContent={availableCount} 
                  color="success" 
                  max={99}
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: isExtraSmallScreen ? '0.6rem' : '0.65rem',
                      height: isExtraSmallScreen ? '16px' : '18px',
                      minWidth: isExtraSmallScreen ? '16px' : '18px',
                    }
                  }}
                >
                  <PersonOutlineOutlinedIcon fontSize={isSmallScreen ? "small" : "medium"} />
                </Badge>
              } 
              iconPosition="start"
              label={isExtraSmallScreen ? "" : (isVerySmallScreen ? "Avail" : "Available")}
            />
            <Tab 
              icon={<DoneAllIcon fontSize={isSmallScreen ? "small" : "medium"} />} 
              iconPosition="start"
              label={isExtraSmallScreen ? "" : (isVerySmallScreen ? "Assig" : "Assigned")} 
            />
          </Tabs>
        </Box>
        
        {/* Active filters - appear only when filters are applied */}
        {(activeTab !== "all" || searchTerm) && (
          <Box sx={{ 
            px: isSmallScreen ? (isExtraSmallScreen ? 1 : 1.5) : 2, 
            py: isSmallScreen ? 1 : 1.5, 
            backgroundColor: "rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row",
            alignItems: isSmallScreen ? "flex-start" : "center",
            justifyContent: "space-between",
            gap: isSmallScreen ? 1 : 0
          }}>
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              flexWrap: "wrap",
              gap: 1,
              width: isSmallScreen ? "100%" : "auto"
            }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ flexShrink: 0 }}
              >
                Active filters:
              </Typography>
              
              {activeTab !== "all" && (
                <Box sx={{ 
                  py: 0.5, 
                  px: 1.5, 
                  borderRadius: 4, 
                  backgroundColor: "rgba(0,0,0,0.06)",
                  fontSize: "0.75rem",
                  flexShrink: 0
                }}>
                  Status: {activeTab}
                </Box>
              )}
              
              {searchTerm && (
                <Box sx={{ 
                  py: 0.5, 
                  px: 1.5, 
                  borderRadius: 4, 
                  backgroundColor: "rgba(0,0,0,0.06)",
                  fontSize: "0.75rem",
                  maxWidth: isSmallScreen ? "calc(100% - 80px)" : "300px", // Leave space for "Active filters:"
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>
                  Search: "{searchTerm.length > 20 && isSmallScreen ? searchTerm.substring(0, 20) + "..." : searchTerm}"
                </Box>
              )}
            </Box>
            
            <Button
              variant="text"
              size="small"
              onClick={onClearFilters}
              sx={{ 
                color: "#f44336",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.75rem",
                alignSelf: isSmallScreen ? "flex-end" : "center",
                flexShrink: 0,
                minWidth: isExtraSmallScreen ? "60px" : "auto"
              }}
            >
              Clear All
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Add Employee Dialog */}
      <AddEmployeeForm 
        open={addEmployeeOpen} 
        onClose={handleCloseAddEmployee} 
      />
    </>
  );
};

export default SearchFilter;