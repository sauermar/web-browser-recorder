import React from 'react';
import styled from "styled-components";
import { stopRecording } from "../../api/recording";
import { useGlobalInfoStore } from "../../context/globalInfo";
import { Button } from "@mui/material";
import { RecordingIcon } from "../atoms/RecorderIcon";
import { AddButton } from "../atoms/buttons/AddButton";
import Box from "@mui/material/Box";
import { SaveRecording } from "./SaveRecording";

interface NavBarProps {
  newRecording: () => void;
  recordingName: string;
}

export const NavBar = ({newRecording, recordingName}:NavBarProps) => {

  const { notify, browserId, setBrowserId, recordingLength } = useGlobalInfoStore();

  // If recording is in progress, the resources and change page view by setting browserId to null
  // else it won't affect the page
  const goToMainMenu = async() => {
    if (browserId) {
      await stopRecording(browserId);
      notify('warning', 'Current Recording was terminated');
      setBrowserId(null);
    }
  };

  const handleNewRecording = async () => {
    if (browserId) {
      setBrowserId(null);
      await stopRecording(browserId);
    }
    newRecording();
    notify('info', 'New Recording started');
  }

  return (
    <NavBarWrapper>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-start',
      }}>
      <RecordingIcon/>
      <div style={{padding: '11px'}}><ProjectName>Browser Recorder</ProjectName></div>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
      }}>
        <AddButton
          handleClick={handleNewRecording}
          title="NEW RECORDING"
          style={{
            borderRadius: '5px',
            padding: '8px',
            background: 'rgba(25, 118, 210, 0.8)',
            color: '#fff',
            marginRight: '10px',
            fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
            fontWeight: '500',
            fontSize: '0.875rem',
            lineHeight: '1.75',
            letterSpacing: '0.02857em',
          }}
        />
        {
          recordingLength > 0
            ? <SaveRecording fileName={recordingName}/>
            :null
        }
        <Button sx={{
          background: '#fff',
          padding: '9px',
          marginRight: '19px',
          '&:hover': {
            background: 'lightgray',
          }
        }} onClick={goToMainMenu}>exit recording</Button>
      </div>

    </NavBarWrapper>
  );
};

const NavBarWrapper = styled.div`
  grid-area: navbar;
  background-color: #3f4853;
  padding:5px;
  display: flex;
  justify-content: space-between;
`;

const ProjectName = styled.b`
  color: white;
  font-size: 1.3em;
`;
