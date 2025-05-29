/**
 * Common styles for the employee form components - Enhanced with complete Accenture palette
 */

// Complete Accenture Colors from the guidelines
export const ACCENTURE_COLORS = {
  // Core Purples
  corePurple1: "#a100ff", // Primary Purple
  corePurple2: "#7500c0", // Secondary Purple
  corePurple3: "#460073", // Dark Purple
  
  // Accent Purples
  accentPurple1: "#b455aa", // Accent Purple 1
  accentPurple2: "#a055f5", // Accent Purple 2
  accentPurple3: "#be82ff", // Accent Purple 3
  accentPurple4: "#dcafff", // Accent Purple 4
  accentPurple5: "#e6dcff", // Accent Purple 5
  
  // Custom Purple
  accenturePurple: "#9c27b0", // Profile purple used in dashboard
  
  // Secondary Colors
  blue: "#0041f0",        // Blue
  lightBlue: "#00ffff",   // Light Blue
  green: "#64ff50",       // Green
  blueGreen: "#05f0a5",   // Blue Green
  red: "#ff3246",         // Red
  pink: "#ff50a0",        // Pink
  orange: "#ff7800",      // Orange
  yellow: "#ffeb32",      // Yellow
  
  // Neutrals
  black: "#000000",
  darkGray: "#96968c",
  lightGray: "#e6e6dc",
  white: "#ffffff"
};

// Common form field styling - Enhanced for better focus states
export const formFieldStyles = {
  '& .MuiOutlinedInput-root': {
    fontSize: '0.875rem',
    borderRadius: 1.5,
    transition: 'box-shadow 0.2s',
    '& fieldset': {
      borderColor: 'rgba(0,0,0,0.06)',
    },
    '&:hover fieldset': {
      borderColor: `${ACCENTURE_COLORS.corePurple1}40`,
    },
    '&.Mui-focused': {
      boxShadow: `0 2px 8px rgba(0,0,0,0.05)`,
      '& fieldset': {
        borderColor: `${ACCENTURE_COLORS.corePurple1}80`,
        borderWidth: '1px',
      },
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    color: ACCENTURE_COLORS.darkGray,
    '&.Mui-focused': {
      color: ACCENTURE_COLORS.corePurple1,
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '0.875rem',
  },
};

// Paper styling for content sections - More subtle and elegant
export const contentPaperStyles = {
  p: { xs: 2, sm: 3 }, 
  borderRadius: 2,
  boxShadow: '0 4px 6px rgba(0,0,0,0.04)',
  border: 'none',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    backgroundColor: ACCENTURE_COLORS.corePurple1,
  },
};

// Alternate paper style with no top bar
export const contentPaperAlternateStyles = {
  p: { xs: 2, sm: 3 }, 
  borderRadius: 2,
  boxShadow: '0 4px 6px rgba(0,0,0,0.04)',
  border: 'none',
  height: '100%',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 12px rgba(0,0,0,0.08)',
  },
};

// Button styles - More refined with better transitions
export const primaryButtonStyles = {
  bgcolor: ACCENTURE_COLORS.corePurple1,
  fontSize: { xs: '0.8rem', sm: '0.875rem' },
  fontWeight: 500,
  borderRadius: 1.5,
  boxShadow: 'none',
  padding: '8px 16px',
  transition: 'all 0.2s',
  '&:hover': {
    bgcolor: ACCENTURE_COLORS.corePurple2,
    boxShadow: `0 4px 8px rgba(161, 0, 255, 0.2)`,
    transform: 'translateY(-2px)',
  },
  textTransform: 'none'
};

export const outlineButtonStyles = {
  textTransform: 'none',
  borderColor: ACCENTURE_COLORS.corePurple1,
  color: ACCENTURE_COLORS.corePurple1,
  fontSize: { xs: '0.8rem', sm: '0.875rem' },
  fontWeight: 500,
  borderRadius: 1.5,
  padding: '7px 16px',
  transition: 'all 0.2s',
  '&:hover': {
    borderColor: ACCENTURE_COLORS.corePurple1,
    bgcolor: `rgba(161, 0, 255, 0.08)`,
    boxShadow: `0 2px 6px rgba(161, 0, 255, 0.15)`,
    transform: 'translateY(-2px)',
  }
};

export const secondaryButtonStyles = {
  bgcolor: ACCENTURE_COLORS.accentPurple2,
  fontSize: { xs: '0.8rem', sm: '0.875rem' },
  fontWeight: 500,
  borderRadius: 1.5,
  boxShadow: 'none',
  padding: '8px 16px',
  transition: 'all 0.2s',
  '&:hover': {
    bgcolor: ACCENTURE_COLORS.accentPurple1,
    boxShadow: `0 4px 8px rgba(160, 85, 245, 0.2)`,
    transform: 'translateY(-2px)',
  },
  textTransform: 'none'
};

