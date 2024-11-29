import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  Box,
  CircularProgress,
  CardMedia,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid, // Import Grid instead of Stack
} from "@mui/material";
import { supabase } from "../supabaseClient";

const TripsCards = () => {
  const initialBookingState = {
    customerName: "",
    numberOfPeople: "",
  };

  // State for existing trips
  const [existingTrips, setExistingTrips] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Booking state
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [bookingData, setBookingData] = useState(initialBookingState);

  // Open booking dialog
  const handleOpenBookingDialog = (trip) => {
    setSelectedTrip(trip);
    setBookingDialogOpen(true);
    setBookingData(initialBookingState);
  };

  // Handle booking form changes
  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit trip booking
  const handleBookTrip = async () => {
    const { customerName, numberOfPeople } = bookingData;

    if (!customerName || !numberOfPeople) {
      setError("Please fill in all booking details.");
      return;
    }

    const peopleCount = parseInt(numberOfPeople, 10);

    if (!selectedTrip || selectedTrip.capacity < peopleCount) {
      setError(`Only ${selectedTrip?.capacity || 0} seats are available.`);
      return;
    }

    try {
      // Insert booking into the receipt table
      const { error: receiptError } = await supabase.from("receipt").insert([
        {
          trip_id: selectedTrip.id,
          customer_name: customerName,
          no_people: peopleCount,
          cost_per: parseFloat(selectedTrip.cost),
          total_cost: parseFloat(selectedTrip.cost) * peopleCount,
          start_port: selectedTrip.start_port,
          end_port: selectedTrip.end_port,
          trip_name: selectedTrip.trip_name,
          terminal_cost: 0,
        },
      ]);

      if (receiptError) throw receiptError;

      // Update trip capacity
      const { error: updateError } = await supabase
        .from("trip")
        .update({ capacity: selectedTrip.capacity - peopleCount })
        .eq("id", selectedTrip.id);

      if (updateError) throw updateError;

      // Refresh trips data
      await fetchInitialData();

      // Reset booking dialog
      setBookingDialogOpen(false);
      setBookingData(initialBookingState);
      setSuccess("Booking successful!");
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const user_id = localStorage.getItem("user_id");

      if (!user_id) {
        setError("User not logged in.");
        return;
      }

      const { data: tripsData, error: tripsError } = await supabase
        .from("trip")
        .select("*, trip_images(image_url)")
        .eq("user_id", user_id);

      if (tripsError) throw tripsError;

      setExistingTrips(tripsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleCloseAlert = (type) => {
    if (type === "error") setError(null);
    if (type === "success") setSuccess(null);
  };

  return (
    <>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        Existing Trips
      </Typography>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid 
          container 
          spacing={3} 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'flex-start' 
          }}
        >
          {existingTrips.map((trip) => (
            <Grid item xs={12} sm={6} md={4} key={trip.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={
                    trip.trip_images && trip.trip_images.length > 0
                      ? trip.trip_images[0].image_url
                      : "/path/to/default/image.jpg"
                  }
                  alt={trip.trip_name}
                  sx={{ 
                    objectFit: 'cover', 
                    width: '100%', 
                    height: '200px' 
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6">
                    {trip.trip_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    From: {trip.start_port} To: {trip.end_port}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {trip.date}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available Seats: {trip.capacity}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleOpenBookingDialog(trip)}
                    disabled={trip.capacity === 0}
                  >
                    Book Trip
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Rest of the dialog and alert components remain the same */}
      <Dialog open={bookingDialogOpen} onClose={() => setBookingDialogOpen(false)}>
        <DialogTitle>Book Trip</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Book a trip to {selectedTrip?.trip_name}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="customerName"
            label="Customer Name"
            fullWidth
            variant="outlined"
            value={bookingData.customerName}
            onChange={handleBookingChange}
          />
          <TextField
            margin="dense"
            name="numberOfPeople"
            label="Number of People"
            type="number"
            fullWidth
            variant="outlined"
            value={bookingData.numberOfPeople}
            onChange={handleBookingChange}
            inputProps={{ min: 1, max: selectedTrip?.capacity }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleBookTrip} color="primary">
            Book
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Alert
          severity="error"
          onClose={() => handleCloseAlert("error")}
          sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          onClose={() => handleCloseAlert("success")}
          sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}
        >
          {success}
        </Alert>
      )}
    </>
  );
};

export default TripsCards;