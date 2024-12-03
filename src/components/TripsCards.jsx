import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
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
  Grid,
} from "@mui/material";
import logo from "../assets/logo.png";
import { supabase } from "../supabaseClient";
import jsPDF from "jspdf";
import "jspdf-autotable";

// PDF Receipt Generator Function
const generatePDFReceipt = (receipt) => {
  const doc = new jsPDF();

  // Add Company Logo
  doc.addImage(logo, "PNG", 15, 10, 30, 30);

  // Add Company Name and Header
  doc.setFontSize(20);
  doc.text("Aquarious", 50, 20);
  doc.setFontSize(14);
  doc.text("Trip Booking Receipt", 50, 30);
  doc.setFontSize(10);
  doc.text("Providing hassle-free ferry booking services", 50, 36);

  // Receipt Info
  doc.setFontSize(12);
  doc.text(`Receipt Date: ${new Date().toLocaleDateString()}`, 15, 50);
  doc.text(`Receipt Number: ${receipt.id || "N/A"}`, 15, 60);

  // Customer Details
  doc.setFontSize(14);
  doc.text("Customer Details", 15, 75);
  doc.setFontSize(12);
  doc.text(`Name: ${receipt.customer_name}`, 15, 85);
  doc.text(`Contact: ${receipt.contact_number}`, 15, 95);

  // Trip Details
  doc.setFontSize(14);
  doc.text("Trip Details", 15, 110);
  doc.setFontSize(12);
  doc.text(`Trip Name: ${receipt.trip_name}`, 15, 120);
  doc.text(`From: ${receipt.start_port}`, 15, 130);
  doc.text(`To: ${receipt.end_port}`, 15, 140);
  doc.text(`Number of People: ${receipt.no_people}`, 15, 150);

  // Cost Breakdown
  doc.setFontSize(14);
  doc.text("Cost Breakdown", 15, 175);
  doc.setFontSize(12);

  // Use autoTable for better cost breakdown
  doc.autoTable({
    startY: 180,
    head: [["Description", "Amount"]],
    body: [
      ["Trip Cost per Person", `$${receipt.cost_per.toFixed(2)}`],
      ["Terminal Cost", `$${receipt.terminal_cost.toFixed(2)}`],
      ["Number of People", receipt.no_people],
      ["Total Cost", `$${receipt.total_cost.toFixed(2)}`],
    ],
    theme: "striped",
  });

  // Footer Message
  doc.setFontSize(10);
  doc.text("Thank you for booking with Aquarious!", 105, 290, {
    align: "center",
  });

  // Convert to Blob and open in new tab
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, "_blank");
};

const TripsCards = () => {
  const initialBookingState = {
    customerName: "",
    numberOfPeople: "",
    contactNumber: "",
  };

  const [existingTrips, setExistingTrips] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [bookingData, setBookingData] = useState(initialBookingState);
  const [lastReceipt, setLastReceipt] = useState(null);

  const handleOpenBookingDialog = (trip) => {
    setSelectedTrip(trip);
    setBookingDialogOpen(true);
    setBookingData(initialBookingState);
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookTrip = async () => {
    const { customerName, numberOfPeople, contactNumber } = bookingData;

    if (!customerName || !numberOfPeople || !contactNumber) {
      setError("Please fill in all booking details.");
      return;
    }

    const peopleCount = parseInt(numberOfPeople, 10);

    if (!selectedTrip || selectedTrip.capacity < peopleCount) {
      setError(`Only ${selectedTrip?.capacity || 0} seats are available.`);
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(contactNumber)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      const { data: portData, error: portError } = await supabase
        .from("port")
        .select("terminal_cost")
        .eq("name", selectedTrip.start_port)
        .single();

      if (portError) throw portError;

      const terminalCost = portData?.terminal_cost || 0;
      const totalCost =
        peopleCount * (parseFloat(selectedTrip.cost) + terminalCost);

      const user_id = localStorage.getItem("user_id");

      if (!user_id) {
        setError("User not logged in.");
        return;
      }

      // Insert booking into the receipt table
      const { data: receiptData, error: receiptError } = await supabase
        .from("receipt")
        .insert([
          {
            trip_id: selectedTrip.id,
            user_id: user_id,
            customer_name: customerName,
            contact_number: contactNumber,
            no_people: peopleCount,
            cost_per: parseFloat(selectedTrip.cost),
            terminal_cost: terminalCost,
            total_cost: totalCost,
            start_port: selectedTrip.start_port,
            end_port: selectedTrip.end_port,
            trip_name: selectedTrip.trip_name,
          },
        ])
        .select(); // Return the inserted receipt

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

      // Store last receipt for PDF generation
      const lastReceiptData = receiptData[0];
      setLastReceipt(lastReceiptData);

      // Set success message with PDF download option
      setSuccess(
        <div>
          Booking successful!
          <Button
            variant="contained"
            color="primary"
            onClick={() => generatePDFReceipt(lastReceiptData)}
            sx={{ ml: 2 }}
          >
            Download Receipt
          </Button>
        </div>
      );
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
            display: "flex",
            justifyContent: "center",
            width: "100%",
            marginTop: 3,
          }}
        >
          {existingTrips.map((trip) => (
            <Grid item xs={12} sm={6} md={4} key={trip.id}>
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  boxShadow: 3,
                  borderRadius: 2,
                }}
              >
                {trip.trip_images.length > 0 && (
                  <CardMedia
                    component="img"
                    image={trip.trip_images[0].image_url}
                    alt={trip.trip_name}
                    sx={{
                      height: 200,
                      objectFit: "cover",
                      borderRadius: 2,
                    }}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {trip.trip_name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    From: {trip.start_port} To: {trip.end_port}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Capacity: {trip.capacity}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleOpenBookingDialog(trip)}
                  >
                    Book Trip
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {error && (
        <Alert severity="error" onClose={() => handleCloseAlert("error")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => handleCloseAlert("success")}>
          {success}
        </Alert>
      )}
      <Dialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
      >
        <DialogTitle>Book a Trip</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide the details for booking your trip.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            name="customerName"
            value={bookingData.customerName}
            onChange={handleBookingChange}
          />
          <TextField
            margin="dense"
            label="Number of People"
            type="number"
            fullWidth
            variant="standard"
            name="numberOfPeople"
            value={bookingData.numberOfPeople}
            onChange={handleBookingChange}
          />
          <TextField
            margin="dense"
            label="Contact Number"
            type="text"
            fullWidth
            variant="standard"
            name="contactNumber"
            value={bookingData.contactNumber}
            onChange={handleBookingChange}
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
    </>
  );
};

export default TripsCards;
