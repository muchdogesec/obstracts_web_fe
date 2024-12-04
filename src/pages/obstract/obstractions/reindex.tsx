import React, { useState } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
} from '@mui/material';
import { URLS } from '../../../services/urls.ts';
import { useNavigate } from 'react-router-dom';

const ReindexingDialog = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
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