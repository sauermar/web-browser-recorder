import { IconButton } from "@mui/material";
import { Add } from "@mui/icons-material";
import React, { FC } from "react";

interface AddButtonProps {
  handleClick: () => void;
  size?: "small" | "medium" | "large";
  title?: string
}

export const AddButton: FC<AddButtonProps> = ({ handleClick, size , title}) => {
  return (
    <IconButton aria-label="add" size={size || "small"} onClick={handleClick}>
      <Add/>  {title}
    </IconButton>
  );
};
