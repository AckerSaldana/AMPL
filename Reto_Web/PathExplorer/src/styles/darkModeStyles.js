import { ACCENTURE_COLORS } from './styles';

// Dark mode aware styles
export const getDarkModeStyles = (darkMode) => ({
  // Form field styles for dark mode
  formFieldStyles: {
    '& .MuiOutlinedInput-root': {
      fontSize: '0.875rem',
      borderRadius: 1.5,
      transition: 'box-shadow 0.2s',
      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
      '& fieldset': {
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0,0,0,0.06)',
      },
      '&:hover fieldset': {
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.4)' : `${ACCENTURE_COLORS.corePurple1}40`,
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
      color: darkMode ? 'rgba(255, 255, 255, 0.7)' : ACCENTURE_COLORS.darkGray,
      '&.Mui-focused': {
        color: ACCENTURE_COLORS.corePurple1,
      },
    },
    '& .MuiInputBase-input': {
      fontSize: '0.875rem',
      color: darkMode ? '#ffffff' : '#000000',
    },
  },

  // Paper styling for content sections
  contentPaperStyles: {
    p: { xs: 2, sm: 3 },
    borderRadius: 2,
    boxShadow: darkMode ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.04)',
    border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '4px',
      backgroundColor: ACCENTURE_COLORS.corePurple1,
    },
  },

  // Section header styles
  sectionHeaderStyles: {
    mb: 2.5,
    fontWeight: 500,
    fontSize: { xs: '1.1rem', sm: '1.25rem' },
    color: darkMode ? '#ffffff' : ACCENTURE_COLORS.black,
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
  },

  // Card styles
  cardStyles: {
    borderRadius: 2,
    boxShadow: darkMode ? "0 4px 6px rgba(0,0,0,0.3)" : "0 4px 6px rgba(0,0,0,0.04)",
    height: '100%',
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    border: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "none",
    backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
    transition: "transform 0.2s, box-shadow 0.2s",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: darkMode ? "0 6px 12px rgba(0,0,0,0.4)" : "0 6px 12px rgba(0,0,0,0.06)",
    },
  },

  // Table styles
  tableStyles: {
    '& .MuiTableHead-root': {
      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.01)',
    },
    '& .MuiTableCell-head': {
      fontWeight: 500,
      color: darkMode ? '#ffffff' : ACCENTURE_COLORS.black,
      borderBottom: darkMode ? `2px solid rgba(255, 255, 255, 0.2)` : `2px solid ${ACCENTURE_COLORS.corePurple1}30`,
      fontSize: '0.85rem',
    },
    '& .MuiTableCell-body': {
      fontSize: '0.85rem',
      borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0,0,0,0.03)',
      color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'inherit',
    },
    '& .MuiTableRow-root:hover': {
      backgroundColor: darkMode ? 'rgba(161, 0, 255, 0.1)' : 'rgba(161, 0, 255, 0.02)',
    },
  },

  // Input styles
  inputStyles: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 1.5,
      fontSize: "0.875rem",
      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0,0,0,0.02)",
      transition: "background-color 0.2s",
      "&:hover": {
        backgroundColor: darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0,0,0,0.04)",
      },
      "& fieldset": {
        borderColor: darkMode ? "rgba(255, 255, 255, 0.23)" : "transparent",
      },
      "&:hover fieldset": {
        borderColor: darkMode ? "rgba(255, 255, 255, 0.4)" : "transparent",
      },
      "&.Mui-focused fieldset": {
        borderColor: `${ACCENTURE_COLORS.corePurple1}80`,
      },
    },
    "& .MuiInputBase-input": {
      color: darkMode ? '#ffffff' : '#000000',
    },
  },
});