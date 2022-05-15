import React from 'react';
import styled from "styled-components";
import BrowserNavBar from "../molecules/BrowserNavBar";
import { BrowserWindow } from "./BrowserWindow";
import { useBrowserDimensionsStore } from "../../context/browserDimensions";

export const BrowserContent = () => {
 const { width } = useBrowserDimensionsStore();

  return (
    <BrowserContentWrapper>
      <BrowserNavBar initialAddress={'https://'} browserWidth={width - 10}/>
      <BrowserWindow/>
    </BrowserContentWrapper>
  );
}

const BrowserContentWrapper = styled.div`
  grid-area: browser;
`;
