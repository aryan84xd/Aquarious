import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  Box,
  Stack,
} from "@mui/material";
import { supabase } from "../supabaseClient";

const TripsForm = () => {
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
    capacity: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [ports, setPorts] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        setError("User not logged in");
        return;
      }

      const { data: portData, error: portError } = await supabase
        .from("port_with_coordinates")
        .select("*");
      if (portError) throw portError;
      setPorts(portData || []);

      const { data: vesselData, error: vesselError } = await supabase
        .from("vessel")
        .select("*")
        .eq("user_id", user_id);
      if (vesselError) throw vesselError;
      setVessels(vesselData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "vessel") {
      const selectedVessel = vessels.find((vessel) => vessel.id === value);
      if (selectedVessel) {
        const capacity =
          selectedVessel.total_seat != null ? selectedVessel.total_seat : 0;
        console.log("Selected Vessel Capacity:", capacity);
        setFormData((prev) => ({
          ...prev,
          vessel: value,
          capacity: capacity.toString(),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          vessel: value,
          capacity: "",
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      console.log("Image file selected:", file.name);
    } else {
      console.warn("No file selected");
      setImageFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        throw new Error("User not logged in");
      }

      if (!imageFile) {
        throw new Error("No image file selected");
      }

      // Upload image to a user-specific folder in Supabase bucket
      const fileName = `${user_id}/${Date.now()}_${imageFile.name}`;
      console.log("Uploading image:", fileName);

      const { data: imageData, error: imageError } = await supabase.storage
        .from("trip-images")
        .upload(fileName, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (imageError) throw imageError;

      const { data: publicUrlData, error: urlError } = supabase.storage
        .from("trip-images")
        .getPublicUrl(fileName);

      if (urlError) throw urlError;
      const imageUrl = publicUrlData.publicUrl;
      console.log("Image URL:", imageUrl);

      // Insert trip details into the database
      const { data: tripData, error: tripError } = await supabase
        .from("trip")
        .insert([{ ...formData, user_id }])
        .select(); // Use .select() to return the inserted data

      if (tripError) throw tripError;

      // Verify that tripData exists and has at least one item
      if (!tripData || tripData.length === 0) {
        throw new Error("No trip data returned after insertion");
      }

      console.log("Inserted Trip Data:", tripData);

      // Insert image record
      const { error: imageRecordError } = await supabase
        .from("trip_images")
        .insert([
          {
            trip_id: tripData[0].id,
            image_url: imageUrl,
          },
        ]);

      if (imageRecordError) throw imageRecordError;

      setSuccess("Trip created successfully!");
      setFormData(initialFormState);
      setImageFile(null);
    } catch (err) {
      console.error("Trip Creation Error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

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
      capacity,
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
      !distance ||
      !capacity
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

    if (!imageFile) {
      setError("Please upload an image for the trip.");
      return false;
    }

    setError(null);
    return true;
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Add New Trip
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Trip Name */}
            <TextField
              fullWidth
              label="Trip Name"
              name="trip_name"
              value={formData.trip_name}
              onChange={handleChange}
              variant="outlined"
              required
            />

            {/* Start Port and End Port */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
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
            </Stack>

            {/* Start Time and End Time */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
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
            </Stack>

            {/* Date */}
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

            {/* Vessel */}
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

            {/* Cost and Distance */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
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
            </Stack>

            {/* Capacity */}
            <TextField
              fullWidth
              label="Capacity"
              name="capacity"
              value={formData.capacity || ""}
              variant="outlined"
              disabled
            />

            {/* Image Upload */}
            <TextField
              type="file"
              fullWidth
              label=""
              onChange={handleImageChange}
              variant="outlined"
              required
            />

            {/* Submit Button */}
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              disabled={isLoading}
              sx={{ marginTop: 2 }} // Added margin-top to create space between button and fields
            >
              {isLoading ? "Creating Trip..." : "Create Trip"}
            </Button>
          </Stack>
        </form>

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
      </CardContent>
    </Card>
  );
};

export default TripsForm;
