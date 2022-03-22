import React, {createContext, useMemo} from 'react';
import { io, Socket } from 'socket.io-client';

const SERVER_ENDPOINT = 'http://localhost:8080';

// the socket client connection is recomputed whenever id changes -> the new browser has been initialized
const socket =
     io(`${SERVER_ENDPOINT}/test`, {
        transports: ["websocket"],
        rejectUnauthorized: false
    });

const SocketContext = createContext<Socket>(socket);

socket.on('connect', () => console.log('connected to socket'));
socket.on("connect_error", (err) => console.log(`connect_error due to ${err.message}`));

const SocketProvider = ({ children, id }: any) => {

    return (
        <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
    );
};
export { SocketContext, SocketProvider };
