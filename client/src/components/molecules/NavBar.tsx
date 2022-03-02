import type {
    FC,
} from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { definition as faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import { definition as faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
import { definition as faRedo } from '@fortawesome/free-solid-svg-icons/faRedo';

import { NavBarButton } from '../atoms/Button.style';
import UrlForm from './UrlForm';
import {Socket} from "socket.io-client";
import {useContext, useEffect, useState} from "react";
import {SocketContext} from "../../context/socket";

const StyledNavBar = styled.div`
    display: flex;
    padding: 5px;
    background-color: #f6f6f6;
`;

type NavBarProps = {
    initialAddress: string;
};

const handleRefresh = (socket: Socket) : void => {
    socket.emit('input:refresh');
};

const handleGoTo = (socket : Socket, address: string) : void => {
    socket.emit('input:url', address);
};

const NavBar: FC<NavBarProps> = ({
   initialAddress,
}) => {
    // context:
    const socket = useContext(SocketContext);
    //state:
    const [history, setHistory] = useState<string[]>([initialAddress]);
    const [historyIndex, setHistoryIndex] = useState<number>(0);

    const currentAddress = history[historyIndex];

    const addAddress = (address: string) => {
        setHistory([...history, address]);
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
    };

    useEffect(() => {
        if (currentAddress !== initialAddress) {
            handleGoTo(socket, currentAddress);
        }
    }, [historyIndex, currentAddress, initialAddress, socket]);

    return (
        <StyledNavBar>
            <NavBarButton
                type="button"
                onClick={() => {
                    const newIndex = historyIndex - 1;
                    setHistoryIndex(newIndex);
                }}
                disabled={historyIndex === 1 || history.length === 1}
            >
                <FontAwesomeIcon
                    icon={faArrowLeft}
                />
            </NavBarButton>

            <NavBarButton
                type="button"
                onClick={()=>{
                    const newIndex = historyIndex + 1;
                    setHistoryIndex(newIndex);
                }}
                disabled={historyIndex === (history.length - 1)}
            >
                <FontAwesomeIcon
                    icon={faArrowRight}
                />
            </NavBarButton>

            <NavBarButton
                type="button"
                onClick={() => handleRefresh(socket)}
                disabled={ history.length === 1 }
            >
                <FontAwesomeIcon
                    icon={faRedo}
                />
            </NavBarButton>

            <UrlForm
                currentAddress={currentAddress}
                handleRefresh={handleRefresh}
                setCurrentAddress={addAddress}
            />
        </StyledNavBar>
    );
}

export default NavBar;
