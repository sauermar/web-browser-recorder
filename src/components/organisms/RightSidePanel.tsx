import React from 'react';
import { Button, MenuItem, Paper, Stack } from "@mui/material";
import { Dropdown as  MuiDropdown } from '../atoms/DropdownMui';
import styled from "styled-components";
import { ActionSettings } from "../molecules/ActionSettings";
import { SelectChangeEvent } from "@mui/material/Select/Select";
import { SimpleBox } from "../atoms/Box";
import Typography from "@mui/material/Typography";
import { useGlobalInfoStore } from "../../context/globalInfo";

export const RightSidePanel = () => {

  const [action, setAction] = React.useState<string>('');
  const [isSettingsDisplayed, setIsSettingsDisplayed] = React.useState<boolean>(false);

  const { lastAction } = useGlobalInfoStore();

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
      <SimpleBox height={60} width='100%' background='lightGray' radius='0%'>
        <Typography sx={{padding: '10px'}}>
          Last action:
          {` ${lastAction}`}
        </Typography>
      </SimpleBox>

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
