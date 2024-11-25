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
  CircularProgress,
  Box,
} from "@mui/material";
import { supabase } from "../supabaseClient";
import PortsMap from "./PortsMap";

const initialFormState = {
  name: "",
  no_gates: "",
  terminal_cost: "",
  latitude: "",
  longitude: "",
};

const Ports = () => {
  const [ports, setPorts] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPorts();
  }, []);

  const fetchPorts = async () => {
    try {
      setIsLoading(true);

      let { data: port, error } = await supabase
        .from("port_with_coordinates")
        .select("id, name, no_gates, terminal_cost, longitude, latitude");

      console.log('Fetched Ports:', port); 
      if (error) throw error;

      setPorts(port || []);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      return;
    }

    try {
      const location = `POINT(${formData.longitude} ${formData.latitude})`;

      const { data, error } = await supabase.from("port").insert([
        {
          name: formData.name,
          no_gates: parseInt(formData.no_gates),
          terminal_cost: parseFloat(formData.terminal_cost),
          location,
        },
      ]);

      if (error) throw error;

      setPorts((prev) => [...prev, ...data]);
      setFormData(initialFormState);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const isFormValid = () => {
    const requiredFields = [
      "name",
      "no_gates",
      "terminal_cost",
      "latitude",
      "longitude",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      setError(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return false;
    }

    if (
      isNaN(parseFloat(formData.latitude)) ||
      isNaN(parseFloat(formData.longitude))
    ) {
      setError("Latitude and longitude must be valid numbers");
      return false;
    }

    return true;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Add New Port
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Port Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Number of Gates"
                  name="no_gates"
                  type="number"
                  value={formData.no_gates}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Terminal Cost"
                  name="terminal_cost"
                  type="number"
                  step="0.01"
                  value={formData.terminal_cost}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  variant="outlined"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
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
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                Add Port
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Ports Map
          </Typography>

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{
                height: 600,
                width: "100%",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <PortsMap ports={ports} />
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Ports;
