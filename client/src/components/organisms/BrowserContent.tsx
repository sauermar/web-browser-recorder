import React from 'react';
import styled from "styled-components";
import BrowserNavBar from "../molecules/BrowserNavBar";
import { BrowserWindow } from "./BrowserWindow";
import { ToggleButton } from "../molecules/ToggleButton";

export const BrowserContent = () => (
    <BrowserContentWrapper>
      <BrowserNavBar initialAddress={'https://'}/>
      <BrowserWindow/>
    </BrowserContentWrapper>
);

const BrowserContentWrapper = styled.div`
  grid-area: browser;
  padding: 10px;
`;
