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

/**
 * Componente para la barra de búsqueda y filtros
 * @param {Object} props - Propiedades del componente
 * @param {string} props.searchTerm - Término de búsqueda actual
 * @param {function} props.onSearchChange - Función para manejar cambios en la búsqueda
 * @param {string} props.activeTab - Pestaña activa actual
 * @param {function} props.onTabChange - Función para cambiar de pestaña
 * @param {function} props.onFilterClick - Función para abrir el menú de filtros
 * @param {function} props.onSortClick - Función para abrir el menú de ordenamiento
 * @param {function} props.onClearFilters - Función para limpiar todos los filtros
 * @param {number} props.availableCount - Número de empleados disponibles (para el badge)
 * @param {function} props.onAddEmployee - Función para abrir el diálogo de añadir empleado
 */
const SearchFilter = ({
  searchTerm,
  onSearchChange,
  activeTab,
  onTabChange,
  onFilterClick,
  onSortClick,
  onClearFilters,
  availableCount,
  onAddEmployee
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Calcula el índice de la pestaña activa para el componente Tabs
  const getTabIndex = () => {
    switch(activeTab) {
      case "all": return 0;
      case "available": return 1;
      case "assigned": return 2;
      default: return 0;
    }
  };
  
  // Convierte el índice de pestaña en su valor correspondiente
  const handleTabChange = (event, newIndex) => {
    switch(newIndex) {
      case 0: onTabChange("all"); break;
      case 1: onTabChange("available"); break;
      case 2: onTabChange("assigned"); break;
      default: onTabChange("all");
    }
  };
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        mb: 3, 
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "rgba(0,0,0,0.08)",
      }}
    >
      {/* Barra de búsqueda */}
      <Box sx={{ 
        display: "flex", 
        alignItems: "center",
        p: 2,
        backgroundColor: "#ffffff",
      }}>
        <Box
          sx={{ 
            display: "flex", 
            alignItems: "center",
            px: 2,
            py: 1,
            flex: 1,
            mr: 2,
            border: "1px solid",
            borderColor: isSearchFocused ? "#9c27b0" : "rgba(0,0,0,0.12)",
            borderRadius: 10,
            transition: "all 0.2s ease",
            backgroundColor: "#ffffff",
          }}
        >
          <SearchIcon 
            sx={{ 
              mr: 1, 
              color: isSearchFocused ? "#9c27b0" : "action.active" 
            }} 
          />
          <InputBase
            placeholder="Search employees by name, role, or skill..."
            fullWidth
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchTerm && (
            <IconButton 
              size="small" 
              onClick={() => onSearchChange("")}
              sx={{ color: "text.secondary" }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddEmployee}
            sx={{ 
              borderRadius: 6,
              textTransform: "none",
              fontWeight: 500,
              py: 1,
              px: 2,
              backgroundColor: "#9c27b0",
              "&:hover": {
                backgroundColor: "#7b1fa2",
              }
            }}
          >
            Add Employee
          </Button>
          
          <IconButton 
            onClick={onFilterClick}
            sx={{ 
              backgroundColor: "rgba(0,0,0,0.04)", 
              borderRadius: 1,
              color: "#666"
            }}
          >
            <FilterListIcon />
          </IconButton>
          
          <IconButton 
            onClick={onSortClick}
            sx={{ 
              backgroundColor: "rgba(0,0,0,0.04)",
              borderRadius: 1,
              color: "#666"
            }}
          >
            <SortIcon />
          </IconButton>
        </Box>
      </Box>

      <Divider />
      
      {/* Pestañas */}
      <Box>
        <Tabs 
          value={getTabIndex()}
          onChange={handleTabChange}
          sx={{ 
            minHeight: "48px",
            '& .MuiTabs-indicator': {
              backgroundColor: '#9c27b0',
              height: 3,
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minHeight: 48,
              fontSize: '0.875rem',
              '&.Mui-selected': {
                color: '#9c27b0',
                fontWeight: 600,
              },
              '& .MuiTab-iconWrapper': {
                marginRight: 1,
              },
            },
          }}
        >
          <Tab 
            icon={<PeopleAltIcon fontSize="small" />} 
            iconPosition="start"
            label="All Employees" 
          />
          <Tab 
            icon={<PersonOutlineOutlinedIcon fontSize="small" />} 
            iconPosition="start"
            label={
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                position: 'relative'
              }}>
                Available
                {availableCount > 0 && (
                  <Box
                    sx={{
                      ml: 1,
                      px: 1,
                      py: 0.25,
                      borderRadius: '10px',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      minWidth: '18px',
                      textAlign: 'center',
                      display: 'inline-block'
                    }}
                  >
                    {availableCount}
                  </Box>
                )}
              </Box>
            } 
          />
          <Tab 
            icon={<DoneAllIcon fontSize="small" />} 
            iconPosition="start"
            label="Assigned" 
          />
        </Tabs>
      </Box>
      
      {/* Filtros activos - aparecen solo cuando hay filtros */}
      {(activeTab !== "all" || searchTerm) && (
        <Box sx={{ 
          px: 2, 
          py: 1.5, 
          backgroundColor: "rgba(0,0,0,0.02)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between" 
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Active filters:
            </Typography>
            
            {activeTab !== "all" && (
              <Box sx={{ 
                py: 0.5, 
                px: 1.5, 
                borderRadius: 4, 
                backgroundColor: "rgba(0,0,0,0.06)",
                fontSize: "0.75rem"
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
                fontSize: "0.75rem"
              }}>
                Search: "{searchTerm}"
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
              fontSize: "0.75rem"
            }}
          >
            Clear All
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default SearchFilter;