import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Orders from './components/Orders';
import { supabase } from './supabaseClient';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Initialize session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Listen for auth state changes
    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup on component unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route
          path="/orders"
          element={session ? <Orders /> : <Navigate to="/signup" />}
        />
        <Route path="*" element={<Navigate to={session ? "/orders" : "/signup"} />} />
      </Routes>
    </Router> 
  );
}

export default App;
