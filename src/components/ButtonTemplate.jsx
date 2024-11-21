import React from "react";
import Button from "@mui/material/Button";

const ButtonTemplate = ({ label, onClick, variant, type = "button" }) => {
  return (
    <Button type={type} onClick={onClick} variant={variant}>
      {label}
    </Button>
  );
};

export default ButtonTemplate;
