// src/components/ProjectCard.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  AvatarGroup, 
  LinearProgress, 
  Chip, 
  IconButton,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ProjectCard = ({ project, onEdit, onDelete, onViewDetails }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleClose();
    if (onEdit) onEdit(project);
  };

  const handleDelete = () => {
    handleClose();
    if (onDelete) onDelete(project);
  };

  const handleViewDetails = () => {
    handleClose();
    if (onViewDetails) onViewDetails(project);
  };

  const getProgressColor = () => {
    if (project.status === 'Completed') return 'success.main';
    if (project.progress >= 70) return '#8bc34a';
    if (project.progress >= 30) return '#9c27b0';
    return '#e0e0e0';
  };

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 1,
        overflow: 'visible',
        boxShadow: 'none',
        border: '1px solid rgba(0,0,0,0.12)',
      }}
    >
      <CardContent sx={{ p: 2.5, pb: 2, flexGrow: 1, backgroundColor: '#ffffff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Chip 
            label={project.status} 
            size="small"
            sx={{
              height: '24px',
              borderRadius: 5,
              backgroundColor: 
                project.status === 'In Progress' 
                  ? 'rgba(155, 79, 234, 0.1)' 
                  : project.status === 'Completed' 
                    ? 'rgba(111, 207, 151, 0.1)' 
                    : 'rgba(245, 159, 0, 0.1)',
              color: 
                project.status === 'In Progress' 
                  ? 'rgb(155, 79, 234)' 
                  : project.status === 'Completed' 
                    ? 'rgb(111, 207, 151)' 
                    : 'rgb(245, 159, 0)',
              fontWeight: 500,
              fontSize: '0.7rem',
              '& .MuiChip-label': {
                px: 1
              }
            }}
          />
          <IconButton 
            size="small" 
            onClick={handleClick}
            aria-controls={open ? 'project-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            id="project-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'project-menu-button',
            }}
          >
            {onEdit && <MenuItem onClick={handleEdit}>Edit Project</MenuItem>}
            <MenuItem onClick={handleViewDetails}>View Details</MenuItem>
            <Divider />
            {onDelete && (
              <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                Delete Project
              </MenuItem>
            )}
          </Menu>
        </Box>

        <Box sx={{ display: 'flex', mb: 1 }}>
          <Box 
            sx={{ 
              mr: 2, 
              width: 55, 
              height: 55, 
              borderRadius: 0.5,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: project.logoBackground || '#f5f5f5'
            }}
          >
            {project.logo ? (
              <img 
                src={project.logo} 
                alt={project.title} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain' 
                }} 
              />
            ) : (
              <Typography variant="h6" sx={{ color: '#fff' }}>
                {project.title.charAt(0)}
              </Typography>
            )}
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5, fontSize: '0.95rem' }}>
              {project.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {project.description}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ mt: 3, mb: 0.5, fontWeight: 500, fontSize: '0.75rem' }}>
          Team:
        </Typography>
        <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', mt: 2 }}>
        <AvatarGroup
            max={4}
            sx={{
              justifyContent: 'flex-start',
              mb: 2,
              '& .MuiAvatar-root': {
                width: 36,
                height: 36,
                fontSize: '0.75rem',
                border: '2px solid #fff',
              },
              '& .MuiAvatarGroup-avatar': {
                width: 36,
                height: 36,
                fontSize: '0.75rem',
              }
            }}
          >
            {project.team.map((member, index) => (
              <Avatar 
                key={index} 
                alt={member.name}
                src={member.avatar || undefined}
                sx={{
                  bgcolor: member.avatar
                    ? 'transparent'
                    : ['#f44336', '#2196f3', '#4caf50', '#ff9800'][index % 4],
                }}
              >
                {!member.avatar && member.name ? member.name.charAt(0).toUpperCase() : ''}
              </Avatar>
            ))}
          </AvatarGroup>

        </Box>

        <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
          <span>Project Progress:</span>
          <span>{project.progress}%</span>
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={project.progress} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            mb: 3,
            bgcolor: 'rgba(0,0,0,0.06)',
            '& .MuiLinearProgress-bar': {
              bgcolor: getProgressColor(),
            }
          }} 
        />

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 'auto',
          pt: 2,
          borderTop: '1px solid rgba(0,0,0,0.08)'
        }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              Assigned Date:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
              {project.assignedDate}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              Due Date:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
              {project.dueDate}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
