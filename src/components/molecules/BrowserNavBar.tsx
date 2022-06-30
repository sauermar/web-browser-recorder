import type {
    FC,
} from 'react';
import styled from 'styled-components';

import ReplayIcon from '@mui/icons-material/Replay';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { NavBarButton } from '../atoms/buttons/buttons';
import { UrlForm }  from './UrlForm';
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
    handleUrlChanged: (url: string) => void;
};

const BrowserNavBar: FC<NavBarProps> = ({
  browserWidth,
  handleUrlChanged,
}) => {

  // context:
  const { socket } = useSocketStore();

  const [currentUrl, setCurrentUrl] = useState<string>('https://');

  const handleRefresh = useCallback(() : void => {
    socket?.emit('input:refresh');
  }, [socket]);

  const handleGoTo = useCallback((address: string) : void => {
    socket?.emit('input:url', address);
  }, [socket]);

  const handleCurrentUrlChange = useCallback((url: string) => {
    handleUrlChanged(url);
    setCurrentUrl(url);
    console.log("Current url: " + url);
  }, [handleUrlChanged, currentUrl]);

  useEffect(() => {
    getCurrentUrl().then((response) => {
      console.log("Fetching default url successful");
      if (response) {
        handleUrlChanged(response);
        setCurrentUrl(response);
      }
    }).catch((error) => {
      console.log("Fetching current url failed");
    })
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('urlChanged', handleCurrentUrlChange);
    }
    return () => {
      if (socket) {
        socket.off('urlChanged', handleCurrentUrlChange);
      }
    }
  }, [socket, handleCurrentUrlChange])

    const addAddress = (address: string) => {
        if (socket) {
          handleUrlChanged(address);
          handleGoTo(address);
        }
    };

    return (
        <StyledNavBar browserWidth={browserWidth}>
            <NavBarButton
                type="button"
                onClick={() => {
                    socket?.emit('input:back');
                }}
                disabled={false}
            >
                <ArrowBackIcon/>
            </NavBarButton>

            <NavBarButton
                type="button"
                onClick={()=>{
                  socket?.emit('input:forward');
                }}
                disabled={false}
            >
                <ArrowForwardIcon/>
            </NavBarButton>

            <NavBarButton
                type="button"
                onClick={() => {
                  if (socket) {
                    handleRefresh()
                  }
                }}
                disabled={false}
            >
              <ReplayIcon/>
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
