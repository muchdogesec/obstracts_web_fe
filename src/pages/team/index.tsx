import React, { useContext, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import {
  Container,
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
  TextField,
  Grid,
  Snackbar,
  Alert,
  Checkbox,
} from "@mui/material";
import { Api, Subscription } from "../../services/api.ts";
import { ITeam, Member } from "../../services/types.ts";
import LoadingButton from "../../components/loading_button/index.tsx";
import InviteUserList from "./invite-user-list.tsx";
import TeamManagement from "../teams/team-management.tsx";
import { TeamContext } from "../../contexts/team-context.tsx";
import { URLS } from "../../services/urls.ts";
import { TeamRouteContext } from "../team-layout.tsx/index.tsx";
import { ChangeRoleDialog } from "./change-role.tsx";
import { ConfirmDeleteDialog } from "./confirm-delete.tsx";
import { useAlert } from "../../contexts/alert-context.tsx";
import { getDateString } from "../../services/utils.ts";

const ConfirmRemoveMemberDialog = ({ teamId, open, onClose, member }: {
  teamId: string, open: boolean, onClose: (reload: boolean) => void, member?: Member
}) => {
  const alert = useAlert()
  const removeMember = async (member?: Member) => {
    if (!member) return
    try {
      await Api.removeTeamMember(teamId, member.user_id)
      onClose(true)
    } catch (err) {
      if ([400, 403].includes(err?.response?.status)) {
        onClose(false)
        return alert.showAlert(err?.response?.data[0] || err?.response?.data?.detail)
      }
      throw err
    }
    onClose(false)
  }
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Error</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to remove {member?.display_name}</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => onClose(false)} color="primary">
          Cancel
        </Button>
        <Button variant="contained" onClick={() => removeMember(member)} color="error">
          Remove
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function Team() {
  const { teamId: id } = useContext(TeamRouteContext)
  const [loading, setLoading] = useState(true);
  const { user } = useAuth0()
  const [members, setMembers] = useState<Member[]>([]);
  const [invitedMembers, setInvitedMembers] = useState<any[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>()
  const [activeMember, setActiveMember] = useState<Member | null>()
  const [openInvite, setOpenInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteEmailError, setInviteEmailError] = useState("")
  const [loadingSave, setLoadingSave] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTeam, setActiveTeam] = useState<ITeam | null>(null);
  const [activeUserIsAdmin, setActiveUserIsAdmin] = useState(false)

  const [openCancelMembership, setOpenCancelMembership] = useState(false);
  const [openCancelInvitation, setOpenCancelInvitation] = useState(false);
  const [selectedInvitationId, setSelectedInvitationId] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState(false)
  const { reloadTeamListIndex, setReloadTeamListIndex } = useContext(TeamContext);
  const [disableEdit, setDisableEdit] = useState(true)
  const [selectedMember, setSelectedMember] = useState<Member>()
  const [openChangeRole, setOpenChangeRole] = useState(false)
  const [opeDeleteTeam, setOpenDeleteTeam] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Team Settings | Obstracts Web'
  }, [])


  useEffect(() => {
    if (!id) return
    loadTeam();
    getMembers();
    getInvitedMembers();
    getActiveSubscription();
  }, [id])

  const handleSubscriptionDetail = async () => {
    if (!id) return
    const res = await Api.initSubscriptionManagementPortal(id)
    window.location.href = res.data.redirect_url
  };

  const getActiveSubscription = async () => {
    if (!id) return
    const res = await Api.getTeamActiveSubscription(id)
    if (res.data.id)
      setActiveSubscription(res.data)
  }
  const getMembers = async () => {
    if (!id) return
    try {
      const res = await Api.getMembers(id)

      setMembers(res.data);
    } catch (error) {
      setSnackbarMessage("Failed to fetch members");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const getInvitedMembers = async () => {
    try {
      const res = await Api.getInvitedMembers(id)
      setInvitedMembers(res.data.results);
    } catch (error) {
      setSnackbarMessage("Failed to fetch invited members");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const loadTeam = async () => {
    if (!id) return
    try {
      const result = await Api.fetchTeamLimits(id)
      setActiveTeam(result.data)
      setActiveUserIsAdmin(result.data.is_admin)
    } catch (err) {
      if (err?.response?.status === 403 || err?.response?.status === 404) {
        navigate(URLS.profile())
      }
    }
  }

  const handleCloseInvite = () => {
    setOpenInvite(false);
    setInviteEmail("");
    setInviteEmailError("");
  };

  const handleInviteUser = async () => {
    if (!id) return
    setLoadingSave(true)
    try {
      await Api.inviteUser(id, inviteEmail, isAdmin);

      handleCloseInvite();
      getInvitedMembers()
    } catch (error) {
      if (error.response.status === 400) {
        if (error.response.data.code) {
          setSnackbarMessage(error.response.data.message);
        } else {
          setInviteEmailError(error.response.data.email)
          setSnackbarMessage("Failed to invite user");
        }
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage("Failed to invite users");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } finally {
      setLoadingSave(false)
    }
  };

  const handleCancelMembership = async () => {
    if (!id) return
    try {
      await Api.cancelMembership(id);
      setSnackbarMessage("Membership canceled successfully");
      setSnackbarSeverity("success");
      setOpenCancelMembership(false);
      // Optionally refresh member list or redirect
    } catch (error) {
      setSnackbarMessage("Failed to cancel membership");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCancelInvitation = async () => {
    if (!id) return
    if (selectedInvitationId === null) return;
    try {
      await Api.cancelInvitation(id, selectedInvitationId);
      setSnackbarMessage("Invitation canceled successfully");
      setSnackbarSeverity("success");
      setOpenCancelInvitation(false);
      getInvitedMembers(); // Refresh invited members list
    } catch (error) {
      setSnackbarMessage("Failed to cancel invitation");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const getRole = (member: Member) => {
    return member.role
  }

  const initConfirmRemove = (member: Member) => {
    setShowRemoveMemberDialog(true)
    setActiveMember(member)
  }

  const onRemoveDialogClose = (reload: boolean) => {
    if (reload) {
      if (activeMember?.email === user?.email) {
        return navigate(URLS.profile())
      }
      getMembers()
    }
    setShowRemoveMemberDialog(false)
  }

  const reloadInvitationList = () => {
    getInvitedMembers()
  }

  const onTeamUpdated = () => {
    setReloadTeamListIndex(reloadTeamListIndex + 1)
    setDisableEdit(true)
    loadTeam()
  }

  const initChangeRole = (member: Member) => {
    setSelectedMember(member)
    setOpenChangeRole(true)
  }

  const initDeleteTeam = () => {
    setOpenDeleteTeam(true)
  }

  const getSubscriptionNextBillingDate = () => {
    if (activeSubscription?.status === 'canceled') {
      return ''
    }
    const subscriptionEndDate = getDateString(activeSubscription?.current_period_end)
    if (!activeSubscription?.cancel_at_period_end) {
      return subscriptionEndDate
    }
    if (activeSubscription?.status === 'trialing') {
      return `Your trial ends on ${subscriptionEndDate}. Please update your payment method on file.`
    } else {
      return `Plan cancelled, will end on ${subscriptionEndDate}`
    }
  }

  return (
    <Container>
      <Box my={4}>
        <Box sx={{ display: 'flex' }}>
          <Typography sx={{ flex: 'auto' }} variant="h4" gutterBottom>
            Team Management
          </Typography>
        </Box>
        <Grid container spacing={2}>
        </Grid>
        <Dialog open={openInvite} onClose={handleCloseInvite}>
          <DialogTitle>Invite User</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="User Email"
              type="email"
              fullWidth
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <Typography sx={{ color: 'red', size: '0.5rem' }}>{inviteEmailError}</Typography>
            <div>Is admin</div>
            <Checkbox
              checked={isAdmin}
              onChange={() => setIsAdmin(!isAdmin)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseInvite} color="primary">
              Cancel
            </Button>
            <LoadingButton isLoading={loadingSave} onClick={handleInviteUser} color="primary">
              Send Invite
            </LoadingButton>
          </DialogActions>
        </Dialog>

        <Dialog open={openCancelMembership} onClose={() => setOpenCancelMembership(false)}>
          <DialogTitle>Cancel Membership</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to cancel your membership?</Typography>
          </DialogContent>
          <DialogActions>
            <Button variant='contained' onClick={() => setOpenCancelMembership(false)} color="primary">
              No
            </Button>
            <Button variant='contained' onClick={handleCancelMembership} color="error">
              Yes, Cancel
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openCancelInvitation} onClose={() => setOpenCancelInvitation(false)}>
          <DialogTitle>Revoke Invitation</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to revoke this invitation?</Typography>
          </DialogContent>
          <DialogActions>
            <Button variant='contained' onClick={() => setOpenCancelInvitation(false)} color="primary">
              Cancel
            </Button>
            <Button variant='contained' onClick={handleCancelInvitation} color="error">
              Revoke
            </Button>
          </DialogActions>
        </Dialog>



        <Box sx={{ paddingTop: '3rem' }}>
          <TeamManagement
            onClose={() => setDisableEdit(true)}
            team={activeTeam}
            onTeamUpdated={() => onTeamUpdated()}
            isAdmin={false}
            disabled={disableEdit}
          />
          {activeUserIsAdmin && disableEdit && <Button color="success" variant="contained" onClick={() => setDisableEdit(false)}>Edit</Button>}
        </Box>
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Subscription
          </Typography>
          <TableContainer component={Paper} sx={{ marginTop: '2rem' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Key
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Value
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell style={{ fontWeight: 'bold' }}>Product name:</TableCell>
                  <TableCell>{activeSubscription?.items[0].price.product_name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ fontWeight: 'bold' }}>Cost:</TableCell>
                  <TableCell>{activeSubscription?.items[0].price.payment_amount}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ fontWeight: 'bold' }}>Next Billing Date:</TableCell>
                  <TableCell>{getSubscriptionNextBillingDate()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ fontWeight: 'bold' }}>Subscription Status:</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{activeSubscription?.status || 'No subscription'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <TableContainer component={Paper} sx={{ marginTop: '2rem' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Feature</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Usage</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Allowed feed subscriptions</TableCell>
                  <TableCell>{activeTeam?.feed_limit}</TableCell>
                  <TableCell>{activeTeam?.feed_count}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Allowed users in team</TableCell>
                  <TableCell>{activeTeam?.user_limit}</TableCell>
                  <TableCell>{activeTeam && (activeTeam?.members_count + activeTeam?.invitations_count)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>API Access</TableCell>
                  <TableCell>{activeTeam?.allowed_api_access ? 'True' : 'False'}</TableCell>
                  <TableCell>
                    {activeTeam?.api_keys_count ?
                      <>{activeTeam?.api_keys_count} keys created</> : <>
                        No key created yet
                      </>}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Data Download</TableCell>
                  <TableCell>{activeTeam?.allowed_data_download ? 'True' : 'False'}</TableCell>
                  <TableCell>N/A</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          {activeUserIsAdmin && <Button sx={{ marginTop: '1rem' }} onClick={handleSubscriptionDetail} variant="contained">Modify Subscription</Button>}
        </Box>


        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Members
          </Typography>
          <Typography>You can manage roles of your team. There must always be one Owner of the team.</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <CircularProgress />
                      <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
                        Loading members...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : members.length > 0 ? (
                  members.map((member, index) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.display_name}</TableCell>
                      <TableCell>{getRole(member)}</TableCell>
                      <TableCell>
                        {activeUserIsAdmin && <Button variant="contained" onClick={() => initChangeRole(member)}>Change role</Button>}
                        {activeUserIsAdmin || (user?.email === member.email) &&
                          <Button sx={{ marginLeft: '2rem' }} variant="contained" color="error" onClick={() => initConfirmRemove(member)}>
                            {user?.email === member.email ? 'Leave' : 'Remove'}
                          </Button>
                        }
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No members available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>


        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Invited Users
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress />
                      <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
                        Loading invited users...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : invitedMembers.length > 0 ? (
                  invitedMembers.map((invitation, index) => (
                    <TableRow key={invitation.id}>
                      <TableCell>{invitation.email}</TableCell>
                      <TableCell>{invitation.role}</TableCell>
                      <TableCell>
                        <Button
                          color="error"
                          variant="contained"
                          onClick={() => {
                            setSelectedInvitationId(invitation.id);
                            setOpenCancelInvitation(true);
                          }}
                        >Revoke</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No invited users
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <br />
        <Typography>Invite User</Typography>
        <Typography>Members can subscribe/unsubscribe to feeds, view their posts, and access the API. Admins inherit all member permissions but can also add/remove users from the team and edit the team information (including subscriptions). Owners inherit all Admin permissions and can also delete the team.</Typography>
        {id && <InviteUserList isOwner={true} teamId={id} onComplete={() => { reloadInvitationList() }}></InviteUserList>}
      </Box>

      <Box>
        {activeTeam?.is_owner && <Button variant="contained" color='error' onClick={initDeleteTeam}>Delete Team</Button>}
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      {id && (<>
        {activeTeam && <ConfirmDeleteDialog open={opeDeleteTeam} team={activeTeam} onClose={() => setOpenDeleteTeam(false)}></ConfirmDeleteDialog>}
        {activeMember && <ConfirmRemoveMemberDialog teamId={id} open={showRemoveMemberDialog} onClose={onRemoveDialogClose} member={activeMember}></ConfirmRemoveMemberDialog>}
        {selectedMember && <ChangeRoleDialog member={selectedMember} open={openChangeRole} onClose={() => setOpenChangeRole(false)} isOwner={true} teamId={id} onRoleChanged={() => getMembers()}></ChangeRoleDialog>}
      </>)}
    </Container >
  );
}

export default Team;
