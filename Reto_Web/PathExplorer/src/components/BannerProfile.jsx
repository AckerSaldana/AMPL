import React, { useEffect, useState } from "react";
import { Box, Avatar, Typography, Paper, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

export const BannerProfile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    role: "",
    profilePic: "",
  });

  useEffect(() => {
    const fetchUserBanner = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return;

      // Fetch basic user info
      const { data: userData, error: userDataError } = await supabase
        .from("User")
        .select("name, last_name, profile_pic")
        .eq("user_id", user.id)
        .single();

      if (userDataError) {
        console.error("User fetch error:", userDataError.message);
        return;
      }

      // Fetch role
      const { data: roleData, error: roleError } = await supabase
        .from("UserRole")
        .select("role_name")
        .eq("user_id", user.id)
      
        const firstRole = Array.isArray(roleData) ? roleData[0]?.role_name : "";

      if (roleError) {
        console.error("Role fetch error:", roleError.message);
        return;
      }

      const rawName = userData.name?.trim() || "";
      const rawLastName = userData.last_name?.trim() || "";

      const nameParts = rawName.split(" ");
      const lastNameParts = rawLastName.split(" ");

      const firstName = nameParts[0] || rawName || "User";
      const lastName = lastNameParts[0] || "";

      setUserInfo({
        firstName,
        lastName,
        role: firstRole || "No role assigned",
        profilePic: userData.profile_pic || "/default-profile.jpg",
      });
    };

    fetchUserBanner();
  }, []);

  return (
    <Paper
      sx={{
        position: "relative",
        height: 260,
        width: "100%",
        backgroundImage: "url('/defaultBanner.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "column",
        textAlign: "left",
        p: 3,
        overflow: "hidden",
        "&::before": {
          content: "''",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
          zIndex: 1,
        },
        "&::after": {
          content: "''",
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "50px",
          backgroundColor: "white",
          zIndex: 2,
        },
      }}
    >
      {/* Profile Info */}
      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          left: 30,
          display: "flex",
          alignItems: "center",
          zIndex: 3,
        }}
      >
        <Avatar
          src={userInfo.profilePic}
          sx={{ width: 100, height: 100, border: "3px solid white" }}
        />
        <Box sx={{ ml: 2, color: "white", position: "relative", bottom: 15 }}>
          <Typography variant="h5">
            {userInfo.firstName} {userInfo.lastName}
          </Typography>
          <Typography variant="subtitle1">{userInfo.role}</Typography>
        </Box>
      </Box>

      {/* Edit Profile Button */}
      <Button
        variant="contained"
        sx={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 3,
          backgroundColor: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(5px)",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.3)",
          },
        }}
        onClick={() => navigate("/edit-profile")}
      >
        Edit Profile
      </Button>
    </Paper>
  );
};
