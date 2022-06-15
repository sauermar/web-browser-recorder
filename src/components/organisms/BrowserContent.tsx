import React, { useCallback, useEffect, useState } from 'react';
import styled from "styled-components";
import BrowserNavBar from "../molecules/BrowserNavBar";
import { BrowserWindow } from "./BrowserWindow";
import { useBrowserDimensionsStore } from "../../context/browserDimensions";
import { BrowserTabs } from "../molecules/BrowserTabs";
import { useSocketStore } from "../../context/socket";
import { interpretCurrentRecording } from "../../api/recording";

export const BrowserContent = () => {
 const { width } = useBrowserDimensionsStore();
 const { socket } = useSocketStore();

 const [tabs, setTabs] = useState<string[]>(['current']);
 let currentTabIndex = 0;

  useEffect(() => {
    console.log(currentTabIndex, ' tab index from effect');
  }, [currentTabIndex]);

  const handleAddNewTab = useCallback(() => {
    handleNewTab('new tab');
    socket?.emit('addTab');
  }, []);

 const handleNewTab = useCallback((tab: string) => {
   setTabs((prevState) => [...prevState, tab]);
   console.log(`updated tabs ${tab}`)
 }, []);

  const handleTabChange = useCallback((tabIndex: number) => {
    console.log(currentTabIndex);
    console.log(tabIndex);
    currentTabIndex = tabIndex;
    // page screencast and focus needs to be changed on backend
    socket?.emit('changeTab', tabIndex);
  }, [currentTabIndex, socket]);

  const handleUrlChanged = useCallback((url: string) => {
    const parsedUrl = new URL(url);
    console.log(`tab index: ${currentTabIndex}, hostname: ${parsedUrl.hostname}`)
    if (parsedUrl.hostname) {
      const host = parsedUrl.hostname.match(/\b(?!www\.)[a-zA-Z0-9]+/g)?.join('.')
      if (host && host !== tabs[currentTabIndex]) {
        setTabs((prevState) => [
          ...prevState.slice(0, currentTabIndex),
          host,
          ...prevState.slice(currentTabIndex + 1)
        ])
      }
    } else {
      if (tabs[currentTabIndex] !== 'new tab') {
        setTabs((prevState) => [
          ...prevState.slice(0, currentTabIndex),
          'new tab',
          ...prevState.slice(currentTabIndex + 1)
        ])
      }
    }

  }, [currentTabIndex, tabs])

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
      <BrowserTabs
        tabs={tabs}
        handleTabChange={handleTabChange}
        handleAddNewTab={handleAddNewTab}
      />
      <BrowserNavBar
        browserWidth={width - 10}
        handleUrlChanged={handleUrlChanged}
      />
      <BrowserWindow/>
    </BrowserContentWrapper>
  );
}

const BrowserContentWrapper = styled.div`
  grid-area: browser;
`;
