import { Server, Socket } from 'socket.io';
import logger from "../logger";

const handleMousedown = async () => {
    logger.log('debug', 'Handling mousedown event emitted from client');
};

const handleScroll = async () => {
    logger.log('debug', 'Handling scroll event emitted from client');
};

const registerInputHandlers = (io: Server, socket: Socket) => {
    socket.on("input:mousedown", handleMousedown);
    socket.on("input:scroll", handleScroll);
};

export default registerInputHandlers;
