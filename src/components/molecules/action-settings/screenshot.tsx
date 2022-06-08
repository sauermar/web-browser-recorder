import React, { forwardRef, useImperativeHandle } from 'react';
import { InputLabel, MenuItem, TextField, Select, FormControl } from "@mui/material";
import { ScreenshotSettings as Settings } from "../../../shared/types";
import styled from "styled-components";
import { SelectChangeEvent } from "@mui/material/Select/Select";
import { Dropdown } from "../../atoms/DropdownMui";

export const ScreenshotSettings = forwardRef((props, ref) => {
  const [settings, setSettings] = React.useState<Settings>({ });
  useImperativeHandle(ref, () => ({
    getSettings() {
      return settings;
    }
  }));

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = event.target;
    let parsedValue: any = value;
    if (type === "number") {
      parsedValue = parseInt(value);
    };
    setSettings({
      ...settings,
      [id]: parsedValue,
    });
  };

  const handleSelect = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    let parsedValue: any = value;
    if (value === "true" || value === "false") {
      parsedValue = value === "true";
    };
    setSettings({
      ...settings,
      [name]: parsedValue,
    });
  };

  return (
    <SettingsWrapper>
      <TextField
        type="number"
        id = "quality"
        label="Quality"
        InputProps={{ inputProps: { min: 0, max: 100 } }}
        onChange={handleInput}
      />
      <TextField
        type="number"
        id = "timeout"
        label="Max time in ms"
        onChange={handleInput}
      />

      <Dropdown
        id="animations"
        label="Animations"
        value={settings.animations}
        handleSelect={handleSelect}
      >
        <MenuItem value="disabled">disabled</MenuItem>
        <MenuItem value="allow">allow</MenuItem>
      </Dropdown>
      <Dropdown
        id="omitBackground"
        label="Omit background"
        value={settings.omitBackground?.toString()}
        handleSelect={handleSelect}
      >
        <MenuItem value="true">true</MenuItem>
        <MenuItem value="false">false</MenuItem>
      </Dropdown>
      <Dropdown
        id="caret"
        label="Caret"
        value={settings.caret}
        handleSelect={handleSelect}
      >
        <MenuItem value="hide">hide</MenuItem>
        <MenuItem value="initial">initial</MenuItem>
      </Dropdown>
    </SettingsWrapper>
  );
});

const SettingsWrapper = styled.div`
  margin-left: 15px;
  * {
    margin-bottom: 10px;
  }
`;
