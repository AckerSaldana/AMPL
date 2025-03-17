import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Checkbox, 
  FormControlLabel, 
  Box, 
  Typography,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Aplicar estilos al body para quitar márgenes
  useEffect(() => {
    // Guardar estilos originales
    const originalBodyStyle = document.body.style.cssText;
    const originalHtmlStyle = document.documentElement.style.cssText;
    
    // Aplicar nuevos estilos
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.width = '100vw';
    document.body.style.height = '100vh';
    document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#FFFFFF';
    
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.width = '100vw';
    document.documentElement.style.height = '100vh';
    document.documentElement.style.overflow = 'hidden';
    
    // Sobrescribir cualquier estilo del root
    document.getElementById('root').style.width = '100vw';
    document.getElementById('root').style.height = '100vh';
    document.getElementById('root').style.margin = '0';
    document.getElementById('root').style.padding = '0';
    
    return () => {
      // Restaurar estilos originales al desmontar
      document.body.style.cssText = originalBodyStyle;
      document.documentElement.style.cssText = originalHtmlStyle;
    };
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password, rememberMe });
    // Handle login logic here
  };

  return (
    <Box sx={{ 
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw', 
      height: '100vh',
      margin: 0,
      padding: 0,
      display: 'flex',
      overflow: 'hidden'
    }}>
      {/* Left side - Purple background with tagline */}
      <Box sx={{ 
        width: '50%', 
        height: '100%',
        bgcolor: '#973EBC',
        display: 'flex',
        alignItems: 'center', 
        justifyContent: 'center',
        m: 0,
        p: 0
      }}>
        <Box sx={{ 
          textAlign: 'center',
          p: 6
        }}>
          <Typography variant="h2" component="h1" sx={{ 
            color: 'white', 
            fontWeight: 'bold', 
            mb: 1,
            fontSize: '3.5rem'
          }}>
            Explore<br />Your Path
          </Typography>
          <Typography variant="h6" sx={{ 
            color: 'white', 
            opacity: 0.9,
            fontWeight: 'normal'
          }}>
            Accent your future
          </Typography>
        </Box>
      </Box>

      {/* Right side - Login form */}
      <Box sx={{ 
        width: '50%', 
        height: '100%',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#FFFFFF',
        m: 0,
        p: 0
      }}>
        <Box sx={{ 
          width: '100%', 
          maxWidth: '400px',
          p: 3,
          textAlign: 'center'
        }}>
          <Typography component="h1" variant="h4" sx={{ 
            fontWeight: 'bold', 
            mb: 1
          }}>
            Hello !
          </Typography>
          
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
            Enter your login information.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box sx={{ mb: 1, textAlign: 'left' }}>
              <Typography variant="body2" sx={{ textAlign: 'left', mb: 1 }}>
                Email
              </Typography>
              <TextField
                required
                fullWidth
                id="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                variant="outlined"
                size="small"
              />
            </Box>

            <Box sx={{ mb: 2, textAlign: 'left' }}>
              <Typography variant="body2" sx={{ textAlign: 'left', mb: 1 }}>
                Password
              </Typography>
              <TextField
                required
                fullWidth
                name="password"
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                variant="outlined"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 4,
              justifyContent: 'flex-start'
            }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    value="remember" 
                    color="primary" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">Remember me</Typography>}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                py: 1.5, 
                backgroundColor: '#973EBC', 
                '&:hover': { backgroundColor: '#7B1FA2' },
                color: 'white',
                fontWeight: 500,
                textTransform: 'uppercase',
                borderRadius: '4px',
                letterSpacing: '0.5px'
              }}
            >
              SIGN IN
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;