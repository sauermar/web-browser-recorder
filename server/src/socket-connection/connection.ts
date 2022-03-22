/**
 * Handles Socket.io connections on the server side.
 */
import { Server, Socket } from 'socket.io';
import { Server as httpServer } from 'http';

import logger from "../logger";
import registerInputHandlers from '../browser-management/inputHandlers'

/**
 * Opens a websocket canal for duplex data transfer and registers all handlers for this data.
 * @param server instance of the running server
 * @param callback function called after the connection is created providing the socket resource
 */
export const createSocketConnection = (
    server: httpServer,
    callback: (socket: Socket) => void,
    ) => {
    const io = new Server(server);

    const onConnection = (socket: Socket) => {
        logger.log('info',"Client connected");
        registerInputHandlers(socket);
        socket.on('disconnect', () => logger.log('info', "Client disconnected"));
        callback(socket);
    }

    io.on('connection', onConnection);
};
