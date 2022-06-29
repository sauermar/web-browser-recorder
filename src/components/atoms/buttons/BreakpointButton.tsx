import { IconButton } from "@mui/material";
import { Circle } from "@mui/icons-material";
import React, { FC } from "react";

interface BreakpointButtonProps {
  handleClick: () => void;
  size?: "small" | "medium" | "large";
}

export const BreakpointButton: FC<BreakpointButtonProps> = ({ handleClick, size }) => {
  return (
    <IconButton aria-label="add" size={size || "small"} onClick={handleClick}>
      <Circle color="error"/>
    </IconButton>
  );
};
