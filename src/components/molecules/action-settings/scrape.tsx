import React, { forwardRef, useImperativeHandle } from 'react';
import { Stack, TextField, Typography } from "@mui/material";

export const ScrapeSettings = forwardRef((props, ref) => {
  const [settings, setSettings] = React.useState<string>('');
  useImperativeHandle(ref, () => ({
    getSettings() {
      return settings;
    }
  }));

  return (
    <Stack direction="column">
      <TextField
        sx={{marginLeft: '15px'}}
        type="string"
        label="Selector"
        onChange={(e) => setSettings(e.target.value)}
      />
      <Typography>
        The scrape function uses heuristic algorithm to automatically scrape only important data from the page.
        If a selector is used it will scrape and automatically parse all available
        data inside of the selected element(s).
      </Typography>
    </Stack>
  );
});
