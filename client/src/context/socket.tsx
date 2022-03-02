import React, { createContext } from 'react';
import { io, Socket } from 'socket.io-client';

const SERVER_ENDPOINT = 'http://localhost:8080';

const socket = io(SERVER_ENDPOINT, {
            transports: ["websocket"],
            rejectUnauthorized: false
        }),
    SocketContext = createContext<Socket>(socket);

socket.on('connect', () => console.log('connected to socket'));
socket.on("connect_error", (err) => console.log(`connect_error due to ${err.message}`));

const SocketProvider = ({ children }: any) => {
    return (
        <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
    );
};
export { SocketContext, SocketProvider };
