import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Button,
  Chip,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { createProfile, editProfile, loadAliases, loadExtractors, loadWhitelists } from '../../../services/obstract.ts';
import LoadingButton from '../../../components/loading_button/index.tsx';
import { useAlert } from '../../../contexts/alert-context.tsx';

interface AddEntryDialogProps {
  open: boolean;
  onClose: () => void;
  onAddEntry: () => void;
  entryData?: any;
}

const ai_settings_options = [
  "openai:gpt-4o",
  "openai:gpt-4o-mini",
  "openai:gpt-4-turbo",
  "openai:gpt-4",
  "anthropic:claude-3-5-sonnet-latest",
  "anthropic:claude-3-5-haiku-latest",
  "claude-3-opus-latest",
  "gemini:models/gemini-1.5-pro-latest",
  "gemini:models/gemini-1.5-flash-latest",
]

const AddEntryDialog: React.FC<AddEntryDialogProps> = ({
  open,
  onClose,
  onAddEntry,
  entryData, // Accept entry data for editing
}) => {
  const [listObj, setListObj] = useState({
    extractions: '',
    ai_settings_extractions: '',
    aliases: '',
  });

  const [loading, setLoading] = useState(false)
  const [extractions, setExtractions] = useState<{ name: string; id: string }[]>([]);
  const [extracorIdToNameDict, setExtractorIdToNameDict] = useState({});
  const alert = useAlert()
  const [formData, setFormData] = useState<{
    name: string,
    extractions: string[],
    ai_settings_extractions?: string[],
    ai_settings_relationships: string,
    ai_summary_provider: string,
    relationship_mode: string,
    extract_text_from_image: boolean,
    defang: boolean,
    ignore_image_refs: boolean,
    ignore_link_refs: boolean,
  }>({
    name: '',
    extractions: [],
    ai_settings_extractions: [],
    ai_settings_relationships: ai_settings_options[0],
    ai_summary_provider: ai_settings_options[0],
    relationship_mode: 'ai',
    extract_text_from_image: true,
    defang: true,
    ignore_image_refs: true,
    ignore_link_refs: true,
  });
  const [errors, setErrors] = useState<{
    name?: string[],
    extractions?: string[],
    ai_settings_extractions?: string[],
    ai_settings_relationships?: string[],
    ai_summary_provider?: string[],
    non_field_errors?: string[],
  }>({})

  const loadList = async (func: () => Promise<[]>, setter: React.Dispatch<React.SetStateAction<{ name: string; id: string }[]>>, dictSetter: React.Dispatch<React.SetStateAction<{}>>) => {
    const results = await func()
    setter(results);
    const dict: any = {};
    results.forEach((item: { id: string, name: string }) => {
      dict[item.id] = item.name;
    });
    dictSetter(dict);
  };

  useEffect(() => {
    loadList(loadExtractors, setExtractions, setExtractorIdToNameDict);
  }, []);

  useEffect(() => {
    setFormData({
      name: '',
      extractions: [],
      relationship_mode: 'ai',
      ai_settings_relationships: '',
      ai_summary_provider: '',
      ai_settings_extractions: [],
      extract_text_from_image: true,
      defang: true,
    });
    setErrors({})

  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayDelete = (arrayName: string, index: number) => {
    const newArray = [...(formData[arrayName as keyof typeof formData] as string[])];
    newArray.splice(index, 1);
    setFormData((prev) => ({ ...prev, [arrayName]: newArray }));
  };


  const addEntry = async (data: any) => {
    await createProfile(data)
  };

  const editEntry = async (id: string, data: any) => {
    try {
      await editProfile(id, data);
    } catch (err) {
      if (err.response.status === 400) {
        console.log(err.response.data);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { ...submitData } = formData
    setLoading(true)
    try {
      await addEntry(submitData);
      onAddEntry();
    } catch (err) {
      if (err.response.status === 400) {
        setErrors(err?.response?.data?.details)
      }
    } finally {
      setLoading(false)
    }
  };

  const handleArrayChangeNew = (arrayName: string, value: string) => {
    setListObj((prev) => ({ ...prev, [arrayName]: value }));
  };

  const handleArrayAdded = (arrayName: string) => {
    if (!listObj[arrayName]) return;
    const newArray = [...(formData[arrayName as keyof typeof formData] as string[])];
    newArray.push(listObj[arrayName]);
    setListObj((prev) => ({ ...prev, [arrayName]: '' }));
    setFormData((prev) => ({ ...prev, [arrayName]: newArray }));
  };

  return (
    <Box>
      <Typography variant='h4'>{entryData ? 'Edit Profile' : 'Add Profile'}</Typography>

      <Typography>Please enter the details of the {entryData ? 'profile to edit' : 'new profile'}.</Typography>

      <Box mt={4}>
        <strong>Name:</strong>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Name"
          type="text"
          fullWidth
          value={formData.name}
          onChange={handleChange}
          required
        />
        {errors?.name?.map(error => <Typography sx={{ color: 'red' }}>{error}</Typography>)}
      </Box>

      {/* Extractions */}
      <Box marginY={2}>
        <div>
          <strong>Extractions:</strong>
          {formData.extractions.map((extraction, index) => (
            <Chip
              key={index}
              label={extraction}
              onDelete={() => handleArrayDelete('extractions', index)}
              style={{ margin: '4px' }}
            />
          ))}
        </div>
        <Box display="flex" alignItems="center">
          <Select
            style={{ flex: 'auto' }}
            name="extractions"
            value={listObj.extractions}
            onChange={(e) => handleArrayChangeNew('extractions', e.target.value)}
          >
            {extractions.map((extraction) => (
              <MenuItem sx={{
                display:
                  formData.extractions?.includes(extraction.id) ? 'none' : 'block'
              }} key={extraction.id} value={extraction.id}>
                {extraction.id}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleArrayAdded('extractions')}
            style={{ marginLeft: '8px' }}
          >
            Add
          </Button>
        </Box>
        {errors?.extractions?.map(error => <Typography sx={{ color: 'red' }}>{error}</Typography>)}
      </Box>

      <FormControl fullWidth margin="dense">
        <strong>Relationship Mode:</strong>
        <Select
          name="relationship_mode"
          value={formData.relationship_mode}
          onChange={(e) => setFormData({ ...formData, relationship_mode: e.target.value })}
        >
          <MenuItem value="ai">AI</MenuItem>
          <MenuItem value="standard">Standard</MenuItem>
        </Select>
      </FormControl>

      <Box mb={4}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.extract_text_from_image}
              color="primary"
              onChange={(e) => setFormData({ ...formData, extract_text_from_image: e.target.checked })}
            />
          }
          label="Extract text from image"
        />
      </Box>


      {/* Extractions */}
      <Box marginY={2}>
        <div>
          <strong>AI Extractions  Settings:</strong>
          {formData.ai_settings_extractions.map((option, index) => (
            <Chip
              key={option}
              label={option}
              onDelete={() => handleArrayDelete('ai_settings_extractions', index)}
              style={{ margin: '4px' }}
            />
          ))}
        </div>
        <Box display="flex" alignItems="center">
          <Select
            style={{ flex: 'auto' }}
            name="ai_settings_extractions"
            value={listObj.ai_settings_extractions}
            onChange={(e) => handleArrayChangeNew('ai_settings_extractions', e.target.value)}
          >
            {ai_settings_options.map((extraction) => (
              <MenuItem key={extraction} value={extraction}>{extraction}</MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleArrayAdded('ai_settings_extractions')}
            style={{ marginLeft: '8px' }}
          >
            Add
          </Button>
        </Box>
        {errors?.extractions?.map(error => <Typography sx={{ color: 'red' }}>{error}</Typography>)}
      </Box>

      <Box>
        <strong>AI Relationships Settings:</strong>

        <Select

          sx={{ width: '100%' }}

          label="AI Settings Relationships"
          name="ai_settings_relationships"
          value={formData.ai_settings_relationships}
          onChange={(e) => setFormData({ ...formData, ai_settings_relationships: e.target.value })}
        >
          {ai_settings_options.map((extraction) => (
            <MenuItem key={extraction} value={extraction}>{extraction}</MenuItem>
          ))}
        </Select>
        {errors?.ai_settings_relationships?.map(error => <Typography sx={{ color: 'red' }}>{error}</Typography>)}
      </Box>

      <Box>
        <strong>AI Summary Provider:</strong>

        <Select

          sx={{ width: '100%' }}

          label="AI Summary Provider"
          name="ai_summary_provider"
          value={formData.ai_summary_provider}
          onChange={(e) => setFormData({ ...formData, ai_summary_provider: e.target.value })}
        >
          {ai_settings_options.map((extraction) => (
            <MenuItem key={extraction} value={extraction}>{extraction}</MenuItem>
          ))}
        </Select>
        {errors?.ai_summary_provider?.map(error => <Typography sx={{ color: 'red' }}>{error}</Typography>)}
      </Box>
      <Box mb={4}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.defang}
              color="primary"
              onChange={(e) => setFormData({ ...formData, defang: e.target.checked })}
            />
          }
          label="Defang"
        />
      </Box>
      <Box mb={4}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.ignore_image_refs}
              color="primary"
              onChange={(e) => setFormData({ ...formData, ignore_image_refs: e.target.checked })}
            />
          }
          label="Ignore Image Refs"
        />
      </Box>
      <Box mb={4}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.ignore_link_refs}
              color="primary"
              onChange={(e) => setFormData({ ...formData, ignore_link_refs: e.target.checked })}
            />
          }
          label="Ignore Link Refs"
        />
      </Box>
      {errors?.non_field_errors?.map(error => <Typography sx={{ color: 'red' }}>{error}</Typography>)}
      <Button variant='contained' sx={{ textTransform: 'uppercase' }} onClick={onClose} color="secondary">
        Cancel
      </Button>
      <LoadingButton isLoading={loading} variant='contained' sx={{ textTransform: 'uppercase', marginLeft: '3rem' }} onClick={handleSubmit} color="primary">
        {entryData ? 'Update' : 'Add'}
      </LoadingButton>
    </Box >
  );
};

export default AddEntryDialog;
