import React, { forwardRef, useImperativeHandle } from "react";
import { Box, TextField } from "@mui/material";

interface KeyValueFormProps {
  keyLabel?: string;
  valueLabel?: string;
}

export const KeyValueForm = forwardRef(({keyLabel, valueLabel}: KeyValueFormProps, ref) => {
  const [key, setKey] = React.useState<string>('');
  const [value, setValue] = React.useState<string>('');
  useImperativeHandle(ref, () => ({
    getKeyValuePair() {
      return { key, value };
    }
  }));
  return (
    <Box
      component="form"
      sx={{
        '& > :not(style)': { m: 1, width: '100px' },
      }}
      noValidate
      autoComplete="off"
    >
      <TextField
        id="outlined-name"
        label={keyLabel || "Key"}
        value={key}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setKey(event.target.value)}
        size="small"
        required
      />
      <TextField
        id="outlined-name"
        label={valueLabel || "Value"}
        value={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
        size="small"
        required
      />
    </Box>
  );
});
