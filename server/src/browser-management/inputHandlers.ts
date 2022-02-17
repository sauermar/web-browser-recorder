import { Server, Socket } from 'socket.io';

import logger from "../logger";
import { Coordinates } from '../interfaces/Input';
import { browserPool } from "../server";

const handleMousedown = async ( { x, y } : Coordinates) => {
    logger.log('debug', 'Handling mousedown event emitted from client');
    const id = browserPool.getActiveBrowserId();
    const activeBrowser = browserPool.getRemoteBrowser(id);
    if (activeBrowser) {
        await activeBrowser.currentPage!.mouse.click(x, y);
        logger.log('info', `Clicked on position x:${x}, y:${y}`);
    } else {
        logger.log('warn', `Did not clicked, because there is no active browser`);
    }
};

const handleScroll = async () => {
    logger.log('debug', 'Handling scroll event emitted from client');
};

const registerInputHandlers = (io: Server, socket: Socket) => {
    socket.on("input:mousedown", handleMousedown);
    socket.on("input:scroll", handleScroll);
};

export default registerInputHandlers;
