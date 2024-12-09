import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, Box, TextField } from '@mui/material';
import { changePostProfileId, Feed, Post } from '../../../services/obstract.ts';
import { useAlert } from '../../../contexts/alert-context.tsx';
import LoadingButton from '../../../components/loading_button/index.tsx';

interface CheckForUpdatesDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirmReIndex: () => void;
    post: Post;
    feed: Feed;
}

const CheckForUpdatesDialog: React.FC<CheckForUpdatesDialogProps> = ({ feed, post, open, onClose, onConfirmReIndex }: CheckForUpdatesDialogProps) => {
    const [loading, setLoading] = useState(false)
    const alert = useAlert()

    const confirmReIndex = async () => {
        if (!post) return
        try {
            setLoading(true)
            await changePostProfileId(feed.id, post.id, feed?.profile_id || '')
            onConfirmReIndex()
            setLoading(false)
        } catch (err) {
            setLoading(false)
            if (err?.response?.status === 403) {
                return alert.showAlert(err?.response?.data?.message)
            }
            throw err
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle><Typography variant="h5" sx={{ textAlign: 'center' }}>Check for updates</Typography></DialogTitle>
            <DialogContent>
                <Typography>
                This will delete all the current data for this post (post record and all extractions) and reindex them. The result of the reindexing might be different to the current state (due to changes in posts and/or AI extraction behaviour). Are you sure you want to reindex this post?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => onClose()} color="error">
                    Close
                </Button>
                <LoadingButton isLoading={loading} variant="contained" onClick={() => confirmReIndex()} color="success">
                    Reindex
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};

export default CheckForUpdatesDialog;