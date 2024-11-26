import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Box,
  CircularProgress,
} from "@mui/material";
import { supabase } from "../supabaseClient";
import { DirectionsBoat } from "@mui/icons-material";

const initialFormState = {
  model: "",
  crew: "",
  columns: "",
  rows: "",
  fuel: "",
  range: "",
};

const Vessels = () => {
  const [vessels, setVessels] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVessels();
  }, []);

  const fetchVessels = async () => {
    try {
      setIsLoading(true);
  
      const user_id = localStorage.getItem("user_id"); // Get user_id from local storage
      if (!user_id) {
        setError("User not logged in");
        setIsLoading(false);
        return;
      }
      console.log(user_id)
  
      // Make the query to Supabase
      const { data, error } = await supabase
        .from("vessel")
        .select("id, columns, crew, fuel, model, range, rows, total_seat, created_at")
        .eq("user_id", user_id); // Filter by user_id
      
        console.log(data)
      if (error) throw error;
  
      // Correctly setting the vessels state
      setVessels(data || []); // `data` is the array of vessels
  
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateTotalSeats = () => {
    const { rows, columns } = formData;
    const totalSeats = parseInt(rows || 0) * parseInt(columns || 0);
    return isNaN(totalSeats) ? 0 : totalSeats;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!isFormValid()) return;
  
    try {
      const user_id = localStorage.getItem("user_id"); // Get user_id from local storage
      if (!user_id) {
        setError("User not logged in");
        return;
      }
  
      const total_seat = calculateTotalSeats();
  
      const { data, error } = await supabase.from("vessel").insert([
        {
          model: formData.model,
          crew: parseInt(formData.crew),
          columns: parseInt(formData.columns),
          rows: parseInt(formData.rows),
          fuel: parseFloat(formData.fuel),
          range: parseFloat(formData.range),
          total_seat,
          user_id, // Include user_id in the insert
        },
      ]);
  
      if (error) throw error;
  
      // Check if data is valid before updating the state
      if (Array.isArray(data)) {
        setVessels((prev) => [...prev, ...data]); // Update vessels state with valid data
      } else {
        setError("Invalid data returned from database");
      }
  
      setFormData(initialFormState);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const isFormValid = () => {
    const requiredFields = ["model", "crew", "columns", "rows", "fuel", "range"];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return false;
    }

    return true;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Add New Vessel
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Crew"
                  name="crew"
                  type="number"
                  value={formData.crew}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Columns"
                  name="columns"
                  type="number"
                  value={formData.columns}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Rows"
                  name="rows"
                  type="number"
                  value={formData.rows}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fuel (in Liters)"
                  name="fuel"
                  type="number"
                  value={formData.fuel}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Range (in Nautical Miles)"
                  name="range"
                  type="number"
                  value={formData.range}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mt: 3 }}>
              <Button type="submit" variant="contained" color="primary" size="large">
                Add Vessel
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Vessel List
          </Typography>

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {vessels.map((vessel) => (
                <Grid item xs={12} md={4} key={vessel.id}>
                  <Card
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                    }}
                  >
                    <DirectionsBoat fontSize="large" sx={{ color: "primary.main" }} />
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="h6">{vessel.model}</Typography>
                      <Typography variant="body2">
                        Seats: {vessel.total_seat}, Crew: {vessel.crew}
                      </Typography>
                      <Typography variant="body2">
                        Range: {vessel.range} NM, Fuel: {vessel.fuel} L
                      </Typography>
                      <Typography variant="body2">
                        Rows: {vessel.rows}, Columns: {vessel.columns}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Vessels;
