import React from 'react';
import { Button, Paper, Stack } from "@mui/material";
import Dropdown from "../atoms/Dropdown";
import styled from "styled-components";

export const RightSidePanel = () => {

  const dropdownActions = [
    {
      id: 1,
      text: 'scroll'
    }
  ];

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

      <ActionTypeWrapper>
        <p>Type of action:</p>
        <Dropdown items={dropdownActions} activatorText="Custom action"></Dropdown>
      </ActionTypeWrapper>

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
