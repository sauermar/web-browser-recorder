import { IconButton } from "@mui/material";
import { Edit } from "@mui/icons-material";
import React, { FC } from "react";

interface EditButtonProps {
  handleClick: () => void;
  size?: "small" | "medium" | "large";
}

export const EditButton: FC<EditButtonProps> = ({ handleClick, size }) => {
  return (
    <IconButton aria-label="add" size={size || "small"} onClick={handleClick}>
      <Edit/>
    </IconButton>
  );
};
