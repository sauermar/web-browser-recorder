/**
 * Main class determining the flow of remote browser management.
 */
import { Socket } from "socket.io";
import { uuid } from 'uuidv4';

import { createSocketConnection } from "../socket-connection/connection";
import { io, browserPool } from "../server";
import { RemoteBrowser } from "./classes/RemoteBrowser";
import { RemoteBrowserOptions } from "../interfaces/Input";
import logger from "../logger";
import { interpretWorkflow } from "../workflow-management/interpretation";

/**
 * Starts a remote browser recording session.
 * @param options remote browser options
 */
export const createRemoteBrowser = (options: RemoteBrowserOptions): string => {
    const id = getActiveBrowserId() || uuid();
    createSocketConnection(
        io.of(id),
        async (socket: Socket) => {
            // browser is already active
            const activeId = getActiveBrowserId();
            if (activeId) {
                const remoteBrowser = browserPool.getRemoteBrowser(activeId);
                remoteBrowser?.updateSocket(socket);
                await remoteBrowser?.makeAndEmitScreenshot();
            } else {
                const browserSession = new RemoteBrowser(socket);
                await browserSession.initialize(options);
                await browserSession.subscribeToScreencast();
                browserPool.addRemoteBrowser(id, browserSession);
            }
        });
    return id;
};

/**
 * Terminates a remote browser recording session.
 * @param id remote browser recording session's id
 */
export const destroyRemoteBrowser = async (id: string) : Promise<boolean> => {
    const browserSession = browserPool.getRemoteBrowser(id);
    if (browserSession) {
        logger.log('debug', `Switching off the browser with id: ${id}`);
        await browserSession.switchOff();
    }
    return browserPool.deleteRemoteBrowser(id);
};

//TODO reprogram this
// just for development
export const getActiveBrowserId = () => {
    return browserPool.getActiveBrowserId();
};

export const interpretWholeWorkflow = async() => {
    const id = getActiveBrowserId();
    const browser = browserPool.getRemoteBrowser(id);
    if (browser && browser.generator) {
        const workflow = await browser.generator.getWorkflowFile();
        logger.log('info', `Workflow: ${JSON.stringify(workflow)}`);
        await browser.initializeNewPage();
        if (browser.currentPage) {
            const result = await interpretWorkflow(workflow, browser.currentPage);
            logger.log('info', `Result: ${result}`);
        } else {
            logger.log('error', 'Could not get a new page, returned undefined');
        }
    } else {
        logger.log('error', 'Cannot interpret the workflow: No active browser or generator.');
    }

};
