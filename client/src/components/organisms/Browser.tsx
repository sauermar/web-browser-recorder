import React from 'react';
import styled from "styled-components";
import BrowserNavBar from "../molecules/BrowserNavBar";
import { BrowserWindow } from "./BrowserWindow";

export const Browser = () => (
  <BrowserWrapper>
    <BrowserNavBar initialAddress={'https://'}/>
    <BrowserWindow/>
  </BrowserWrapper>
);

const BrowserWrapper = styled.div`
  grid-area: browser;
  padding: 10px;
`;
