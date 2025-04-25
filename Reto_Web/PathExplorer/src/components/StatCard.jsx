import React from "react";
import { Box, Typography, Paper } from "@mui/material";

/**
 * Componente para mostrar estadísticas generales con el diseño de la imagen de referencia
 * @param {Object} props - Propiedades del componente
 * @param {React.Component} props.icon - Componente de icono a mostrar
 * @param {string} props.title - Título de la estadística
 * @param {number|string} props.value - Valor de la estadística
 * @param {string} props.bgColor - Color de fondo del icono (formato rgba o hex)
 */
const StatCard = ({ icon: Icon, title, value, bgColor }) => (
  <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          bgcolor: bgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mr: 2
        }}
      >
        <Icon sx={{ color: "white" }} />
      </Box>
      <Box>
        <Typography variant="h4" fontWeight={500} color={bgColor.replace("20", "")}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

export default StatCard;