import React from 'react';
import styled from "styled-components";
import BrowserNavBar from "../molecules/BrowserNavBar";
import { BrowserWindow } from "./BrowserWindow";
import { BROWSER_W } from "../../constants/const";

export const BrowserContent = () => (
    <BrowserContentWrapper>
      <BrowserNavBar initialAddress={'https://'} browserWidth={BROWSER_W}/>
      <BrowserWindow/>
    </BrowserContentWrapper>
);

const BrowserContentWrapper = styled.div`
  grid-area: browser;
`;