export const textButtonStyles = {
  color: ACCENTURE_COLORS.corePurple1,
  textTransform: 'none',
  fontSize: { xs: '0.8rem', sm: '0.875rem' },
  fontWeight: 500,
  transition: 'all 0.2s',
  padding: '6px 12px',
  '&:hover': {
    bgcolor: `rgba(161, 0, 255, 0.08)`,
    transform: 'translateY(-2px)',
  }
};

// Heading styles - More distinctive with subtle accents
export const sectionHeaderStyles = {
  mb: 2.5, 
  fontWeight: 500,
  fontSize: { xs: '1.1rem', sm: '1.25rem' },
  color: ACCENTURE_COLORS.black,
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  paddingBottom: '8px',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '40px',
    height: '3px',
    backgroundColor: ACCENTURE_COLORS.corePurple1,
  }
};

// Alternative section header without underline
export const simpleSectionHeaderStyles = {
  mb: 2, 
  fontWeight: 500,
  fontSize: { xs: '1rem', sm: '1.1rem' },
  color: ACCENTURE_COLORS.black,
  display: 'flex',
  alignItems: 'center',
};

// Chip styles - More refined with better visual hierarchy
export const chipStyles = (type = "Technical") => ({
  height: '22px',
  fontSize: '0.7rem',
  fontWeight: 500,
  borderRadius: '4px',
  backgroundColor: type === "Soft" 
    ? `${ACCENTURE_COLORS.accentPurple1}15`
    : `${ACCENTURE_COLORS.corePurple1}15`,
  color: type === "Soft"
    ? ACCENTURE_COLORS.accentPurple1
    : ACCENTURE_COLORS.corePurple1,
  border: 'none',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: type === "Soft" 
      ? `${ACCENTURE_COLORS.accentPurple1}25`
      : `${ACCENTURE_COLORS.corePurple1}25`,
  }
});

// Status chip styles for different states
export const statusChipStyles = (status) => {
  let color;
  switch(status.toLowerCase()) {
    case 'completed':
      color = ACCENTURE_COLORS.corePurple3;
      break;
    case 'in progress':
      color = ACCENTURE_COLORS.corePurple1;
      break;
    case 'on hold':
      color = ACCENTURE_COLORS.accentPurple1;
      break;
    case 'not started':
      color = ACCENTURE_COLORS.accentPurple2;
      break;
    case 'high':
      color = ACCENTURE_COLORS.red;
      break;
    case 'medium':
      color = ACCENTURE_COLORS.orange;
      break;
    case 'low':
      color = ACCENTURE_COLORS.blue;
      break;
    default:
      color = ACCENTURE_COLORS.darkGray;
  }
  
  return {
    height: '22px',
    fontSize: '0.7rem',
    fontWeight: 500,
    borderRadius: '4px',
    backgroundColor: `${color}15`,
    color: color,
    border: 'none',
  };
};

// Avatar styles
export const avatarStyles = (permission) => {
  let color;
  switch(permission) {
    case 'Manager':
      color = ACCENTURE_COLORS.corePurple1;
      break;
    case 'TFS':
      color = ACCENTURE_COLORS.corePurple2;
      break;
    case 'Employee':
      color = ACCENTURE_COLORS.accentPurple2;
      break;
    default:
      color = ACCENTURE_COLORS.darkGray;
  }
  
  return {
    bgcolor: `${color}15`,
    color: color,
    fontWeight: 500,
  };
};

// Card styles
export const cardStyles = {
  borderRadius: 2,
  boxShadow: "0 4px 6px rgba(0,0,0,0.04)",
  height: '100%',
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  border: "none",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 6px 12px rgba(0,0,0,0.06)",
  },
};

// Card header styles
export const cardHeaderStyles = {
  p: { xs: 2.5, md: 3 }, 
  borderBottom: '1px solid rgba(0,0,0,0.03)',
};

// Table styles for better data presentation
export const tableStyles = {
  '& .MuiTableHead-root': {
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
  '& .MuiTableCell-head': {
    fontWeight: 500,
    color: ACCENTURE_COLORS.black,
    borderBottom: `2px solid ${ACCENTURE_COLORS.corePurple1}30`,
    fontSize: '0.85rem',
  },
  '& .MuiTableCell-body': {
    fontSize: '0.85rem',
    borderBottom: '1px solid rgba(0,0,0,0.03)',
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: 'rgba(161, 0, 255, 0.02)',
  },
};

// Input styles with Accenture colors
export const inputStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    fontSize: "0.875rem",
    backgroundColor: "rgba(0,0,0,0.02)",
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.04)",
    },
    "& fieldset": {
      borderColor: "transparent",
    },
    "&:hover fieldset": {
      borderColor: "transparent",
    },
    "&.Mui-focused fieldset": {
      borderColor: `${ACCENTURE_COLORS.corePurple1}80`,
    },
  },
};