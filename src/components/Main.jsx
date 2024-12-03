import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import { DirectionsBoat, LocationOn, Receipt, Commute } from '@mui/icons-material';
import { Outlet, NavLink } from 'react-router-dom';

const Main = () => {
  const features = [
    { name: 'Trips', icon: <DirectionsBoat />, route: '/main/trips' },
    { name: 'Ports', icon: <LocationOn />, route: '/main/ports' },
    { name: 'Receipts', icon: <Receipt />, route: '/main/receipts' },
    { name: 'Vessel', icon: <Commute />, route: '/main/vessels' },
  ];

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md')); // Check for medium and smaller screens

  return (
    <Box display="flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box
        width={isSmallScreen ? '60px' : '20%'} // Collapsing sidebar on small screens
        bgcolor="primary.main"
        color="white"
        display="flex"
        flexDirection="column"
        alignItems="center"
        paddingTop="20px"
        sx={{
          transition: 'width 0.3s', // Smooth transition for sidebar
        }}
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
                {!isSmallScreen && <ListItemText primary={feature.name} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Main Content */}
      <Box
        width={isSmallScreen ? '100%' : '80%'} // Full width on small screens
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
