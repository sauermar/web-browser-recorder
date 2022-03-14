import {Namespace, Socket} from 'socket.io';

import logger from "../logger";
import registerInputHandlers from '../browser-management/inputHandlers'

// uses socket.io dynamic namespaces for multiplexing the traffic from different running remote browser instances
export const createSocketConnection = (
    io: Namespace,
    callback: (socket: Socket) => void,
    ) => {
    const onConnection = async (socket: Socket) => {
        logger.log('info',"Client connected");
        registerInputHandlers(io, socket);
        socket.on('disconnect', () => logger.log('info', "Client disconnected"));
        callback(socket);
    }

    io.on('connection', onConnection);
};
