import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  // const [error, setError] = useState('');
  // const navigate = useNavigate();

  // const handleSignIn = async () => {
  //   const { error } = await supabase.auth.signInWithPassword({ email, password });
  //   if (error) {
  //     setError(error.message);
  //   } else {
  //     navigate('/orders'); // Redirect to orders page
  //   }
  // };

  return (
    <div>
      {/* <h2>Sign In</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSignIn}>Sign In</button> */}
    </div>
  );
};

export default SignIn;
