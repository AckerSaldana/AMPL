import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  AvatarGroup,
  Chip,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import { supabase } from "../supabase/supabaseClient";

export const PastProjectsCard = ({ darkMode = false }) => {
  const theme = useTheme();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!user || userError) return;

      // Get current user's roles in projects
      const { data: rolesData, error: rolesError } = await supabase
        .from("UserRole")
        .select("project_id, role_name")
        .eq("user_id", user.id);

      if (rolesError || !rolesData.length) return;

      const projectIDs = rolesData.map((r) => r.project_id);

      // Get project titles
      const { data: projectData, error: projectError } = await supabase
        .from("Project")
        .select("projectID, title")
        .in("projectID", projectIDs);

      if (projectError) return;

      // Get team members
      const { data: allRoles, error: teamError } = await supabase
        .from("UserRole")
        .select("project_id, User:User(user_id, name, profile_pic)")
        .in("project_id", projectIDs);

      const teamByProject = {};
      allRoles?.forEach(({ project_id, User }) => {
        if (!teamByProject[project_id]) teamByProject[project_id] = [];
        if (User) {
          teamByProject[project_id].push({
            name: User.name || "User",
            avatar: User.profile_pic || "",
          });
        }
      });

      const roleSkillRequests = await Promise.all(
        rolesData.map(async ({ role_name, project_id }) => {
          // Get skills for the role and project
          const { data: roleSkillsData, error: skillError } = await supabase
            .from("RoleSkill")
            .select("skill_id")
            .eq("role_name", role_name)
      
          if (skillError || !roleSkillsData?.length) {
            console.error("RoleSkill fetch error:", skillError?.message);
            return { key: `${project_id}_${role_name}`, skills: [] };
          }
      
          const skillIds = roleSkillsData.map((s) => s.skill_id);
      
          // Fetch Skill titles
          const { data: skillsData, error: titleError } = await supabase
            .from("Skill")
            .select("name")
            .in("skill_ID", skillIds); 
      
          if (titleError) {
            console.error("Skill title fetch error:", titleError.message);
            return { key: `${project_id}_${role_name}`, skills: [] };
          }
      
          return {
            key: `${project_id}_${role_name}`,
            skills: skillsData?.map((s) => s.name) || [],
          };
        })
      );
      
      const skillMap = {};
      roleSkillRequests.forEach(({ key, skills }) => {
        skillMap[key] = skills;
      });

      const finalProjects = rolesData.map(({ project_id, role_name }) => {
        const project = projectData.find((p) => p.projectID === project_id);
        const team = teamByProject[project_id] || [];
        const skills = skillMap[`${project_id}_${role_name}`] || [];

        return {
          title: project?.title || "Unnamed Project",
          team,
          role: role_name,
          skills,
        };
      });

      setProjects(finalProjects);
    };

    fetchProjects();
  }, []);

  return (
    <Paper sx={{ 
      padding: 2, 
      overflow: "auto", 
      width: "100%",
      backgroundColor: darkMode ? '#2e2e2e' : '#ffffff',
      border: darkMode ? '1px solid rgba(255,255,255,0.12)' : 'none'
    }}>
      <Typography variant="body1" fontWeight={"bold"} sx={{ color: darkMode ? '#ffffff' : '#000000' }}>
        Past Projects
      </Typography>
      <Box sx={{ overflowX: "auto" }}>
        <Table sx={{ tableLayout: "fixed", width: "100%" }}>
          <TableHead>
            <TableRow>
              {["Title", "Team", "Role", "Skills Used / Attained"].map(
                (header, index) => (
                  <TableCell
                    key={index}
                    sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : theme.palette.text.secondary }}
                  >
                    <strong>{header}</strong>
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {projects.map((project, index) => (
              <TableRow key={index}>
                <TableCell sx={{ color: darkMode ? '#ffffff' : '#000000' }}>{project.title}</TableCell>
                <TableCell>
                  <AvatarGroup
                    max={4}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      "& .MuiAvatar-root": {
                        width: 24,
                        height: 24,
                        fontSize: 10,
                        bgcolor: theme.palette.primary.main,
                      },
                    }}
                  >
                    {project.team.map((member, i) => (
                      <Avatar
                        key={i}
                        src={member.avatar}
                        alt={member.name}
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: theme.palette.primary.main,
                        }}
                      />
                    ))}
                  </AvatarGroup>
                </TableCell>
                <TableCell sx={{ color: darkMode ? '#ffffff' : '#000000' }}>{project.role}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      maxWidth: 250,
                      overflowX: "auto",
                      whiteSpace: "nowrap",
                      "&::-webkit-scrollbar": {
                        height: 0,
                      },
                    }}
                  >
                    {project.skills.map((skill, i) => (
                      <Chip
                        key={i}
                        label={skill}
                        sx={{
                          margin: "2px",
                          backgroundColor: darkMode ? theme.palette.primary.dark : theme.palette.primary.light,
                          color: theme.palette.common.white,
                        }}
                      />
                    ))}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};
