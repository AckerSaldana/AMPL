import React from "react";
import {
  Box,
  Typography,
  Paper,
} from "@mui/material";
import { ACCENTURE_COLORS } from "../styles/styles";
import MatchedEmployeeCard from "./MatchedEmployeeCard";

const CandidateMatchesList = ({ 
  roles, 
  selectedRoleIndex, 
  availableCandidates, 
  onCandidateSelect 
}) => {
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
          2
        </Box>
        <Typography variant="subtitle1" fontWeight={700} color={ACCENTURE_COLORS.corePurple3}>
          {roles.length > 0 ? (
            <>
              Candidate Matches for{" "}
              <Typography component="span" color={ACCENTURE_COLORS.corePurple2} sx={{ fontWeight: 700 }}>
                {roles[selectedRoleIndex]?.role || ""}
              </Typography>
            </>
          ) : (
            "Candidate Matches"
          )}
        </Typography>
      </Box>

      <Paper sx={{ 
        flexGrow: 1, 
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "none",
        backgroundColor: "rgba(255,255,255,0.8)"
      }}>
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
          {roles.length > 0 ? (
            availableCandidates.length > 0 ? (
              availableCandidates.map(match => (
                <MatchedEmployeeCard
                  key={match.id}
                  name={match.name}
                  avatar={match.avatar}
                  score={match.score || match.combinedScore || 0}
                  technicalScore={match.technicalScore || 0}
                  contextualScore={match.contextualScore || 0}
                  weights={match.weights || { technical: 60, contextual: 40 }}
                  onSelect={() => onCandidateSelect(selectedRoleIndex, match.id)}
                />
              ))
            ) : (
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                height: "100%",
                p: 4
              }}>
                <Typography variant="body1" color="text.secondary">
                  No hay más candidatos disponibles para este rol
                </Typography>
              </Box>
            )
          ) : (
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              height: "100%",
              p: 4
            }}>
              <Typography variant="body1" color="text.secondary">
                Seleccione un rol primero
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default CandidateMatchesList;