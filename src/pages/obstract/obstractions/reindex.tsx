import React, { useState } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    Typography,
} from '@mui/material';
import { URLS } from '../../../services/urls.ts';
import { Link, useNavigate } from 'react-router-dom';

const ReindexingDialog = ({ open, onClose, jobId, feedId }: { feedId: string, open: boolean, onClose: () => void, jobId: string }) => {
    const naviagete = useNavigate()

    const handleClose = () => {
        onClose();
        naviagete(URLS.staffObstractFeeds())
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Reindexing in Progress</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please wait while the reindexing is in progress. This might take several minutes.
                    <Typography>You can track this request using job ID: {jobId}</Typography>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button color='error' variant='contained' onClick={handleClose}>
                    Return to feed list
                </Button>
                <Link to={URLS.staffObstractJob(feedId, jobId)}>
                    <Button variant='contained' onClick={handleClose} color="primary">
                        Go to job
                    </Button>
                </Link>
            </DialogActions>
        </Dialog>
    );
};

export default ReindexingDialog;