import { Server, Socket } from 'socket.io';

import logger from "../logger";
import { Coordinates, ScrollDeltas } from '../interfaces/Input';
import { browserPool } from "../server";

const handleMousedown = async ( { x, y }: Coordinates) => {
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

const handleWheel = async ( { deltaX, deltaY }: ScrollDeltas) => {
    logger.log('debug', 'Handling scroll event emitted from client');
    const id = browserPool.getActiveBrowserId();
    const activeBrowser = browserPool.getRemoteBrowser(id);
    if (activeBrowser) {
        await activeBrowser.currentPage!.mouse.wheel(deltaX, deltaY);
        logger.log('info', `Scrolled horizontally ${deltaX} pixels and vertically ${deltaY} pixels`);
    } else {
        logger.log('warn', `Did not scroll, because there is no active browser`);
    }
};

const handleMousemove = async ({x, y}: Coordinates) => {
    logger.log('debug', 'Handling mouseover event emitted from client');
    const id = browserPool.getActiveBrowserId();
    const activeBrowser = browserPool.getRemoteBrowser(id);
    if (activeBrowser) {
        await activeBrowser.currentPage!.mouse.move(x, y);
        logger.log('info', `Moved over position x:${x}, y:${y}`);
    } else {
        logger.log('warn', `Did not move, because there is no active browser`);
    }
}

const registerInputHandlers = (io: Server, socket: Socket) => {
    socket.on("input:mousedown", handleMousedown);
    socket.on("input:wheel", handleWheel);
    socket.on("input:mousemove", handleMousemove);
};

export default registerInputHandlers;
