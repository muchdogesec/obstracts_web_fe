import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, Box, TextField } from '@mui/material';
import { deleteObstractPost, Post } from '../../../services/obstract.ts';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../../contexts/alert-context.tsx';
import LoadingButton from '../../../components/loading_button/index.tsx';
import { URLS } from '../../../services/urls.ts';

interface DeleteDialogProps {
    open: boolean;
    onClose: () => void;
    post: Post;
    feedId: string;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({ feedId, post, open, onClose }: DeleteDialogProps) => {
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const alert = useAlert()

    const confirmDelete = async () => {
        if (!post) return
        try {
            setLoading(true)
            await deleteObstractPost(feedId, post.id);
            await navigate(URLS.staffObstractFeed(feedId))
            setLoading(false)
        } catch (err) {
            setLoading(false)
            if (err?.response?.status === 403) {
                return alert.showAlert(err?.response?.data?.message)
            }
            throw err
        }
    };

    useEffect(() => {
        setName('')
    }, [open])

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle><Typography variant="h5" sx={{ textAlign: 'center' }}>Delete Post</Typography></DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to delete this post? Enter the post name `{post.title}` to delete this post.
                </Typography>
                <Box sx={{ display: 'flex' }}>
                    <TextField
                        label='Post Name'
                        style={{ flex: 'auto', marginTop: '2rem' }}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    ></TextField>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => onClose()} color="primary">
                    Close
                </Button>
                <LoadingButton isLoading={loading} disabled={name !== post.title} variant="contained" onClick={() => confirmDelete()} color="error">
                    Delete
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteDialog;