import type {
    FC,
} from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { definition as faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import { definition as faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
import { definition as faRedo } from '@fortawesome/free-solid-svg-icons/faRedo';

import { NavBarButton } from '../atoms/buttons';
import { UrlForm }  from './UrlForm';
import {Socket} from "socket.io-client";
import { useCallback, useEffect, useState } from "react";
import {useSocketStore} from "../../context/socket";
import { getCurrentUrl } from "../../api/recording";

const StyledNavBar = styled.div<{ browserWidth: number }>`
    display: flex;
    padding: 5px;
    background-color: #f6f6f6;
    width: ${({ browserWidth }) => browserWidth}px;
`;

interface NavBarProps {
    browserWidth: number;
};

const handleRefresh = (socket: Socket) : void => {
    socket.emit('input:refresh');
};

const handleGoTo = (socket : Socket, address: string) : void => {
    socket.emit('input:url', address);
};

const BrowserNavBar: FC<NavBarProps> = ({
  browserWidth,
}) => {

  // context:
  const { socket } = useSocketStore();

  const [currentUrl, setCurrentUrl] = useState<string>('https://');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);


  useEffect(() => {
    getCurrentUrl().then((response) => {
      console.log("Fetching default url successful");
      if (response) {
        setCurrentUrl(response);
        // add the first url to the history array
        setHistory([...history, response]);
      }
    }).catch((error) => {
      console.log("Fetching current url failed");
    })
  }, []);

  const handleCurrentUrl = useCallback((url: string) => {
    setCurrentUrl(url);
    console.log("Current url: " + url);
  }, []);

  const handleUrlAfterClick = useCallback((url: string) => {
    setHistory([...history, url]);
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setCurrentUrl(url);
    console.log("Current url: " + url);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('currentUrl', handleCurrentUrl);
      socket.on('urlAfterClick', handleUrlAfterClick);
    }
    return () => {
      if (socket) {
        socket.off('currentUrl', handleCurrentUrl);
        socket.off('urlAfterClick', handleUrlAfterClick);
      }
    }
  }, [socket]);

    const addAddress = (address: string) => {
      // continue adding new addresses to the history array
        setHistory([...history, address]);
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        if (socket) {
          handleGoTo(socket, address);
        }
    };

    return (
        <StyledNavBar browserWidth={browserWidth}>
            <NavBarButton
                type="button"
                onClick={() => {
                    socket?.emit('input:back');
                    const newIndex = historyIndex - 1;
                    setHistoryIndex(newIndex);
                }}
                disabled={false}
            >
                <FontAwesomeIcon
                    icon={faArrowLeft}
                />
            </NavBarButton>

            <NavBarButton
                type="button"
                onClick={()=>{
                  socket?.emit('input:forward');
                    const newIndex = historyIndex + 1;
                    setHistoryIndex(newIndex);
                }}
                disabled={false}
            >
                <FontAwesomeIcon
                    icon={faArrowRight}
                />
            </NavBarButton>

            <NavBarButton
                type="button"
                onClick={() => {
                  if (socket) {
                    handleRefresh(socket)
                  }
                }}
                disabled={false}
            >
                <FontAwesomeIcon
                    icon={faRedo}
                />
            </NavBarButton>

            <UrlForm
                currentAddress={currentUrl}
                handleRefresh={handleRefresh}
                setCurrentAddress={addAddress}
            />
        </StyledNavBar>
    );
}

export default BrowserNavBar;
