import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Button, Modal, Box, List, ListItem, ListItemText, Container } from '@mui/material';
import FeedsTable from '../feed_table.tsx';
import { useParams } from 'react-router-dom';
import { fetchObstractProfile } from '../../../services/obstract.ts';

type Profile = {
    id: string;
    created: string;
    name: string;
    extractions: string[];
    whitelists: string[];
    aliases: string[];
    relationship_mode: string;
    extract_text_from_image: boolean;
};

const ProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // `id` corresponds to `:id` in the route
    const [profile, setProfile] = useState<Profile>();

    const loadProfile = async () => {
        if (!id) return
        const res = await fetchObstractProfile(id)
        setProfile(res.data)

    }
    useEffect(() => { loadProfile() }, [id])

    useEffect(() => {
        document.title = `${profile?.name} | Obstracts Web`
    }, [profile])

    return (
        <Container>
            <Box
            >
                <Typography id="modal-title" variant="h4">
                    Profile Details
                </Typography>
                {profile ? (
                    <List>
                        <ListItem>
                            <ListItemText sx={{ width: '50%' }} primary="Name" secondary={profile.name} />
                            <ListItemText sx={{ width: '50%' }} primary="Created" secondary={new Date(profile.created).toLocaleString()} />
                        </ListItem>
                        <ListItem>
                            <ListItemText sx={{ width: '50%' }} primary="Relationship Mode" secondary={profile.relationship_mode} />
                            <ListItemText sx={{ width: '50%' }} primary="Extract Text from Image" secondary={profile.extract_text_from_image ? 'Yes' : 'No'} />
                        </ListItem>
                        <ListItem>
                            <ListItemText sx={{ width: '50%' }} primary="Extractions" secondary={profile.extractions.join(', ')} />
                        </ListItem>
                    </List>
                ) : (
                    <Typography>Loading...</Typography>
                )}

            </Box>
            <Typography variant="h5">Feeds belonging to the profile</Typography>
            {profile && <FeedsTable profileId={profile.id}></FeedsTable>}
        </Container>
    );
};

export default ProfilePage;