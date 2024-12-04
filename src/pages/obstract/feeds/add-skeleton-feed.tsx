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
import { createObstractFeed, createObstractSkeletonFeed, fetchObstractProfiles, Profile, reloadObstractFeed } from '../../../services/obstract.ts';
import LoadingButton from '../../../components/loading_button/index.tsx';
import { useNavigate } from 'react-router-dom';
import { URLS } from '../../../services/urls.ts';


const AddSkeletonFeed = () => {
  const navigate = useNavigate()
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
  }>({
    url: [],
    profile_id: [],
    title: [],
    description: [],
    pretty_url: [],
  })


  useEffect(() => {
    document.title = 'Add Skeleton Feed | Obstracts Web'
  }, [])

  const loadProfiles = async (pageNumber: number) => {
    const res = await fetchObstractProfiles(pageNumber);
    setProfiles(res.data.profiles);
  };

  useEffect(() => {
    loadProfiles(1)
  }, [])

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

  const cleanData = (data: object) => {
    const result: Object = {}
    Object.keys(data).map(key => {
      if(data[key]) {
        result[key] = data[key]
      }
    })
    return result
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    try {
      const res = await createObstractSkeletonFeed(cleanData(formData));
      navigate(URLS.staffObstractFeed(res.data.id))
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
        Add Skeleton Feed
      </Typography>
      <Typography>
        Sometimes blogs don't have an RSS or ATOM feed. It might also be the case you want to curate a blog manually using various URLs. This is what skeleton feeds are designed for, allowing you to create a skeleton feed and then add posts to it manually later on using the add post manually endpoint.
      </Typography>

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
        <strong>Title</strong><span>(Required)</span>
        <TextField
          margin="dense"
          name="title"
          label="Title"
          type="text"
          fullWidth
          value={formData.title}
          onChange={handleChange}
          required
        />
        {errors?.title?.map(error => <Typography sx={{ color: 'red' }}>{error}</Typography>)}
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
          required
        />
        {errors?.pretty_url?.map(error => <Typography sx={{ color: 'red' }}>{error}</Typography>)}
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
          required
        />
        {errors?.description?.map(error => <Typography sx={{ color: 'red' }}>{error}</Typography>)}
      </Box>

      <Box sx={{ marginTop: '1rem' }}>
        <Button variant='contained' color='error' onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <LoadingButton isLoading={loading} variant='contained' color='success' sx={{ marginLeft: '1rem' }} onClick={handleSubmit}>
          Add
        </LoadingButton>
      </Box>

    </Box >
  );
};

export default AddSkeletonFeed;
