import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Stack } from '@mui/material';
const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigate('/orders'); // Redirect to orders page
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center', // Center horizontally
        alignItems: 'flex-start', // Align items starting from the top
        height: '80vh',
        width:'100vw', // Full viewport height
        backgroundColor: '#f9f9f9', // Optional background color for the page
      }}
    >
      <Stack
        spacing={4} // Adds spacing between children
        sx={{
          width:'15vw',
          height:'25vh',
          backgroundColor: '#fff', // Optional: white background for form
          padding: 4, // Adds padding inside the Stack
          border: '1px solid lightgrey', // Light grey border
          borderRadius: 2, // Optional: rounded corners
          marginTop: '10%', // Distance from the top
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Optional: subtle shadow for aesthetics
        }}
      >
        <h2>Sign In</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} // Styled input
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} // Styled input
        />
        <button
          onClick={handleSignIn}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#0F53A8',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Sign In
        </button>
      </Stack>
    </div>
  );
};

export default SignIn;
