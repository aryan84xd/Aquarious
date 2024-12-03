import React, { useState } from "react";
import Stack from "@mui/material/Stack";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import ButtonTemplate from "./ButtonTemplate";
import { Typography, Menu, MenuItem, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useMediaQuery, useTheme } from "@mui/material";

const Preheader = ({ children }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClickSignIn = () => {
    navigate("/signin");
  };

  const handleClickSignUp = () => {
    navigate("/signup");
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      padding={2}
      sx={{
        backgroundColor: "#f5f5f5",
        borderBottom: "2px solid lightgrey", // Add bottom border only
      }}
    >
      <Stack spacing={2} direction="row" alignItems="center">
        <img src={logo} alt="Logo" width="100rem" height="100rem" />
        <Typography variant="h1" color="title">
          Aquarious
        </Typography>
      </Stack>

      {/* Show menu icon on small screens */}
      {isSmallScreen ? (
        <>
          <IconButton
            color="primary"
            onClick={handleMenuOpen}
            aria-controls="menu-appbar"
            aria-haspopup="true"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { handleClickSignIn(); handleMenuClose(); }}>Sign In</MenuItem>
            <MenuItem onClick={() => { handleClickSignUp(); handleMenuClose(); }}>Sign Up</MenuItem>
          </Menu>
        </>
      ) : (
        <Stack spacing={2} direction="row">
          <ButtonTemplate
            label="Sign In"
            onClick={handleClickSignIn}
            variant="contained"
          />
          <ButtonTemplate
            label="Sign Up"
            onClick={handleClickSignUp}
            variant="contained"
          />
        </Stack>
      )}
    </Stack>
  );
};

export default Preheader;
  