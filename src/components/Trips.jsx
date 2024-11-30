import React from "react";
import TripsCards from "./TripsCards";
import TripsForm from "./TripsForm";
import { Stack } from "@mui/material";

const Trips = () => {
  // State for trip creation form

  // Render the component
  return (
    <Stack width="70%">
      <TripsForm />
      <TripsCards />
    </Stack>
  );
};

export default Trips;
