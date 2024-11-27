import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
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
} from "@mui/material";
import { supabase } from "../supabaseClient";

const initialFormState = {
  trip_name: "",
  start_port: "",
  end_port: "",
  start_time: "",
  end_time: "",
  date: "",
  vessel: "",
  cost: "",
  distance: "",
};

const initialBookingState = {
  customerName: "",
  numberOfPeople: "",
};

const Trips = () => {
  // State for trip creation form
  const [formData, setFormData] = useState(initialFormState);
  const [ports, setPorts] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [capacity, setCapacity] = useState(0);

  // State for existing trips
  const [existingTrips, setExistingTrips] = useState([]);

  // State for booking
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [bookingData, setBookingData] = useState(initialBookingState);

  // Fetch initial data when component mounts
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch ports, vessels, and existing trips
  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        setError("User not logged in");
        setIsLoading(false);
        return;
      }

      // Fetch ports
      const { data: portData, error: portError } = await supabase
        .from("port_with_coordinates")
        .select("*");

      if (portError) throw portError;
      setPorts(portData);

      // Fetch vessels for the user
      const { data: vesselData, error: vesselError } = await supabase
        .from("vessel")
        .select("*")
        .eq("user_id", user_id);

      if (vesselError) throw vesselError;
      setVessels(vesselData);

      // Fetch existing trips for the user
      const { data: tripsData, error: tripsError } = await supabase
        .from("trip")
        .select("*, trip_images(image_url)")
        .eq("user_id", user_id);

      if (tripsError) throw tripsError;
      setExistingTrips(tripsData);

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Dynamically update capacity when vessel is selected
    if (name === "vessel") {
      const selectedVessel = vessels.find(
        (vessel) => vessel.id === parseInt(value)
      );
      if (selectedVessel) {
        setCapacity(selectedVessel.total_seat);
      } else {
        setCapacity(0);
      }
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  // Validate form before submission
  const validateForm = () => {
    const {
      trip_name,
      start_port,
      end_port,
      start_time,
      end_time,
      date,
      vessel,
      cost,
      distance,
    } = formData;

    if (
      !trip_name ||
      !start_port ||
      !end_port ||
      !start_time ||
      !end_time ||
      !date ||
      !vessel ||
      !cost ||
      !distance
    ) {
      setError("Please fill in all fields.");
      return false;
    }

    if (start_port === end_port) {
      setError("Start and end ports cannot be the same.");
      return false;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    if (selectedDate < today.setHours(0, 0, 0, 0)) {
      setError("Date must be current or future.");
      return false;
    }

    setError(null);
    return true;
  };

  // Submit new trip
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        setError("User not logged in");
        return;
      }

      const { data: tripData, error: tripError } = await supabase
        .from("trip")
        .insert([
          {
            ...formData,
            capacity,
            user_id,
          },
        ]);

      if (tripError) throw tripError;

      // Upload images
      if (images.length > 0) {
        for (const image of images) {
          const { data, error } = await supabase.storage
            .from("trip-images")
            .upload(`trips/${tripData[0].id}/${image.name}`, image);

          if (error) throw error;

          await supabase
            .from("trip_images")
            .insert([{ trip_id: tripData[0].id, image_url: data.path }]);
        }
      }

      // Refresh trips after creating a new one
      await fetchInitialData();

      setSuccess("Trip created successfully!");
      setFormData(initialFormState);
      setImages([]);
    } catch (err) {
      setError(err.message);
    }
  };

  // Open booking dialog
  const handleOpenBookingDialog = (trip) => {
    setSelectedTrip(trip);
    setBookingDialogOpen(true);
    // Reset booking data
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

    // Validate inputs
    if (!customerName || !numberOfPeople) {
      setError("Please fill in all booking details");
      return;
    }

    const peopleCount = parseInt(numberOfPeople);

    // Check if enough seats are available
    if (!selectedTrip || selectedTrip.capacity < peopleCount) {
      setError(`Only ${selectedTrip?.capacity || 0} seats are available`);
      return;
    }

    try {
      // Create receipt
      const { data: receiptData, error: receiptError } = await supabase
        .from("receipt")
        .insert([
          {
            trip_id: selectedTrip.id,
            customer_name: customerName,
            no_people: peopleCount,
            cost_per: parseFloat(selectedTrip.cost),
            total_cost: parseFloat(selectedTrip.cost) * peopleCount,
            start_port: selectedTrip.start_port,
            end_port: selectedTrip.end_port,
            trip_name: selectedTrip.trip_name,
            terminal_cost: 0, // You might want to calculate this dynamically
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

  // Close error and success messages
  const handleCloseAlert = (type) => {
    if (type === "error") setError(null);
    if (type === "success") setSuccess(null);
  };

  // Render the component
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Trip Creation Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Add New Trip
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Trip Name"
                  name="trip_name"
                  value={formData.trip_name}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Start Port"
                  name="start_port"
                  value={formData.start_port}
                  onChange={handleChange}
                  variant="outlined"
                  required
                >
                  {ports.map((port) => (
                    <MenuItem key={port.id} value={port.name}>
                      {port.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="End Port"
                  name="end_port"
                  value={formData.end_port}
                  onChange={handleChange}
                  variant="outlined"
                  required
                >
                  {ports
                    .filter((port) => port.name !== formData.start_port)
                    .map((port) => (
                      <MenuItem key={port.id} value={port.name}>
                        {port.name}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  type="time"
                  fullWidth
                  label="Start Time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  variant="outlined"
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  type="time"
                  fullWidth
                  label="End Time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  variant="outlined"
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  fullWidth
                  label="Date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  variant="outlined"
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Vessel"
                  name="vessel"
                  value={formData.vessel}
                  onChange={handleChange}
                  variant="outlined"
                  required
                >
                  {vessels.map((vessel) => (
                    <MenuItem key={vessel.id} value={vessel.id}>
                      {vessel.model}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  type="number"
                  fullWidth
                  label="Cost (in USD)"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  type="number"
                  fullWidth
                  label="Distance (in km)"
                  name="distance"
                  value={formData.distance}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Upload Images
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleImageUpload}
                  />
                </Button>
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}

            <Box sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Create Trip"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Existing Trips Section */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        Existing Trips
      </Typography>
      <Grid container spacing={3}>
        {existingTrips.map((trip) => (
          <Grid item xs={12} sm={6} md={4} key={trip.id}>
            <Card
              sx={{
                maxWidth: 345,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {trip.trip_images && trip.trip_images.length > 0 ? (
                <CardMedia
                  component="img"
                  height="140"
                  image={`${process.env.REACT_APP_SUPABASE_STORAGE_URL}/${trip.trip_images[0].image_url}`}
                  alt={trip.trip_name}
                />
              ) : (
                <Box
                  sx={{
                    height: 140,
                    bgcolor: "grey.300",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  No Image
                </Box>
              )}
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
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

      {/* Booking Dialog */}
      <Dialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
      >
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

      {/* Error and Success Alerts */}
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
    </Container>
  );
};

export default Trips;
