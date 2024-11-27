import React, { Component, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
// Component
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import Main from "./components/Main";
import Preheader from "./components/Preheader";
import LandingPage from "./components/Landing";

import Trips from "./components/Trips";
import Ports from "./components/Ports";
import Receipts from "./components/Receipts";
import Vessels from "./components/Vessels";

import { supabase } from "./supabaseClient";

import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme"; // Import the theme
import Typography from "@mui/material/Typography";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Initialize session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Listen for auth state changes
    const { subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Cleanup on component unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <Preheader />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route
            path="/main"
            element={session ? <Main /> : <Navigate to="/signin" />}
          >
            <Route path="trips" element={<Trips />} />
            <Route path="ports" element={<Ports />} />
            <Route path="receipts" element={<Receipts />} />
            <Route path="vessels" element={<Vessels />} />
          </Route>
          <Route
            path="*"
            element={<Navigate to={session ? "/main" : "/signin"} />}
          />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;
