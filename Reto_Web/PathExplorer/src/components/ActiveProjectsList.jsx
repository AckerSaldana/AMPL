// src/components/ActiveProjectsList.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Button,
  alpha,
  Card,
  CardContent,
  Divider
} from "@mui/material";
import { supabase } from "../supabase/supabaseClient";

// Icons
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";
import { useNavigate } from "react-router-dom";

export const ActiveProjectsList = ({ userId, darkMode = false }) => {
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamCount, setTeamCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const navigate = useNavigate();
  
  // Theme color - match with profile purple color
  const profilePurple = '#9c27b0';

  useEffect(() => {
    const fetchActiveProject = async () => {
      try {
        setIsLoading(true);
        
        if (!userId) {
          throw new Error("User ID is required");
        }

        // Get the user's active project
        const { data: userRoles, error: roleError } = await supabase
          .from('UserRole')
          .select('project_id')
          .eq('user_id', userId);

        if (roleError) throw roleError;

        if (!userRoles || userRoles.length === 0) {
          // Set fallback data if no project found
          setProject({
            id: 'WE',
            title: 'Wellness platform for employees',
            status: 'In Progress',
            priority: 'High',
            startDate: '2025-04-28',
            dueDate: '2025-06-15'
          });
          setTeamCount(5);
          setTaskCount(8);
          return;
        }

        const projectIds = userRoles.map(r => r.project_id);
        
        // Get only active projects
        const { data: projectDetails, error: detailsError } = await supabase
          .from('Project')
          .select('projectID, title, status, priority, startDate, dueDate')
          .in('projectID', projectIds)
          .eq('status', 'Active')
          .limit(1);  // Get only one active project

        if (detailsError) throw detailsError;

        let activeProject;
        if (!projectDetails || projectDetails.length === 0) {
          // Set fallback data if no active project
          activeProject = {
            id: 'WE',
            title: 'Wellness platform for employees',
            status: 'In Progress',
            priority: 'High',
            startDate: '2025-04-28',
            dueDate: '2025-06-15'
          };
          setTeamCount(5);
          setTaskCount(8);
        } else {
          activeProject = {
            id: projectDetails[0].projectID,
            title: projectDetails[0].title,
            status: projectDetails[0].status || "In Progress",
            priority: projectDetails[0].priority || "High",
            startDate: projectDetails[0].startDate || "2025-04-28",
            dueDate: projectDetails[0].dueDate || "2025-06-15"
          };
          
          // Get team count for this project
          const { data: teamData, error: teamError } = await supabase
            .from('UserRole')
            .select('user_id')
            .eq('project_id', activeProject.id);

          if (!teamError && teamData) {
            const uniqueMembers = new Set(teamData.map(t => t.user_id));
            setTeamCount(uniqueMembers.size);
          } else {
            setTeamCount(5); // Fallback
          }
          
          // Get task count for this project
          const { data: taskData, error: taskError } = await supabase
            .from('Task')
            .select('id')
            .eq('project_id', activeProject.id);

          if (!taskError && taskData) {
            setTaskCount(taskData.length);
          } else {
            setTaskCount(8); // Fallback
          }
        }
        
        setProject(activeProject);
      } catch (err) {
        console.error("Error fetching active project:", err.message);
        setError(err.message);
        // Fallback data
        setProject({
          id: 'WE',
          title: 'Wellness platform for employees',
          status: 'In Progress',
          priority: 'High',
          startDate: '2025-04-28',
          dueDate: '2025-06-15'
        });
        setTeamCount(5);
        setTaskCount(8);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveProject();
  }, [userId]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress size={24} sx={{ color: profilePurple }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', p: 2, color: 'error.main' }}>
        <Typography variant="body2">Error loading active project</Typography>
      </Box>
    );
  }

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <WorkOutlineIcon sx={{ color: profilePurple, mr: 1.5 }} />
          <Typography variant="h6" fontWeight={500} sx={{ color: darkMode ? '#ffffff' : '#000000' }}>
            Active Project
          </Typography>
        </Box>
        <Button
          endIcon={<ArrowForwardIosIcon sx={{ fontSize: '0.7rem' }} />}
          sx={{
            color: profilePurple,
            '&:hover': { bgcolor: alpha(profilePurple, 0.05) },
            textTransform: 'none'
          }}
          onClick={() => navigate('/projects')}
        >
          View Details
        </Button>
      </Box>
      
      {project ? (
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: darkMode ? '1px solid rgba(255,255,255,0.12)' : `1px solid ${alpha(profilePurple, 0.1)}`,
            backgroundColor: darkMode ? '#3e3e3e' : '#ffffff',
            overflow: 'hidden',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: darkMode ? alpha(profilePurple, 0.5) : alpha(profilePurple, 0.3),
              bgcolor: darkMode ? alpha(profilePurple, 0.08) : alpha(profilePurple, 0.02)
            }
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Project header */}
            <Box sx={{ 
              p: 2.5, 
              borderBottom: darkMode ? '1px solid rgba(255,255,255,0.12)' : `1px solid ${alpha(profilePurple, 0.1)}`,
              display: 'flex',
              alignItems: 'center'
            }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(profilePurple, 0.1),
                  color: profilePurple,
                  mr: 2,
                  fontWeight: 'bold',
                  width: 48,
                  height: 48
                }}
              >
                {project.id.substring(0, 2)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: darkMode ? '#ffffff' : '#000000' }}>
                  {project.title}
                </Typography>
                <Chip 
                  label={`${project.status} • ${project.priority}`}
                  size="small"
                  sx={{ 
                    bgcolor: alpha(profilePurple, 0.1),
                    color: profilePurple,
                    fontWeight: 500,
                    height: 24
                  }}
                />
              </Box>
            </Box>
            
            {/* Project details */}
            <Box sx={{ p: 2 }}>
              <Box 
                sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2
                }}
              >
                {/* Date information */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(profilePurple, 0.1),
                      color: profilePurple,
                      width: 32,
                      height: 32,
                      mr: 1.5
                    }}
                  >
                    <CalendarTodayIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color={darkMode ? 'rgba(255,255,255,0.7)' : "text.secondary"}>
                      Timeline
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ color: darkMode ? '#ffffff' : '#000000' }}>
                      {formatDate(project.startDate)} - {formatDate(project.dueDate)}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Team size */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(profilePurple, 0.1),
                      color: profilePurple,
                      width: 32,
                      height: 32,
                      mr: 1.5
                    }}
                  >
                    <GroupIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color={darkMode ? 'rgba(255,255,255,0.7)' : "text.secondary"}>
                      Team Size
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ color: darkMode ? '#ffffff' : '#000000' }}>
                      {teamCount} members
                    </Typography>
                  </Box>
                </Box>
                
                {/* Task count */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(profilePurple, 0.1),
                      color: profilePurple,
                      width: 32,
                      height: 32,
                      mr: 1.5
                    }}
                  >
                    <AssignmentTurnedInIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color={darkMode ? 'rgba(255,255,255,0.7)' : "text.secondary"}>
                      Tasks
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ color: darkMode ? '#ffffff' : '#000000' }}>
                      {taskCount} total tasks
                    </Typography>
                  </Box>
                </Box>
                
                {/* Priority */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(profilePurple, 0.1),
                      color: profilePurple,
                      width: 32,
                      height: 32,
                      mr: 1.5
                    }}
                  >
                    <PriorityHighIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color={darkMode ? 'rgba(255,255,255,0.7)' : "text.secondary"}>
                      Priority
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ color: darkMode ? '#ffffff' : '#000000' }}>
                      {project.priority}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Action button */}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: profilePurple,
                    color: profilePurple,
                    '&:hover': {
                      borderColor: profilePurple,
                      bgcolor: alpha(profilePurple, 0.05)
                    }
                  }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  Manage Project
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box 
          sx={{ 
            textAlign: 'center', 
            p: 3, 
            color: 'text.secondary',
            border: darkMode ? '1px dashed rgba(255,255,255,0.2)' : `1px dashed ${alpha(profilePurple, 0.3)}`,
            borderRadius: 2,
            backgroundColor: darkMode ? '#2e2e2e' : 'transparent'
          }}
        >
          <Typography variant="body1" sx={{ mb: 2, color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>No active project assigned</Typography>
          <Button
            variant="contained"
            sx={{
              bgcolor: profilePurple,
              '&:hover': {
                bgcolor: '#7b1fa2'
              }
            }}
            onClick={() => navigate('/projects/new')}
          >
            Start a New Project
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ActiveProjectsList;