/**
 * A set of functions handling user input on a remote browser recording session from client.
 */
import { Server, Namespace, Socket } from 'socket.io';

import logger from "../logger";
import { Coordinates, ScrollDeltas } from '../interfaces/Input';
import { browserPool } from "../server";

const handleMousedown = async ( { x, y }: Coordinates) => {
    logger.log('debug', 'Handling mousedown event emitted from client');
    const id = browserPool.getActiveBrowserId();
    const activeBrowser = browserPool.getRemoteBrowser(id);
    if (activeBrowser && activeBrowser.generator) {
        await activeBrowser.currentPage!.mouse.click(x, y);
        logger.log('info', `Clicked on position x:${x}, y:${y}`);
        activeBrowser.generator.onClick({x,y});
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

const handleKeydown = async (key: string) => {
    logger.log('debug', 'Handling keydown event')
    const id = browserPool.getActiveBrowserId();
    const activeBrowser = browserPool.getRemoteBrowser(id);
    if (activeBrowser) {
        await activeBrowser.currentPage!.keyboard.down(key);
        logger.log('info', `Key ${key} pressed`);
    } else {
        logger.log('warn', `Did not press ${key} key, because there is no active browser`);
    }
};

const handleKeyup = async (key: string) => {
    logger.log('debug', 'Handling keyup event')
    const id = browserPool.getActiveBrowserId();
    const activeBrowser = browserPool.getRemoteBrowser(id);
    if (activeBrowser) {
        await activeBrowser.currentPage!.keyboard.up(key);
        logger.log('info', `Key ${key} unpressed`);
    } else {
        logger.log('warn', `Did not unpress ${key} key, because there is no active browser`);
    }
};

const handleChangeUrl = async (url: string) => {
    logger.log('debug', 'Handling changing of url')
    const id = browserPool.getActiveBrowserId();
    const activeBrowser = browserPool.getRemoteBrowser(id);
    if (activeBrowser && url && activeBrowser.generator) {
        await activeBrowser.currentPage!.goto(url);
        logger.log('info', `Went to ${url}`);
        activeBrowser.generator.onChangeUrl();
    } else {
        logger.log('warn', `Did not go to ${url}, because there is no active browser`);
    }
};

const handleRefresh = async () => {
    logger.log('debug', 'Handling refresh of url')
    const id = browserPool.getActiveBrowserId();
    const activeBrowser = browserPool.getRemoteBrowser(id);
    if (activeBrowser) {
        await activeBrowser.currentPage!.reload();
        logger.log('info', `Page refreshed.`);
    } else {
        logger.log('warn', `Did not refresh the page, because there is no active browser`);
    }
};

/**
 * Helper function for registering the handlers onto established websocket connection.
 * @param socket websocket with established connection
 */
const registerInputHandlers = (socket: Socket) => {
    socket.on("input:mousedown", handleMousedown);
    socket.on("input:wheel", handleWheel);
    socket.on("input:mousemove", handleMousemove);
    socket.on("input:keydown", handleKeydown);
    socket.on("input:keyup", handleKeyup);
    socket.on("input:url", handleChangeUrl);
    socket.on("input:refresh", handleRefresh);
};

export default registerInputHandlers;
