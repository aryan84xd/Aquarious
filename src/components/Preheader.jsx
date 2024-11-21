import React, { useState } from "react";
import Stack from "@mui/material/Stack";

import ButtonTemplate from "./ButtonTemplate";
import { Typography } from "@mui/material";

const Preheader = ({ children }) => {
  const handleClick = () => {
    console.log("SignedIN/Singup");
  };
  return (
    
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      padding={2}
      sx={{ backgroundColor: "#f5f5f5" }}
    >
      <Typography variant="h1" color="title">Aquarious</Typography>
      <Stack spacing={2} direction="row">
        <ButtonTemplate
          label="Sign In"
          onClick={handleClick}
          variant="contained"
        />
        <ButtonTemplate
          label="Sign Up"
          onClick={handleClick}
          variant="contained"
        />
      </Stack>
    </Stack>
  );
};

export default Preheader;
