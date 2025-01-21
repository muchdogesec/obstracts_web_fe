import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, Box, TextField, Select, MenuItem } from '@mui/material';
import { Feed, fetchObstractProfiles, Post, Profile, reIndexFeed } from '../../../services/obstract.ts';
import { useAlert } from '../../../contexts/alert-context.tsx';
import LoadingButton from '../../../components/loading_button/index.tsx';

interface ReindexFeedDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirmReIndex: (string) => void;
    feed: Feed;
}

const ReindexFeedDialog: React.FC<ReindexFeedDialogProps> = ({ feed, open, onClose, onConfirmReIndex }: ReindexFeedDialogProps) => {
    const [loading, setLoading] = useState(false)
    const [profileId, setProfileId] = useState(feed.profile_id)
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [errors, setErrors] = useState({
        'profile_id': ['']
    })

    const alert = useAlert()

    const loadProfiles = async (pageNumber: number) => {
        const res = await fetchObstractProfiles(pageNumber);
        setProfiles(res.data.profiles);
    };

    useEffect(() => {
        loadProfiles(1)
    }, [])

    const confirmReIndex = async () => {
        if (!feed) return
        try {
            setLoading(true)
            const res = await reIndexFeed(feed.id, profileId)
            onConfirmReIndex(res.data.id)
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
                <Box marginY={2}>
                    <strong>Profile</strong><span>(Profile to use for extraction)</span>
                    <Select
                        name="profile"
                        label="Profile"
                        style={{ flex: 'auto' }}
                        fullWidth
                        value={profileId}
                        onChange={(e) => setProfileId(e.target.value)}
                    >
                        {profiles.map((profile) => (
                            <MenuItem key={profile.id} value={profile.id}>{profile.name}</MenuItem>
                        ))}
                    </Select>
                    {errors?.profile_id?.map(error => <Typography sx={{ color: 'red' }}>{error}</Typography>)}
                </Box>
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

export default ReindexFeedDialog;