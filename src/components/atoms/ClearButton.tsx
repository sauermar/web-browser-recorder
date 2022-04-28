import { IconButton } from "@mui/material";
import { Clear } from "@mui/icons-material";
import React, { FC } from "react";

interface ClearButtonProps {
  handleClick: () => void;
  size?: "small" | "medium" | "large";
}

export const ClearButton: FC<ClearButtonProps> = ({ handleClick, size }) => {
  return (
    <IconButton aria-label="add" size={size || "small"} onClick={handleClick}>
      <Clear/>
    </IconButton>
  );
};
