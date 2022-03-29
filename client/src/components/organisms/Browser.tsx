import React from 'react';
import styled from "styled-components";
import NavBar from "../molecules/NavBar";
import { BrowserWindow } from "./BrowserWindow";

export const Browser = () => (
  <BrowserWrapper>
    <NavBar initialAddress={'https://'}/>
    <BrowserWindow/>
  </BrowserWrapper>
);

const BrowserWrapper = styled.div`
  grid-area: browser;
  padding: 10px;
`;
