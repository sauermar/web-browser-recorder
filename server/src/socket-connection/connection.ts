/**
 * Handles Socket.io connections on the server side.
 */
import {Namespace, Socket} from 'socket.io';
import logger from "../logger";
import registerInputHandlers from '../browser-management/inputHandlers'

// uses socket.io dynamic namespaces for multiplexing the traffic from different running remote browser instances
/**
 * Opens a websocket canal for duplex data transfer and registers all handlers for this data.
 * @param server instance of the running server
 * @param callback function called after the connection is created providing the socket resource
 */
export const createSocketConnection = (
    io: Namespace,
    callback: (socket: Socket) => void,
    ) => {
    const onConnection = async (socket: Socket) => {
        logger.log('info',"Client connected " + socket.id);
        registerInputHandlers(socket);
        socket.on('disconnect', () => logger.log('info', "Client disconnected " + socket.id));
        callback(socket);
    }

    io.on('connection', onConnection);
};

export const createSocketConnectionForRun = (
  io: Namespace,
  callback: (socket: Socket) => void,
) => {
    const onConnection = async (socket: Socket) => {
        logger.log('info',"Client connected " + socket.id);
        socket.on('disconnect', () => logger.log('info', "Client disconnected " + socket.id));
        callback(socket);
    }

    io.on('connection', onConnection);
};
