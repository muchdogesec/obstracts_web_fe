import React, { useContext, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import SupportIcon from '@mui/icons-material/Support';
import { Api } from '../../services/api.ts';
import { getActiveTeamId, getInvitationId, setActiveTeamId, setApiKey, setAuthToken, setUserData } from "../../services/storage.ts";
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { TeamContext } from '../../contexts/team-context.tsx';
import { URLS } from '../../services/urls.ts';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#ff4081',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
    },
  },
});

const features = [
  { title: 'Fast Performance', description: 'Lightning-fast load times and smooth interactions.', icon: <SpeedIcon fontSize="large" color="primary" /> },
  { title: 'Secure & Reliable', description: 'Your data is protected with top-notch security measures.', icon: <SecurityIcon fontSize="large" color="primary" /> },
  { title: '24/7 Support', description: 'Our dedicated team is always here to help you.', icon: <SupportIcon fontSize="large" color="primary" /> },
];

function LandingPage() {
  const { error, user, getAccessTokenSilently, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const { activeTeam, setActiveTeam } = useContext(TeamContext);

  const navigate = useNavigate()

  const redirect_user = async () => {
    if (isLoading) return
    if (!isAuthenticated) {
      console.log(888)
      return loginWithRedirect({})
    }
    let activeTeamId = getActiveTeamId();
    if (!activeTeamId) {
      return loginWithRedirect({})
    }
    setActiveTeamId(activeTeamId)
    navigate(
      URLS.teamFeeds(activeTeamId)
    )
  };
  useEffect(() => { redirect_user() }, [
    user, isAuthenticated, isLoading
  ])

  return (
    <ThemeProvider theme={theme}>
    </ThemeProvider>
  );
}

export default LandingPage;