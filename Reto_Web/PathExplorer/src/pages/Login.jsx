import React, { useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Link,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import useBodyStyles from "../hooks/useBodyStyles.js";
import { useEffect } from "react";
import { useDarkMode } from "../contexts/DarkModeContext";
import { ACCENTURE_COLORS } from "../styles/styles";
import { alpha } from "@mui/material/styles";

import AccentureLogo from "../brand/AccenturePurpleLogo.png";

const Login = () => {
  const { darkMode } = useDarkMode();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  useBodyStyles();

  const navigate = useNavigate();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem("rememberedEmail");
    const storedPassword = localStorage.getItem("rememberedPassword");

    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    }

    if (storedPassword) {
      setPassword(storedPassword);
    }
  }, []);

  const handleRememberMeChange = (e) => {
    const checked = e.target.checked;
    setRememberMe(checked);

    if (!checked) {
      // Borrar de localStorage
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("rememberedPassword");

      // Limpiar del formulario
      setEmail("");
      setPassword("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log({ email, password, rememberMe });
    // Aquí va la lógica de autenticación
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email);
      localStorage.setItem("rememberedPassword", password);
    } else {
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("rememberedPassword");
    }

    if (error) {
      console.error("Error al iniciar sesión:", error.message);
      alert("Credenciales incorrectas o usuario no registrado");
      return;
    }

    const user = data.user;

    // Obtener información desde la tabla User
    const { data: perfil, error: perfilError } = await supabase
      .from("User")
      .select("name, permission")
      .eq("user_id", user.id)
      .single();

    if (perfilError) {
      console.error("Error obteniendo datos del perfil:", perfilError.message);
      alert("Error al cargar la información del usuario");
      return;
    }

    console.log(`¡Hola, ${perfil.name}!`);

    // Redirigir acorde al permission
    switch (perfil.permission) {
      case "Employee":
        navigate("/dashboard-employee");
        break;
      case "Manager":
      case "TFS":
        navigate("/dashboard-admin");
        break;
      default:
        alert("Rol no reconocido");
    }
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* Left side */}
      <Box
        sx={{
          width: "50%",
          height: "100%",
          background: "linear-gradient(100deg, #973EBC 0%, #C264FF 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          m: 0,
          p: 0,
        }}
      >
        {/* Cuadrado morado claro con texto */}
        <Box
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.5)",
            p: 6,
            width: "500px",
            height: "500px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.1)",
            borderRadius: "4px",
            transition: "all 0.3s ease-in-out",
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: "white",
              fontWeight: "bold",
              mb: 2,
              mt: 15,
              fontSize: "4rem",
              fontFamily: '"Graphik", "Arial", sans-serif',
              lineHeight: 1.5,
              textAlign: "left",
            }}
          >
            Explore
            <br />
            Your Path
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: "white",
              opacity: 0.9,
              mt: 1,
              fontWeight: "normal",
              fontFamily: '"Palanquin", "Arial", sans-serif',
              textAlign: "left",
            }}
          >
            Accent your future
          </Typography>
        </Box>
      </Box>

      {/* Right side - Login form */}
      <Box
        sx={{
          width: "50%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: darkMode ? "#121212" : "#FFFFFF",
          m: 0,
          p: 0,
          position: "relative",
          transition: "background-color 0.3s ease",
        }}
      >
        <Box
          sx={{
            width: "80%",
            maxWidth: "400px",
            p: 2,
            textAlign: "left",
            animation: "fadeIn 0.6s ease-out",
            "@keyframes fadeIn": {
              "0%": { opacity: 0, transform: "translateY(20px)" },
              "100%": { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <Box sx={{ mb: 4 }}>
            <img
              src={AccentureLogo}
              alt="Logo"
              style={{
                height: "50px",
                width: "auto",
                display: "block",
              }}
            />
          </Box>

          {!forgotMode ? (
            <>
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  mb: 1,
                  fontFamily: '"Graphik", "Arial", sans-serif',
                  color: darkMode ? "#ffffff" : "#333333",
                  textAlign: "left",
                }}
              >
                Hello !
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: darkMode ? "rgba(255,255,255,0.7)" : "text.secondary",
                  mb: 4,
                  fontFamily: '"Palanquin", "Arial", sans-serif',
                  textAlign: "left",
                }}
              >
                Enter your login information.
              </Typography>
            </>
          ) : (
            <>
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  mb: 1,
                  fontFamily: '"Graphik", "Arial", sans-serif',
                  color: darkMode ? "#ffffff" : "#333333",
                  textAlign: "left",
                }}
              >
                Reset your password
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: darkMode ? "rgba(255,255,255,0.7)" : "text.secondary",
                  mb: 4,
                  fontFamily: '"Palanquin", "Arial", sans-serif',
                  textAlign: "left",
                }}
              >
                We'll send you a link to reset it.
              </Typography>
            </>
          )}

          {!forgotMode ? (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Box sx={{ mb: 6, textAlign: "left" }}>
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: "left",
                    mb: 1,
                    fontFamily: '"Palanquin", "Arial", sans-serif',
                    color: darkMode ? "#ffffff" : "inherit",
                  }}
                >
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
                    "& .MuiOutlinedInput-root": {
                      bgcolor: darkMode ? "#1e1e1e" : "#ffffff",
                      color: darkMode ? "#ffffff" : "inherit",
                      "& fieldset": {
                        borderColor: darkMode
                          ? "rgba(255,255,255,0.23)"
                          : "#E0E0E0",
                        transition: "all 0.2s ease",
                      },
                      "&:hover fieldset": {
                        borderColor: "#973EBC",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#973EBC",
                        borderWidth: "1px",
                      },
                    },
                    "& .MuiInputBase-input::placeholder": {
                      color: darkMode
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(0,0,0,0.6)",
                      opacity: 1,
                    },
                  }}
                  InputProps={{
                    style: { fontFamily: '"Palanquin", "Arial", sans-serif' },
                  }}
                />
              </Box>

              <Box sx={{ mb: 1, textAlign: "left" }}>
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: "left",
                    mb: 1,
                    fontFamily: '"Palanquin", "Arial", sans-serif',
                    color: darkMode ? "#ffffff" : "inherit",
                  }}
                >
                  Password
                </Typography>
                <TextField
                  required
                  fullWidth
                  name="password"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  variant="outlined"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: darkMode ? "#1e1e1e" : "#ffffff",
                      color: darkMode ? "#ffffff" : "inherit",
                      "& fieldset": {
                        borderColor: darkMode
                          ? "rgba(255,255,255,0.23)"
                          : "#E0E0E0",
                        transition: "all 0.2s ease",
                      },
                      "&:hover fieldset": {
                        borderColor: "#973EBC",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#973EBC",
                        borderWidth: "1px",
                      },
                    },
                    "& .MuiInputBase-input::placeholder": {
                      color: darkMode
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(0,0,0,0.6)",
                      opacity: 1,
                    },
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
                          sx={{ color: "#973EBC" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 4,
                  justifyContent: "space-between",
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      value="remember"
                      color="primary"
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                      size="small"
                      sx={{
                        color: darkMode ? "rgba(255,255,255,0.7)" : "inherit",
                        "&.Mui-checked": {
                          color: "#973EBC",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: '"Palanquin", "Arial", sans-serif',
                        color: darkMode ? "#ffffff" : "inherit",
                      }}
                    >
                      Remember me
                    </Typography>
                  }
                />

                <Link
                  component="button"
                  onClick={() => setForgotMode(true)}
                  underline="hover"
                  sx={{
                    color: "#973EBC",
                    fontFamily: '"Palanquin", "Arial", sans-serif',
                    fontSize: "0.8rem",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: "#7B1FA2",
                    },
                  }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  py: 1,
                  backgroundColor: "#973EBC",
                  "&:hover": {
                    backgroundColor: "#7B1FA2",
                    boxShadow: "0 4px 12px rgba(151, 62, 188, 0.3)",
                  },
                  color: "white",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: "5px",
                  fontFamily: '"Palanquin", "Arial", sans-serif',
                  transition: "all 0.3s ease",
                }}
              >
                Sign In
              </Button>
            </Box>
          ) : (
            <Box sx={{ animation: "fadeIn 0.5s ease-out" }}>
              <Typography
                variant="body1"
                sx={{
                  color: darkMode ? "rgba(255,255,255,0.7)" : "text.secondary",
                  mb: 3,
                  fontFamily: '"Palanquin", "Arial", sans-serif',
                  textAlign: "left",
                }}
              >
                Enter the email associated with your account, and we'll send you
                a link to reset your password.
              </Typography>

              <TextField
                fullWidth
                size="small"
                type="email"
                placeholder="Email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: darkMode ? "#1e1e1e" : "#ffffff",
                    color: darkMode ? "#ffffff" : "inherit",
                    "& fieldset": {
                      borderColor: darkMode
                        ? "rgba(255,255,255,0.23)"
                        : "#E0E0E0",
                      transition: "all 0.2s ease",
                    },
                    "&:hover fieldset": {
                      borderColor: "#973EBC",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#973EBC",
                      borderWidth: "1px",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: darkMode
                      ? "rgba(255,255,255,0.5)"
                      : "rgba(0,0,0,0.6)",
                    opacity: 1,
                  },
                }}
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={async () => {
                    if (!recoveryEmail) {
                      alert("Please enter an email");
                      return;
                    }

                    const { error } = await supabase.auth.resetPasswordForEmail(
                      recoveryEmail,
                      {
                        redirectTo: "http://localhost:3000/update-password",
                      }
                    );

                    if (error) {
                      alert("Error sending recovery email: " + error.message);
                    } else {
                      alert("Recovery email sent. Check your inbox.");
                      setForgotMode(false);
                      setRecoveryEmail("");
                    }
                  }}
                  sx={{
                    backgroundColor: "#973EBC",
                    color: "white",
                    textTransform: "none",
                    fontFamily: '"Palanquin", "Arial", sans-serif',
                    "&:hover": {
                      backgroundColor: "#7B1FA2",
                    },
                  }}
                >
                  Send Link
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => {
                    setForgotMode(false);
                    setRecoveryEmail("");
                  }}
                  sx={{
                    textTransform: "none",
                    fontFamily: '"Palanquin", "Arial", sans-serif',
                    color: darkMode ? "rgba(255,255,255,0.7)" : "inherit",
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
