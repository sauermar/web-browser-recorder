import React, { FC, useEffect } from 'react';
import styled from "styled-components";

import { startRecording, stopRecording } from "../RemoteBrowserAPI";
import { Browser } from "../components/organisms/Browser";
import { NavBar } from "../components/molecules/NavBar";

export const RecordPage: FC = () => {

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
      <Browser/>
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
    "recording browser actions"
  ;
`;
