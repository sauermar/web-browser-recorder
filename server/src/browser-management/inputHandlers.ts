/**
 * A set of functions handling user input on a remote browser recording session from client.
 */
import { Socket } from 'socket.io';

import logger from "../logger";
import { Coordinates, ScrollDeltas, KeyboardInput } from '../types';
import { browserPool } from "../server";
import { WorkflowGenerator } from "../workflow-management/classes/Generator";
import { Page } from "playwright";
import { throttle } from "../../../src/functions/inputHelpers";

const handleWrapper = async (
  handleCallback: (
    generator: WorkflowGenerator,
    page: Page,
    args?: any
  ) => Promise<void>,
  args?: any
) => {
    const id = browserPool.getActiveBrowserId();
    const activeBrowser = browserPool.getRemoteBrowser(id);
    if (activeBrowser) {
        if (activeBrowser.interpreter.interpretationInProgress() && !activeBrowser.interpreter.interpretationIsPaused) {
            logger.log('debug', `Ignoring input, while interpretation is in progress`);
            return;
        }
        const currentPage = activeBrowser.getCurrentPage();
        if (currentPage) {
            if (args) {
                await handleCallback(activeBrowser.generator, currentPage, args);
            } else {
                await handleCallback(activeBrowser.generator, currentPage);
            }
        } else {
            logger.log('warn', `No active page for browser ${id}`);
        }
    } else {
        logger.log('warn', `No active browser for id ${id}`);
    }
}

const onMousedown = async (coordinates: Coordinates) => {
    logger.log('debug', 'Handling mousedown event emitted from client');
    await handleWrapper(handleMousedown, coordinates);
}

const handleMousedown = async (generator: WorkflowGenerator, page: Page, { x, y }: Coordinates) => {
    await generator.onClick({ x, y }, page);
    await page.mouse.click(x, y);
    logger.log('debug', `Clicked on position x:${x}, y:${y}`);
};

const onWheel = async (scrollDeltas: ScrollDeltas) => {
    logger.log('debug', 'Handling scroll event emitted from client');
    await handleWrapper(handleWheel, scrollDeltas);
};

const handleWheel = async (generator: WorkflowGenerator, page: Page, { deltaX, deltaY }: ScrollDeltas) => {
    await page.mouse.wheel(deltaX, deltaY);
    logger.log('debug', `Scrolled horizontally ${deltaX} pixels and vertically ${deltaY} pixels`);
};

const onMousemove = async (coordinates: Coordinates) => {
    logger.log('debug', 'Handling mousemove event emitted from client');
    await handleWrapper(handleMousemove, coordinates);
}

const handleMousemove = async (generator: WorkflowGenerator, page: Page, { x, y }: Coordinates) => {
    await page.mouse.move(x, y);
    throttle(async () => {
        await generator.generateDataForHighlighter(page, { x, y });
    }, 100)();
    logger.log('debug', `Moved over position x:${x}, y:${y}`);
}

const onKeydown = async (keyboardInput: KeyboardInput) => {
    logger.log('debug', 'Handling keydown event emitted from client');
    await handleWrapper(handleKeydown, keyboardInput);
}

const handleKeydown = async (generator: WorkflowGenerator, page: Page, { key, coordinates }: KeyboardInput) => {
    await page.keyboard.down(key);
    await generator.onKeyboardInput(key, coordinates, page);
    logger.log('debug', `Key ${key} pressed`);
};

const onKeyup = async (keyboardInput: KeyboardInput) => {
    logger.log('debug', 'Handling keyup event emitted from client');
    await handleWrapper(handleKeyup, keyboardInput);
}

const handleKeyup = async (generator: WorkflowGenerator, page: Page, key: string) => {
    await page.keyboard.up(key);
    logger.log('debug', `Key ${key} unpressed`);
};

const onChangeUrl = async (url: string) => {
    logger.log('debug', 'Handling change url event emitted from client');
    await handleWrapper(handleChangeUrl, url);
}

const handleChangeUrl = async (generator: WorkflowGenerator, page: Page, url: string) => {
    if (url) {
        generator.onChangeUrl(url, page);
        try {
            await page.goto(url);
            logger.log('debug', `Went to ${url}`);
        } catch (e) {
            const {message} = e as Error;
            logger.log('error', message);
        }
    } else {
        logger.log('warn', `No url provided`);
    }
};

const onRefresh = async () => {
    logger.log('debug', 'Handling refresh event emitted from client');
    await handleWrapper(handleRefresh);
}

const handleRefresh = async (generator: WorkflowGenerator, page: Page) => {
    await page.reload();
    logger.log('debug', `Page refreshed.`);
};

/**
 * Helper function for registering the handlers onto established websocket connection.
 * @param socket websocket with established connection
 */
const registerInputHandlers = (socket: Socket) => {
    socket.on("input:mousedown", onMousedown);
    socket.on("input:wheel", onWheel);
    socket.on("input:mousemove", onMousemove);
    socket.on("input:keydown", onKeydown);
    socket.on("input:keyup", onKeyup);
    socket.on("input:url", onChangeUrl);
    socket.on("input:refresh", onRefresh);
};

export default registerInputHandlers;
