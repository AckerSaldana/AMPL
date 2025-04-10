import React from "react";
import { Box, Grid, Container } from "@mui/material";

// User page components
import { BannerProfile } from "../components/BannerProfile";
import { Information } from "../components/Information";
import { SkillsCard } from "../components/SkillsCard";
import { AssignmentPercentage } from "../components/AssignmentPercentage";
import { GoalsCard } from "../components/GoalsCard";
import { About } from "../components/About";
import { PastProjectsCard } from "../components/PastProjectsCard";

const ProfilePage = () => {
  const userData = {
    fullName: "Benito Antonio Martinez Ocasio",
    phone: "+1 234 567 890",
    email: "benito.martinez@example.com",
    level: 8,
    joinDate: "10/05/2023",
    lastProjectDate: "03/02/2025",
    about:
      "Benito Antonio Martínez Ocasio, known professionally as Bad Bunny, is not only a global music sensation but also a skilled front-end developer with a passion for creating immersive digital experiences. Born in Vega Baja, Puerto Rico, he initially pursued a degree in Software Development, where he honed his skills in JavaScript, React, and UI/UX design. While balancing his studies with a deep love for music, Benito developed a keen eye for aesthetics, seamlessly blending functionality with visually stunning interfaces. His approach to front-end development mirrors his artistic creativity—bold, innovative, and user-centric. Whether crafting dynamic web applications or designing sleek, responsive layouts, he brings the same energy and originality that define his music. Though his rise in the music industry took center stage, Benito remains deeply interested in technology, often collaborating on digital projects that push the boundaries of modern web development",
  };

  return (
    <Box
      sx={{
        p: 4,
        minHeight: "calc(100vh - 60px)",
        width: "100%", // Expanded navbar is 230px wide
        
      }}
    >
      <Grid container spacing={3}>
        <BannerProfile />
        <Grid container spacing={3}>
          {/* Left Section */}
          <Grid item xs={12} md={4}>
            <Information {...userData} />
            <AssignmentPercentage />
            <GoalsCard />
          </Grid>

          {/* Right Section */}
          <Grid item xs={12} md={8}>
            <About about={userData.about} />
            <SkillsCard />
            <PastProjectsCard />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
