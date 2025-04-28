import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import UserProfileDetail from '../pages/UserProfileDetail';

const UserProfileModal = ({ open, onClose, userId }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <UserProfileDetail 
        userId={userId} 
        isModal={true} 
        onClose={onClose} 
      />
    </Dialog>
  );
};

export default UserProfileModal;