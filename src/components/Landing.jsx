import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useNavigate } from "react-router-dom";

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
                minHeight: '100vh', // Ensure it fills the entire viewport height
                bgcolor: '#f8f9fa',
                px: 2, // Add padding for smaller screens
            }}
        >
            <Container
                maxWidth="md"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 4,
                    backgroundColor: '#f0f8ff',
                    border: '2px solid #dcdcdc',
                    borderRadius: 2,
                    boxShadow: 3,
                    width: '100%',
                    maxWidth: '700px',
                }}
            >
                <DirectionsBoatIcon
                    sx={{ fontSize: { xs: 60, sm: 80 }, color: '#007BFF', mb: 2 }}
                />
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{ fontSize: { xs: '1.5rem', sm: '2.5rem' } }}
                >
                    Welcome to <strong>Aquarious</strong> 🌊
                </Typography>
                <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ fontSize: { xs: '0.9rem', sm: '1.2rem' }, mb: 3 }}
                >
                    A streamlined solution for ferry trip management. Empower your
                    company to:
                </Typography>
                <Box sx={{ mt: 2, mb: 4, textAlign: 'left', width: '100%' }}>
                <Typography
                        variant="h6"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: { xs: '1rem', sm: '1.2rem' },
                            justifyContent:'center'
                        }}
                    >
                        <EventAvailableIcon sx={{ mr: 1, color: '#ff9800' }} /> Create
                        trips effortlessly.
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: { xs: '1rem', sm: '1.2rem' },
                            justifyContent:'center'
                        }}
                    >
                        <AddLocationAltIcon sx={{ mr: 1, color: '#28a745' }} /> Add and
                        manage ports efficiently.
                    </Typography>
                    
                    <Typography
                        variant="h6"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: { xs: '1rem', sm: '1.2rem' },
                            justifyContent:'center'
                        }}
                    >
                        🎟️ Make customer bookings right at the port.
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        width: '100%',
                    }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{
                            fontSize: 16,
                            padding: '10px 20px',
                            width: { xs: '100%', sm: 'auto' },
                        }}
                        onClick={handleClickSignUp}
                    >
                        Sign Up ✍️
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{
                            fontSize: 16,
                            padding: '10px 20px',
                            width: { xs: '100%', sm: 'auto' },
                        }}
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
