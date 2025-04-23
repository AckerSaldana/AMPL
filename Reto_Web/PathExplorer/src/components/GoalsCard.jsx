import { Paper, Typography } from "@mui/material";
import React from "react";

export const GoalsCard = () => {
  return (
    <Paper sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography variant="body1" fontWeight={"bold"}>
        Goals
      </Typography>

      <Typography variant="body2" fontWeight={"bold"} color="text.secondary">
        Short-Term
      </Typography>
      <Typography variant="caption" color="text.primary">
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Obcaecati,
        fugiat harum? Natus nihil voluptatum harum nobis iusto vero sint,
        suscipit voluptates? Libero repellendus dolorum ullam odio debitis quo
        quaerat quas.
      </Typography>

      <Typography variant="body2" fontWeight={"bold"} color="text.secondary">
        Mid-Term
      </Typography>
      <Typography variant="caption" color="text.primary">
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Obcaecati,
        fugiat harum? Natus nihil voluptatum harum nobis iusto vero sint,
        suscipit voluptates? Libero repellendus dolorum ullam odio debitis quo
        quaerat quas.
      </Typography>

      <Typography variant="body2" fontWeight={"bold"} color="text.secondary">
        Long-Term
      </Typography>
      <Typography variant="caption" color="text.primary">
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Obcaecati,
        fugiat harum? Natus nihil voluptatum harum nobis iusto vero sint,
        suscipit voluptates? Libero repellendus dolorum ullam odio debitis quo
        quaerat quas.
      </Typography>
    </Paper>
  );
};
