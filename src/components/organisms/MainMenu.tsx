import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Paper } from "@mui/material";
import styled from "styled-components";

interface MainMenuProps {
  value: string;
  handleChangeContent: (newValue: string) => void;
}

export const MainMenu = ({ value = 'recordings', handleChangeContent }: MainMenuProps) => {

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    handleChangeContent(newValue);
  };

  return (
    <Paper
      sx={{
        height: '100%',
        width: '100%',
        backgroundColor: 'lightgray',
        paddingTop: '2rem',
      }}
    >
      <Box sx={{
        width: '100%',
        paddingBottom: '22rem',
      }}>
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="primary"
          indicatorColor="primary"
          orientation="vertical"
        >
          <Tab sx={{
            alignItems: 'baseline',
            fontSize:'medium',
          }} value="recordings" label="Recordings" />
          <Tab sx={{
            alignItems: 'baseline',
            fontSize:'medium',
          }} value="tasks" label="Tasks" />
          <Tab sx={{
            alignItems: 'baseline',
            fontSize:'medium',
          }} value="runs" label="Runs" />
        </Tabs>
      </Box>
      <Box sx={{
        width: '100%',
        height: '25%',
        background: 'darkgray',
      }}>
        <HelpText>Help & Inspiration</HelpText>
      </Box>
    </Paper>
  );
}

const HelpText = styled.p`
  font-size: larger;
  font-style: italic;
  font-family: serif;
  display: grid;
  justify-content: center;
  padding-top: 71px;
  color: rgba(0, 0, 0, 0.5);
`;
