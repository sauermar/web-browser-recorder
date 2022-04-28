import { IconButton } from "@mui/material";
import { Add } from "@mui/icons-material";
import React, { FC } from "react";

interface AddButtonProps {
  handleClick: () => void;
  size?: "small" | "medium" | "large";
}

export const AddButton: FC<AddButtonProps> = ({ handleClick, size }) => {
  return (
    <IconButton aria-label="add" size={size || "small"} onClick={handleClick}>
      <Add/>
    </IconButton>
  );
};
