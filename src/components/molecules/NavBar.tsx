import React from 'react';
import styled from "styled-components";
import { stopRecording } from "../../api/recording";
import { useGlobalInfoStore } from "../../context/globalInfo";
import { Button } from "@mui/material";
import { RecordingIcon } from "../atoms/RecorderIcon";


export const NavBar = () => {

  const { notify, browserId, setBrowserId } = useGlobalInfoStore();

  // If recording is in progress, the resources and change page view by setting browserId to null
  // else it won't affect the page
  const goToMainMenu = () => {
    if (browserId) {
      stopRecording(browserId);
      notify('warning', 'Recording was terminated');
      setBrowserId(null);
    }
  };

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
        <Button sx={{
          background: '#fff',
          padding: '9px',
          marginRight: '19px',
          '&:hover': {
            background: 'lightgray',
          }
        }} onClick={goToMainMenu}>go to menu</Button>
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
