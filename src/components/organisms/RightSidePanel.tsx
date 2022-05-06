import React from 'react';
import { Button, MenuItem, Paper, Stack } from "@mui/material";
import { Dropdown as  MuiDropdown } from '../atoms/DropdownMui';
import styled from "styled-components";
import { ActionSettings } from "../molecules/ActionSettings";
import { SelectChangeEvent } from "@mui/material/Select/Select";

export const RightSidePanel = () => {

  const [action, setAction] = React.useState<string>('');
  const [isSettingsDisplayed, setIsSettingsDisplayed] = React.useState<boolean>(false);

  const handleActionSelect = (event: SelectChangeEvent) => {
    const { value } = event.target;
    setAction(value);
    setIsSettingsDisplayed(true);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        height: '100%',
        width: '100%',
        backgroundColor: 'white',
        alignItems: "center",
      }}>

      <Stack spacing={2} direction="row" sx={{
        marginTop: "25px",
        display: "block",
        textAlign: "center",
      }}>
        <Button variant="text">
          Actions
        </Button>
        <Button variant="text" disabled>
          Logic
        </Button>
      </Stack>
      <hr/>

      <ActionDescription>Type of action:</ActionDescription>
      <ActionTypeWrapper>
        <MuiDropdown
          id="action"
          label="Action"
          value={action}
          handleSelect={handleActionSelect}>
            <MenuItem value="scroll">scroll</MenuItem>
            <MenuItem value="screenshot">screenshot</MenuItem>
        </MuiDropdown>
      </ActionTypeWrapper>

      {isSettingsDisplayed &&
        <ActionSettings action={action}/>
      }
    </Paper>
  );
};

const ActionTypeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`;

export const ActionDescription = styled.p`
  margin-left: 15px;
`;
