import React, { useState } from 'react';
import { GenericModal } from "../atoms/GenericModal";
import { MenuItem, TextField, Typography } from "@mui/material";
import { Dropdown } from "../atoms/DropdownMui";
import Button from "@mui/material/Button";
import { modalStyle } from "./AddWhereCondModal";

interface RunSettingsProps {
  isOpen: boolean;
  handleStart: (settings: RunSettings) => void;
  handleClose: () => void;
  isTask: boolean;
  params?: string[];
}

export interface RunSettings {
  maxConcurrency: number;
  maxRepeats: number;
  debug: boolean;
  params?: any;
}

export const RunSettingsModal = ({ isOpen, handleStart, handleClose, isTask, params }: RunSettingsProps) => {

  const [settings, setSettings] = React.useState<RunSettings>({
    maxConcurrency: 1,
    maxRepeats: 1,
    debug: true,
  });

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={handleClose}
      modalStyle={modalStyle}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginLeft: '65px',
      }}>
        { isTask
          ?
          (
            <React.Fragment>
            <Typography sx={{ margin: '20px 0px' }} >Recording parameters:</Typography>
              { params?.map((item, index) => {
            return <TextField
              sx={{ marginBottom: '15px' }}
              key={`param-${index}`}
              type="string"
              label={item}
              required
              onChange={(e) => setSettings(
                {
                  ...settings,
                  params: settings.params
                    ? {
                    ...settings.params,
                    [item]: e.target.value,
                  }
                  : {
                    [item]: e.target.value,
                  },
                })}
            />
          }) }
            </React.Fragment>)
          : null
        }
        <Typography sx={{ margin: '20px 0px' }} >Interpreter settings:</Typography>
        <TextField
          sx={{ marginBottom: '15px' }}
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
          sx={{ marginBottom: '15px' }}
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
