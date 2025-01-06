// Teams.tsx
import React, { useEffect, useState } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TablePagination,
  TextField
} from "@mui/material";
import { Link } from "react-router-dom";
import { Api } from "../../services/api.ts";
import { AdminTeam, ITeam } from "../../services/types.ts";
import Invitations from "./invitations.tsx";
import { URLS } from "../../services/urls.ts";
import { useAlert } from "../../contexts/alert-context.tsx";

const ConfirmLeaveTeamDialog = ({ open, onClose, team }: {
  open: boolean, onClose: (reload: boolean) => void, team?: ITeam
}) => {
  const alert = useAlert()

  const leaveTeam = async (teamId?: string) => {
    if (!teamId) return
    try {
      await Api.leaveTeam(teamId)
      onClose(true)
    } catch (err) {
      if (err?.response?.status === 400) {
        onClose(false)
        return alert.showAlert(err?.response?.data[0])
      }
      throw err
    }
    onClose(false)

  }
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Error</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to leave {team?.name}</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => onClose(false)} color="primary">
          Cancel
        </Button>
        <Button variant='contained' onClick={() => leaveTeam(team?.id)} color="error">
          Leave team
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface TeamListProps {
  isAdmin?: boolean;
}


function TeamList({ isAdmin }: TeamListProps) {
  const [teams, setTeams] = useState<(ITeam & AdminTeam)[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<ITeam | null>(null);
  const [showLeaveTeamDialog, setShowLeaveTeamDialog] = useState(false)
  const [totalResultsCount, setTotalResultsCount] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  async function loadTeams() {
    try {
      const res = await (isAdmin ? Api.adminFetchTeams(page, search) : Api.fetchTeams(page, search));
      setTotalResultsCount(res.data.count)
      setTeams(res.data.results);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeams();
  }, [page, search]);

  const getRole = (team: ITeam) => {
    if (team.is_private) return 'Personal space'
    if (team.is_owner) return 'Owner'
    if (team.is_admin) return 'Admin'
    return 'Member'
  }

  const handleOpenLeaveTeamModal = (team: ITeam) => {
    setSelectedTeam(team)
    setShowLeaveTeamDialog(true)
  }

  const closeLeaveTeamDialog = (reload: boolean) => {
    setShowLeaveTeamDialog(false)
    if (reload) loadTeams()
  }

  const filter = () => {
    setPage(0)
    loadTeams()
  }

  const limitExceeded = (team: AdminTeam) => {
    if (team?.feed_count > team.feed_limit) return true
    if ((team.members_count + team.invitations_count) > team.user_limit) {
      return true
    }
    return false
  }
  return (
    <>
      <Box my={4}>
        {isAdmin ? (
          <Typography variant="h4" gutterBottom>
            Teams
          </Typography>
        ) : (<>
          <Typography variant="h5" gutterBottom>
            Teams
          </Typography>
          <Typography className="description">
            <p>You can create one or more teams below. You must create at least one team to add a feed.</p>
            <p>Most users only require one team for their organisation.</p>
            <p>Each team you create has a subscription which limits the number of blog feeds you can subscribe to, and how many users can be added to the team to view the content.</p>
          </Typography>
        </>
        )}
        {!isAdmin &&
          <Link to={URLS.addTeam()}>
            <Button variant="contained" color="primary">
              Add New Team
            </Button>
          </Link>
        }


        {isAdmin && <Box sx={{ display: 'flex', justifyContent: 'right' }}>
          <TextField
            sx={{ maxWidth: '200px' }}
            autoFocus
            rows={3}
            margin="dense"
            label="Name"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={filter}> Filter </Button>
        </Box>}
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                {!isAdmin && <TableCell>Role</TableCell>}
                {isAdmin && <TableCell>Type</TableCell>}
                {isAdmin && <TableCell>Users</TableCell>}
                {isAdmin && <TableCell>Team within plan limits</TableCell>}
                <TableCell>Plan</TableCell>
                <TableCell>Subscription Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                    <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
                      Loading teams...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                teams.map((team, index) => (
                  <TableRow key={team.id} sx={{ backgroundColor: limitExceeded(team) ? 'pink' : 'transparent' }}>
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{team.description}</TableCell>
                    {!isAdmin && <TableCell>{getRole(team)}</TableCell>}
                    {isAdmin && <TableCell>{team.is_private ? 'Personal' : 'User Created'}</TableCell>}
                    {isAdmin && <TableCell>
                      {team?.user_emails?.map((userEmail) => (
                        <Link key={userEmail} to={URLS.staffUserListWithEmailQuery(userEmail)}>
                          <Chip label={userEmail} />
                        </Link>))}
                    </TableCell>}
                    {isAdmin && <TableCell>{limitExceeded(team) ? 'false' : 'true'}</TableCell>}
                    <TableCell>{team.subscription?.items[0].price.product_name || 'No Active Plan'}</TableCell>
                    <TableCell>{team.subscription?.status}</TableCell>
                    <TableCell>
                      {(isAdmin || team.is_admin) ? (<>
                        <Link to={URLS.teamManagement(team.id)}>
                          <Button variant="contained" color="secondary" sx={{ ml: 1 }}>
                            Manage
                          </Button>
                        </Link>
                      </>
                      ) : (<div></div>)}

                      <Link to={URLS.teamFeeds(team.id)}>
                        <Button variant="contained" color="secondary" sx={{ ml: 1 }}>
                          Feeds
                        </Button>
                      </Link>


                      {!isAdmin && (
                        (team.is_private) ? (<></>) : (
                          <Button
                            variant="contained"
                            color="error"
                            sx={{ ml: 1 }}
                            onClick={() => handleOpenLeaveTeamModal(team)}
                          >
                            Leave
                          </Button>
                        )
                      )
                      }
                    </TableCell>
                  </TableRow>
                ))
              )}
              <Invitations></Invitations>

            </TableBody>
          </Table>
          {isAdmin && <TablePagination
            rowsPerPageOptions={[]}
            count={totalResultsCount}
            page={page}
            rowsPerPage={10}
            onPageChange={(ev, value) => setPage(value)}
            color="primary"
            style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}
          />}
        </TableContainer>
        {selectedTeam && <ConfirmLeaveTeamDialog open={showLeaveTeamDialog} onClose={closeLeaveTeamDialog} team={selectedTeam}></ConfirmLeaveTeamDialog>}
      </Box>
    </ >
  );
}

export default TeamList;
