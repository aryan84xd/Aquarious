import React from "react";
import Stack from "@mui/material/Stack";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

import ButtonTemplate from "./ButtonTemplate";
import { Typography } from "@mui/material";

const Preheader = ({ children }) => {
  const navigate = useNavigate();

  const handleClickSignIn = () => {
    navigate("/signin");
  };

  const handleClickSignUp = () => {
    navigate("/signup");
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
        <img src={logo} alt="Logo" width="100rem" height="100rem"></img>
        <Typography variant="h1" color="title">
          Aquarious
        </Typography>
      </Stack>
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
    </Stack>
  );
};

export default Preheader;
