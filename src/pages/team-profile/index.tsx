import React, { useEffect, useState } from 'react';
import {
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
} from '@mui/material';
import { Api } from '../../services/api.ts';
import { useParams } from 'react-router-dom';
import { fetchObstractProfiles, Profile } from '../../services/obstract.ts';
import ProfileCard from '../obstract/profile/profile-card.tsx';




const TeamProfileManager = () => {
    const { team_id } = useParams<{ team_id: string }>();
    const [teamIdNumber, setTeamIdNumber] = useState(0);
    const [availableProfiles, setAvailableProfiles] = useState<Profile[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [selectedProfile, setSelectedProfile] = useState('');
    const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

    const loadActiveProfiles = async () => {
        const res = await Api.fetchTeamProfiles(teamIdNumber)
        // console.log(data)
        setProfiles(res.data)
    }

    const loadProfiles = async (pageNumber: number) => {
        // setLoading(true);
        const res = await fetchObstractProfiles(pageNumber); // Pass page number and size
        setAvailableProfiles(res.data.profiles);
        // setTotalPages(Math.ceil(res.data.total_results_count / res.data.page_size)); // Calculate total pages
        // setLoading(false);
    };

    useEffect(() => { loadProfiles(1) }, [])
    useEffect(() => {
        if (!team_id) return
        setTeamIdNumber(Number(team_id));
        console.log(teamIdNumber, team_id)
    }, [team_id]);

    useEffect(() => {
        if (!teamIdNumber) return
        loadActiveProfiles()
    }, [teamIdNumber])

    // Open the register profile dialog
    const handleOpenRegisterDialog = () => {
        setRegisterDialogOpen(true);
    };

    // Close the register profile dialog
    const handleCloseRegisterDialog = () => {
        setRegisterDialogOpen(false);
        setSelectedProfile('');
    };

    // Handle selecting a profile from the list
    const handleSelectProfile = (event) => {
        setSelectedProfile(event.target.value);
    };
    // Register the selected profile
    const handleRegisterProfile = async () => {
        await Api.registerTeamProfile(teamIdNumber, selectedProfile)
        loadActiveProfiles()
        handleCloseRegisterDialog();
    };

    // Delete a profile from the list
    const handleDeleteProfile = async (profileId) => {
        await Api.deleteTeamProfile(teamIdNumber, profileId)
        loadActiveProfiles()
    };

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Feeds
            </Typography>

            <TableContainer component={Paper}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell align="right">Age</TableCell>
                            <TableCell align="right">Job</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell component="th" scope="row">
                                    {row.name}
                                </TableCell>
                                <TableCell align="right">{row.age}</TableCell>
                                <TableCell align="right">{row.job}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default TeamProfileManager;
