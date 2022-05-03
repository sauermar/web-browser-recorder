import React, { forwardRef, useImperativeHandle } from 'react';
import { TextField } from "@mui/material";

export const ScrollSettings = forwardRef((props, ref) => {
  const [scrollPages, setScrollPages] = React.useState('0');
  useImperativeHandle(ref, () => ({
    getSettings() {
      return {
        scrollPages,
      }
    }
  }));

  return (
    <TextField
      sx={{marginLeft: '15px'}}
      type="number"
      label="Number of scroll pages"
      required
      onChange={(e) => setScrollPages(e.target.value)}
    />
  );
});
