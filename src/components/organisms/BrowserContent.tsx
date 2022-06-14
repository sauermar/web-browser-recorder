import React, { useCallback, useEffect, useState } from 'react';
import styled from "styled-components";
import BrowserNavBar from "../molecules/BrowserNavBar";
import { BrowserWindow } from "./BrowserWindow";
import { useBrowserDimensionsStore } from "../../context/browserDimensions";
import { BrowserTabs } from "../molecules/BrowserTabs";
import { useSocketStore } from "../../context/socket";

export const BrowserContent = () => {
 const { width } = useBrowserDimensionsStore();
 const { socket } = useSocketStore();

 const [tabs, setTabs] = useState<string[]>(['current']);

 const handleNewTab = useCallback((tab: string) => {
   setTabs((prevState) => [...prevState, tab]);
   console.log(`updated tabs ${tab}`)
 }, []);

 useEffect(() => {
   if (socket) {
     socket.on('newTab', handleNewTab);
   }
   return () => {
     if (socket) {
       socket.off('newTab', handleNewTab);
     }
   }
 }, [socket])

  return (
    <BrowserContentWrapper>
      <BrowserTabs tabs={tabs}/>
      <BrowserNavBar browserWidth={width - 10}/>
      <BrowserWindow/>
    </BrowserContentWrapper>
  );
}

const BrowserContentWrapper = styled.div`
  grid-area: browser;
`;
