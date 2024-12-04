import React, { useContext, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Box } from '@mui/material';
import { DocumentScanner, Groups, Search } from '@mui/icons-material';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import { NavLink } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import NavBar from './navbar.tsx';
import { TeamContext } from '../../contexts/team-context.tsx';
import { URLS } from '../../services/urls.ts';
import './index.css';


const drawerWidth = 240;
const OBSTRACTS_API_SWAGGER_URL = process.env.REACT_APP_OBSTRACTS_API_SWAGGER_URL

console.log({ OBSTRACTS_API_SWAGGER_URL })

const DashboardLayout = () => {
  const { activeTeam, setActiveTeam } = useContext(TeamContext);
  const [activeTeamId, setActiveTeamId] = useState('')
  const { user, logout, isAuthenticated, isLoading } = useAuth0()
  const navigate = useNavigate()
  const handleLogout = () => {
    logout()
  };

  useEffect(() => {
    setActiveTeamId(activeTeam?.id)
  }, [activeTeam])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/')
  }, [isLoading, isAuthenticated])

  return (
    <Box>
      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 6rem)' }}>
        <NavBar></NavBar>

        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              height: 'calc(100vh - 6rem)'
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <Toolbar sx={{ background: '#fb8521' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: '100%', width: '100%' }}>
              <NavLink to={URLS.teamFeeds(activeTeamId)}>
                <img style={{ width: '200px', display: 'block' }} src="/obstracts-logo.png" />
              </NavLink>
            </div>

          </Toolbar>
          <Divider />
          <List>
            {!activeTeam?.is_private && (<>
              <ListItem button component={NavLink} to={URLS.teamFeeds(activeTeamId)}>
                <ListItemIcon><RssFeedIcon /></ListItemIcon>
                <ListItemText primary="Feeds" />
              </ListItem>
              <ListItem button component={NavLink} to={URLS.teamObservationSearchWithoutParams(activeTeamId)}>
                <ListItemIcon><Search /></ListItemIcon>
                <ListItemText primary="Observable Search" />
              </ListItem>
              <ListItem button component={NavLink} to={OBSTRACTS_API_SWAGGER_URL}>
                <ListItemIcon><DocumentScanner></DocumentScanner></ListItemIcon>
                <ListItemText primary="API Documentation" />
              </ListItem>
              {activeTeam?.is_admin && (
                <ListItem button component={NavLink} to={URLS.teamManagement(activeTeamId)}>
                  <ListItemIcon><Groups></Groups></ListItemIcon>
                  <ListItemText primary="Team Management" />
                </ListItem>
              )}
            </>)}
          </List>
        </Drawer>

        <Box
          component="main"
          sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
        >
          <Toolbar />
          <Box sx={{}}>
            <Outlet />
          </Box>
        </Box>
      </Box>
      <Box className='footer'>
        <Typography>
          Built by the <a href='https://www.dogesec.com/' target='_blank'>DOGESEC</a> team. Copyright {new Date().getFullYear()}.
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
