/**
 * Common styles for the employee form components
 */

// Core Accenture Colors from the guidelines
export const ACCENTURE_COLORS = {
    corePurple1: "#a100ff", // Primary Purple
    corePurple2: "#7500c0", // Secondary Purple
    corePurple3: "#460073", // Dark Purple
    accentPurple1: "#b455aa", // Accent Purple 1
    accentPurple2: "#a055f5", // Accent Purple 2
    accentPurple3: "#be82ff", // Accent Purple 3
    accentPurple4: "#dcafff", // Accent Purple 4
    accentPurple5: "#e6dcff", // Accent Purple 5
    black: "#000000",
    darkGray: "#96968c",
    lightGray: "#e6e6dc",
    white: "#ffffff"
  };
  
  // Common form field styling
  export const formFieldStyles = {
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': {
        borderColor: ACCENTURE_COLORS.corePurple1,
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: ACCENTURE_COLORS.corePurple1,
    },
  };
  
  // Paper styling for content sections
  export const contentPaperStyles = {
    p: 3, 
    borderRadius: 2,
    border: `1px solid rgba(161, 0, 255, 0.2)`,
    height: '100%'
  };
  
  // Button styles
  export const primaryButtonStyles = {
    bgcolor: ACCENTURE_COLORS.corePurple1,
    '&:hover': {
      bgcolor: ACCENTURE_COLORS.corePurple2
    },
    textTransform: 'none'
  };
  
  export const outlineButtonStyles = {
    textTransform: 'none',
    borderColor: ACCENTURE_COLORS.corePurple1,
    color: ACCENTURE_COLORS.corePurple1,
    '&:hover': {
      borderColor: ACCENTURE_COLORS.corePurple2,
      bgcolor: `rgba(161, 0, 255, 0.05)`
    }
  };
  
  // Heading styles
  export const sectionHeaderStyles = {
    mb: 2, 
    fontWeight: 600,
    color: ACCENTURE_COLORS.corePurple1,
    display: 'flex',
    alignItems: 'center'
  };
  
  // Chip styles
  export const chipStyles = (type = "Technical") => ({
    backgroundColor: type === "Soft" 
      ? `rgba(180, 85, 170, 0.1)`
      : `rgba(161, 0, 255, 0.1)`,
    borderColor: type === "Soft"
      ? ACCENTURE_COLORS.accentPurple1
      : ACCENTURE_COLORS.corePurple1,
    color: type === "Soft"
      ? ACCENTURE_COLORS.accentPurple1
      : ACCENTURE_COLORS.corePurple1
  });