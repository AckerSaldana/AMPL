import React from "react";
import {
  Box,
  Typography,
  Paper,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { ACCENTURE_COLORS } from "../styles/styles";
import RoleCard from "./RoleCard";

const RoleAssignmentsList = ({ roles, selectedRoleIndex, onRoleSelect }) => {
  return (
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100%",
      overflow: "hidden"
    }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            backgroundColor: ACCENTURE_COLORS.corePurple1,
            color: "#fff",
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            mr: 1.5,
            fontWeight: "bold"
          }}
        >
          1
        </Box>
        <Typography variant="subtitle1" fontWeight={700} color={ACCENTURE_COLORS.corePurple3}>
          AI Suggested Role Assignments
        </Typography>
      </Box>

      <Paper sx={{ 
        flexGrow: 1, 
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "none"
      }}>
        {roles.length > 0 ? (
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              p: 2,
              "&::-webkit-scrollbar": { width: "8px" },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "rgba(0,0,0,0.02)",
                borderRadius: "4px"
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: ACCENTURE_COLORS.accentPurple5,
                borderRadius: "4px",
                "&:hover": {
                  backgroundColor: ACCENTURE_COLORS.accentPurple4,
                }
              }
            }}
          >
            {roles.map((r, i) => (
              <React.Fragment key={`${r.id}-${i}`}>
                <RoleCard
                  role={r.role}
                  name={r.assigned?.name || "Sin asignar"}
                  avatar={r.assigned?.avatar}
                  percentage={r.assigned?.score || 0}
                  onClick={() => onRoleSelect(i)}
                  selected={selectedRoleIndex === i}
                />
                {i === selectedRoleIndex && (
                  <Box sx={{ mt: 1, mb: 2, px: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                      <InfoIcon fontSize="inherit" sx={{ mr: 0.5, color: ACCENTURE_COLORS.accentPurple3 }} />
                      Descripción: {r.description?.substring(0, 100)}...
                    </Typography>
                    {r.assigned && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Pesos: Técnico {r.assigned.weights?.technical || "60"}%, Contextual {r.assigned.weights?.contextual || "40"}%
                      </Typography>
                    )}
                  </Box>
                )}
              </React.Fragment>
            ))}
          </Box>
        ) : (
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            height: "100%",
            p: 4
          }}>
            <Typography variant="body1" color="text.secondary">
              No hay roles definidos para este proyecto
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default RoleAssignmentsList;