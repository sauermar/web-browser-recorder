import React, { forwardRef, useImperativeHandle } from 'react';
import { TextField } from "@mui/material";
import { ScrollSettings as Settings } from "../../../shared/types";

export const ScrollSettings = forwardRef((props, ref) => {
  const [settings, setSettings] = React.useState<Settings>({
    scrollPages: 0,
  });
  useImperativeHandle(ref, () => ({
    getSettings() {
      return settings;
    }
  }));

  return (
    <TextField
      sx={{marginLeft: '15px'}}
      type="number"
      label="Number of scroll pages"
      required
      onChange={(e) => setSettings(
        {
          ...settings,
          scrollPages: parseInt(e.target.value),
        })}
    />
  );
});
