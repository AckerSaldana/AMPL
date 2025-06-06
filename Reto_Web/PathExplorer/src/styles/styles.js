/**
 * Common styles for the employee form components - Enhanced with complete Accenture palette
 */

// Common form field styling - Enhanced for better focus states
export const formFieldStyles = (theme) => ({
  '& .MuiOutlinedInput-root': {
    fontSize: '0.875rem',
    borderRadius: 1.5,
    transition: 'box-shadow 0.2s',
    '& fieldset': {
      borderColor: theme.palette.accenture.colors.lightGray,
    },
    '&:hover fieldset': {
      borderColor: `${theme.palette.accenture.colors.corePurple1}40`,
    },
    '&.Mui-focused': {
      boxShadow: `0 2px 8px rgba(0,0,0,0.05)`,
      '& fieldset': {
        borderColor: `${theme.palette.accenture.colors.corePurple1}80`,
        borderWidth: '1px',
      },
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    color: theme.palette.accenture.colors.darkGray,
    '&.Mui-focused': {
      color: theme.palette.accenture.colors.corePurple1,
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '0.875rem',
  },
});


// Paper styling for content sections - More subtle and elegant
export const contentPaperStyles = (theme) => ({
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
    backgroundColor: theme.palette.accenture.colors.corePurple1,
  },
});


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
export const primaryButtonStyles = (theme) => ({
  bgcolor: theme.palette.primary.main,
  fontSize: { xs: '0.8rem', sm: '0.875rem' },
  fontWeight: 500,
  color: theme.palette.text.white,
  borderRadius: 1.5,
  boxShadow: 'none',
  padding: '8px 16px',
  transition: 'all 0.2s',
  '&:hover': {
    bgcolor: theme.palette.primary.main,
    boxShadow: "0 4px 10px rgba(161, 0, 255, 0.25)",
  },
  textTransform: 'none'
});

export const outlineButtonStyles = (theme) => ({
  textTransform: 'none',
  borderColor: theme.palette.accenture.colors.corePurple1,
  color: theme.palette.accenture.colors.corePurple1,
  fontSize: { xs: '0.8rem', sm: '0.875rem' },
  fontWeight: 500,
  borderRadius: 1.5,
  padding: '7px 16px',
  transition: 'all 0.2s',
  '&:hover': {
    borderColor: theme.palette.accenture.colors.corePurple1,
    bgcolor: `rgba(161, 0, 255, 0.08)`,
    boxShadow: `0 2px 6px rgba(161, 0, 255, 0.15)`,
    transform: 'translateY(-2px)',
  }
});

export const secondaryButtonStyles = (theme) => ({
  bgcolor: theme.palette.accenture.colors.accentPurple2,
  fontSize: { xs: '0.8rem', sm: '0.875rem' },
  fontWeight: 500,
  borderRadius: 1.5,
  boxShadow: 'none',
  padding: '8px 16px',
  transition: 'all 0.2s',
  '&:hover': {
    bgcolor: theme.palette.accenture.colors.accentPurple1,
    boxShadow: `0 4px 8px rgba(160, 85, 245, 0.2)`,
    transform: 'translateY(-2px)',
  },
  textTransform: 'none'
});

export const textButtonStyles = (theme) => ({
  color: theme.palette.accenture.colors.corePurple1,
  textTransform: 'none',
  fontSize: { xs: '0.8rem', sm: '0.875rem' },
  fontWeight: 500,
  transition: 'all 0.2s',
  padding: '6px 12px',
  '&:hover': {
    bgcolor: `rgba(161, 0, 255, 0.08)`,
    transform: 'translateY(-2px)',
  }
});

// Heading styles - More distinctive with subtle accents
export const sectionHeaderStyles = (theme) => ({
  mb: 2.5, 
  fontWeight: 500,
  fontSize: { xs: '1.1rem', sm: '1.25rem' },
  color: theme.palette.accenture.colors.black,
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
    backgroundColor: theme.palette.accenture.colors.corePurple1,
  }
});

// Alternative section header without underline
export const simpleSectionHeaderStyles = (theme) => ({
  mb: 2, 
  fontWeight: 500,
  fontSize: { xs: '1rem', sm: '1.1rem' },
  color: theme.palette.accenture.colors.black,
  display: 'flex',
  alignItems: 'center',
});

// Chip styles - More refined with better visual hierarchy
export const chipStyles = (theme, type = "Technical") => ({
  height: '22px',
  fontSize: '0.7rem',
  fontWeight: 500,
  borderRadius: '4px',
  backgroundColor:
    type === "Soft"
      ? `${theme.palette.accenture.colors.accentPurple1}15`
      : `${theme.palette.accenture.colors.corePurple1}15`,
  color:
    type === "Soft"
      ? theme.palette.accenture.colors.accentPurple1
      : theme.palette.accenture.colors.corePurple1,
  border: 'none',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor:
      type === "Soft"
        ? `${theme.palette.accenture.colors.accentPurple1}25`
        : `${theme.palette.accenture.colors.corePurple1}25`,
  },
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
export const avatarStyles = (theme, permission) => {
  let color;
  switch(permission) {
    case 'Manager':
      color = theme.palette.accenture.colors.corePurple1;
      break;
    case 'TFS':
      color = theme.palette.accenture.colors.corePurple2;
      break;
    case 'Employee':
      color = theme.palette.accenture.colors.accentPurple2;
      break;
    default:
      color = theme.palette.accenture.colors.darkGray;
  }
  
  return {
    bgcolor: `${color}15`,
    color: color,
    fontWeight: 500,
  };
};

// Card styles
export const cardStyles = (theme) => ({
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
});

// Card header styles
export const cardHeaderStyles = (theme) => ({
  p: { xs: 2.5, md: 3 }, 
  borderBottom: '1px solid rgba(0,0,0,0.03)',
});

// Table styles for better data presentation
export const tableStyles = (theme) => ({
  '& .MuiTableHead-root': {
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
  '& .MuiTableCell-head': {
    fontWeight: 500,
    color: theme.palette.accenture.colors.black,
    borderBottom: `2px solid ${theme.palette.accenture.colors.corePurple1}30`,
    fontSize: '0.85rem',
  },
  '& .MuiTableCell-body': {
    fontSize: '0.85rem',
    borderBottom: '1px solid rgba(0,0,0,0.03)',
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: 'rgba(161, 0, 255, 0.02)',
  },
});

// Input styles with Accenture colors
export const inputStyles = (theme) => ({
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
      borderColor: `${theme.palette.accenture.colors.corePurple1}80`,
    },
  },
});

// TEMPORAL WHILE FIXING:
export const ACCENTURE_COLORS = {
  corePurple1: "#a100ff",
  corePurple2: "#7500c0",
  corePurple3: "#460073",
  accentPurple1: "#b455aa",
  accentPurple2: "#a055f5",
  accentPurple3: "#be82ff",
  accentPurple4: "#dcafff",
  accentPurple5: "#e6dcff",
  accenturePurple: "#9c27b0",
  blue: "#0041f0",
  lightBlue: "#00ffff",
  green: "#64ff50",
  blueGreen: "#05f0a5",
  red: "#ff3246",
  pink: "#ff50a0",
  orange: "#ff7800",
  yellow: "#ffeb32",
  black: "#000000",
  darkGray: "#96968c",
  lightGray: "#e6e6dc",
  white: "#ffffff",
};
