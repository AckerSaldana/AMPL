import React from "react";
import { Box, Typography, Paper, Avatar, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  WorkspacePremium,
  Code,
  CalendarMonth,
  Person,
  Business,
} from "@mui/icons-material";
import { ACCENTURE_COLORS } from "../styles/styles";

// Item por defecto para evitar errores con propiedades indefinidas
const defaultItem = {
  id: "default",
  name: "Evento",
  type: "project",
  displayDate: "Sin fecha",
  role: "Sin rol",
  issuer: "Sin emisor",
  description: "",
  company: ""
};

const TimelineItem = ({ item = defaultItem, isLast = false, index = 0 }) => {
  // Combinamos el item por defecto con el item proporcionado para asegurar todas las propiedades
  const safeItem = { ...defaultItem, ...item };
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getColor = () => {
    return safeItem.type === "project" 
      ? ACCENTURE_COLORS.corePurple1
      : ACCENTURE_COLORS.corePurple2;
  };

  const Icon = safeItem.type === "project" ? Code : WorkspacePremium;

  return (
    <Box
      sx={{
        display: "flex",
        position: "relative",
        mb: isLast ? 0 : 5,
      }}
    >
      {/* Left column with timeline element */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: { xs: 50, md: 80 },
          flexShrink: 0,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Avatar
          sx={{
            width: { xs: 36, md: 44 },
            height: { xs: 36, md: 44 },
            bgcolor: "#fff",
            color: getColor(),
            border: `2px solid ${getColor()}`,
            boxShadow: `0 0 0 4px ${getColor()}10`,
            zIndex: 2,
          }}
        >
          <Icon fontSize="small" />
        </Avatar>
        {!isLast && (
          <Box
            sx={{
              width: 2,
              height: "calc(100% + 40px)", // Extend to connect with next icon
              position: "absolute",
              top: { xs: 36, md: 44 },
              bgcolor: ACCENTURE_COLORS.corePurple1, // Using Accenture's primary purple
              zIndex: 1,
            }}
          />
        )}
      </Box>

      {/* Right column with content */}
      <Box sx={{ flex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            bgcolor: "#fff",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.03)",
            border: `1px solid ${getColor()}10`,
            position: "relative",
            "&:hover": {
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
              transform: "translateY(-2px)",
              transition: "all 0.2s ease",
            },
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 500,
              color: ACCENTURE_COLORS.black,
              mb: 1.5,
            }}
          >
            {safeItem.name}
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CalendarMonth
                fontSize="small"
                sx={{ color: ACCENTURE_COLORS.accentPurple1 }}
              />
              <Typography
                variant="body2"
                sx={{ color: ACCENTURE_COLORS.darkGray }}
              >
                {safeItem.displayDate}
              </Typography>
            </Box>

            {safeItem.type === "project" ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Person
                  fontSize="small"
                  sx={{ color: ACCENTURE_COLORS.corePurple1 }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: ACCENTURE_COLORS.darkGray }}
                >
                  {safeItem.role}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Business
                  fontSize="small"
                  sx={{ color: ACCENTURE_COLORS.corePurple2 }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: ACCENTURE_COLORS.darkGray }}
                >
                  {safeItem.issuer}
                </Typography>
              </Box>
            )}
          </Box>

          {safeItem.type === "project" && safeItem.description && (
            <Typography
              variant="body2"
              sx={{
                color: ACCENTURE_COLORS.darkGray,
                mt: 1.5,
                fontStyle: "italic",
              }}
            >
              {safeItem.description}
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

const CareerTimeline = ({ timelineItems = [] }) => {
  // Aseguramos que timelineItems sea un array
  const safeTimelineItems = Array.isArray(timelineItems) ? timelineItems : [];

  return (
    <Box
      sx={{
        position: "relative",
        pb: 2,
        pl: { xs: 0, sm: 2 },
        pr: { xs: 0, sm: 2 },
      }}
    >
      {/* Solo mostramos la línea si hay elementos */}
      {safeTimelineItems.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            left: { xs: 38, md: 53 },
            width: 6,  // Línea más delgada para un aspecto más elegante
            top: 22,
            bottom: 22,
            bgcolor: `${ACCENTURE_COLORS.corePurple1}20`,  // Más sutil
            borderRadius: 4,
            zIndex: 1,
          }}
        />
      )}
      
      {safeTimelineItems.map((item, index) => (
        <TimelineItem
          key={`${item?.type || 'item'}-${item?.id || index}`}
          item={item}
          index={index}
          isLast={index === safeTimelineItems.length - 1}
        />
      ))}

      {/* Mensaje cuando no hay elementos */}
      {safeTimelineItems.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            bgcolor: "#fff",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.03)",
            textAlign: "center",
            border: `1px dashed ${ACCENTURE_COLORS.corePurple1}30`
          }}
        >
          <Typography
            variant="body1"
            sx={{ color: ACCENTURE_COLORS.darkGray }}
          >
            No hay eventos en tu cronología aún.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default CareerTimeline;