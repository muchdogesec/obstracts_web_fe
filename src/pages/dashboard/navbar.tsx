import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Select, MenuItem } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { Api } from '../../services/api.ts';
import { getActiveTeamId, setActiveTeamId } from '../../services/storage.ts';
import UserPopover from './user-popover.tsx';
import './styles.css'
import StaffPopover from './staff-popover.tsx';
import { TeamContext } from '../../contexts/team-context.tsx';
import { ITeam } from '../../services/types.ts';
import { URLS } from '../../services/urls.ts';

const drawerWidth = 240;

const NavBar = () => {
    const { user } = useAuth0();
    const { activeTeam, setActiveTeam, reloadTeamListIndex } = useContext(TeamContext);
    const [selectedTeamId, setSelectedTeamId] = useState('')

    const [teams, setTeams] = useState<ITeam[]>([]);
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true);

    async function reloadTeams() {
        const res = await Api.fetchTeams(0, '');
        const teams = res.data.results
        setTeams(teams);
    }

    useEffect(() => {
        if (teams.length === 0) return
        const selectedTeam = teams.find(team => team.id === activeTeam?.id)
        if (selectedTeam) {
            setSelectedTeamId(selectedTeam.id)
        } else {
            setSelectedTeamId(teams[0].id)
        }
    }, [activeTeam, teams])

    async function loadTeams() {
        try {
            const res = await Api.fetchTeams(0, '');
            const teams = res.data.results
            setTeams(teams);

            let activeTeamId = getActiveTeamId();
            const team = teams.find(team => team.id === activeTeamId)
            if (team) {
                setActiveTeam(team)
            } else {
                setActiveTeam(teams[0])
                setActiveTeamId(teams[0].id)
            }
        } catch (error) {
            console.error("Failed to fetch teams:", error);
        } finally {
            setLoading(false);
        }
    }

    const changeTeam = (team: ITeam) => {
        setActiveTeam(team)
        setActiveTeamId(team.id)
        if (team.is_private) {
            navigate(URLS.profile())
            return
        }
        navigate(URLS.teamFeeds(team.id))
    }

    useEffect(() => {
        loadTeams();
    }, []);

    useEffect(() => {
        if (reloadTeamListIndex > 0) {
            reloadTeams()
        }
    }, [reloadTeamListIndex])

    return (
        <AppBar position="fixed" sx={{ ml: `${drawerWidth}px`, background: '#fb8521' }}>

            <Toolbar sx={{ background: '#fb8521' }}>
                <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                    Obstracts
                </Typography>
                {user?.metadata_is_staff && <StaffPopover></StaffPopover>}
                {user ? (
                    <>
                        <Select
                            style={{ color: 'white', height: '60px', border: 'none' }}
                            value={selectedTeamId}
                        >
                            {teams.map((team) => (
                                <MenuItem onClick={() => changeTeam(team)} key={team.id} value={team.id}>{team.is_private ? 'Account Settings' : team.name}</MenuItem>
                            ))}
                            <MenuItem><Link to={URLS.addTeam()} style={{ textDecoration: 'none', color: 'unset' }}>+ Create a new Team</Link></MenuItem>
                        </Select>

                        <UserPopover userEmail={user?.name || ''}></UserPopover>
                    </>
                ) : (<></>)}
            </Toolbar>
        </AppBar >
    );
};

export default NavBar;
