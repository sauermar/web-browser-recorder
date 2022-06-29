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
import { CustomActions } from "../../../src/shared/types";

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

interface CustomActionEventData {
    action: CustomActions;
    settings: any;
}

const onGenerateAction = async (customActionEventData: CustomActionEventData) => {
    logger.log('debug', `Generating ${customActionEventData.action} action emitted from client`);
    await handleWrapper(handleGenerateAction, customActionEventData);
}

const handleGenerateAction =
  async (generator: WorkflowGenerator, page: Page, {action, settings}: CustomActionEventData) => {
    await generator.customAction(action, settings, page);
}

const onMousedown = async (coordinates: Coordinates) => {
    logger.log('debug', 'Handling mousedown event emitted from client');
    await handleWrapper(handleMousedown, coordinates);
}

const handleMousedown = async (generator: WorkflowGenerator, page: Page, { x, y }: Coordinates) => {
    await generator.onClick({ x, y }, page);
    const previousUrl = page.url();
    const tabsBeforeClick = page.context().pages().length;
    await page.mouse.click(x, y);
    // try if the click caused a navigation to a new url
    try {
        await page.waitForNavigation({ timeout: 2000 });
        const currentUrl = page.url();
        console.log(`current: ${currentUrl}, previous: ${previousUrl}`)
        if (currentUrl !== previousUrl) {
            generator.notifyUrlChange(currentUrl);
        }
    } catch (e) {
        const {message} = e as Error;
        console.log(message)
        console.log('url did not change')
    } //ignore possible timeouts

    // check if any new page was opened by the click
    const tabsAfterClick = page.context().pages().length;
    const numOfNewPages = tabsAfterClick - tabsBeforeClick;
    console.log(`${tabsBeforeClick}, ${tabsAfterClick}`)
    if (numOfNewPages > 0) {
        console.log(`${numOfNewPages} new tabs opened`)
        for (let i = 1; i <= numOfNewPages; i++) {
            const newPage = page.context().pages()[tabsAfterClick - i];
            if (newPage) {
                generator.notifyOnNewTab(newPage.url());
            }
        }
    }
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
    try {
        await page.mouse.move(x, y);
        throttle(async () => {
            await generator.generateDataForHighlighter(page, { x, y });
        }, 100)();
        logger.log('debug', `Moved over position x:${x}, y:${y}`);
    } catch (e) {
        const { message } = e as Error;
        logger.log('error', message);
    }
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
        await generator.onChangeUrl(url, page);
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

const onGoBack = async () => {
    logger.log('debug', 'Handling refresh event emitted from client');
    await handleWrapper(handleGoBack);
}

const handleGoBack = async (generator: WorkflowGenerator, page: Page) => {
    await page.goBack({waitUntil: 'commit'});
    generator.onGoBack(page.url());
    logger.log('debug', 'Page went back')
};

const onGoForward = async () => {
    logger.log('debug', 'Handling refresh event emitted from client');
    await handleWrapper(handleGoForward);
}

const handleGoForward = async (generator: WorkflowGenerator, page: Page) => {
    await page.goForward({waitUntil: 'commit'});
    generator.onGoForward(page.url());
    logger.log('debug', 'Page went forward');
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
    socket.on("input:back", onGoBack);
    socket.on("input:forward", onGoForward);
    socket.on("action", onGenerateAction);
};

export default registerInputHandlers;
