import React, { forwardRef, useImperativeHandle } from 'react';
import { Stack, TextField } from "@mui/material";
import { WarningText } from '../../atoms/texts';
import InfoIcon from "@mui/icons-material/Info";

export const ClickOnCoordinatesSettings = forwardRef((props, ref) => {
  const [settings, setSettings] = React.useState<number[]>([0,0]);
  useImperativeHandle(ref, () => ({
    getSettings() {
      return settings;
    }
  }));

  return (
    <Stack direction="column">
      <TextField
        sx={{marginLeft: '15px', marginRight: '15px'}}
        type="number"
        label="X"
        onChange={(e) => setSettings(prevState => ([Number(e.target.value), prevState[1]]))}
        required
        defaultValue={settings[0]}
      />
      <TextField
        sx={{margin: '15px'}}
        type="number"
        label="Y"
        onChange={(e) => setSettings(prevState => ([prevState[0], Number(e.target.value)]))}
        required
        defaultValue={settings[1]}
      />
      <WarningText>
        <InfoIcon color='warning'/>
        The click function will click on the given coordinates.
        You need to put the coordinates by yourself.
      </WarningText>
    </Stack>
  );
});
