import React, { FC, useEffect, useState } from 'react';
import styled from "styled-components";

import { startRecording, stopRecording } from "../RemoteBrowserAPI";
import { BrowserContent } from "../components/organisms/BrowserContent";
import { NavBar } from "../components/molecules/NavBar";
import { SlidingPanel } from "../components/organisms/SlidingPanel";
import { ToggleButton } from "../components/molecules/ToggleButton";

export const RecordPage: FC = () => {

  const [openLeftPanel, setOpenLeftPanel] = useState<boolean>(true);
  const [isChecked, setIsChecked] = useState<boolean>(true);

  useEffect(() => {
    const id = startRecording();
    if (id) {
      // cleanup function when the component dismounts
      return () => stopRecording(id);
    }
  }, []);

  return (
    <Layout>
      <NavBar/>
      <StyledSlidingPanel type={'left'} size={30} isOpen={openLeftPanel}/>
      <BrowserContent/>
      <ToggleButton isChecked={isChecked} onChange={() => {
        setIsChecked(!isChecked);
        setOpenLeftPanel(!openLeftPanel);
      }}>Left</ToggleButton>
    </Layout>
  );
};

const Layout = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 270px auto 260px;
  grid-template-rows: 50px auto;
  grid-template-areas: 
    "navbar navbar navbar"
    "workflow browser actions"
  ;
`;

const StyledSlidingPanel = styled(SlidingPanel)`
  grid-area: workflow;
`;

