import React from "react";
import {
  Box,
  Typography,
  TextField,
  Paper
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ACCENTURE_COLORS, formFieldStyles } from "../styles/styles";


/**
 * Credentials Step Component - Third step in the form wizard
 */
const CredentialsStep = ({
  userData,
  handleInputChange
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, width: '100%' }}>
      <Typography variant="h6" align="center" sx={{ mb: 3, fontWeight: 500 }}>
        Set Account Credentials
      </Typography>
      
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 2,
          border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.2)}`,
          maxWidth: 500,
          width: '100%',
          mx: 'auto'
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            Email Address
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            disabled
            value={userData.email}
            InputProps={{
              readOnly: true,
              sx: { bgcolor: alpha(ACCENTURE_COLORS.lightGray, 0.2) }
            }}
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            Password
          </Typography>
          <TextField
            fullWidth
            type="password"
            variant="outlined"
            required
            placeholder="Create password"
            value={userData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            sx={formFieldStyles}
            helperText="Password must be at least 8 characters"
          />
        </Box>
        
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            Confirm Password
          </Typography>
          <TextField
            fullWidth
            type="password"
            variant="outlined"
            required
            placeholder="Confirm password"
            value={userData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            sx={formFieldStyles}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default CredentialsStep;