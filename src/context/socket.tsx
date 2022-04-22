import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SERVER_ENDPOINT = 'http://localhost:8080';

interface SocketState {
  socket: Socket | null;
  id: string;
  setId: (id: string) => void;
  resetId: (id: string) => void;
};

class SocketStore implements Partial<SocketState>{
  socket = null;
  id = '';
};

const socketStore = new SocketStore();
const socketStoreContext = createContext<SocketState>(socketStore as SocketState);

export const useSocketStore = () => useContext(socketStoreContext);

export const SocketProvider = ({ children }: { children: JSX.Element }) => {
  const [socket, setSocket] = useState<Socket | null>(socketStore.socket);
  const [id, setActiveId] = useState<string>(socketStore.id);

  const setId = useCallback((id: string) => {
    console.log(id);
    // the socket client connection is recomputed whenever id changes -> the new browser has been initialized
    const socket =
      io(`${SERVER_ENDPOINT}/${id}`, {
        transports: ["websocket"],
        rejectUnauthorized: false
      });

    socket.on('connect', () => console.log('connected to socket'));
    socket.on("connect_error", (err) => console.log(`connect_error due to ${err.message}`));

    setSocket(socket);
    setActiveId(id);
  }, [setSocket]);

  const resetId = useCallback((id: string) => {
    setActiveId(id);
  }, []);

    return (
        <socketStoreContext.Provider
          value={{
            socket,
            id,
            setId,
            resetId,
          }}
        >
          {children}
        </socketStoreContext.Provider>
    );
};
