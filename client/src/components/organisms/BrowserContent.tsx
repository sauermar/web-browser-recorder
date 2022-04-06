import React from 'react';
import styled from "styled-components";
import BrowserNavBar from "../molecules/BrowserNavBar";
import { BrowserWindow, VIEWPORT_W } from "./BrowserWindow";

export const BrowserContent = () => (
    <BrowserContentWrapper>
      <BrowserNavBar initialAddress={'https://'} browserWidth={VIEWPORT_W}/>
      <BrowserWindow/>
    </BrowserContentWrapper>
);

const BrowserContentWrapper = styled.div`
  grid-area: browser;
`;
