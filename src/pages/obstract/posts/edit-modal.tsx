import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { changePostProfileId, fetchObstractProfiles, Post, Profile } from '../../../services/obstract.ts';

type EditPostModalProps = {
  open: boolean;
  onClose: () => void;
  post: Post | null;
  onSave: () => void;
  feed_id: string;
};

const EditPostModal: React.FC<EditPostModalProps> = ({
  open,
  onClose,
  post,
  onSave,
  feed_id,
}) => {
  const [formData, setFormData] = useState<{ profile_id: string }>({
    profile_id: post?.profile_id || ''
  });
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const loadProfiles = async (pageNumber: number) => {
    const res = await fetchObstractProfiles(pageNumber); // Pass page number and size
    setProfiles(res.data.profiles);
  };


  useEffect(() => {
    loadProfiles(1)
  }, [])

  useEffect(() => {
    setFormData({
      profile_id: post?.profile_id || ''
    })
  }, [open, post])

  const handleProfileChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      profile_id: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      await changePostProfileId(feed_id, post?.id || '', formData.profile_id)
      onSave();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent style={{ width: '30vw' }}>
        <Box>
          <Typography variant="h6" mb={2}>Change post profile</Typography>
          <form onSubmit={handleSubmit}>
            <Box marginY={2} style={{ display: 'flex', flexDirection: 'column' }}>
              <Box>
                <strong>Profile:</strong>
              </Box>
              <Select
                style={{ flex: 'auto' }}
                name="extractions"
                value={formData.profile_id}
                onChange={(e) => handleProfileChange(e.target.value)}
              >
                {profiles.map((profile) => (
                  <MenuItem key={profile.id} value={profile.id}>{profile.name}</MenuItem>
                ))}
              </Select>
            </Box>
            <Button variant="contained" type="submit" fullWidth style={{ marginTop: '16px' }}>
              Save
            </Button>
          </form>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostModal;
