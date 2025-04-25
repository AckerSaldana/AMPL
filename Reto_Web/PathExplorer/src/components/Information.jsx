import React, { useEffect, useState } from "react";
import { Paper, Box, Typography } from "@mui/material";
import {
  Person,
  Phone,
  Email,
  Star,
  CalendarToday,
  Work,
} from "@mui/icons-material";
import { supabase } from "../supabase/supabaseClient";

export const Information = () => {
  const [userData, setUserData] = useState({
    fullName: "",
    phone: "",
    email: "",
    level: 0,
    joinDate: "",
    lastProjectDate: "", //Exmpl data
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.error("No logged in user");
          return;
        }

        const { data: userInfo, error: userError } = await supabase
          .from("User")
          .select("user_id, name, last_name, mail, phone, level, enter_date")
          .eq("user_id", user.id)
          .single();

        if (userError) throw error;

            // Fetch project IDs from UserRole
        const { data: userProjects, error: roleError } = await supabase
        .from("UserRole")
        .select("project_id")
        .eq("user_id", user.id);

      if (roleError) throw roleError;

      const projectIds = userProjects.map((p) => p.project_id).filter(Boolean);

      let lastProjectDate = "";

      if (projectIds.length > 0) {
        const { data: projects, error: projectError } = await supabase
          .from("Project")
          .select("projectID, start_date")
          .in("projectID", projectIds);

        if (projectError) throw projectError;

        const mostRecent = projects
          .filter((p) => p.start_date)
          .sort(
            (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
          )[0];

        if (mostRecent?.start_date) {
          lastProjectDate = new Date(mostRecent.start_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        }
      }

        setUserData({
          fullName: `${userInfo.name} ${userInfo.last_name}`,
          phone: userInfo.phone || "",
          email: userInfo.mail || "",
          level: userInfo.level || 0,
          joinDate: new Date(userInfo.enter_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          lastProjectDate: lastProjectDate || "No recent project",
        });
      } catch (err) {
        console.error("Error loading user data:", err.message);
      }
    };

    fetchUserData();
  }, []);

  const { fullName, phone, email, level, joinDate, lastProjectDate } = userData;

  return (
    <Paper
      sx={{ p: 3, mb: 3, display: "flex", flexDirection: "column", gap: 1.5 }}
    >
      <Typography variant="body1">
        <b>Information</b>
      </Typography>

      {/* Full Name */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Person color="primary" />
        <Typography variant="body1">{fullName}</Typography>
      </Box>

      {/* Phone */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Phone color="primary" />
        <Typography variant="body1">{phone}</Typography>
      </Box>

      {/* Email */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Email color="primary" />
        <Typography variant="body1">{email}</Typography>
      </Box>

      {/* Level */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Star color="primary" />
        <Typography variant="body1">Level: {level}/12</Typography>
      </Box>

      {/* Join Date */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CalendarToday color="primary" />
        <Typography variant="body1">Joined: {joinDate}</Typography>
      </Box>

      {/* Last Project Date */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Work color="primary" />
        <Typography variant="body1">Last Project: {lastProjectDate}</Typography>
      </Box>
    </Paper>
  );
};
