import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useNavigate } from "react-router-dom";
// import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';

const LandingPage = () => {
    const navigate = useNavigate();

  const handleClickSignIn = () => {
    navigate("/signin");
  };

  const handleClickSignUp = () => {
    navigate("/signup");
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
        bgcolor: '#f8f9fa',
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: 4,
          backgroundColor: '#f0f8ff',
          border: '2px solid #dcdcdc',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <DirectionsBoatIcon
          sx={{ fontSize: 80, color: '#007BFF', mb: 2 }}
        />
        <Typography variant="h3" gutterBottom>
          Welcome to <strong>Aquarious</strong> 🌊
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          A streamlined solution for ferry trip management. Empower your company
          to:
        </Typography>
        <Box sx={{ mt: 2, mb: 4 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <AddLocationAltIcon sx={{ mr: 1, color: '#28a745' }} /> Add and
            manage ports efficiently.
          </Typography>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <EventAvailableIcon sx={{ mr: 1, color: '#ff9800' }} /> Create trips
            effortlessly.
          </Typography>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            🎟️ Make customer bookings right at the port.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ fontSize: 16, padding: '10px 20px' }}
            onClick={handleClickSignUp}
          >
            Sign Up ✍️
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ fontSize: 16, padding: '10px 20px' }}
            onClick={handleClickSignIn}
          >
            Sign In 🔑
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
