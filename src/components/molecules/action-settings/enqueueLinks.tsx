import React, { forwardRef, useImperativeHandle } from 'react';
import { Stack, TextField } from "@mui/material";
import { WarningText } from "../../atoms/texts";
import WarningIcon from "@mui/icons-material/Warning";

export const EnqueueLinksSettings = forwardRef((props, ref) => {
  const [settings, setSettings] = React.useState<string>('');
  useImperativeHandle(ref, () => ({
    getSettings() {
      return settings;
    }
  }));

  return (
    <Stack direction="column">
      <TextField
        sx={{marginLeft: '15px', marginRight: '15px'}}
        type="string"
        label="Selector"
        required
        onChange={(e) => setSettings(e.target.value)}
      />
      <WarningText>
        <WarningIcon color="warning"/>
        Reads elements targeted by the selector and stores their links in a queue.
        Those pages are then processed using the same workflow as the initial page
        (in parallel if the maxConcurrency parameter is greater than 1).
      </WarningText>
    </Stack>
  );
});
