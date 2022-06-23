import React, { useState } from 'react';
import { GenericModal } from "../atoms/GenericModal";
import { MenuItem, TextField } from "@mui/material";
import { Dropdown } from "../atoms/DropdownMui";
import Button from "@mui/material/Button";

interface RunSettingsProps {
  isOpen: boolean;
  handleStart: (settings: RunSettings) => void;
  handleClose: () => void;
}

export interface RunSettings {
  maxConcurrency: number,
  maxRepeats: number,
  debug: boolean,
}

export const RunSettingsModal = ({ isOpen, handleStart, handleClose }: RunSettingsProps) => {

  const [settings, setSettings] = React.useState<RunSettings>({
    maxConcurrency: 1,
    maxRepeats: 1,
    debug: true,
  });

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={handleClose}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginLeft: '65px',
      }}>
        <TextField
          sx={{ marginLeft: '15px' }}
          type="number"
          label="maxConcurrency"
          required
          onChange={(e) => setSettings(
            {
              ...settings,
              maxConcurrency: parseInt(e.target.value),
            })}
          defaultValue={settings.maxConcurrency}
        />
        <TextField
          sx={{ marginLeft: '15px' }}
          type="number"
          label="maxRepeats"
          required
          onChange={(e) => setSettings(
            {
              ...settings,
              maxRepeats: parseInt(e.target.value),
            })}
          defaultValue={settings.maxRepeats}
        />
        <Dropdown
          id="debug"
          label="debug"
          value={settings.debug?.toString()}
          handleSelect={(e) => setSettings(
            {
              ...settings,
              debug: e.target.value === "true",
            })}
        >
          <MenuItem value="true">true</MenuItem>
          <MenuItem value="false">false</MenuItem>
        </Dropdown>
        <Button onClick={() => handleStart(settings)}>Start</Button>
      </div>
    </GenericModal>
  );
}
