import { Paper, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";

export const GoalsCard = () => {

  const [goals, setGoals] = useState(["", "", ""]);

  useEffect(() => {
    const fetchGoals = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return;

      const { data, error } = await supabase
        .from("User")
        .select("goals")
        .eq("user_id", user.id)
        .single();

      if (!error && Array.isArray(data?.goals)) {
        const [short = "", mid = "", long = ""] = data.goals;
        setGoals([short, mid, long]);
      }
    };

    fetchGoals();
  }, []);

  const [shortTerm, midTerm, longTerm] = goals;

  return (
    <Paper sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography variant="body1" fontWeight={"bold"}>
        Goals
      </Typography>

      <Typography variant="body2" fontWeight={"bold"} color="text.secondary">
        Short-Term
      </Typography>
      <Typography variant="caption" color="text.primary">
        {shortTerm || "No short-term goal set."}
      </Typography>

      <Typography variant="body2" fontWeight={"bold"} color="text.secondary">
        Mid-Term
      </Typography>
      <Typography variant="caption" color="text.primary">
          {midTerm || "No mid-term goal set."}
      </Typography>

      <Typography variant="body2" fontWeight={"bold"} color="text.secondary">
        Long-Term
      </Typography>
      <Typography variant="caption" color="text.primary">
          {longTerm || "No long-term goal set."}
      </Typography>
    </Paper>
  );
};
