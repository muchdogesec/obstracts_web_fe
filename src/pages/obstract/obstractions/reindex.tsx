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
import { useNavigate } from 'react-router-dom';

const ReindexingDialog = ({ open, onClose, jobId }: { open: boolean, onClose: () => void, jobId: string }) => {
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
                <Button variant='contained' onClick={handleClose} color="primary">
                    Return to feed list
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReindexingDialog;