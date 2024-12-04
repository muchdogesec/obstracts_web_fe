import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Button,
    Box,
    TextField,
    Checkbox,
} from "@mui/material";
import { Api } from "../../services/api.ts";

interface Invitation {
    id: number;
    email: string;
    role: string;
    team: {
        name: string;
    };
    marked?: boolean; // Add marked property
}

interface InvitationsDialogProps {
    open: boolean;
    onClose: () => void;
}

const InvitationsDialog: React.FC<InvitationsDialogProps> = ({ open, onClose }) => {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [openAcceptDialog, setOpenAcceptDialog] = useState(false);
    const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
    const [teamName, setTeamName] = useState("");
    const [dialogTitle, setDialogTitle] = useState("");


    const cancelCreateTeam = async () => {
        try {
            await Api.completeRegistration({})
            onClose();
        } catch (error) {
            console.error("Failed to save team:", error);
        }
    };

    const handleSave = async () => {
        try {
            await Api.completeRegistration({ team: { name: teamName } })
            onClose();
        } catch (error) {
            console.error("Failed to save team:", error);
        }
    };

    async function fetchInvitations() {
        try {
            const results = await Api.fetchMyInvitations();
            setInvitations(results.map(inv => ({ ...inv, marked: false }))); // Initialize marked property
            results.length > 0 ? setDialogTitle('Invitations') : setDialogTitle('Create new team');
        } catch (error) {
            console.error("Failed to fetch invitations:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {

        if (open) {
            console.log(open)
            fetchInvitations();
        }
    }, [open]);

    const handleCancelInvitation = async () => {
        if (selectedInvitation) {
            try {
                await Api.cancelInvite(selectedInvitation.id);
                setInvitations((prev) => prev.filter((inv) => inv.id !== selectedInvitation.id));
                setOpenCancelDialog(false);
                setSelectedInvitation(null);
            } catch (error) {
                console.error("Failed to cancel invitation:", error);
            }
        }
    };

    const handleAcceptInvitation = async () => {
        const accepted_invitations = invitations.filter(invitation => invitation.marked).map(invitation => invitation.id)
        try {
            await Api.completeRegistration({ accepted_invitations })
            setSelectedInvitation(null);
        } catch (error) {
            console.error("Failed to accept invitation:", error);
        }
        onClose();
    };

    const handleOpenAcceptDialog = (invitation: Invitation) => {
        setSelectedInvitation(invitation);
        setOpenAcceptDialog(true);
    };

    const handleOpenCancelDialog = (invitation: Invitation) => {
        setSelectedInvitation(invitation);
        setOpenCancelDialog(true);
    };

    const handleCloseDialogs = () => {
        setOpenCancelDialog(false);
        setOpenAcceptDialog(false);
        setSelectedInvitation(null);
    };

    const toggleMarkInvitation = (invitation: Invitation) => {
        setInvitations((prev) =>
            prev.map((inv) =>
                inv.id === invitation.id ? { ...inv, marked: !inv.marked } : inv
            )
        );
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                        <CircularProgress />
                    </Box>
                ) : invitations.length === 0 ? (
                    <Box textAlign="center">
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Team Name"
                            fullWidth
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                        />
                        <Button onClick={cancelCreateTeam} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} color="primary"> Save </Button>
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>S/N</TableCell>
                                    <TableCell>Team Name</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Accept</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {invitations.map((invitation, index) => (
                                    <TableRow key={invitation.id}>

                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{invitation.team.name}</TableCell>
                                        <TableCell>{invitation.role}</TableCell>
                                        {/* <TableCell>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleOpenAcceptDialog(invitation)}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                sx={{ ml: 1 }}
                                                onClick={() => handleOpenCancelDialog(invitation)}
                                            >
                                                Cancel
                                            </Button>
                                        </TableCell> */}
                                        <Checkbox
                                            checked={invitation.marked}
                                            onChange={() => toggleMarkInvitation(invitation)}
                                        />
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Box justifyContent='right' display='flex'>
                            <Button onClick={handleAcceptInvitation} color="primary" style={{ alignSelf: 'right' }}>
                                Accept checked invitations
                            </Button>
                        </Box>
                    </TableContainer>
                )}
            </DialogContent>

            <Dialog open={openAcceptDialog} onClose={handleCloseDialogs}>
                <DialogTitle>Accept Invitation</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to accept this invitation?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialogs} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAcceptInvitation} color="primary">
                        Accept
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openCancelDialog} onClose={handleCloseDialogs}>
                <DialogTitle>Cancel Invitation</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to cancel this invitation?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialogs} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleCancelInvitation} color="primary">
                        Cancel Invitation
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog >
    );
};

export default InvitationsDialog;
