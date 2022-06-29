import { IconButton } from "@mui/material";
import { Add } from "@mui/icons-material";
import React, { FC } from "react";

interface AddButtonProps {
  handleClick: () => void;
  size?: "small" | "medium" | "large";
  title?: string;
  disabled?: boolean;
  hoverEffect?: boolean;
  style?: React.CSSProperties;
}

export const AddButton: FC<AddButtonProps> = (
  { handleClick,
    size ,
    title,
    disabled = false,
    hoverEffect= true,
    style
  }) => {
  return (
    <IconButton
      aria-label="add"
      size={size || "small"}
      onClick={handleClick}
      disabled={disabled}
      sx={ hoverEffect
        ? {...style, '&:hover': { background: '#1976d2' }}
        : {...style, '&:hover': { color: '#1976d2', backgroundColor: 'transparent' }}
    }
    >
      <Add/>  {title}
    </IconButton>
  );
};
