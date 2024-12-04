import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, Box, TextField } from '@mui/material';
import { deleteObstractFeed, Feed } from '../../../services/obstract.ts';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../../contexts/alert-context.tsx';
import LoadingButton from '../../../components/loading_button/index.tsx';
import { URLS } from '../../../services/urls.ts';

interface DeleteDialogProps {
    open: boolean;
    onClose: () => void;
    feed: Feed;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({ feed, open, onClose }: DeleteDialogProps) => {
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const alert = useAlert()

    const confirmDelete = async () => {
        if (!feed) return
        try {
            await deleteObstractFeed(feed.id);
            await navigate(URLS.staffObstractFeeds())
        } catch (err) {
            if (err?.response?.status === 403) {
                return alert.showAlert(err?.response?.data?.message)
            }
        }
    };

    useEffect(() => {
        setName('')
    }, [open])

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle><Typography variant="h5" sx={{ textAlign: 'center' }}>Delete feed </Typography></DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to delete this feed. Enter the feed name `{feed.obstract_feed_metadata['title']}` to delete.
                </Typography>
                <Box sx={{ display: 'flex' }}>
                    <TextField
                        label='Feed Name'
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
                <LoadingButton isLoading={loading} disabled={name != feed.obstract_feed_metadata['title']} variant="contained" onClick={() => confirmDelete()} color="error">
                    Delete
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteDialog;