import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Grid,
  Box,
} from "@mui/material";
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // For table in PDF
import { supabase } from "../supabaseClient"; // Replace with your Supabase client import
import logo from "../assets/logo.png"; // Add your base64 logo here

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        setError("User not logged in");
        return;
      }

      const { data, error } = await supabase
        .from("receipt")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReceipts(data);
    } catch (err) {
      setError(err.message);
    }
  };

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
    doc.text(`Receipt Date: ${new Date(receipt.created_at).toLocaleDateString()}`, 15, 50);
    doc.text(`Receipt Number: ${receipt.id || "N/A"}`, 15, 60);

    // Customer Details
    doc.setFontSize(14);
    doc.text("Customer Details", 15, 75);
    doc.setFontSize(12);
    doc.text(`Name: ${receipt.customer_name}`, 15, 85);

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
        ["Trip Cost per Person", `$${receipt.cost_per?.toFixed(2) || 0}`],
        ["Terminal Cost", `$${receipt.terminal_cost?.toFixed(2) || 0}`],
        ["Number of People", receipt.no_people || 0],
        ["Total Cost", `$${receipt.total_cost?.toFixed(2) || 0}`],
      ],
      theme: "striped",
    });

    // Footer Message
    doc.setFontSize(10);
    doc.text("Thank you for booking with Aquarious!", 105, 290, { align: "center" });

    // Convert to Blob and open in new tab
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center" }}>
        Receipts
      </Typography>
      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}
      <Grid container spacing={3}>
        {receipts.map((receipt) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={receipt.id}>
            <Box sx={{ marginBottom: 3 }}>
              <Card
                sx={{
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                  borderRadius: "10px",
                  border: "1px solid #ddd",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.3)",
                  },
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#2C3E50" }}
                  >
                    {receipt.trip_name || "Trip Name Not Available"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#7F8C8D", marginBottom: "8px" }}
                  >
                    From: {receipt.start_port || "N/A"} | To: {receipt.end_port || "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#34495E" }}>
                    Date: {new Date(receipt.created_at).toLocaleDateString()}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", marginTop: "8px", color: "#16A085" }}
                  >
                    Total Cost: ${receipt.total_cost?.toFixed(2) || 0}
                  </Typography>
                  <Box sx={{ mt: 2, textAlign: "center" }}>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#3498DB",
                        color: "#fff",
                        "&:hover": { backgroundColor: "#2980B9" },
                      }}
                      onClick={() => generatePDFReceipt(receipt)}
                    >
                      View Receipt
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Receipts;
  