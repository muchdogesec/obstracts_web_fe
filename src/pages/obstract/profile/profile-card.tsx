import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Button, Modal, Box, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import { URLS } from '../../../services/urls.ts';

type Profile = {
  id: string;
  created: string;
  name: string;
  extractions: string[];
  whitelists: string[];
  aliases: string[];
  relationship_mode: string;
  extract_text_from_image: boolean;
};

interface ProfileCardProps {
  profile: Profile;
  onEdit: (profile: Profile) => void; // Function to handle edit
  onDelete: (id: string) => void; // Function to handle delete
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onEdit, onDelete }) => {
  const [openModal, setOpenModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const handleModalOpen = () => {
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
  };

  const handleEditClick = () => {
    onEdit(profile);
  };

  const handleDeleteClick = () => {
    onDelete(profile.id);
  };

  const handleConfirmDelete = () => {
    onDelete(profile.id);
    setOpenConfirmModal(false);
  };

  const handleCancelDelete = () => {
    setOpenConfirmModal(false); // Close confirmation modal
  };

  return (
    <>
      <Button
        variant="contained"
        color="error"
        onClick={handleDeleteClick}
        style={{ marginRight: '8px' }}
      >
        Delete
      </Button>

      {/* Confirmation Modal for Deletion */}
      <Modal open={openConfirmModal} onClose={handleCancelDelete} aria-labelledby="confirm-delete-title">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="confirm-delete-title" variant="h6" component="h2">
            Confirm Deletion
          </Typography>
          <Typography variant="body1" style={{ marginTop: '16px' }}>
            Are you sure you want to delete this profile: {profile.name}?
          </Typography>
          <Box mt={2}>
            <Button variant="contained" color="error" onClick={handleConfirmDelete}>
              Delete
            </Button>
            <Button variant="contained" onClick={handleCancelDelete} style={{ marginLeft: '8px' }}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ProfileCard;
