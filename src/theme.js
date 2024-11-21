import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Blue
    },
    secondary: {
      main: "#dc004e", // Pink
    },
    title:{
        main:"#0F52BA" //blue saphire
    },
    background: {
      default: "#f4f6f8", // Light gray
      paper: "#ffffff", // White for cards or containers
    },
    text: {
      primary: "#000000", // Black text
      secondary: "#5f6368", // Gray text
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif", // Base font
    h1: {
      
      fontSize: "2.5rem",
      fontWeight: 700,
      "@media (min-width:600px)": {
        fontSize: "3rem",
      },
      [createTheme().breakpoints.up("md")]: {
        fontSize: "4rem",
      },
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      "@media (min-width:600px)": {
        fontSize: "2.5rem",
      },
      [createTheme().breakpoints.up("md")]: {
        fontSize: "3rem",
      },
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 500,
      "@media (min-width:600px)": {
        fontSize: "2rem",
      },
      [createTheme().breakpoints.up("md")]: {
        fontSize: "2.5rem",
      },
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
    },
    body2: {
      fontSize: "0.875rem",
      fontWeight: 400,
    },
    button: {
      textTransform: "none", // Prevent uppercase transformation
      fontWeight: 600,
    },
  },
  spacing: 8, // Default spacing unit (e.g., 8px, 16px, 24px, etc.)
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px", // Rounded corners for buttons
          padding: "8px 16px", // Button padding
        },
        containedPrimary: {
          backgroundColor: "#1976d2",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#115293", // Darker blue on hover
          },
        },
        containedSecondary: {
          backgroundColor: "#dc004e",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#9a0036", // Darker pink on hover
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          padding: "16px",
        },
      },
    },
  },
});

export default theme;
