import React, { useContext, useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Input, MenuItem, Select, TextField, Typography } from "@mui/material";
import { ITeam, Member } from "../../services/types.ts";
import { Api } from "../../services/api.ts";
import { URLS } from "../../services/urls.ts";
import { useNavigate } from "react-router-dom";
import { TeamContext } from "../../contexts/team-context.tsx";
import LoadingButton from "../../components/loading_button/index.tsx";

export const ConfirmDisable2FA = ({ email, open, onClose }: {
    email: string, onClose: (disabled: boolean) => void, open: boolean,
}) => {
    const [inputEmail, setInputEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const { reloadTeamListIndex, setReloadTeamListIndex } = useContext(TeamContext);
    const navigate = useNavigate()

    const handleDisable2FA = async () => {
        try {
            setLoading(true)
            await Api.disableOTP();
            setLoading(false)
            onClose(true)
        } catch (error) {
            setLoading(false)
        }
    };

    useEffect(() => {
        setInputEmail('')
    }, [open])

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle><Typography variant="h5" sx={{ textAlign: 'center' }}>Confirm Disable 2FA</Typography></DialogTitle>
            <DialogContent>
                <Typography>
                    Enter your email (`{email}`) to disable OTP
                </Typography>
                <Box sx={{ display: 'flex' }}>
                    <TextField
                        label='User Email'
                        style={{ flex: 'auto', marginTop: '2rem'}}
                        value={inputEmail}
                        onChange={(e) => setInputEmail(e.target.value)}
                    ></TextField>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => onClose(false)} color="primary">
                    Close
                </Button>
                <LoadingButton isLoading={loading} disabled={inputEmail != email} variant="contained" onClick={() => handleDisable2FA()} color="error">
                    Disable 2FA
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};
