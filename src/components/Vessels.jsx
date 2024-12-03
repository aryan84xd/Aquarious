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
  useMediaQuery,
  useTheme
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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

      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        setError("User not logged in");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("vessel")
        .select(
          "id, columns, crew, fuel, model, range, rows, total_seat, created_at"
        )
        .eq("user_id", user_id);

      if (error) throw error;

      setVessels(data || []);
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
      const user_id = localStorage.getItem("user_id");
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
          user_id,
        },
      ]);

      if (error) throw error;

      if (Array.isArray(data) && data.length > 0) {
        setVessels((prev) => [...prev, data[0]]);
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
    const requiredFields = [
      "model",
      "crew",
      "columns",
      "rows",
      "fuel",
      "range",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      setError(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return false;
    }

    return true;
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 }
      }}
    >
      {/* Add New Vessel Card */}
      <Card 
        sx={{ 
          mb: { xs: 2, sm: 4 },
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <CardContent>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="h2" 
            gutterBottom
            sx={{ textAlign: 'center' }}
          >
            Add New Vessel
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={isMobile ? 2 : 3}>
              {[
                { label: "Model", name: "model", type: "text" },
                { label: "Crew", name: "crew", type: "number" },
                { label: "Columns", name: "columns", type: "number" },
                { label: "Rows", name: "rows", type: "number" },
                { label: "Fuel (in Liters)", name: "fuel", type: "number" },
                { label: "Range (in Nautical Miles)", name: "range", type: "number" }
              ].map((field) => (
                <Grid item xs={12} sm={6} key={field.name}>
                  <TextField
                    fullWidth
                    label={field.label}
                    name={field.name}
                    type={field.type}
                    value={formData[field.name]}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>
              ))}
            </Grid>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mt: { xs: 1, sm: 2 },
                  fontSize: { xs: '0.8rem', sm: '1rem' }
                }}
              >
                {error}
              </Alert>
            )}

            <Box 
              sx={{ 
                mt: { xs: 2, sm: 3 },
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size={isMobile ? "medium" : "large"}
                fullWidth={isMobile}
              >
                Add Vessel
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Vessel List Card */}
      <Card 
        sx={{ 
          mb: { xs: 2, sm: 4 },
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <CardContent>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="h2" 
            gutterBottom
            sx={{ textAlign: 'center' }}
          >
            Vessel List
          </Typography>

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid 
              container 
              spacing={isMobile ? 2 : 3}
              justifyContent={isMobile ? "center" : "flex-start"}
            >
              {vessels.map((vessel) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4} 
                  key={vessel.id}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    width: '100%'
                  }}
                >
                  <Card
                    sx={{
                      width: '100%',
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: { xs: 1, sm: 2 },
                      border: "1px solid",
                      borderColor: "grey.300",
                      borderRadius: 2,
                      boxShadow: 2,
                      textAlign: isMobile ? 'center' : 'left'
                    }}
                  >
                    <DirectionsBoat
                      fontSize={isMobile ? "medium" : "large"}
                      sx={{ 
                        color: "primary.main",
                        mb: isMobile ? 1 : 0,
                        mx: isMobile ? 'auto' : 0
                      }}
                    />
                    <Box 
                      sx={{ 
                        ml: { xs: 0, sm: 2 },
                        textAlign: isMobile ? 'center' : 'left',
                        width: '100%'
                      }}
                    >
                      <Typography 
                        variant={isMobile ? "subtitle1" : "h6"}
                      >
                        {vessel.model}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                      >
                        Seats: {vessel.total_seat}, Crew: {vessel.crew}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                      >
                        Range: {vessel.range} NM, Fuel: {vessel.fuel} L
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                      >
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