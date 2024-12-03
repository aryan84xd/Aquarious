import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Stack, TextField, Button, Typography, useMediaQuery, useTheme, Box } from '@mui/material';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Use media query to check screen size

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      const user_id = data.user.id; // Retrieve user_id
      localStorage.setItem('user_id', user_id); // Save to local storage
      navigate('/main'); // Redirect to main page
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh', // Full viewport height
        backgroundColor: '#f5f5f5', // Light background for the page
      }}
    >
      <Stack
        spacing={4}
        sx={{
          width: isSmallScreen ? '90%' : '35vw', // More width on larger screens but capped at 35vw
          maxWidth: '400px', // Maximum width to prevent form from becoming too large on very wide screens
          backgroundColor: '#fff', // White background for the form
          padding: 4,
          border: '1px solid #ddd', // Soft border
          borderRadius: 3, // Rounded corners
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)', // Subtle shadow for depth
        }}
      >
        <Typography variant="h4" component="h2" align="center" sx={{ fontWeight: 'bold', color: '#333' }}>
          Sign In
        </Typography>

        {error && <Typography color="error" variant="body2" align="center">{error}</Typography>}

        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSignIn}
          fullWidth
          sx={{
            padding: '12px',
            fontSize: isSmallScreen ? '14px' : '16px',
            borderRadius: 2,
            '&:hover': {
              backgroundColor: '#1976d2', // Slightly darker on hover
            },
          }}
        >
          Sign In
        </Button>
      </Stack>
    </Box>
  );
};

export default SignIn;
