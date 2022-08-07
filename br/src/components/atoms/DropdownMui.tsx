import React from 'react';
import { FormControl, InputLabel, Select } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select/Select";

interface DropdownProps {
  id: string;
  label: string;
  value: string | undefined;
  handleSelect: (event: SelectChangeEvent) => void;
  children? : React.ReactNode;
};

export const Dropdown = ({id, label, value, handleSelect, children}: DropdownProps) => {
  return (
    <FormControl sx={{ minWidth: 120 }} size="small">
      <InputLabel id={id}>{label}</InputLabel>
      <Select
        labelId={id}
        name = {id}
        value={value}
        label={label}
        onChange={handleSelect}
        size='small'
      >
        {children}
      </Select>
    </FormControl>
  );
};
