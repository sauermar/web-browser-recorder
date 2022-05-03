import { IconButton } from "@mui/material";
import { Add } from "@mui/icons-material";
import React, { FC } from "react";

interface AddButtonProps {
  handleClick: () => void;
  size?: "small" | "medium" | "large";
  title?: string;
  disabled?: boolean;
  hoverEffect?: boolean;
}

export const AddButton: FC<AddButtonProps> = (
  { handleClick,
    size ,
    title,
    disabled = false,
    hoverEffect= true,
  }) => {
  return (
    <IconButton
      aria-label="add"
      size={size || "small"}
      onClick={handleClick}
      disabled={disabled}
      sx={hoverEffect ? {} : {'&:hover': { color: '#1976d2', backgroundColor: 'transparent' }}}
    >
      <Add/>  {title}
    </IconButton>
  );
};
