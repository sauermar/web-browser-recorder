import React from 'react';
import { Button, Paper, Stack } from "@mui/material";
import { Dropdown, IDropdownItem } from "../atoms/Dropdown";
import styled from "styled-components";
import { ActionSettings } from "../molecules/ActionSettings";

export const RightSidePanel = () => {

  const [action, setAction] = React.useState<string>('');
  const [isSettingsDisplayed, setIsSettingsDisplayed] = React.useState<boolean>(false);

  const dropdownActions = [
    {
      id: 0,
      text: 'scroll'
    },
    {
      id: 1,
      text: 'screenshot'
    }
  ];

  const onDropdownActionClick = (action: IDropdownItem) => {
    setAction(action.text);
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
        <Dropdown
          items={dropdownActions}
          activatorText="Custom action"
          onItemClick={onDropdownActionClick}
        />
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
