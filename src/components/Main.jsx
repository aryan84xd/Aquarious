import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { DirectionsBoat, LocationOn, Receipt } from '@mui/icons-material';
import { Outlet, NavLink } from 'react-router-dom';

const Main = () => {
  const features = [
    { name: 'Trips', icon: <DirectionsBoat />, route: '/main/trips' },
    { name: 'Ports', icon: <LocationOn />, route: '/main/ports' },
    { name: 'Receipts', icon: <Receipt />, route: '/main/receipts' },
  ];

  return (
    <Box display="flex" height="100vh">
      {/* Sidebar */}
      <Box
        width="20%"
        bgcolor="primary.main"
        color="white"
        display="flex"
        flexDirection="column"
        alignItems="center"
        paddingTop="20px"
      >
        <List>
          {features.map((feature) => (
            <ListItem disablePadding key={feature.name}>
              <ListItemButton
                component={NavLink}
                to={feature.route}
                sx={{
                  '&.active': {
                    bgcolor: 'secondary.main',
                  },
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'secondary.main',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>{feature.icon}</ListItemIcon>
                <ListItemText primary={feature.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Main Content */}
      <Box
        width="80%"
        bgcolor="#f5f5f5"
        padding="20px"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Main;
