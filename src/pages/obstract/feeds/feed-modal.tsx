import React, { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { createObstractFeed, Feed, fetchObstractProfiles, Profile, updateObstractFeed } from '../../../services/obstract.ts';
import LoadingButton from '../../../components/loading_button/index.tsx';

interface AddEntryDialogProps {
  open: boolean;
  feed?: Feed,
  isEdit?: boolean;
  onClose: () => void;
  onAddEntry: () => void;
}

const AddEntryDialog: React.FC<AddEntryDialogProps> = ({
  open,
  feed,
  isEdit,
  onClose,
  onAddEntry,
}) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    profile_id: '',
    url: '',
    include_remote_blogs: false,
    is_public: false,
    polling_schedule_minute: 0,
    title: '',
    description: '',
    pretty_url: '',
  });
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [errors, setErrors] = useState<{
    url?: string[],
    profile_id?: string[],
    title?: string[],
    description?: string[],
    pretty_url?: string[],
    non_field_errors?: string[],
  }>({
    url: [],
    profile_id: [],
    title: [],
    description: [],
    pretty_url: [],
  })

  const loadProfiles = async (pageNumber: number) => {
    const res = await fetchObstractProfiles(pageNumber);
    setProfiles(res.data.profiles);
  };

  useEffect(() => {
    loadProfiles(1)
  }, [])

  useEffect(() => {
    // Reset form for adding a new entry
    setFormData({
      profile_id: feed?.profile_id ?? '',
      url: feed?.obstract_feed_metadata.url ?? '',
      include_remote_blogs: feed?.obstract_feed_metadata.include_remote_blogs || false,
      is_public: feed?.is_public ?? false,
      polling_schedule_minute: feed?.polling_schedule_minute ?? 0,
      title: feed?.obstract_feed_metadata.title ?? '',
      description: feed?.obstract_feed_metadata.description ?? '',
      pretty_url: feed?.obstract_feed_metadata.pretty_url ?? '',
    });
    setErrors({})
  }, [open, feed]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleProfileChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      profile_id: value
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    try {
      await updateObstractFeed(feed?.id || '', formData);
      onAddEntry();
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setErrors(err.response.data.details || err.response.data)
      } else {
        throw err
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    try {
      await createObstractFeed(formData); // Add new entry
      setFormData({
        profile_id: '',
        url: '',
        include_remote_blogs: false,
        is_public: false,
        polling_schedule_minute: 0,
        title: '',
        description: '',
        pretty_url: '',
      });
      onAddEntry();
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setErrors(err.response.data.details || err.response.data)
      } else {
        throw err
      }
    } finally {
      setLoading(false)
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Edit a Feed' : 'Add a New Feed'}
      </Typography>
      <Typography>
        {isEdit ? <>
          Feed ID: {feed?.id || ''}
        </> :
          <>
            Add a new feed. Make it public to expose it to all users. You can change a feed from private to public at any time
          </>}
      </Typography>

      {!isEdit && <Box marginY={2}>
        <strong>Profile</strong><span>(Profile to use for extraction)</span>
        <Select
          name="profile"
          label="Profile"
          style={{ flex: 'auto' }}
          fullWidth
          value={formData.profile_id}
          onChange={(e) => handleProfileChange(e.target.value)}
        >
          {profiles.map((profile) => (
            <MenuItem key={profile.id} value={profile.id}>{profile.name}</MenuItem>
          ))}
        </Select>
        {errors?.profile_id?.map(error => <Typography sx={{ color: 'red' }}>{error}</Typography>)}
      </Box>}

      <Box marginY={2}>
        <strong>URL</strong><span>(Blog URL)</span>
        <TextField
          margin="dense"
          name="url"
          label="URL"
          type="url"
          fullWidth
          value={formData.url}
          onChange={handleChange}
          required
        />
        {errors?.url?.map(error => <Typography sx={{ color: 'red' }}>{error}</Typography>)}
      </Box>

      <Box marginY={2}>
        <strong>Title</strong><span>(Optional)</span>
        <TextField
          margin="dense"
          name="title"
          label="Title"
          type="text"
          fullWidth
          value={formData.title}
          onChange={handleChange}
        />
        {errors?.title?.map(error => <Typography sx={{ color: 'red' }}>{error}</Typography>)}
      </Box>

      <Box marginY={2}>
        <strong>Description</strong><span>(Optional)</span>
        <TextField
          margin="dense"
          name="description"
          label="Description"
          type="description"
          fullWidth
          value={formData.description}
          onChange={handleChange}
        />
        {errors?.description?.map(error => <Typography sx={{ color: 'red' }}>{error}</Typography>)}
      </Box>

      <Box marginY={2}>
        <strong>Pretty URL</strong><span>(Optional)</span>
        <TextField
          margin="dense"
          name="pretty_url"
          label="Pretty URL"
          type="pretty_url"
          fullWidth
          value={formData.pretty_url}
          onChange={handleChange}
        />
        {errors?.pretty_url?.map(error => <Typography sx={{ color: 'red' }}>{error}</Typography>)}
      </Box>


      {!isEdit && <FormControlLabel
        control={
          <Switch
            checked={formData.include_remote_blogs}
            onChange={handleChange}
            name="include_remote_blogs"
            color="primary"
          />
        }
        label="Include Remote Blogs (history4feed setting)"
      />}

      <FormControlLabel
        control={
          <Switch
            checked={formData.is_public}
            onChange={handleChange}
            name="is_public"
            color="primary"
          />
        }
        label="Is Public (make visible to users)"
      />
      <TextField
        margin="dense"
        name="polling_schedule_minute"
        label="Polling schedule (Minutes)"
        type="number"
        fullWidth
        value={formData.polling_schedule_minute}
        onChange={handleChange}
        required
      />

      {errors?.non_field_errors?.map(error => <Typography sx={{ color: 'red' }}>{error}</Typography>)}

      <Box sx={{ marginTop: '1rem' }}>
        <Button variant='contained' color='error' onClick={onClose}>
          Cancel
        </Button>
        {isEdit ? <LoadingButton isLoading={loading} variant='contained' color='success' sx={{ marginLeft: '1rem' }} onClick={handleUpdate}>
          Submit
        </LoadingButton> :
          <LoadingButton isLoading={loading} variant='contained' color='success' sx={{ marginLeft: '1rem' }} onClick={handleSubmit}>
            Add
          </LoadingButton>
        }
      </Box>

    </Box >
  );
};

export default AddEntryDialog;
