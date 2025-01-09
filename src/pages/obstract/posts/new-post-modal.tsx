import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { createNewPost } from '../../../services/obstract.ts';
import { useAlert } from '../../../contexts/alert-context.tsx';
import { useNavigate } from 'react-router-dom';


interface NewPostModalProps {
    open: boolean;
    onClose: () => void;
    feedId: string;
    onPostCreated: () => void;
    profileId: string;
}

const NewPostModal: React.FC<NewPostModalProps> = ({ open, onClose, feedId, onPostCreated, profileId }) => {
    const [title, setTitle] = useState<string>('');
    const [link, setLink] = useState<string>('');
    const [pubdate, setPubdate] = useState<Date | null>(null);
    const [author, setAuthor] = useState<string>('');
    const [categories, setCategories] = useState<string[]>([]);
    const [newCategory, setNewCategory] = useState<string>('');
    const [errors, setErrors] = useState<{
        title?: string[],
        link?: string[],
        pubdate?: string[],
        author?: string[],
    }>({})
    const alert = useAlert()
    const navigate = useNavigate()

    const handleAddCategory = () => {
        if (newCategory && !categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
            setNewCategory('');
        }
    };

    const handleRemoveCategory = (category: string) => {
        setCategories(categories.filter(c => c !== category));
    };

    const handleSubmit = async () => {
        if (title && link && pubdate && author) {
            try {
                await createNewPost(feedId, profileId, { title, link, pubdate: pubdate, author, categories, });
                onPostCreated(); // Refresh feed data
                onClose(); // Close modal
            } catch (err) {
                if (err.response && err.response.status === 400) {
                    setErrors(err.response.data)
                }
            }
        } else {
            setErrors({
                title: title ? [] : ['This field cannot be empty'],
                link: link ? [] : ['This field cannot be empty'],
                pubdate: pubdate ? [] : ['This field cannot be empty'],
                author: author ? [] : ['This field cannot be empty'],
            })
        }
    };

    return (
        <Box>
            <Typography variant="h4">
                Create New Post
            </Typography>
            <Typography>Add a post manually. The profile used will be the same as the profile originally specified when adding the blog (so will be the same as all other posts currently indexed for this blog). Obstracts will use the URL (link) specified to grab the content for the blog</Typography>
            <Box mt={4}>
                <strong>Title:</strong>
                <TextField
                    label="Title"
                    fullWidth
                    margin="normal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                {errors?.title?.map(error => <Typography sx={{ color: 'red' }}>{error}</Typography>)}
            </Box>


            <Box mt={4}>
                <strong>Link:</strong>
                <TextField
                    label="Link"
                    fullWidth
                    margin="normal"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                />
                {errors?.link?.map(error => <Typography sx={{ color: 'red' }}>{error}</Typography>)}
            </Box>


            <Box mt={4}>
                <strong>Publication Date:</strong>
                <TextField
                    type="datetime-local"
                    fullWidth
                    margin="normal"
                    value={pubdate ? pubdate.toISOString().substring(0, 16) : ''}
                    onChange={(e) => setPubdate(e.target.value ? new Date(e.target.value) : null)}
                />
                {errors?.pubdate?.map(error => <Typography sx={{ color: 'red' }}>{error}</Typography>)}
            </Box>

            <Box mt={4}>
                <strong>Author:</strong>
                <TextField
                    label="Author"
                    fullWidth
                    margin="normal"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                />
                {errors?.author?.map(error => <Typography sx={{ color: 'red' }}>{error}</Typography>)}
            </Box>

            <Box mt={4}>
                <strong>Categories:</strong>
                <Box sx={{ marginTop: '0.5rem' }}>
                    {categories.map((value) => (
                        <Chip key={value} label={value} onDelete={() => handleRemoveCategory(value)} />
                    ))}
                </Box>

                <Box sx={{ display: 'flex', marginTop: '0.5rem', alignItems: 'center' }}>
                    <TextField
                        label="Add Category"
                        value={newCategory}
                        fullWidth
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <Box>
                        <Button variant='contained' onClick={() => handleAddCategory()}>Add Category</Button>
                    </Box>
                </Box>
            </Box>
            <Box sx={{ marginTop: '2rem' }}>
                <Button color='error' variant='contained' onClick={() => navigate(-1)}>Cancel</Button>
                <Button sx={{ marginLeft: '2rem' }} variant="contained" color="primary" onClick={handleSubmit}>
                    Create Post
                </Button>
            </Box>
        </Box >
    );
};

export default NewPostModal;