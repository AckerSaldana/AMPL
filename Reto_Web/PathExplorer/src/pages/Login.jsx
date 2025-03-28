import React, { useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Checkbox, 
  FormControlLabel, 
  Box, 
  Typography,
  InputAdornment,
  IconButton,
  Link
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import useBodyStyles from '../hooks/useBodyStyles.js';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useBodyStyles();

  const navigate = useNavigate();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log({ email, password, rememberMe });
    // Aquí va la lógica de autenticación
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'ask_tst@hotmail.com',
      password: '123'
    });
  
    if (error) {
      console.error('Error al iniciar sesión:', error.message);
      alert('Credenciales incorrectas o usuario no registrado');
      return;
    }
  
    const user = data.user;

    console.log('Usuario:', user); // Asegúrate de que sea válido
    console.log('UUID:', user.id); // Copia este y busca en Supabase
  
    // Obtener información desde la tabla User
    const { data: perfil, error: perfilError } = await supabase
      .from('User')
      .select('name, permission') 
      .eq('user_id', user.id)
      .single();
  
    if (perfilError) {
      console.error('Error obteniendo datos del perfil:', perfilError.message);
      alert('Error al cargar la información del usuario');
      return;
    }
  
    console.log(`¡Hola, ${perfil.name}!`);
  
    // Redirigir acorde al permission
    switch (perfil.permission) {
      case 'Employee':
        navigate('/dashboard-employee');
        break;
      case 'Manager':
      case 'TFS':
        navigate('/dashboard-admin');
        break;
      default:
        alert('Rol no reconocido');
    }
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
      {/* Left side */}
      <Box sx={{ 
        width: '50%', 
        height: '100%',
        background: 'linear-gradient(100deg, #973EBC 0%, #C264FF 100%)',
        display: 'flex',
        alignItems: 'center', 
        justifyContent: 'center',
        m: 0,
        p: 0
      }}>
        {/* Cuadrado morado claro con texto */}
        <Box sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.5)', 
          p: 6,
          width: '500px',
          height: '500px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.1)',
          borderRadius: '4px',
          transition: 'all 0.3s ease-in-out',
        }}>
          <Typography variant="h2" component="h1" sx={{ 
            color: 'white', 
            fontWeight: 'bold', 
            mb: 2,
            mt: 15,
            fontSize: '4rem',
            fontFamily: '"Graphik", "Arial", sans-serif',
            lineHeight: 1.5,
            textAlign: 'left',
          }}>
            Explore<br />Your Path
          </Typography>
          <Typography variant="h4" sx={{ 
            color: 'white', 
            opacity: 0.9,
            mt: 1,
            fontWeight: 'normal',
            fontFamily: '"Palanquin", "Arial", sans-serif',
            textAlign: 'left'
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
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: '#FFFFFF',
        m: 0,
        p: 0,
        position: 'relative'
      }}>
        
        <Box sx={{ 
          width: '80%',    
          maxWidth: '400px', 
          p: 2,
          textAlign: 'left',
          animation: 'fadeIn 0.6s ease-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          }
        }}>
          
          <Box sx={{ mb: 4 }}>
            <img 
              src="/src/brand/AccenturePurpleLogo.png"
              alt="Logo"
              style={{ 
                height: '50px', 
                width: 'auto',
                display: 'block'
              }}
            />
          </Box>
          
          <Typography component="h1" variant="h4" sx={{ 
            fontWeight: 'bold', 
            mb: 1,
            fontFamily: '"Graphik", "Arial", sans-serif',
            color: '#333333',
            textAlign: 'left', 
          }}>
            Hello !
          </Typography>
          
          <Typography variant="body1" sx={{ 
            color: 'text.secondary', 
            mb: 4,
            fontFamily: '"Palanquin", "Arial", sans-serif',
            textAlign: 'left', 
          }}>
            Enter your login information.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box sx={{ mb: 6, textAlign: 'left' }}>
              <Typography variant="body2" sx={{ 
                textAlign: 'left', 
                mb: 1,
                fontFamily: '"Palanquin", "Arial", sans-serif',
              }}>
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
                placeholder="Email"
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#E0E0E0',
                      transition: 'all 0.2s ease'
                    },
                    '&:hover fieldset': {
                      borderColor: '#973EBC'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#973EBC',
                      borderWidth: '1px'
                    }
                  }
                }}
                InputProps={{
                  style: { fontFamily: '"Palanquin", "Arial", sans-serif' }
                }}
              />
            </Box>

            <Box sx={{ mb: 1, textAlign: 'left' }}>
              <Typography variant="body2" sx={{ 
                textAlign: 'left', 
                mb: 1,
                fontFamily: '"Palanquin", "Arial", sans-serif',
              }}>
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
                placeholder="Password"
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#E0E0E0',
                      transition: 'all 0.2s ease'
                    },
                    '&:hover fieldset': {
                      borderColor: '#973EBC'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#973EBC',
                      borderWidth: '1px'
                    }
                  }
                }}
                InputProps={{
                  style: { fontFamily: '"Palanquin", "Arial", sans-serif' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                        size="small"
                        sx={{ color: '#973EBC' }}
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
              justifyContent: 'space-between'
            }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    value="remember" 
                    color="primary" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                    sx={{
                      '&.Mui-checked': {
                        color: '#973EBC',
                      }
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ 
                    fontFamily: '"Palanquin", "Arial", sans-serif'
                  }}>
                    Remember me
                  </Typography>
                }
              />

              <Link href="#" underline="hover" sx={{
                color: '#973EBC',
                fontFamily: '"Palanquin", "Arial", sans-serif',
                fontSize: '0.8rem',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#7B1FA2'
                }
              }}>
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                py: 1, 
                backgroundColor: '#973EBC', 
                '&:hover': { 
                  backgroundColor: '#7B1FA2',
                  boxShadow: '0 4px 12px rgba(151, 62, 188, 0.3)'
                },
                color: 'white',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '5px',
                fontFamily: '"Palanquin", "Arial", sans-serif',
                transition: 'all 0.3s ease'
              }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;