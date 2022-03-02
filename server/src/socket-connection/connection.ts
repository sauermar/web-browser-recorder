import { Server, Socket } from 'socket.io';
import { Server as httpServer } from 'http';

import logger from "../logger";
import registerInputHandlers from '../browser-management/inputHandlers'

export const createSocketConnection = (
    server: httpServer,
    callback: (socket: Socket) => void,
    ) => {
    const io = new Server(server);

    const onConnection = (socket: Socket) => {
        logger.log('info',"Client connected");
        registerInputHandlers(io, socket);
        socket.on('disconnect', () => logger.log('info', "Client disconnected"));
        callback(socket);
    }

    io.on('connection', onConnection);
};
